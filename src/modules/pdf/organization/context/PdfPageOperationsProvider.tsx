import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { usePdfEngine } from '../../hooks/usePdfEngine';
import { createDocumentLoadingTask, releasePdfDocument } from '../../services/pdfDocumentService';
import { validatePdfFile } from '../../services/pdfValidationService';
import { PdfPageOperationsContext, type BlankPageDimensions } from './pageOperationsStore';
import { deleteWorkingPages, duplicateWorkingPages, initialPageOrganizationState, pageOrganizationReducer, reorderWorkingPages, rotateWorkingPages } from '../state/pageOrganizationReducer';
import type { PageId, PageInsertion, PageOrganizationPresent, PageSelectionMode, PageSource, WorkingPage } from '../types/pages';
import { createPageId, orderedPageIds, pageIndexById } from '../utils/pageUtils';

type SourceRecord = PageSource & { document: PDFDocumentProxy; loadingTask: PDFDocumentLoadingTask | null; root: boolean };
const MIN_PAGE_DIMENSION = 36;
const MAX_PAGE_DIMENSION = 14_400;

function fileDocumentId(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

function insertionIndex(pages: WorkingPage[], activePageId: PageId | null, insertion: PageInsertion) {
    if (insertion === 'beginning') return 0;
    if (insertion === 'end') return pages.length;
    const activeIndex = pageIndexById(pages, activePageId);
    if (activeIndex < 0) return pages.length;
    return insertion === 'before-active' ? activeIndex : activeIndex + 1;
}

async function readPageDimensions(document: PDFDocumentProxy, index: number) {
    const page = await document.getPage(index + 1);
    try {
        const viewport = page.getViewport({ scale: 1, rotation: 0 });
        return { width: viewport.width, height: viewport.height };
    } finally {
        page.cleanup();
    }
}

async function buildSourcePages(document: PDFDocumentProxy, sourceDocumentId: string): Promise<WorkingPage[]> {
    const pages: WorkingPage[] = [];
    for (let index = 0; index < document.numPages; index += 1) {
        const dimensions = await readPageDimensions(document, index);
        pages.push({ id: createPageId(), kind: 'source', sourceDocumentId, sourcePageIndex: index, ...dimensions, rotation: 0, duplicatedFromPageId: null });
    }
    return pages;
}

export function PdfPageOperationsProvider({ children }: { children: ReactNode }) {
    const { document: rootDocument, sourceFile, failViewer } = usePdfEngine();
    const [state, dispatch] = useReducer(pageOrganizationReducer, initialPageOrganizationState);
    const [isInitializing, setIsInitializing] = useState(false);
    const sourcesRef = useRef(new Map<string, SourceRecord>());
    const sourceGenerationRef = useRef(0);
    const stateRef = useRef(state);
    stateRef.current = state;

    const releaseImportedSources = useCallback(() => {
        sourceGenerationRef.current += 1;
        for (const source of sourcesRef.current.values()) {
            if (!source.root) void releasePdfDocument(source.loadingTask, source.document);
        }
        sourcesRef.current.clear();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const initialize = async () => {
            releaseImportedSources();
            if (!rootDocument || !sourceFile) {
                dispatch({ type: 'reset', documentId: null, pages: [] });
                setIsInitializing(false);
                return;
            }
            setIsInitializing(true);
            const sourceId = `root-${fileDocumentId(sourceFile)}`;
            sourcesRef.current.set(sourceId, { id: sourceId, file: sourceFile, pageCount: rootDocument.numPages, document: rootDocument, loadingTask: null, root: true });
            try {
                const pages = await buildSourcePages(rootDocument, sourceId);
                if (!cancelled) dispatch({ type: 'reset', documentId: sourceId, pages });
            } catch {
                if (!cancelled) failViewer('The document pages could not be prepared safely. Please retry the PDF.');
            } finally {
                if (!cancelled) {
                    setIsInitializing(false);
                }
            }
        };
        void initialize();
        return () => { cancelled = true; };
    }, [failViewer, releaseImportedSources, rootDocument, sourceFile]);

    useEffect(() => () => releaseImportedSources(), [releaseImportedSources]);

    const commit = useCallback((next: PageOrganizationPresent) => dispatch({ type: 'commit', next }), []);
    const select = useCallback((pageId: PageId | null, mode: PageSelectionMode) => {
        dispatch({ type: 'select', pageId, mode });
    }, []);
    const setActivePage = useCallback((pageId: PageId | null) => dispatch({ type: 'active', pageId }), []);
    const selectAll = useCallback(() => dispatch({ type: 'select', pageId: null, mode: 'all' }), []);
    const clearSelection = useCallback(() => dispatch({ type: 'select', pageId: null, mode: 'clear' }), []);
    const invertSelection = useCallback(() => dispatch({ type: 'select', pageId: null, mode: 'invert' }), []);
    const selectedIds = useCallback(() => stateRef.current.present.selectedPageIds.length ? stateRef.current.present.selectedPageIds : stateRef.current.present.activePageId ? [stateRef.current.present.activePageId] : [], []);

    const reorder = useCallback((targetId: PageId, placement: 'before' | 'after') => {
        const present = stateRef.current.present;
        const moving = selectedIds();
        const next = reorderWorkingPages(present, moving, targetId, placement);
        if (next !== present) commit(next);
    }, [commit, selectedIds]);
    const reorderPages = useCallback((movingIds: PageId[], targetId: PageId, placement: 'before' | 'after') => {
        const present = stateRef.current.present;
        const next = reorderWorkingPages(present, movingIds, targetId, placement);
        if (next !== present) commit(next);
    }, [commit]);
    const moveActive = useCallback((direction: -1 | 1) => {
        const present = stateRef.current.present;
        const activeIndex = pageIndexById(present.pages, present.activePageId);
        const target = present.pages[activeIndex + direction];
        if (target) reorder(target.id, direction < 0 ? 'before' : 'after');
    }, [reorder]);
    const deleteSelected = useCallback(() => {
        const present = stateRef.current.present;
        const next = deleteWorkingPages(present, selectedIds());
        if (!next) return false;
        commit(next);
        return true;
    }, [commit, selectedIds]);
    const duplicateSelected = useCallback(() => {
        const present = stateRef.current.present;
        const ids = selectedIds();
        const copies: WorkingPage[] = [];
        for (const id of orderedPageIds(present.pages, ids)) {
            const source = present.pages.find((page) => page.id === id);
            if (source) copies.push({ ...source, id: createPageId(), duplicatedFromPageId: source.id });
        }
        if (copies.length) commit(duplicateWorkingPages(present, ids, copies));
    }, [commit, selectedIds]);
    const insertBlank = useCallback((dimensions: BlankPageDimensions, insertion: PageInsertion) => {
        if (!Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height) || dimensions.width < MIN_PAGE_DIMENSION || dimensions.height < MIN_PAGE_DIMENSION || dimensions.width > MAX_PAGE_DIMENSION || dimensions.height > MAX_PAGE_DIMENSION) return;
        const present = stateRef.current.present;
        const page: WorkingPage = { id: createPageId(), kind: 'blank', sourceDocumentId: null, sourcePageIndex: null, width: dimensions.width, height: dimensions.height, rotation: 0, duplicatedFromPageId: null };
        const index = insertionIndex(present.pages, present.activePageId, insertion);
        commit({ ...present, pages: [...present.pages.slice(0, index), page, ...present.pages.slice(index)], selectedPageIds: [page.id], activePageId: page.id });
    }, [commit]);
    const rotateSelected = useCallback((delta: -90 | 90) => {
        const present = stateRef.current.present;
        const ids = selectedIds();
        if (ids.length) commit(rotateWorkingPages(present, ids, delta));
    }, [commit, selectedIds]);
    const rotateAll = useCallback((delta: -90 | 90) => {
        const present = stateRef.current.present;
        if (present.pages.length) commit(rotateWorkingPages(present, present.pages.map((page) => page.id), delta));
    }, [commit]);

    const importPages = useCallback(async (file: File, pageIndices: number[], insertion: PageInsertion) => {
        const generation = sourceGenerationRef.current;
        const present = stateRef.current.present;
        const existing = [...sourcesRef.current.values()].find((source) => source.file.name === file.name && source.file.size === file.size && source.file.lastModified === file.lastModified);
        let source = existing;
        let createdSource: SourceRecord | null = null;
        if (!source) {
            const data = await validatePdfFile(file);
            const task = createDocumentLoadingTask(data, () => undefined);
            let document: PDFDocumentProxy | null = null;
            try {
                document = await task.promise;
            } catch (error) {
                await releasePdfDocument(task, document);
                throw error;
            }
            if (generation !== sourceGenerationRef.current) {
                await releasePdfDocument(task, document);
                throw new Error('The open document changed before the imported pages were ready.');
            }
            const id = `import-${fileDocumentId(file)}-${createPageId()}`;
            source = { id, file, pageCount: document.numPages, document, loadingTask: task, root: false };
            createdSource = source;
            sourcesRef.current.set(id, source);
        }
        try {
            const requestedIndices = pageIndices.length ? pageIndices : Array.from({ length: source.pageCount }, (_, index) => index);
            const uniqueIndices = [...new Set(requestedIndices)].filter((index) => Number.isInteger(index) && index >= 0 && index < source.pageCount);
            if (!uniqueIndices.length) throw new Error('The imported PDF does not contain any usable pages.');
            const imported: WorkingPage[] = await Promise.all(uniqueIndices.map(async (sourcePageIndex) => ({ id: createPageId(), kind: 'source' as const, sourceDocumentId: source.id, sourcePageIndex, ...(await readPageDimensions(source.document, sourcePageIndex)), rotation: 0 as const, duplicatedFromPageId: null })));
            if (generation !== sourceGenerationRef.current) throw new Error('The open document changed before the imported pages were ready.');
            const index = insertionIndex(present.pages, present.activePageId, insertion);
            commit({ ...present, pages: [...present.pages.slice(0, index), ...imported, ...present.pages.slice(index)], selectedPageIds: imported.map((page) => page.id), activePageId: imported[0]?.id ?? present.activePageId });
        } catch (error) {
            if (createdSource) {
                sourcesRef.current.delete(createdSource.id);
                await releasePdfDocument(createdSource.loadingTask, createdSource.document);
            }
            throw error;
        }
    }, [commit]);

    const getPage = useCallback(async (page: WorkingPage): Promise<PDFPageProxy> => {
        if (!page.sourceDocumentId || page.sourcePageIndex === null) throw new Error('Blank pages do not have a PDF.js source page.');
        const source = sourcesRef.current.get(page.sourceDocumentId);
        if (!source) throw new Error('The source document is no longer available.');
        return source.document.getPage(page.sourcePageIndex + 1);
    }, []);
    const getSourceFile = useCallback((sourceDocumentId: string) => sourcesRef.current.get(sourceDocumentId)?.file ?? null, []);
    const getPageNumber = useCallback((pageId: PageId) => pageIndexById(stateRef.current.present.pages, pageId) + 1, []);

    const activePage = state.present.pages.find((page) => page.id === state.present.activePageId) ?? null;
    const value = useMemo(() => ({ documentId: state.present.documentId, pages: state.present.pages, selectedPageIds: state.present.selectedPageIds, activePageId: state.present.activePageId, activePage, isInitializing, canUndo: state.past.length > 0, canRedo: state.future.length > 0, select, setActivePage, selectAll, clearSelection, invertSelection, reorder, reorderPages, moveActive, deleteSelected, duplicateSelected, insertBlank, rotateSelected, rotateAll, undo: () => dispatch({ type: 'undo' }), redo: () => dispatch({ type: 'redo' }), importPages, getPage, getSourceFile, getPageNumber }), [activePage, clearSelection, deleteSelected, duplicateSelected, getPage, getPageNumber, getSourceFile, importPages, insertBlank, invertSelection, isInitializing, moveActive, reorder, reorderPages, rotateAll, rotateSelected, select, selectAll, setActivePage, state]);

    return <PdfPageOperationsContext.Provider value={value}>{children}</PdfPageOperationsContext.Provider>;
}

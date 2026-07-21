import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { cloneAnnotation } from '../utils/annotationUtils';
import { alignAnnotations, type Alignment } from '../utils/professionalEditing';
import { editorReducer, initialEditorState } from '../state/editorReducer';
import { PdfEditorContext } from './editorStore';
import type { EditorPresent, EditorTool, PdfAnnotation } from '../types/annotations';

function patchChangesAnnotation(annotation: PdfAnnotation, patch: Partial<PdfAnnotation>) {
    const current = annotation as unknown as Record<string, unknown>;
    const candidate = patch as unknown as Record<string, unknown>;
    return Object.keys(candidate).some((key) => !Object.is(current[key], candidate[key]));
}

function modifyAnnotation(present: EditorPresent, id: string, updater: (annotation: PdfAnnotation) => PdfAnnotation | null) {
    for (const [pageId, annotations] of Object.entries(present.annotationsByPageId)) {
        const index = annotations.findIndex((annotation) => annotation.id === id);
        if (index < 0) continue;
        const updated = updater(annotations[index]);
        if (!updated || updated === annotations[index]) return null;
        const nextPage = [...annotations];
        nextPage[index] = updated;
        return {
            ...present,
            annotationsByPageId: { ...present.annotationsByPageId, [pageId]: nextPage },
        };
    }
    return null;
}

export function PdfEditorProvider({ children }: { children: ReactNode }) {
    const { documentId, pages } = usePdfPageOperations();
    const [state, dispatch] = useReducer(editorReducer, initialEditorState);
    const stateRef = useRef(state);
    stateRef.current = state;
    useEffect(() => { dispatch({ type: 'reset', documentId }); }, [documentId]);
    useEffect(() => {
        const copies: Record<string, PdfAnnotation[]> = {};
        for (const page of pages) {
            if (page.duplicatedFromPageId && !stateRef.current.present.annotationsByPageId[page.id]) {
                copies[page.id] = (stateRef.current.present.annotationsByPageId[page.duplicatedFromPageId] ?? []).map((annotation) => cloneAnnotation(annotation, page.id));
            }
        }
        if (Object.keys(copies).length) dispatch({ type: 'sync-page-copies', copies });
    }, [pages]);
    const commit = useCallback((next: EditorPresent) => dispatch({ type: 'commit', next }), []);
    const add = useCallback((annotation: PdfAnnotation) => {
        const present = stateRef.current.present;
        const page = present.annotationsByPageId[annotation.pageId] ?? [];
        if (page.some((candidate) => candidate.id === annotation.id)) return;
        commit({
            ...present,
            annotationsByPageId: { ...present.annotationsByPageId, [annotation.pageId]: [...page, annotation] },
            selectedId: annotation.id,
            selectedIds: [annotation.id],
        });
    }, [commit]);
    const update = useCallback((id: string, patch: Partial<PdfAnnotation>) => {
        const present = stateRef.current.present;
        const next = modifyAnnotation(present, id, (annotation) => patchChangesAnnotation(annotation, patch)
            ? { ...annotation, ...patch, updatedAt: Date.now() } as PdfAnnotation
            : null);
        if (next) commit(next);
    }, [commit]);
    const remove = useCallback((id: string) => {
        const present = stateRef.current.present;
        for (const [pageId, annotations] of Object.entries(present.annotationsByPageId)) {
            const index = annotations.findIndex((annotation) => annotation.id === id);
            if (index < 0) continue;
            const selectedIds = present.selectedIds.filter((selectedId) => selectedId !== id);
            commit({
                ...present,
                annotationsByPageId: {
                    ...present.annotationsByPageId,
                    [pageId]: [...annotations.slice(0, index), ...annotations.slice(index + 1)],
                },
                selectedId: selectedIds[selectedIds.length - 1] ?? null,
                selectedIds,
            });
            return;
        }
    }, [commit]);
    const duplicate = useCallback((id: string) => { const present = stateRef.current.present; for (const annotations of Object.values(present.annotationsByPageId)) { const source = annotations.find((annotation) => annotation.id === id); if (source) { add({ ...cloneAnnotation(source), x: source.x + 12, y: source.y - 12 }); return; } } }, [add]);
    const copy = useCallback((id: string) => { for (const annotations of Object.values(stateRef.current.present.annotationsByPageId)) { const source = annotations.find((annotation) => annotation.id === id); if (source) dispatch({ type: 'clipboard', annotation: source }); } }, []);
    const paste = useCallback((pageId: string) => { const clipboard = stateRef.current.present.clipboard; if (clipboard) add({ ...cloneAnnotation(clipboard, pageId), x: clipboard.x + 16, y: clipboard.y - 16 }); }, [add]);
    const reorder = useCallback((id: string, direction: 'forward' | 'backward') => {
        const present = stateRef.current.present;
        for (const [pageId, annotations] of Object.entries(present.annotationsByPageId)) {
            const index = annotations.findIndex((annotation) => annotation.id === id);
            if (index < 0) continue;
            const target = Math.max(0, Math.min(annotations.length - 1, index + (direction === 'forward' ? 1 : -1)));
            if (target === index) return;
            const reordered = [...annotations];
            [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
            const updatedAt = Date.now();
            const nextPage = reordered.map((annotation, zIndex) => {
                if (annotation.id === id) return { ...annotation, zIndex, updatedAt } as PdfAnnotation;
                return annotation.zIndex === zIndex ? annotation : { ...annotation, zIndex } as PdfAnnotation;
            });
            commit({
                ...present,
                annotationsByPageId: { ...present.annotationsByPageId, [pageId]: nextPage },
            });
            return;
        }
    }, [commit]);
    const removeSelected = useCallback(() => {
        const present = stateRef.current.present;
        if (!present.selectedIds.length) return;
        const selected = new Set(present.selectedIds);
        let removed = false;
        let annotationsByPageId = present.annotationsByPageId;
        for (const [pageId, annotations] of Object.entries(present.annotationsByPageId)) {
            const nextPage = annotations.filter((annotation) => !selected.has(annotation.id));
            if (nextPage.length === annotations.length) continue;
            if (!removed) annotationsByPageId = { ...present.annotationsByPageId };
            removed = true;
            annotationsByPageId[pageId] = nextPage;
        }
        if (!removed) return;
        commit({ ...present, annotationsByPageId, selectedId: null, selectedIds: [] });
    }, [commit]);
    const duplicateSelected = useCallback(() => {
        const present = stateRef.current.present;
        if (!present.selectedIds.length) return;
        const selected = new Set(present.selectedIds);
        const duplicates: PdfAnnotation[] = [];
        let annotationsByPageId = present.annotationsByPageId;
        for (const [pageId, annotations] of Object.entries(present.annotationsByPageId)) {
            const copies = annotations.filter((annotation) => selected.has(annotation.id)).map((annotation) => ({ ...cloneAnnotation(annotation), x: annotation.x + 12, y: annotation.y - 12 }));
            if (!copies.length) continue;
            if (!duplicates.length) annotationsByPageId = { ...present.annotationsByPageId };
            duplicates.push(...copies);
            annotationsByPageId[pageId] = [...annotations, ...copies];
        }
        if (!duplicates.length) return;
        const selectedIds = duplicates.map((annotation) => annotation.id);
        commit({ ...present, annotationsByPageId, selectedId: selectedIds[selectedIds.length - 1], selectedIds });
    }, [commit]);
    const alignSelected = useCallback((alignment: Alignment) => {
        const present = stateRef.current.present;
        const selectedIds = new Set(present.selectedIds);
        const selected = Object.values(present.annotationsByPageId).flat().filter((annotation) => selectedIds.has(annotation.id));
        if (selected.length < 2) return;
        const updatedAt = Date.now();
        const changed = new Map<string, PdfAnnotation>();
        for (const annotation of alignAnnotations(selected, alignment)) {
            const source = selected.find((candidate) => candidate.id === annotation.id);
            if (source && (source.x !== annotation.x || source.y !== annotation.y)) {
                changed.set(annotation.id, { ...annotation, updatedAt } as PdfAnnotation);
            }
        }
        if (!changed.size) return;
        let annotationsByPageId = present.annotationsByPageId;
        let copied = false;
        for (const [pageId, annotations] of Object.entries(present.annotationsByPageId)) {
            if (!annotations.some((annotation) => changed.has(annotation.id))) continue;
            if (!copied) annotationsByPageId = { ...present.annotationsByPageId };
            copied = true;
            annotationsByPageId[pageId] = annotations.map((annotation) => changed.get(annotation.id) ?? annotation);
        }
        commit({ ...present, annotationsByPageId });
    }, [commit]);
    const updateLayout = useCallback((patch: Partial<EditorPresent['layout']>) => { const present = stateRef.current.present; commit({ ...present, layout: { ...present.layout, ...patch } }); }, [commit]);
    const setFormValue = useCallback((name: string, value: string | boolean | string[]) => { const present = stateRef.current.present; commit({ ...present, formValues: { ...present.formValues, [name]: value } }); }, [commit]);
    const setFlattenForms = useCallback((flattenForms: boolean) => { const present = stateRef.current.present; commit({ ...present, flattenForms }); }, [commit]);
    const value = useMemo(() => ({ activeTool: state.present.activeTool, highlighterSettings: state.present.highlighterSettings, selectedId: state.present.selectedId, selectedIds: state.present.selectedIds, annotationsByPageId: state.present.annotationsByPageId, formValues: state.present.formValues, flattenForms: state.present.flattenForms, layout: state.present.layout, history: state.past, dirty: state.present.dirty, canUndo: state.past.length > 0, canRedo: state.future.length > 0, setTool: (tool: EditorTool) => dispatch({ type: 'tool', tool }), updateHighlighterSettings: (settings: Partial<EditorPresent['highlighterSettings']>) => dispatch({ type: 'highlighter-settings', settings }), select: (id: string | null, append = false) => dispatch({ type: 'select', id, append }), selectMany: (ids: string[]) => dispatch({ type: 'select-many', ids }), add, update, remove, removeSelected, duplicate, duplicateSelected, alignSelected, updateLayout, setFormValue, setFlattenForms, undo: () => dispatch({ type: 'undo' }), redo: () => dispatch({ type: 'redo' }), copy, paste, reorder }), [add, alignSelected, copy, duplicate, duplicateSelected, paste, remove, removeSelected, reorder, setFlattenForms, setFormValue, state, update, updateLayout]);
    return <PdfEditorContext.Provider value={value}>{children}</PdfEditorContext.Provider>;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import { createDocumentLoadingTask, getPdfDocumentInfo, releasePdfDocument } from '../services/pdfDocumentService';
import { validatePdfFile } from '../services/pdfValidationService';
import type { PdfRotation, PdfViewerState, ZoomPreset } from '../types/pdf';
import { getPdfErrorMessage } from '../utils/pdfErrors';
import { notify } from '../../../components/feedback/notifications';

const initialState: PdfViewerState = { phase: 'idle', document: null, loadingTask: null, info: null, progress: 0, currentPage: 1, zoom: 'fit-width', rotation: 0, error: null };

export function usePdfViewer() {
    const [state, setState] = useState<PdfViewerState>(initialState);
    const [lastFile, setLastFile] = useState<File | null>(null);
    const documentRef = useRef<PDFDocumentProxy | null>(null);
    const taskRef = useRef<PDFDocumentLoadingTask | null>(null);
    const requestRef = useRef(0);
    const mountedRef = useRef(true);

    const dispose = useCallback(async () => {
        const task = taskRef.current;
        const document = documentRef.current;
        taskRef.current = null;
        documentRef.current = null;
        await releasePdfDocument(task, document);
    }, []);

    const openFile = useCallback(async (file: File) => {
        const request = ++requestRef.current;
        await dispose();
        if (!mountedRef.current || request !== requestRef.current) return;
        setLastFile(file);
        setState({ ...initialState, phase: 'loading', progress: 1 });
        let task: PDFDocumentLoadingTask | null = null;
        let document: PDFDocumentProxy | null = null;
        try {
            const data = await validatePdfFile(file);
            if (request !== requestRef.current) return;
            task = createDocumentLoadingTask(data, (progress) => {
                if (mountedRef.current && request === requestRef.current) setState((current) => ({ ...current, progress }));
            });
            taskRef.current = task;
            document = await task.promise;
            if (request !== requestRef.current) { await task.destroy(); return; }
            documentRef.current = document;
            const info = await getPdfDocumentInfo(document, file);
            if (request !== requestRef.current) return;
            if (!mountedRef.current) return;
            setState({ phase: 'ready', document, loadingTask: task, info, progress: 100, currentPage: 1, zoom: 'fit-width', rotation: 0, error: null });
            notify(`${file.name} loaded successfully.`);
        } catch (error) {
            if (mountedRef.current && request === requestRef.current) {
                taskRef.current = null;
                documentRef.current = null;
                await releasePdfDocument(task, document);
                setState({ ...initialState, phase: 'error', error: getPdfErrorMessage(error) });
            }
        }
    }, [dispose]);

    const setUploadError = useCallback((message: string) => setState({ ...initialState, phase: 'error', error: message }), []);
    const failViewer = useCallback((message: string) => { ++requestRef.current; void dispose(); setState({ ...initialState, phase: 'error', error: message }); }, [dispose]);
    const retry = useCallback(() => { if (lastFile) void openFile(lastFile); }, [lastFile, openFile]);
    const closeDocument = useCallback(() => { ++requestRef.current; void dispose(); setLastFile(null); setState(initialState); }, [dispose]);
    const setCurrentPage = useCallback((page: number) => setState((current) => ({ ...current, currentPage: Math.min(Math.max(1, page), current.document?.numPages ?? 1) })), []);
    const setZoom = useCallback((zoom: ZoomPreset) => setState((current) => ({ ...current, zoom })), []);
    const setRotation = useCallback((rotation: PdfRotation) => setState((current) => ({ ...current, rotation })), []);

    useEffect(() => () => { mountedRef.current = false; ++requestRef.current; void dispose(); }, [dispose]);
    return { ...state, sourceFile: lastFile, openFile, retry, closeDocument, setCurrentPage, setZoom, setRotation, setUploadError, failViewer };
}

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { resetCompletedToolSource } from '../../../utils/toolReset';
import { loadPendingPdfFile } from '../../../utils/pendingPdfLifecycle';
import { usePdfViewer } from '../hooks/usePdfViewer';
import { PdfEngineContext, type PendingPdfFile } from './pdfEngineStore';

export function PdfEngineProvider({ children }: { children: ReactNode }) {
    const viewer = usePdfViewer();
    const { closeDocument: closeViewerDocument, openFile: openViewerFile } = viewer;
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingPdfRef = useRef<PendingPdfFile | null>(null);
    const pendingLoadRef = useRef<{ pending: PendingPdfFile; promise: Promise<boolean> } | null>(null);
    const [pendingPdfFile, setPendingPdfFile] = useState<PendingPdfFile | null>(null);
    const stagedFile = pendingPdfFile?.file ?? null;
    const loading = viewer.phase === 'loading';
    const openFilePicker = useCallback(() => {
        if (!loading) inputRef.current?.click();
    }, [loading]);
    const stageFile = useCallback((file: File) => {
        closeViewerDocument();
        pendingLoadRef.current = null;
        const pending = { file, source: 'landing-page', selectedAt: Date.now() } as const;
        pendingPdfRef.current = pending;
        setPendingPdfFile(pending);
    }, [closeViewerDocument]);
    const clearStagedFile = useCallback(() => {
        pendingPdfRef.current = null;
        pendingLoadRef.current = null;
        setPendingPdfFile(null);
    }, []);
    const loadPdfFile = useCallback(async (file: File) => {
        const loaded = await openViewerFile(file);
        if (loaded && pendingPdfRef.current) clearStagedFile();
        return loaded;
    }, [clearStagedFile, openViewerFile]);
    const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const [file] = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (file && !loading) void loadPdfFile(file);
    }, [loadPdfFile, loading]);
    const consumePendingPdf = useCallback(async () => {
        const pending = pendingPdfRef.current;
        if (!pending) return false;
        if (pendingLoadRef.current?.pending === pending) return pendingLoadRef.current.promise;

        const promise = loadPendingPdfFile(pending, () => pendingPdfRef.current, openViewerFile, clearStagedFile).finally(() => {
            if (pendingLoadRef.current?.pending === pending) pendingLoadRef.current = null;
        });
        pendingLoadRef.current = { pending, promise };
        return promise;
    }, [clearStagedFile, openViewerFile]);
    const openStagedFile = useCallback(() => {
        return consumePendingPdf();
    }, [consumePendingPdf]);
    const closeDocument = useCallback(() => {
        resetCompletedToolSource({ clearSource: closeViewerDocument, fileInputs: [inputRef.current] });
        clearStagedFile();
    }, [clearStagedFile, closeViewerDocument]);
    const value = useMemo(() => ({ ...viewer, openFile: loadPdfFile, closeDocument, openFilePicker, pendingPdfFile, stagedFile, stageFile, clearStagedFile, openStagedFile, consumePendingPdf }), [viewer, loadPdfFile, closeDocument, openFilePicker, pendingPdfFile, stagedFile, stageFile, clearStagedFile, openStagedFile, consumePendingPdf]);

    return <PdfEngineContext.Provider value={value}><input ref={inputRef} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={loading} onChange={onFileChange} tabIndex={-1} aria-hidden="true" />{children}</PdfEngineContext.Provider>;
}

import { useCallback, useMemo, useRef, type ChangeEvent, type ReactNode } from 'react';
import { resetCompletedToolSource } from '../../../utils/toolReset';
import { usePdfViewer } from '../hooks/usePdfViewer';
import { PdfEngineContext } from './pdfEngineStore';

export function PdfEngineProvider({ children }: { children: ReactNode }) {
    const viewer = usePdfViewer();
    const { closeDocument: closeViewerDocument, openFile } = viewer;
    const inputRef = useRef<HTMLInputElement>(null);
    const loading = viewer.phase === 'loading';
    const openFilePicker = useCallback(() => {
        if (!loading) inputRef.current?.click();
    }, [loading]);
    const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const [file] = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (file && !loading) void openFile(file);
    }, [loading, openFile]);
    const closeDocument = useCallback(() => {
        resetCompletedToolSource({ clearSource: closeViewerDocument, fileInputs: [inputRef.current] });
    }, [closeViewerDocument]);
    const value = useMemo(() => ({ ...viewer, closeDocument, openFilePicker }), [viewer, closeDocument, openFilePicker]);

    return <PdfEngineContext.Provider value={value}><input ref={inputRef} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={loading} onChange={onFileChange} tabIndex={-1} aria-hidden="true" />{children}</PdfEngineContext.Provider>;
}

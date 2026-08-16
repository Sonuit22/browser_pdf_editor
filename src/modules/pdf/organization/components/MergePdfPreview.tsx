import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { validatePdfFile } from '../../services/pdfValidationService';

type Props = {
    file: File;
    fileKey: string;
    onPageCount: (fileKey: string, pageCount: number) => void;
};

export function MergePdfPreview({ file, fileKey, onPageCount }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        let cancelled = false;
        let loadingTask: PDFDocumentLoadingTask | null = null;
        let document: PDFDocumentProxy | null = null;
        let page: PDFPageProxy | null = null;
        let renderTask: RenderTask | null = null;
        let releasePdfDocument = async (task: PDFDocumentLoadingTask | null, pdf: PDFDocumentProxy | null) => {
            await task?.destroy().catch(() => undefined);
            await pdf?.cleanup().catch(() => undefined);
        };

        const render = async () => {
            try {
                const data = await validatePdfFile(file);
                if (cancelled) return;
                const documentService = await import('../../services/pdfDocumentService');
                releasePdfDocument = documentService.releasePdfDocument;
                const { createDocumentLoadingTask } = documentService;
                if (cancelled) return;
                loadingTask = createDocumentLoadingTask(data, () => undefined);
                document = await loadingTask.promise;
                if (cancelled) return;
                onPageCount(fileKey, document.numPages);
                page = await document.getPage(1);
                if (cancelled) return;
                const baseViewport = page.getViewport({ scale: 1 });
                const cssWidth = 96;
                const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
                const viewport = page.getViewport({ scale: cssWidth / baseViewport.width * pixelRatio });
                const canvas = canvasRef.current;
                if (!canvas) return;
                canvas.width = Math.max(1, Math.round(viewport.width));
                canvas.height = Math.max(1, Math.round(viewport.height));
                canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
                const context = canvas.getContext('2d', { alpha: false });
                if (!context) throw new Error('Canvas rendering is unavailable.');
                renderTask = page.render({ canvas, canvasContext: context, viewport });
                await renderTask.promise;
                if (!cancelled) setStatus('ready');
            } catch (error) {
                if (!cancelled && !(error instanceof DOMException && error.name === 'AbortError')) setStatus('error');
            } finally {
                page?.cleanup();
                if (!cancelled) await releasePdfDocument(loadingTask, document);
            }
        };
        void render();
        return () => {
            cancelled = true;
            renderTask?.cancel();
            page?.cleanup();
            void releasePdfDocument(loadingTask, document);
        };
    }, [file, fileKey, onPageCount]);

    return <figure className={`merge-file-preview is-${status}`} aria-label={`First page preview of ${file.name}`}>
        <canvas ref={canvasRef} aria-hidden="true" />
        {status !== 'ready' && <span>{status === 'loading' ? 'Loading preview' : 'Preview unavailable'}</span>}
    </figure>;
}

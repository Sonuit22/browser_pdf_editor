import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PageViewport, PDFPageProxy } from 'pdfjs-dist';
import type { WorkingPage } from '../organization/types/pages';
import { normalizePageRotation } from '../organization/utils/pageUtils';
import type { PdfRotation, ZoomPreset } from '../types/pdf';

export type PdfPageLayout = { viewport: PageViewport; width: number; height: number };
type PdfPageCanvasProps = { page: WorkingPage; pageNumber: number; getPage: (page: WorkingPage) => Promise<PDFPageProxy>; zoom: ZoomPreset; rotation: PdfRotation; onRenderError: () => void; children?: (layout: PdfPageLayout) => ReactNode };

function blankViewport(page: WorkingPage, scale: number, rotation: number): PageViewport {
    const width = page.width * scale;
    const height = page.height * scale;
    const normalized = normalizePageRotation(rotation);
    const viewportWidth = normalized === 90 || normalized === 270 ? height : width;
    const viewportHeight = normalized === 90 || normalized === 270 ? width : height;
    const convertToViewportPoint = (x: number, y: number): [number, number] => {
        if (normalized === 90) return [y * scale, x * scale];
        if (normalized === 180) return [(page.width - x) * scale, y * scale];
        if (normalized === 270) return [(page.height - y) * scale, (page.width - x) * scale];
        return [x * scale, (page.height - y) * scale];
    };
    const convertToPdfPoint = (x: number, y: number): [number, number] => {
        if (normalized === 90) return [y / scale, x / scale];
        if (normalized === 180) return [page.width - x / scale, y / scale];
        if (normalized === 270) return [page.width - y / scale, page.height - x / scale];
        return [x / scale, page.height - y / scale];
    };
    return { width: viewportWidth, height: viewportHeight, scale, rotation: normalized, convertToViewportPoint, convertToPdfPoint } as unknown as PageViewport;
}

function drawBlankPage(canvas: HTMLCanvasElement, viewport: PageViewport) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, viewport.width, viewport.height);
}

export function PdfPageCanvas({ page, pageNumber, getPage, zoom, rotation, onRenderError, children }: PdfPageCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [layout, setLayout] = useState<PdfPageLayout | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;
        let frame = 0;
        const observer = new ResizeObserver(([entry]) => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setSize({ width: entry.contentRect.width, height: entry.contentRect.height })); });
        observer.observe(element);
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, []);

    useEffect(() => {
        let cancelled = false;
        let renderTask: ReturnType<PDFPageProxy['render']> | null = null;
        const effectCanvas = canvasRef.current;
        const render = async () => {
            let sourcePage: PDFPageProxy | null = null;
            try {
                setLayout(null);
                const effectiveRotation = normalizePageRotation(page.rotation + rotation);
                sourcePage = page.kind === 'source' ? await getPage(page) : null;
                const baseViewport = sourcePage ? sourcePage.getViewport({ scale: 1, rotation: effectiveRotation }) : blankViewport(page, 1, effectiveRotation);
                const padding = 32;
                const scale = typeof zoom === 'number'
                    ? zoom / 100
                    : zoom === 'fit-page'
                        ? Math.max(0.1, Math.min((size.width - padding) / baseViewport.width, (size.height - padding) / baseViewport.height))
                        : Math.max(0.1, (size.width - padding) / baseViewport.width);
                const viewport = sourcePage ? sourcePage.getViewport({ scale, rotation: effectiveRotation }) : blankViewport(page, scale, effectiveRotation);
                const canvas = canvasRef.current;
                const context = canvas?.getContext('2d');
                if (!canvas || !context || cancelled) return;
                setLayout({ viewport, width: viewport.width, height: viewport.height });
                if (!sourcePage) {
                    drawBlankPage(canvas, viewport);
                    return;
                }
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.floor(viewport.width * pixelRatio);
                canvas.height = Math.floor(viewport.height * pixelRatio);
                canvas.style.width = `${Math.floor(viewport.width)}px`;
                canvas.style.height = `${Math.floor(viewport.height)}px`;
                renderTask = sourcePage.render({ canvas, canvasContext: context, viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] });
                await renderTask.promise;
            } catch {
                if (!cancelled) onRenderError();
            } finally {
                sourcePage?.cleanup();
            }
        };
        if (size.width && size.height) void render();
        return () => {
            cancelled = true;
            renderTask?.cancel();
            if (effectCanvas) {
                effectCanvas.width = 0;
                effectCanvas.height = 0;
            }
        };
    }, [getPage, onRenderError, page, rotation, size.height, size.width, zoom]);

    return <div ref={containerRef} className="pdf-canvas-stage"><div className="pdf-page-frame" style={layout ? { width: layout.width, height: layout.height } : undefined}><canvas ref={canvasRef} aria-label={`PDF page ${pageNumber}`} />{layout && children?.(layout)}</div></div>;
}

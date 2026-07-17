import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { WorkingPage } from '../organization/types/pages';
import { normalizePageRotation } from '../organization/utils/pageUtils';
import type { PdfRotation } from '../types/pdf';

type PdfThumbnailProps = { page: WorkingPage; pageNumber: number; active: boolean; rotation: PdfRotation; getPage: (page: WorkingPage) => Promise<PDFPageProxy>; onSelect: (pageId: string, event: MouseEvent<HTMLButtonElement>) => void };

export function PdfThumbnail({ page, pageNumber, active, rotation, getPage, onSelect }: PdfThumbnailProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [visible, setVisible] = useState(pageNumber === 1);

    useEffect(() => {
        const element = buttonRef.current;
        if (!element || visible) return;
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: '160px 0px' });
        observer.observe(element);
        return () => observer.disconnect();
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        let cancelled = false;
        let renderTask: ReturnType<PDFPageProxy['render']> | null = null;
        const render = async () => {
            try {
                const canvas = canvasRef.current;
                const context = canvas?.getContext('2d');
                if (!canvas || !context || cancelled) return;
                const effectiveRotation = normalizePageRotation(page.rotation + rotation);
                if (page.kind === 'blank') {
                    const portraitWidth = effectiveRotation === 90 || effectiveRotation === 270 ? page.height : page.width;
                    const portraitHeight = effectiveRotation === 90 || effectiveRotation === 270 ? page.width : page.height;
                    const scale = 112 / portraitWidth;
                    canvas.width = Math.floor(portraitWidth * scale);
                    canvas.height = Math.floor(portraitHeight * scale);
                    canvas.style.width = `${Math.floor(portraitWidth * scale)}px`;
                    canvas.style.height = `${Math.floor(portraitHeight * scale)}px`;
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    return;
                }
                const source = await getPage(page);
                const viewport = source.getViewport({ scale: 1, rotation: effectiveRotation });
                const scale = 112 / viewport.width;
                const thumbnail = source.getViewport({ scale, rotation: effectiveRotation });
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
                canvas.width = Math.floor(thumbnail.width * pixelRatio);
                canvas.height = Math.floor(thumbnail.height * pixelRatio);
                canvas.style.width = `${Math.floor(thumbnail.width)}px`;
                canvas.style.height = `${Math.floor(thumbnail.height)}px`;
                renderTask = source.render({ canvas, canvasContext: context, viewport: thumbnail, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] });
                await renderTask.promise;
            } catch { /* A thumbnail failure must not interrupt the viewer. */ }
        };
        void render();
        return () => { cancelled = true; renderTask?.cancel(); };
    }, [getPage, page, rotation, visible]);

    return <button ref={buttonRef} className={`pdf-thumbnail${active ? ' is-active' : ''}`} type="button" onClick={(event) => onSelect(page.id, event)} aria-label={`Go to page ${pageNumber}`} aria-current={active ? 'page' : undefined}><canvas ref={canvasRef} /><span>{pageNumber}</span></button>;
}

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { PageViewport, PDFPageProxy } from 'pdfjs-dist';
import type { PdfAnnotation } from '../editor/types/annotations';
import { createAnnotationImageCache, renderAnnotationsToCanvas } from '../editor/services/canvasAnnotationRenderer';
import type { WorkingPage } from '../organization/types/pages';
import { normalizePageRotation } from '../organization/utils/pageUtils';
import type { PdfRotation } from '../types/pdf';

type PdfThumbnailProps = {
    page: WorkingPage;
    pageNumber: number;
    active: boolean;
    rotation: PdfRotation;
    getPage: (page: WorkingPage) => Promise<PDFPageProxy>;
    onSelect: (pageId: string, event: MouseEvent<HTMLButtonElement>) => void;
    annotations?: PdfAnnotation[];
    previewAnnotation?: PdfAnnotation | null;
    formValues?: Record<string, string | boolean | string[]>;
};

type ThumbnailLayout = { viewport: PageViewport; pixelRatio: number; width: number; height: number };

function blankViewport(page: WorkingPage, scale: number, rotation: number): PageViewport {
    const normalized = normalizePageRotation(rotation);
    const width = page.width * scale;
    const height = page.height * scale;
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

function annotationRevision(annotations: PdfAnnotation[]) {
    return annotations.map((annotation) => `${annotation.id}:${annotation.updatedAt}:${annotation.zIndex}`).join('|');
}

function previewRevision(annotation: PdfAnnotation | null | undefined) {
    if (!annotation) return '';
    if (annotation.type !== 'draw' && annotation.type !== 'highlight') return `${annotation.id}:${annotation.updatedAt}:${annotation.zIndex}`;
    const last = annotation.points[annotation.points.length - 1];
    return `${annotation.id}:${annotation.updatedAt}:${annotation.points.length}:${last?.x ?? ''}:${last?.y ?? ''}`;
}

function formRevision(annotations: PdfAnnotation[], formValues: Record<string, string | boolean | string[]> | undefined) {
    if (!formValues) return '';
    return annotations.flatMap((annotation) => 'name' in annotation ? [`${annotation.name}:${JSON.stringify(formValues[annotation.name])}`] : []).join('|');
}

function effectiveAnnotations(annotations: PdfAnnotation[], preview: PdfAnnotation | null | undefined, pageId: string) {
    if (!preview || preview.pageId !== pageId) return annotations;
    const existing = annotations.findIndex((annotation) => annotation.id === preview.id);
    if (existing < 0) return [...annotations, preview];
    const next = [...annotations];
    next[existing] = preview;
    return next;
}

export function PdfThumbnail({ page, pageNumber, active, rotation, getPage, onSelect, annotations = [], previewAnnotation = null, formValues }: PdfThumbnailProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const annotationJobRef = useRef(0);
    const imageCacheRef = useRef(createAnnotationImageCache());
    const annotationsRef = useRef(annotations);
    const previewRef = useRef(previewAnnotation);
    const formValuesRef = useRef(formValues);
    annotationsRef.current = annotations;
    previewRef.current = previewAnnotation;
    formValuesRef.current = formValues;
    const annotationsVersion = annotationRevision(annotations);
    const previewVersion = previewRevision(previewAnnotation);
    const formsVersion = formRevision(annotations, formValues);
    const [visible, setVisible] = useState(pageNumber === 1);
    const [layout, setLayout] = useState<ThumbnailLayout | null>(null);

    useEffect(() => {
        const element = buttonRef.current;
        if (!element || visible) return;
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: '160px 0px' });
        observer.observe(element);
        return () => observer.disconnect();
    }, [visible]);

    useEffect(() => { if (active) setVisible(true); }, [active]);

    useEffect(() => {
        if (!visible) return;
        let cancelled = false;
        let renderTask: ReturnType<PDFPageProxy['render']> | null = null;
        const baseCanvas = baseCanvasRef.current;
        const annotationCanvas = annotationCanvasRef.current;
        const imageCache = imageCacheRef.current;
        setLayout(null);
        const render = async () => {
            let source: PDFPageProxy | null = null;
            try {
                const canvas = baseCanvasRef.current;
                const context = canvas?.getContext('2d');
                if (!canvas || !context || cancelled) return;
                const effectiveRotation = normalizePageRotation(page.rotation + rotation);
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
                if (page.kind === 'blank') {
                    const rotatedWidth = effectiveRotation === 90 || effectiveRotation === 270 ? page.height : page.width;
                    const scale = 112 / rotatedWidth;
                    const viewport = blankViewport(page, scale, effectiveRotation);
                    canvas.width = Math.max(1, Math.floor(viewport.width * pixelRatio));
                    canvas.height = Math.max(1, Math.floor(viewport.height * pixelRatio));
                    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, viewport.width, viewport.height);
                    if (!cancelled) setLayout({ viewport, pixelRatio, width: viewport.width, height: viewport.height });
                    return;
                }
                source = await getPage(page);
                if (cancelled) return;
                const viewport = source.getViewport({ scale: 1, rotation: effectiveRotation });
                const scale = 112 / viewport.width;
                const thumbnail = source.getViewport({ scale, rotation: effectiveRotation });
                canvas.width = Math.max(1, Math.floor(thumbnail.width * pixelRatio));
                canvas.height = Math.max(1, Math.floor(thumbnail.height * pixelRatio));
                if (!cancelled) setLayout({ viewport: thumbnail, pixelRatio, width: thumbnail.width, height: thumbnail.height });
                renderTask = source.render({ canvas, canvasContext: context, viewport: thumbnail, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] });
                await renderTask.promise;
            } catch { /* A thumbnail failure must not interrupt the viewer. */ }
            finally { source?.cleanup(); }
        };
        void render();
        return () => {
            cancelled = true;
            renderTask?.cancel();
            annotationJobRef.current += 1;
            imageCache.clear();
            if (baseCanvas) { baseCanvas.width = 0; baseCanvas.height = 0; }
            if (annotationCanvas) { annotationCanvas.width = 0; annotationCanvas.height = 0; }
        };
    }, [getPage, page, rotation, visible]);

    useEffect(() => {
        if (!visible || !layout) return;
        const target = annotationCanvasRef.current;
        const targetContext = target?.getContext('2d');
        if (!target || !targetContext) return;
        const targetWidth = Math.max(1, Math.floor(layout.width * layout.pixelRatio));
        const targetHeight = Math.max(1, Math.floor(layout.height * layout.pixelRatio));
        if (target.width !== targetWidth) target.width = targetWidth;
        if (target.height !== targetHeight) target.height = targetHeight;
        const currentAnnotations = effectiveAnnotations(annotationsRef.current, previewRef.current, page.id);
        const currentImageSources = new Set(currentAnnotations.flatMap((annotation) => annotation.type === 'image' || annotation.type === 'signature' ? [annotation.source] : []));
        for (const source of imageCacheRef.current.keys()) if (!currentImageSources.has(source)) imageCacheRef.current.delete(source);
        if (!currentAnnotations.length) {
            targetContext.clearRect(0, 0, target.width, target.height);
            return;
        }

        const controller = new AbortController();
        const job = ++annotationJobRef.current;
        const scratch = document.createElement('canvas');
        scratch.width = target.width;
        scratch.height = target.height;
        const scratchContext = scratch.getContext('2d');
        const render = async () => {
            try {
                if (!scratchContext) return;
                await renderAnnotationsToCanvas({
                    context: scratchContext,
                    viewport: layout.viewport,
                    pixelRatio: layout.pixelRatio,
                    annotations: currentAnnotations,
                    formValues: formValuesRef.current,
                    signal: controller.signal,
                    imageCache: imageCacheRef.current,
                });
                if (controller.signal.aborted || job !== annotationJobRef.current || target.width !== scratch.width || target.height !== scratch.height) return;
                targetContext.setTransform(1, 0, 0, 1, 0, 0);
                targetContext.clearRect(0, 0, target.width, target.height);
                targetContext.drawImage(scratch, 0, 0);
            } catch { /* An annotation preview failure must not interrupt the viewer. */ }
            finally { scratch.width = 0; scratch.height = 0; }
        };
        void render();
        return () => controller.abort();
    }, [annotationsVersion, formsVersion, layout, page.id, previewVersion, visible]);

    const stackStyle = layout ? { width: layout.width, aspectRatio: `${layout.width} / ${layout.height}` } : undefined;
    return <button ref={buttonRef} className={`pdf-thumbnail${active ? ' is-active' : ''}`} type="button" onClick={(event) => onSelect(page.id, event)} aria-label={`Go to page ${pageNumber}`} aria-current={active ? 'page' : undefined}><span className="pdf-thumbnail__canvas-stack" style={stackStyle}><canvas ref={baseCanvasRef} className="pdf-thumbnail__base-canvas" /><canvas ref={annotationCanvasRef} className="pdf-thumbnail__annotation-canvas" aria-hidden="true" /></span><span>{pageNumber}</span></button>;
}

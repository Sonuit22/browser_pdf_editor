import type { PageViewport } from 'pdfjs-dist';
import type { AnnotationBounds, Point } from '../types/annotations';

export function clientPointToPdfPoint(event: PointerEvent | React.PointerEvent, element: HTMLElement, viewport: PageViewport): Point { const rect = element.getBoundingClientRect(); const [x, y] = viewport.convertToPdfPoint(event.clientX - rect.left, event.clientY - rect.top); return { x, y }; }
export function pdfPageSize(viewport: PageViewport) {
    const rotated = Math.abs(viewport.rotation % 180) === 90;
    return {
        width: (rotated ? viewport.height : viewport.width) / viewport.scale,
        height: (rotated ? viewport.width : viewport.height) / viewport.scale,
    };
}
export function clampPdfPoint(point: Point, pageWidth: number, pageHeight: number): Point {
    return {
        x: Math.max(0, Math.min(pageWidth, point.x)),
        y: Math.max(0, Math.min(pageHeight, point.y)),
    };
}
export function pdfBoundsToViewport(bounds: AnnotationBounds, viewport: PageViewport) { const first = viewport.convertToViewportPoint(bounds.x, bounds.y); const second = viewport.convertToViewportPoint(bounds.x + bounds.width, bounds.y + bounds.height); return { left: Math.min(first[0], second[0]), top: Math.min(first[1], second[1]), width: Math.abs(second[0] - first[0]), height: Math.abs(second[1] - first[1]) }; }
export function pdfPointToViewport(point: Point, viewport: PageViewport) { const [x, y] = viewport.convertToViewportPoint(point.x, point.y); return { x, y }; }
export function safeEditedFilename(filename: string) { const base = filename.replace(/[\\/:*?"<>|]/g, '-').replace(/\.pdf$/i, '') || 'document'; return `${base}-edited.pdf`; }

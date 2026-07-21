import type { AnnotationBounds, AnnotationId, PdfAnnotation, Point } from '../types/annotations';

export function createAnnotationId(): AnnotationId { return globalThis.crypto?.randomUUID?.() ?? `annotation-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function boundsFromPoints(start: Point, end: Point): AnnotationBounds { return { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.max(2, Math.abs(end.x - start.x)), height: Math.max(2, Math.abs(end.y - start.y)) }; }
export function clampBounds(bounds: AnnotationBounds, pageWidth: number, pageHeight: number): AnnotationBounds { const width = Math.max(2, Math.min(bounds.width, pageWidth)); const height = Math.max(2, Math.min(bounds.height, pageHeight)); return { x: Math.max(0, Math.min(bounds.x, pageWidth - width)), y: Math.max(0, Math.min(bounds.y, pageHeight - height)), width, height }; }
export function cloneAnnotation(annotation: PdfAnnotation, pageId = annotation.pageId): PdfAnnotation { const timestamp = Date.now(); return { ...annotation, id: createAnnotationId(), pageId, createdAt: timestamp, updatedAt: timestamp } as PdfAnnotation; }

export function pathBounds(points: Point[]): AnnotationBounds {
    if (!points.length) return { x: 0, y: 0, width: 2, height: 2 };
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(2, Math.max(...xs) - x), height: Math.max(2, Math.max(...ys) - y) };
}

export function resizePathPoints(points: Point[], original: AnnotationBounds, resized: AnnotationBounds): Point[] {
    const scaleX = resized.width / Math.max(2, original.width);
    const scaleY = resized.height / Math.max(2, original.height);
    return points.map((point) => ({
        x: resized.x + (point.x - original.x) * scaleX,
        y: resized.y + (point.y - original.y) * scaleY,
    }));
}

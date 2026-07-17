import type { AnnotationBounds, AnnotationId, PdfAnnotation, Point } from '../types/annotations';

export function createAnnotationId(): AnnotationId { return globalThis.crypto?.randomUUID?.() ?? `annotation-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function boundsFromPoints(start: Point, end: Point): AnnotationBounds { return { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.max(2, Math.abs(end.x - start.x)), height: Math.max(2, Math.abs(end.y - start.y)) }; }
export function clampBounds(bounds: AnnotationBounds, pageWidth: number, pageHeight: number): AnnotationBounds { const width = Math.max(2, Math.min(bounds.width, pageWidth)); const height = Math.max(2, Math.min(bounds.height, pageHeight)); return { x: Math.max(0, Math.min(bounds.x, pageWidth - width)), y: Math.max(0, Math.min(bounds.y, pageHeight - height)), width, height }; }
export function cloneAnnotation(annotation: PdfAnnotation, pageId = annotation.pageId): PdfAnnotation { const timestamp = Date.now(); return { ...annotation, id: createAnnotationId(), pageId, createdAt: timestamp, updatedAt: timestamp } as PdfAnnotation; }

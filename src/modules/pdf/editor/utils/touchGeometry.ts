import type { PdfAnnotation } from '../types/annotations';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function resizeBounds(annotation: PdfAnnotation, dx: number, dy: number, handle: ResizeHandle) {
    let { x, y, width, height } = annotation;
    if (handle.includes('e')) width += dx;
    if (handle.includes('w')) { x += dx; width -= dx; }
    if (handle.includes('n')) height += dy;
    if (handle.includes('s')) { y += dy; height -= dy; }
    const minWidth = annotation.type === 'text' ? 80 : 20;
    const minHeight = annotation.type === 'text' ? 36 : 20;
    width = Math.max(minWidth, width); height = Math.max(minHeight, height);
    if ((annotation.type === 'image' || annotation.type === 'signature') && ['nw', 'ne', 'se', 'sw'].includes(handle)) {
        const ratio = annotation.aspectRatio || annotation.width / annotation.height;
        const nextHeight = width / ratio;
        if (handle.includes('n')) y += height - nextHeight;
        height = Math.max(minHeight, nextHeight);
    }
    return { x, y, width, height };
}

export function constrainBounds<T extends { x: number; y: number; width: number; height: number }>(bounds: T, pageWidth: number, pageHeight: number) {
    const width = Math.min(bounds.width, pageWidth); const height = Math.min(bounds.height, pageHeight);
    return { x: Math.max(0, Math.min(pageWidth - width, bounds.x)), y: Math.max(0, Math.min(pageHeight - height, bounds.y)), width, height };
}

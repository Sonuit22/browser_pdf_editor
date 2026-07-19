import type { PdfAnnotation } from '../types/annotations';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function resizeBounds(annotation: PdfAnnotation, dx: number, dy: number, handle: ResizeHandle) {
    let { x, y, width, height } = annotation;
    if (handle.includes('e')) width += dx;
    if (handle.includes('w')) { x += dx; width -= dx; }
    if (handle.includes('n')) height += dy;
    if (handle.includes('s')) { y += dy; height -= dy; }
    if ((annotation.type === 'image' || annotation.type === 'signature') && ['nw', 'ne', 'se', 'sw'].includes(handle)) {
        const ratio = annotation.aspectRatio || annotation.width / annotation.height;
        const minimumWidth = Math.max(20, 20 * ratio);
        const candidateWidth = Math.max(minimumWidth, width);
        const candidateHeight = Math.max(20, height);
        const fromWidth = { width: candidateWidth, height: candidateWidth / ratio };
        const fromHeight = { width: candidateHeight * ratio, height: candidateHeight };
        const widthChange = Math.abs(candidateWidth - annotation.width);
        const heightChangeAtRatio = Math.abs(fromHeight.width - annotation.width);
        const next = widthChange >= heightChangeAtRatio ? fromWidth : fromHeight;
        const anchorX = handle.includes('w') ? annotation.x + annotation.width : annotation.x;
        const anchorY = handle.includes('s') ? annotation.y + annotation.height : annotation.y;
        width = next.width;
        height = next.height;
        x = handle.includes('w') ? anchorX - width : anchorX;
        y = handle.includes('s') ? anchorY - height : anchorY;
    } else {
        const minWidth = annotation.type === 'text' ? 80 : 20;
        const minHeight = annotation.type === 'text' ? 36 : 20;
        if (width < minWidth) {
            if (handle.includes('w')) x = annotation.x + annotation.width - minWidth;
            width = minWidth;
        }
        if (height < minHeight) {
            if (handle.includes('s')) y = annotation.y + annotation.height - minHeight;
            height = minHeight;
        }
    }
    return { x, y, width, height };
}

export function resizeHandleForPageRotation(handle: ResizeHandle, rotation: number): ResizeHandle {
    const directions = handle.split('') as Array<'n' | 'e' | 's' | 'w'>;
    const normalized = ((rotation % 360) + 360) % 360;
    const turns = Math.round(normalized / 90) % 4;
    const order = ['n', 'e', 's', 'w'] as const;
    const mapped = directions.map((direction) => order[(order.indexOf(direction) - turns + 4) % 4]);
    const contains = (direction: typeof order[number]) => mapped.includes(direction);
    if (mapped.length === 1) return mapped[0];
    if (contains('n')) return contains('e') ? 'ne' : 'nw';
    return contains('e') ? 'se' : 'sw';
}

export function constrainBounds<T extends { x: number; y: number; width: number; height: number }>(bounds: T, pageWidth: number, pageHeight: number) {
    const width = Math.min(bounds.width, pageWidth); const height = Math.min(bounds.height, pageHeight);
    return { x: Math.max(0, Math.min(pageWidth - width, bounds.x)), y: Math.max(0, Math.min(pageHeight - height, bounds.y)), width, height };
}

export function constrainAnnotationBounds(annotation: PdfAnnotation, bounds: { x: number; y: number; width: number; height: number }, pageWidth: number, pageHeight: number) {
    if (annotation.type !== 'image' && annotation.type !== 'signature') return constrainBounds(bounds, pageWidth, pageHeight);
    const ratio = annotation.aspectRatio || annotation.width / annotation.height;
    let width = Math.min(bounds.width, pageWidth);
    let height = width / ratio;
    if (height > pageHeight) {
        height = pageHeight;
        width = height * ratio;
    }
    return constrainBounds({ ...bounds, width, height }, pageWidth, pageHeight);
}

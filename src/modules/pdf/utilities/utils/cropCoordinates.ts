import type { PageViewport } from 'pdfjs-dist';
import type { CropBox, CropDistribution } from '../types/utilities';

export type PageDimensions = { width: number; height: number };
export type ViewportRect = { left: number; top: number; width: number; height: number };
export type CropHandle = 'move' | 'create' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

const minimumCropSize = 12;

export function normalizeCropMargins(crop: CropBox, page: PageDimensions, minimum = minimumCropSize): CropBox {
    const maxHorizontal = Math.max(0, page.width - minimum);
    const maxVertical = Math.max(0, page.height - minimum);
    const left = clamp(crop.left, 0, maxHorizontal);
    const bottom = clamp(crop.bottom, 0, maxVertical);
    return {
        left,
        bottom,
        right: clamp(crop.right, 0, Math.max(0, maxHorizontal - left)),
        top: clamp(crop.top, 0, Math.max(0, maxVertical - bottom)),
    };
}

export function cropMarginsToPdfRect(crop: CropBox, page: PageDimensions) {
    const normalized = normalizeCropMargins(crop, page);
    return { x: normalized.left, y: normalized.bottom, width: page.width - normalized.left - normalized.right, height: page.height - normalized.top - normalized.bottom };
}

export function pdfRectToCropMargins(rect: { x: number; y: number; width: number; height: number }, page: PageDimensions) {
    return normalizeCropMargins({ left: rect.x, bottom: rect.y, right: page.width - rect.x - rect.width, top: page.height - rect.y - rect.height }, page);
}

export function cropMarginsToViewportRect(crop: CropBox, page: PageDimensions, viewport: PageViewport): ViewportRect {
    const rect = cropMarginsToPdfRect(crop, page);
    const corners: Array<[number, number]> = [[rect.x, rect.y], [rect.x + rect.width, rect.y], [rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    const points: Array<[number, number]> = corners.map(([x, y]) => viewport.convertToViewportPoint(x, y) as [number, number]);
    return viewportBounds(points);
}

export function viewportRectToCropMargins(rect: ViewportRect, page: PageDimensions, viewport: PageViewport) {
    const corners: Array<[number, number]> = [[rect.left, rect.top], [rect.left + rect.width, rect.top], [rect.left, rect.top + rect.height], [rect.left + rect.width, rect.top + rect.height]];
    const points: Array<[number, number]> = corners.map(([x, y]) => viewport.convertToPdfPoint(x, y) as [number, number]);
    const left = Math.min(...points.map(([x]) => x));
    const right = Math.max(...points.map(([x]) => x));
    const bottom = Math.min(...points.map(([, y]) => y));
    const top = Math.max(...points.map(([, y]) => y));
    return pdfRectToCropMargins({ x: left, y: bottom, width: right - left, height: top - bottom }, page);
}

export function moveViewportRect(rect: ViewportRect, deltaX: number, deltaY: number, viewport: { width: number; height: number }): ViewportRect {
    return { ...rect, left: clamp(rect.left + deltaX, 0, Math.max(0, viewport.width - rect.width)), top: clamp(rect.top + deltaY, 0, Math.max(0, viewport.height - rect.height)) };
}

export function resizeViewportRect(rect: ViewportRect, handle: Exclude<CropHandle, 'move' | 'create'>, point: { x: number; y: number }, viewport: { width: number; height: number }): ViewportRect {
    let left = rect.left;
    let right = rect.left + rect.width;
    let top = rect.top;
    let bottom = rect.top + rect.height;
    if (handle.includes('w')) left = clamp(point.x, 0, right - 1);
    if (handle.includes('e')) right = clamp(point.x, left + 1, viewport.width);
    if (handle.includes('n')) top = clamp(point.y, 0, bottom - 1);
    if (handle.includes('s')) bottom = clamp(point.y, top + 1, viewport.height);
    return { left, top, width: right - left, height: bottom - top };
}

export function projectCropMargins(crop: CropBox, source: PageDimensions, target: PageDimensions, distribution: CropDistribution) {
    if (distribution === 'absolute') return normalizeCropMargins(crop, target);
    const normalized = normalizeCropMargins(crop, source);
    return normalizeCropMargins({ left: normalized.left / source.width * target.width, right: normalized.right / source.width * target.width, top: normalized.top / source.height * target.height, bottom: normalized.bottom / source.height * target.height }, target);
}

function viewportBounds(points: Array<[number, number]>): ViewportRect {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(Math.max(Number.isFinite(value) ? value : 0, minimum), maximum);
}

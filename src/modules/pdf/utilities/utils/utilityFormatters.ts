import type { CropBox, PageNumberSettings, UtilityPosition } from '../types/utilities';

export function formatPageNumber(settings: PageNumberSettings, pageIndex: number, targetedPageIndex = pageIndex) {
    const number = settings.numberingMode === 'physical' ? pageIndex + 1 : settings.start + targetedPageIndex;
    return `${settings.prefix}${number}${settings.suffix}`;
}

export function expandTemplate(template: string, values: { page: number; pages: number; totalPages: number; filename: string; date: string }) {
    return template.replace(/\{page\}/g, String(values.page)).replace(/\{pages\}/g, String(values.pages)).replace(/\{totalPages\}/g, String(values.totalPages)).replace(/\{filename\}/g, values.filename).replace(/\{date\}/g, values.date);
}

export function positionFor(pageWidth: number, pageHeight: number, position: UtilityPosition, margin: number, custom?: { x: number; y: number }) {
    if (position === 'custom') return { x: pageWidth * ((custom?.x ?? 50) / 100), y: pageHeight * ((custom?.y ?? 50) / 100) };
    const x = position.endsWith('left') ? margin : position.endsWith('right') ? pageWidth - margin : pageWidth / 2;
    const y = position.startsWith('top') ? pageHeight - margin : position.startsWith('bottom') ? margin : pageHeight / 2;
    return { x, y };
}

export function cropBoxFromMargins(pageWidth: number, pageHeight: number, crop: CropBox) {
    const width = Math.max(1, pageWidth - crop.left - crop.right);
    const height = Math.max(1, pageHeight - crop.top - crop.bottom);
    return { x: Math.max(0, crop.left), y: Math.max(0, crop.bottom), width, height };
}

export function isPageTargeted(pageIds: string[], pageId: string) {
    return pageIds.includes(pageId);
}

export function metadataValue(value: string) {
    return Array.from(value).filter((character) => character.charCodeAt(0) >= 32).join('').slice(0, 255);
}

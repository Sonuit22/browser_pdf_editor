import type { CropBox, PageNumberSettings, UtilityPosition } from '../types/utilities';
import { normalizeCropMargins } from './cropCoordinates';

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

export function watermarkSize(kind: 'text' | 'image', text: string, fontSize: number, image?: { width: number | null; height: number | null }) {
    if (kind === 'image' && image?.width && image.height) {
        const scale = Math.min(180 / image.width, 120 / image.height, 1);
        return { width: image.width * scale, height: image.height * scale };
    }
    return { width: Math.max(fontSize, Array.from(text.slice(0, 160)).length * fontSize * .56), height: fontSize };
}

export function watermarkPlacement(pageWidth: number, pageHeight: number, position: UtilityPosition, size: { width: number; height: number }, margin = 36, custom?: { x: number; y: number }) {
    const centeredX = pageWidth / 2 - size.width / 2;
    const centeredY = pageHeight / 2 - size.height / 2;
    if (position === 'custom') return {
        x: pageWidth * ((custom?.x ?? 50) / 100) - size.width / 2,
        y: pageHeight * ((custom?.y ?? 50) / 100) - size.height / 2,
    };
    return {
        x: position.endsWith('left') ? margin : position.endsWith('right') ? pageWidth - margin - size.width : centeredX,
        y: position.startsWith('top') ? pageHeight - margin - size.height : position.startsWith('bottom') ? margin : centeredY,
    };
}

export function cropBoxFromMargins(pageWidth: number, pageHeight: number, crop: CropBox) {
    const normalized = normalizeCropMargins(crop, { width: pageWidth, height: pageHeight });
    return { x: normalized.left, y: normalized.bottom, width: pageWidth - normalized.left - normalized.right, height: pageHeight - normalized.top - normalized.bottom };
}

export function isPageTargeted(pageIds: string[], pageId: string) {
    return pageIds.includes(pageId);
}

export function metadataValue(value: string) {
    return Array.from(value).filter((character) => character.charCodeAt(0) >= 32).join('').slice(0, 255);
}

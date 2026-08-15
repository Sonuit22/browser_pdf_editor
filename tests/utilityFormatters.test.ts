import { describe, expect, it } from 'vitest';
import { cropBoxFromMargins, expandTemplate, formatPageNumber, isPageTargeted, metadataValue, positionFor, watermarkPlacement, watermarkSize } from '../src/modules/pdf/utilities/utils/utilityFormatters';
import type { PageNumberSettings } from '../src/modules/pdf/utilities/types/utilities';

const pageNumbers: PageNumberSettings = { enabled: true, pageIds: ['a'], applicationMode: 'custom', customRange: '3', numberingMode: 'sequential', position: 'bottom-center', start: 4, prefix: 'Document - ', suffix: ' / 12', fontSize: 11, color: '#172433', margin: 28 };

describe('PDF utility formatters', () => {
    it('calculates standard and custom watermark positions', () => {
        expect(positionFor(600, 800, 'bottom-right', 24)).toEqual({ x: 576, y: 24 });
        expect(positionFor(600, 800, 'custom', 24, { x: 25, y: 75 })).toEqual({ x: 150, y: 600 });
    });

    it('keeps text and image watermarks inside standard page margins', () => {
        const textSize = watermarkSize('text', 'PRIVATE', 40);
        expect(watermarkPlacement(612, 792, 'top-left', textSize)).toEqual({ x: 36, y: 716 });
        const right = watermarkPlacement(612, 792, 'bottom-right', textSize);
        expect(right.x + textSize.width).toBe(576);
        expect(right.y).toBe(36);
        expect(watermarkSize('image', '', 40, { width: 800, height: 400 })).toEqual({ width: 180, height: 90 });
    });

    it('formats physical and sequential page numbering and expands header/footer tokens', () => {
        expect(formatPageNumber(pageNumbers, 7, 2)).toBe('Document - 6 / 12');
        expect(formatPageNumber({ ...pageNumbers, numberingMode: 'physical' }, 7, 2)).toBe('Document - 8 / 12');
        expect(expandTemplate('{filename} - {page} of {totalPages} - {date}', { filename: 'report.pdf', page: 2, pages: 9, totalPages: 9, date: '2026-07-17' })).toBe('report.pdf - 2 of 9 - 2026-07-17');
    });

    it('uses stable page IDs for range application and crop boxes in PDF coordinates', () => {
        expect(isPageTargeted(['page-a', 'page-c'], 'page-c')).toBe(true);
        expect(cropBoxFromMargins(612, 792, { left: 20, right: 12, top: 30, bottom: 18 })).toEqual({ x: 20, y: 18, width: 580, height: 744 });
    });

    it('sanitizes metadata strings before export', () => {
        expect(metadataValue('Title\u0000with control')).toBe('Titlewith control');
        expect(metadataValue('a'.repeat(300))).toHaveLength(255);
    });
});

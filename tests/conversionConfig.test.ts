import { describe, expect, it } from 'vitest';
import { conversionAccept, conversionLimits } from '../src/modules/conversion/conversionConfig';

describe('browser conversion configuration', () => {
    it('enforces lower mobile limits for large sequential jobs', () => {
        expect(conversionLimits.mobile.images).toBe(30);
        expect(conversionLimits.desktop.images).toBe(100);
        expect(conversionLimits.mobile.pdfPages).toBe(30);
        expect(conversionLimits.desktop.pdfPages).toBe(100);
        expect(conversionLimits.mobile.docxBytes).toBeLessThan(conversionLimits.desktop.docxBytes);
    });

    it('accepts promised formats without exposing an input for Coming Soon conversion', () => {
        expect(conversionAccept['jpg-to-pdf']).toContain('.webp');
        expect(conversionAccept['jpg-to-pdf']).toContain('.png');
        expect(conversionAccept['word-to-pdf']).toContain('.docx');
        expect(conversionAccept['word-to-pdf']).not.toMatch(/\.doc(?:,|$)/);
        expect('ppt-to-pdf' in conversionAccept).toBe(false);
    });
});

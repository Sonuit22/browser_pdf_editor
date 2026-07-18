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

    it('accepts every promised image input and rejects legacy Word/PPT formats', () => {
        expect(conversionAccept['jpg-to-pdf']).toContain('.webp');
        expect(conversionAccept['jpg-to-pdf']).toContain('.png');
        expect(conversionAccept['word-to-pdf']).toContain('.docx');
        expect(conversionAccept['word-to-pdf']).not.toMatch(/\.doc(?:,|$)/);
        expect(conversionAccept['ppt-to-pdf']).toContain('.pptx');
    });
});

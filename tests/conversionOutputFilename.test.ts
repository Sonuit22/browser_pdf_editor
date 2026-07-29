import { describe, expect, it } from 'vitest';
import { conversionOutputFilename } from '../src/modules/conversion/conversionConfig';

const file = (name: string) => new File(['content'], name);

describe('conversion output filenames', () => {
    it('uses the source name and selected page number for PDF image output', () => {
        expect(conversionOutputFilename('pdf-to-jpg', [file('Quarterly Report.pdf')], [2])).toBe('Quarterly Report-page-002.jpg');
        expect(conversionOutputFilename('pdf-to-jpg', [file('Quarterly Report.pdf')], [1, 2])).toBe('Quarterly Report-pages.zip');
    });

    it('uses meaningful source-derived names for document conversions', () => {
        expect(conversionOutputFilename('jpg-to-pdf', [file('scan.jpg')])).toBe('scan.pdf');
        expect(conversionOutputFilename('jpg-to-pdf', [file('scan.jpg'), file('page-2.jpeg')])).toBe('scan-and-1-more.pdf');
        expect(conversionOutputFilename('pdf-to-word', [file('source.pdf')])).toBe('source.docx');
        expect(conversionOutputFilename('pdf-to-ppt', [file('source.pdf')])).toBe('source.pptx');
        expect(conversionOutputFilename('word-to-pdf', [file('source.docx')])).toBe('source.pdf');
    });
});

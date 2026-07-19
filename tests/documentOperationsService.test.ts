import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfFiles } from '../src/modules/pdf/organization/services/documentOperationsService';

async function pdfFile(name: string, pages: number) {
    const document = await PDFDocument.create();
    for (let index = 0; index < pages; index += 1) document.addPage([612, 792]);
    return new File([await document.save()], name, { type: 'application/pdf' });
}

describe('document operation services', () => {
    it('merges validated local PDFs in input order', async () => {
        const progress: number[] = [];
        const bytes = await mergePdfFiles([await pdfFile('first.pdf', 1), await pdfFile('second.pdf', 2)], (percent) => progress.push(percent));
        const merged = await PDFDocument.load(bytes);
        expect(merged.getPageCount()).toBe(3);
        expect(progress).toEqual([50, 100]);
    });

    it('rejects too few inputs and corrupted PDFs with user-facing errors', async () => {
        await expect(mergePdfFiles([await pdfFile('single.pdf', 1)])).rejects.toThrow(/at least two/i);
        const broken = new File(['%PDF-not-valid'], 'broken.pdf', { type: 'application/pdf' });
        await expect(mergePdfFiles([await pdfFile('valid.pdf', 1), broken])).rejects.toThrow(/corrupted/i);
    });
});

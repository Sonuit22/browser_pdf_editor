import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { validatePdfFile, validatePdfFileSelection } from '../src/modules/pdf/services/pdfValidationService';
import { MAX_IMAGE_FILE_SIZE, validateImageFile } from '../src/utils/imageFiles';

describe('local file validation', () => {
    it('rejects empty, oversized, and unsupported image selections before decoding', () => {
        expect(() => validateImageFile(new File([], 'empty.png', { type: 'image/png' }))).toThrow(/non-empty/i);
        expect(() => validateImageFile(new File([new Uint8Array(MAX_IMAGE_FILE_SIZE + 1)], 'large.jpg', { type: 'image/jpeg' }))).toThrow(/limited/i);
        expect(() => validateImageFile(new File(['text'], 'notes.txt', { type: 'text/plain' }))).toThrow(/JPG/i);
    });

    it('accepts supported image selection metadata', () => {
        expect(() => validateImageFile(new File(['image'], 'photo.webp', { type: 'image/webp' }))).not.toThrow();
    });

    it('rejects empty and incorrectly typed PDF selections before parsing', () => {
        expect(() => validatePdfFileSelection(new File([], 'empty.pdf', { type: 'application/pdf' }))).toThrow(/empty/i);
        expect(() => validatePdfFileSelection(new File(['text'], 'notes.txt', { type: 'text/plain' }))).toThrow(/Only PDF/i);
    });

    it('rejects corrupted PDFs and accepts a generated valid PDF', async () => {
        await expect(validatePdfFile(new File(['%PDF-not-a-document'], 'broken.pdf', { type: 'application/pdf' }))).rejects.toThrow(/corrupted/i);
        const source = await PDFDocument.create();
        source.addPage();
        const bytes = await source.save();
        await expect(validatePdfFile(new File([bytes], 'valid.pdf', { type: 'application/pdf' }))).resolves.toBeInstanceOf(Uint8Array);
    });
});

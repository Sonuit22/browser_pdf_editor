import { describe, expect, it } from 'vitest';
import { getPdfErrorMessage } from '../src/modules/pdf/utils/pdfErrors';

describe('PDF feedback errors', () => {
    it('explains invalid, encrypted, XFA, and memory failures', () => {
        expect(getPdfErrorMessage(new Error('Invalid PDF format'))).toContain('valid');
        expect(getPdfErrorMessage(new Error('encrypted password required'))).toContain('password');
        expect(getPdfErrorMessage(new Error('XFA form'))).toContain('XFA');
        expect(getPdfErrorMessage(new Error('memory allocation failed'))).toContain('memory');
    });
});

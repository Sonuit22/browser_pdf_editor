import { describe, expect, it } from 'vitest';
import { getProcessingErrorMessage } from '../src/utils/processingErrors';

describe('processing error messages', () => {
    it('turns memory and storage failures into actionable guidance', () => {
        expect(getProcessingErrorMessage(new RangeError('Array buffer allocation failed'), 'fallback')).toMatch(/memory.*fewer pages/i);
        expect(getProcessingErrorMessage(new Error('Quota exceeded'), 'fallback')).toMatch(/temporary storage/i);
    });

    it('preserves concise service errors and hides unusable output', () => {
        expect(getProcessingErrorMessage(new Error('Select at least one page.'), 'fallback')).toBe('Select at least one page.');
        expect(getProcessingErrorMessage(new Error('x'.repeat(300)), 'Try again.')).toBe('Try again.');
    });
});

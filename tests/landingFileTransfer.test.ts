import { describe, expect, it } from 'vitest';
import type { PendingPdfFile } from '../src/modules/pdf/context/pdfEngineStore';
import { shouldPreserveLandingFileTransition } from '../src/utils/landingFileTransfer';

const pending: PendingPdfFile = {
    file: new File(['%PDF-1.7'], 'landing-selected.pdf', { type: 'application/pdf' }),
    source: 'landing-page',
    selectedAt: 123,
};

describe('landing PDF transfer guard', () => {
    it.each(['/sign-pdf', '/compress-pdf', '/split-pdf', '/remove-pages', '/extract-pages', '/organize-pdf'])(
        'preserves the pending File while navigating from home to %s',
        (route) => {
            expect(shouldPreserveLandingFileTransition('/', route, { fromLandingFile: true }, pending)).toBe(true);
        },
    );

    it('does not preserve unrelated or refresh-lost navigation state', () => {
        expect(shouldPreserveLandingFileTransition('/faq', '/split-pdf', { fromLandingFile: true }, pending)).toBe(false);
        expect(shouldPreserveLandingFileTransition('/', '/split-pdf', null, pending)).toBe(false);
        expect(shouldPreserveLandingFileTransition('/', '/split-pdf', { fromLandingFile: true }, null)).toBe(false);
    });
});

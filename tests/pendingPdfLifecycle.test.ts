import { describe, expect, it, vi } from 'vitest';
import type { PendingPdfFile } from '../src/modules/pdf/context/pdfEngineStore';
import { loadPendingPdfFile, shouldShowLandingFileReselect } from '../src/utils/pendingPdfLifecycle';

function pendingFile(name = 'landing.pdf'): PendingPdfFile {
    return {
        file: new File(['%PDF-1.7'], name, { type: 'application/pdf' }),
        source: 'landing-page',
        selectedAt: 123,
    };
}

describe('pending landing PDF lifecycle', () => {
    it('loads the original File and clears it only after successful initialization', async () => {
        const pending = pendingFile();
        const load = vi.fn(async () => true);
        const clear = vi.fn();

        await expect(loadPendingPdfFile(pending, () => pending, load, clear)).resolves.toBe(true);
        expect(load).toHaveBeenCalledWith(pending.file);
        expect(clear).toHaveBeenCalledOnce();
    });

    it('retains the pending File when initialization fails', async () => {
        const pending = pendingFile('invalid.pdf');
        const clear = vi.fn();

        await expect(loadPendingPdfFile(pending, () => pending, async () => false, clear)).resolves.toBe(false);
        expect(clear).not.toHaveBeenCalled();
    });

    it('does not clear a replacement selected while an older file is loading', async () => {
        const pending = pendingFile('old.pdf');
        const replacement = pendingFile('replacement.pdf');
        const clear = vi.fn();

        await loadPendingPdfFile(pending, () => replacement, async () => true, clear);
        expect(clear).not.toHaveBeenCalled();
    });

    it('only requests a replacement when session memory was lost before a successful load', () => {
        expect(shouldShowLandingFileReselect(true, 'idle', null, false)).toBe(true);
        expect(shouldShowLandingFileReselect(true, 'idle', null, true)).toBe(false);
        expect(shouldShowLandingFileReselect(true, 'ready', null, false)).toBe(false);
        expect(shouldShowLandingFileReselect(false, 'idle', null, false)).toBe(false);
    });
});

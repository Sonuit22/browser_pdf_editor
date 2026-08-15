import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from '../src/utils/browserDownload';

describe('browser downloads', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('starts the download before reporting success and blocks rapid duplicate taps', () => {
        const click = vi.fn();
        const remove = vi.fn();
        const anchor = { href: '', download: '', style: { display: '' }, click, remove };
        const createObjectURL = vi.fn(() => 'blob:test');
        const revokeObjectURL = vi.fn();
        vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
        vi.stubGlobal('document', { createElement: vi.fn(() => anchor), body: { append: vi.fn() } });
        vi.stubGlobal('window', { setTimeout: vi.fn() });

        const blob = new Blob(['result'], { type: 'application/pdf' });
        expect(downloadBlob(blob, 'result.pdf')).toBe(true);
        expect(downloadBlob(blob, 'result.pdf')).toBe(false);
        expect(click).toHaveBeenCalledTimes(1);
        expect(remove).toHaveBeenCalledTimes(1);
    });
});

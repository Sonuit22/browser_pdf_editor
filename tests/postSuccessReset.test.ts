import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetCompletedToolSource } from '../src/utils/toolReset';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('post-success tool reset', () => {
    it('clears file inputs, revokes temporary URLs, and invokes the source reset', () => {
        const input = { value: 'C:\\fakepath\\source.pdf' } as HTMLInputElement;
        const clearSource = vi.fn();
        const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

        resetCompletedToolSource({
            clearSource,
            fileInputs: [input],
            objectUrls: ['blob:first', 'blob:second'],
        });

        expect(input.value).toBe('');
        expect(revoke).toHaveBeenCalledTimes(2);
        expect(clearSource).toHaveBeenCalledOnce();
    });
});

import { describe, expect, it } from 'vitest';
import { parsePageRange, parsePageRangeGroups } from '../src/modules/pdf/organization/utils/pageRangeParser';

describe('parsePageRange', () => {
    it('normalizes single pages, inclusive ranges, whitespace, and duplicates', () => {
        expect(parsePageRange('1-3, 5, 3, 8-10', { pageCount: 10 })).toEqual({ indices: [0, 1, 2, 4, 7, 8, 9], errors: [] });
    });

    it('reports invalid, descending, and out-of-range values without throwing', () => {
        const result = parsePageRange('0, 6-3, 12, one', { pageCount: 10 });
        expect(result.indices).toEqual([]);
        expect(result.errors).toHaveLength(4);
    });

    it('returns separate groups for a split-by-ranges workflow', () => {
        expect(parsePageRangeGroups('1-3, 5, 8-10', { pageCount: 10 })).toEqual({ groups: [[0, 1, 2], [4], [7, 8, 9]], errors: [] });
    });
});

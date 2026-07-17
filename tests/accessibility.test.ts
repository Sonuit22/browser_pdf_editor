import { describe, expect, it } from 'vitest';
import { cropAreaDescription, nextFocusIndex } from '../src/components/ui/accessibility';

describe('shared accessibility interactions', () => {
    it('wraps modal focus in both directions', () => {
        expect(nextFocusIndex(3, 2, false)).toBe(0);
        expect(nextFocusIndex(3, 0, true)).toBe(2);
        expect(nextFocusIndex(3, -1, false)).toBe(0);
        expect(nextFocusIndex(0, 0, false)).toBe(-1);
    });

    it('describes crop results in document coordinates', () => {
        expect(cropAreaDescription(612, 792, { left: 24, right: 12, top: 36, bottom: 20 }))
            .toContain('576 by 736 PDF points');
    });
});

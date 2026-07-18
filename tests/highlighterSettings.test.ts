import { describe, expect, it } from 'vitest';
import { createAnnotation } from '../src/modules/pdf/editor/utils/createAnnotation';

describe('highlighter settings', () => {
    it('applies current color, darkness, and marker size to every new highlight', () => {
        const highlight = createAnnotation('highlight', 'page-1', { x: 20, y: 30 }, { color: '#ff9fca', opacity: .6, strokeWidth: 32 });
        expect(highlight).toMatchObject({ type: 'highlight', color: '#ff9fca', opacity: .6, strokeWidth: 32, points: [{ x: 20, y: 30 }] });
    });
});

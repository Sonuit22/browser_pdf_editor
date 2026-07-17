import { describe, expect, it } from 'vitest';
import { filterTools, toolRegistry } from '../src/config/toolRegistry';

describe('tool registry', () => {
    it('returns the complete tool inventory for All', () => {
        expect(filterTools('All', '')).toHaveLength(toolRegistry.length);
    });

    it('filters matches across tool categories', () => {
        expect(filterTools('All', 'jpg').map((tool) => tool.id)).toEqual(expect.arrayContaining(['pdf-jpg', 'images-pdf', 'image-convert']));
    });

    it('keeps category filtering independent from search', () => {
        expect(filterTools('Organize', '').every((tool) => tool.category === 'Organize')).toBe(true);
    });

    it('does not expose removed tool categories', () => {
        expect(toolRegistry.some((tool) => tool.category === 'PDF Utilities')).toBe(false);
    });
});

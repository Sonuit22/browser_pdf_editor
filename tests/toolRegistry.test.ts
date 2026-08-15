import { describe, expect, it } from 'vitest';
import { filterTools, toolRegistry } from '../src/config/toolRegistry';

describe('tool registry', () => {
    it('returns the complete tool inventory for All', () => {
        expect(filterTools('All', '')).toHaveLength(toolRegistry.length);
    });

    it('filters matches across tool categories', () => {
        expect(filterTools('All', 'jpg').map((tool) => tool.id)).toEqual(expect.arrayContaining(['pdf-jpg', 'jpg-pdf']));
    });

    it('keeps category filtering independent from search', () => {
        expect(filterTools('PDF management', '').every((tool) => tool.category === 'PDF management')).toBe(true);
    });

    it('does not expose removed tool categories', () => {
        expect(toolRegistry.some((tool) => tool.category === 'PDF Utilities')).toBe(false);
    });

    it('contains the approved tool catalogue', () => {
        expect(toolRegistry).toHaveLength(20);
        expect(toolRegistry.map((tool) => tool.title)).toEqual([
            'Merge PDF', 'Split PDF', 'Remove Pages from PDF', 'Extract Pages', 'Organize PDF', 'Compress PDF',
            'JPG to PDF', 'Word to PDF', 'PPT to PDF', 'PDF to JPG', 'PDF to Word', 'PDF to PPT',
            'Protect PDF', 'Unlock PDF', 'Sign PDF', 'Edit PDF', 'PDF Form Filler', 'Watermark PDF', 'Translate PDF', 'Image Resizer',
        ]);
    });
});

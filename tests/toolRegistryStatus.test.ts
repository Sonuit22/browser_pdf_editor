import { describe, expect, it } from 'vitest';
import { toolRegistry } from '../src/config/toolRegistry';

describe('central tool status registry', () => {
    it('gives every homepage tool a concise description and valid status', () => {
        expect(toolRegistry.length).toBeGreaterThan(0);
        toolRegistry.forEach((tool) => {
            expect(tool.description.length).toBeGreaterThan(10);
            expect(tool.description.length).toBeLessThan(80);
            expect(['available', 'basic', 'beta', 'coming-soon']).toContain(tool.status);
            expect(tool.enabled).toBe(tool.status !== 'coming-soon');
        });
    });

    it('does not expose incomplete processing tools as usable', () => {
        for (const id of ['compress', 'protect', 'ppt-pdf']) {
            expect(toolRegistry.find((tool) => tool.id === id)).toMatchObject({
                status: 'coming-soon', badge: 'Coming Soon', enabled: false,
            });
        }
    });

    it('marks genuine limited conversions as Basic', () => {
        for (const id of ['word-pdf', 'pdf-word', 'pdf-ppt']) {
            expect(toolRegistry.find((tool) => tool.id === id)).toMatchObject({
                status: 'basic', badge: 'Basic', enabled: true,
            });
        }
    });
});

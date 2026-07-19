import { describe, expect, it } from 'vitest';
import { toolRegistry, toolRoutesBySurface } from '../src/config/toolRegistry';
import { conversionAccept } from '../src/modules/conversion/conversionConfig';

describe('central tool status registry', () => {
    it('gives every homepage tool a concise description and valid status', () => {
        expect(toolRegistry.length).toBeGreaterThan(0);
        toolRegistry.forEach((tool) => {
            expect(tool.description.length).toBeGreaterThan(10);
            expect(tool.description.length).toBeLessThan(80);
            expect(['available', 'basic', 'beta', 'coming-soon']).toContain(tool.status);
            expect(tool.enabled).toBe(tool.status !== 'coming-soon');
            expect(tool.implemented).toBe(tool.status !== 'coming-soon');
            expect(tool.route).toMatch(/^\//);
        });
    });

    it('does not expose incomplete processing tools as usable', () => {
        for (const id of ['compress', 'protect', 'ppt-pdf']) {
            expect(toolRegistry.find((tool) => tool.id === id)).toMatchObject({
                status: 'coming-soon', badge: 'Coming Soon', enabled: false, surface: 'tool-info',
            });
        }
    });

    it('marks genuine limited conversions as Basic', () => {
        for (const id of ['word-pdf', 'pdf-word', 'pdf-ppt']) {
            const tool = toolRegistry.find((item) => item.id === id);
            expect(tool).toMatchObject({
                status: 'basic', badge: 'Basic', enabled: true,
            });
            expect(tool?.limitations.length).toBeGreaterThan(0);
        }
    });

    it('routes every enabled card to a real workspace surface', () => {
        expect(toolRegistry.filter((tool) => tool.enabled).every((tool) => tool.surface !== 'tool-info')).toBe(true);
        expect(new Set(toolRegistry.map((tool) => tool.route)).size).toBe(toolRegistry.length);
        expect(toolRoutesBySurface).toEqual({
            'pdf-workspace': ['/merge', '/split', '/remove-pages', '/extract-pages', '/organize', '/sign-pdf', '/edit'],
            'conversion-workspace': ['/jpg-to-pdf', '/word-to-pdf', '/pdf-to-jpg', '/pdf-to-word', '/pdf-to-ppt'],
            'tool-info': ['/compress', '/ppt-to-pdf', '/protect-pdf'],
        });
        expect(Object.keys(conversionAccept).map((route) => `/${route}`).sort()).toEqual([...toolRoutesBySurface['conversion-workspace']].sort());
    });
});

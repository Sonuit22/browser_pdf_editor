import { describe, expect, it } from 'vitest';
import { landingUploadToolRoutes, landingUploadTools } from '../src/config/landingUploadTools';
import { findToolByRoute } from '../src/config/toolRegistry';

describe('landing upload tool chooser', () => {
    it('offers the required existing routes without changing Edit PDF availability', () => {
        expect(landingUploadToolRoutes).toEqual([
            '/sign-pdf',
            '/compress-pdf',
            '/split-pdf',
            '/remove-pages',
            '/extract-pages',
            '/organize-pdf',
        ]);
        expect(landingUploadTools.map((tool) => tool.route)).toEqual(landingUploadToolRoutes);
        expect(landingUploadTools.some((tool) => tool.route === '/edit-pdf')).toBe(false);
    });

    it.each(landingUploadToolRoutes)('%s remains a registered landing destination', (route) => {
        expect(findToolByRoute(route)?.route).toBe(route);
    });

    it('keeps unfinished compression accurately marked while allowing landing-file intake', () => {
        expect(findToolByRoute('/compress-pdf')).toMatchObject({
            surface: 'tool-info',
            status: 'coming-soon',
            enabled: false,
        });
    });

    it('keeps Edit PDF as a standalone PDF workspace tool', () => {
        expect(findToolByRoute('/edit-pdf')).toMatchObject({
            title: 'Edit PDF',
            surface: 'pdf-workspace',
            enabled: true,
        });
    });
});

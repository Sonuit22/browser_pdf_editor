import { describe, expect, it } from 'vitest';
import { landingUploadToolRoutes, landingUploadTools } from '../src/config/landingUploadTools';

describe('landing upload tool chooser', () => {
    it('offers the required existing routes without changing Edit PDF availability', () => {
        expect(landingUploadToolRoutes).toEqual([
            '/edit',
            '/sign-pdf',
            '/compress',
            '/split',
            '/remove-pages',
            '/extract-pages',
            '/organize',
        ]);
        expect(landingUploadTools.map((tool) => tool.route)).toEqual(landingUploadToolRoutes);
        expect(landingUploadTools.find((tool) => tool.route === '/edit')).toMatchObject({
            title: 'Edit PDF',
            enabled: true,
            status: 'available',
        });
    });
});

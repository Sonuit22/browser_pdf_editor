import { describe, expect, it, vi } from 'vitest';
import { analyticsEnabled, sanitizeAnalyticsProperties, trackEvent } from '../src/utils/analytics';

describe('privacy-conscious analytics', () => {
    it('is disabled without an explicit deployment configuration', () => {
        expect(analyticsEnabled()).toBe(false);
        expect(() => trackEvent('page_view', { path: '/faq' })).not.toThrow();
    });

    it('keeps only generic allowlisted identifiers', () => {
        const result = sanitizeAnalyticsProperties({
            tool: 'merge-pdf',
            path: '/merge-pdf',
            status: 'available',
            filename: 'private-document.pdf',
            password: 'secret',
            signature: '<binary>',
            text: 'document contents',
        });
        expect(result).toEqual({ tool: 'merge-pdf', path: '/merge-pdf', status: 'available' });
        expect(JSON.stringify(result)).not.toContain('private-document');
        expect(JSON.stringify(result)).not.toContain('secret');
    });

    it('enables only the configured cookie-free provider', async () => {
        vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true');
        vi.stubEnv('VITE_ANALYTICS_PROVIDER', 'plausible');
        vi.stubEnv('VITE_ANALYTICS_ID', 'pdfbyib.com');
        vi.resetModules();
        const configuredAnalytics = await import('../src/utils/analytics');
        expect(configuredAnalytics.analyticsEnabled()).toBe(true);
        vi.unstubAllEnvs();
        vi.resetModules();
    });
});

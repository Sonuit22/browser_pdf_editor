import { describe, expect, it } from 'vitest';
import { getSeoForPath } from '../src/config/seo';
import { absoluteSiteUrl, SITE_URL } from '../src/config/site';

describe('route SEO configuration', () => {
    it.each(['/', '/all-tools', '/merge-pdf', '/split-pdf', '/remove-pages', '/extract-pages', '/organize-pdf', '/jpg-to-pdf', '/pdf-to-jpg', '/sign-pdf', '/edit-pdf', '/faq', '/privacy', '/terms', '/about', '/contact'])('provides useful metadata for %s', (path) => {
        const seo = getSeoForPath(path);
        expect(seo.title).toContain('PDF by ib');
        expect(seo.description.length).toBeGreaterThan(50);
        expect(seo.index).not.toBe(false);
    });

    it('marks missing and incomplete tool routes as noindex', () => {
        expect(getSeoForPath('/missing')).toMatchObject({ index: false, canonical: false });
        expect(getSeoForPath('/compress-pdf').index).toBe(false);
        expect(getSeoForPath('/protect-pdf').index).toBe(false);
    });

    it('creates one normalized production canonical origin', () => {
        expect(SITE_URL).toBe('https://pdfbyib.com');
        expect(SITE_URL).not.toMatch(/localhost|127\.0\.0\.1/);
        expect(absoluteSiteUrl('/faq/')).toBe(`${SITE_URL}/faq`);
        expect(absoluteSiteUrl('/')).toBe(`${SITE_URL}/`);
    });
});

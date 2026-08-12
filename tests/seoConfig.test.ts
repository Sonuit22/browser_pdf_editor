import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { defaultSeo, getSeoForPath } from '../src/config/seo';
import { absoluteSiteUrl, SITE_URL } from '../src/config/site';
import { publishedArticleMetadata } from '../src/blog/content';

const pagePaths = [
    '/', '/all-tools', '/merge-pdf', '/split-pdf', '/remove-pages', '/extract-pages', '/organize-pdf',
    '/compress-pdf', '/jpg-to-pdf', '/pdf-to-jpg', '/word-to-pdf', '/pdf-to-word', '/pdf-to-ppt',
    '/ppt-to-pdf', '/protect-pdf', '/compress-image', '/sign-pdf', '/edit-pdf', '/faq', '/privacy', '/terms', '/about',
    '/contact', '/support', '/blog', '/missing',
];

describe('route SEO configuration', () => {
    it.each(['/', '/all-tools', '/merge-pdf', '/split-pdf', '/remove-pages', '/extract-pages', '/organize-pdf', '/jpg-to-pdf', '/pdf-to-jpg', '/protect-pdf', '/compress-image', '/sign-pdf', '/edit-pdf', '/faq', '/privacy', '/terms', '/about', '/contact'])('provides useful metadata for %s', (path) => {
        const seo = getSeoForPath(path);
        expect(seo.title).toContain('PDF by ib');
        expect(seo.description.length).toBeGreaterThan(50);
        expect(seo.index).not.toBe(false);
    });

    it('marks missing and incomplete tool routes as noindex', () => {
        expect(getSeoForPath('/missing')).toMatchObject({ index: false, canonical: false });
        expect(getSeoForPath('/compress-pdf').index).toBe(true);
        expect(getSeoForPath('/protect-pdf').index).toBe(true);
    });

    it('creates one normalized production canonical origin', () => {
        expect(SITE_URL).toBe('https://pdfbyib.com');
        expect(SITE_URL).not.toMatch(/localhost|127\.0\.0\.1/);
        expect(absoluteSiteUrl('/faq/')).toBe(`${SITE_URL}/faq`);
        expect(absoluteSiteUrl('/')).toBe(`${SITE_URL}/`);
    });

    it.each(pagePaths)('uses a 140–160 character meta description for %s', (path) => {
        const description = getSeoForPath(path).description;
        expect(description.length, `${path} description has ${description.length} characters`).toBeGreaterThanOrEqual(140);
        expect(description.length, `${path} description has ${description.length} characters`).toBeLessThanOrEqual(160);
    });

    it.each(publishedArticleMetadata)('uses a 140–160 character description for /blog/$slug', (article) => {
        const description = getSeoForPath(`/blog/${article.slug}`).description;
        expect(description.length, `${article.slug} description has ${description.length} characters`).toBeGreaterThanOrEqual(140);
        expect(description.length, `${article.slug} description has ${description.length} characters`).toBeLessThanOrEqual(160);
    });

    it('keeps every indexable page and article description unique', () => {
        const descriptions = [
            ...pagePaths.map((path) => getSeoForPath(path).description),
            ...publishedArticleMetadata.map((article) => getSeoForPath(`/blog/${article.slug}`).description),
        ];
        expect(new Set(descriptions).size).toBe(descriptions.length);
    });

    it('keeps the static HTML fallback aligned with the homepage SEO description', async () => {
        const html = await readFile('index.html', 'utf8');
        const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
        expect(description).toBe(getSeoForPath('/').description);
        expect(html.match(/<meta property="og:description" content="([^"]+)">/)?.[1]).toBe(description);
        expect(html.match(/<meta name="twitter:description" content="([^"]+)">/)?.[1]).toBe(description);
        expect(defaultSeo.description.length).toBeGreaterThanOrEqual(140);
        expect(defaultSeo.description.length).toBeLessThanOrEqual(160);
    });
});

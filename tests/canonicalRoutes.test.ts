import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { getSeoForPath } from '../src/config/seo';
import { absoluteSiteUrl } from '../src/config/site';

describe('canonical route inventory', () => {
    it('gives every sitemap URL one clean, self-referencing canonical target', async () => {
        const sitemap = await readFile('sitemap.xml', 'utf8');
        const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
        expect(urls.length).toBeGreaterThan(0);
        expect(new Set(urls).size).toBe(urls.length);

        for (const canonical of urls) {
            const url = new URL(canonical);
            expect(url.origin).toBe('https://pdfbyib.com');
            expect(url.search).toBe('');
            expect(url.hash).toBe('');
            expect(url.pathname === '/' || !url.pathname.endsWith('/')).toBe(true);
            expect(absoluteSiteUrl(url.pathname)).toBe(canonical);
            expect(getSeoForPath(url.pathname).index).not.toBe(false);
            expect(getSeoForPath(url.pathname).canonical).not.toBe(false);
        }
    });

    it('keeps exactly one canonical placeholder in the HTML build template', async () => {
        const html = await readFile('index.html', 'utf8');
        expect(html.match(/<link\s+rel="canonical"/g)).toHaveLength(1);
        expect(html).toContain('<link rel="canonical" href="__SITE_URL__/">');
    });
});

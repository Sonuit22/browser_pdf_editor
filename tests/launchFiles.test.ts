import { readFile, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('public launch files', () => {
    it('publishes an indexable robots file and one production sitemap origin', async () => {
        const robots = await readFile('robots.txt', 'utf8');
        const sitemap = await readFile('sitemap.xml', 'utf8');
        expect(robots).toContain('User-agent: *');
        expect(robots).toContain('Allow: /');
        expect(robots).toContain('https://pdfbyib.com/sitemap.xml');
        expect(sitemap).not.toMatch(/localhost|pdfeditorbyib|browserpdfeditor\.vercel\.app|<loc>[^<]*\?/);
        expect(sitemap).not.toMatch(/\/ppt-to-pdf</);
        expect(sitemap).toContain('<loc>https://pdfbyib.com/protect-pdf</loc>');
        expect(sitemap).toContain('<loc>https://pdfbyib.com/image-resizer</loc>');
        expect(sitemap).not.toContain('<loc>https://pdfbyib.com/compress-image</loc>');
        expect(sitemap).toContain('<loc>https://pdfbyib.com/compress-pdf</loc>');
        expect(sitemap).toContain('<loc>https://pdfbyib.com/merge-pdf</loc>');
        expect(sitemap).not.toContain('<loc>https://pdfbyib.com/merge</loc>');
        expect(sitemap).toContain('<loc>https://pdfbyib.com/privacy</loc>');
    });

    it('uses valid PWA icon files and does not claim offline operation', async () => {
        const manifest = JSON.parse(await readFile('manifest.webmanifest', 'utf8')) as { name: string; display: string; icons: Array<{ src: string; sizes: string; type: string }>; description: string };
        expect(manifest.name).toBe('PDF by ib');
        expect(manifest.display).toBe('standalone');
        expect(manifest.description.toLowerCase()).not.toContain('offline');
        for (const icon of manifest.icons) {
            expect(icon.type).toBe('image/png');
            expect((await stat(`public${icon.src}`)).size).toBeGreaterThan(0);
        }
    });

    it('keeps nested routes on the SPA and applies baseline security headers', async () => {
        const config = JSON.parse(await readFile('vercel.json', 'utf8')) as { rewrites: Array<{ source: string; destination: string }>; headers: Array<{ headers: Array<{ key: string; value: string }> }> };
        expect(config.rewrites).toContainEqual({ source: '/:path*', destination: '/index.html' });
        const headerNames = config.headers.flatMap((entry) => entry.headers.map((header) => header.key));
        expect(headerNames).toEqual(expect.arrayContaining(['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options']));
    });
});

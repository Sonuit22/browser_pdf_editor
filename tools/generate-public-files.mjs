import { mkdir, writeFile } from 'node:fs/promises';

const defaultSiteUrl = 'https://pdfbyib.com';
const configuredSiteUrl = (process.env.VITE_SITE_URL || defaultSiteUrl).trim().replace(/\/+$/, '');
const siteUrl = /^https:\/\/(?!localhost|127\.0\.0\.1)[a-z0-9.-]+(?::\d+)?$/i.test(configuredSiteUrl) ? configuredSiteUrl : defaultSiteUrl;
const indexableRoutes = [
    '/', '/all-tools', '/merge-pdf', '/split-pdf', '/remove-pages', '/extract-pages', '/organize-pdf',
    '/jpg-to-pdf', '/pdf-to-jpg', '/word-to-pdf', '/pdf-to-word', '/pdf-to-ppt',
    '/sign-pdf', '/edit-pdf', '/faq', '/privacy', '/terms', '/about', '/contact',
];

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
const urls = indexableRoutes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await mkdir('public', { recursive: true });
await Promise.all([
    writeFile('robots.txt', robots),
    writeFile('sitemap.xml', sitemap),
    writeFile('public/robots.txt', robots),
    writeFile('public/sitemap.xml', sitemap),
]);

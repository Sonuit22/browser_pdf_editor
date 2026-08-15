import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { indexableRoutes } from './site-routes.mjs';

const defaultSiteUrl = 'https://pdfbyib.com';
const configuredSiteUrl = (process.env.VITE_SITE_URL || defaultSiteUrl).trim().replace(/\/+$/, '');
const siteUrl = /^https:\/\/(?!localhost|127\.0\.0\.1)[a-z0-9.-]+(?::\d+)?$/i.test(configuredSiteUrl) ? configuredSiteUrl : defaultSiteUrl;
const articleManifest = JSON.parse(await readFile('src/blog/content/articleManifest.json', 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const publishedArticles = articleManifest.filter((article) => {
    if (article.draft) return false;
    if (article.publishedDate > today || article.updatedDate > today) throw new Error(`Blog article ${article.slug} uses a future publication date.`);
    return true;
});

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
const pageUrls = indexableRoutes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`);
const articleUrls = publishedArticles.map((article) => `  <url><loc>${siteUrl}/blog/${article.slug}</loc><lastmod>${article.updatedDate}</lastmod></url>`);
const urls = [...pageUrls, ...articleUrls].join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const rssItems = publishedArticles.map((article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${siteUrl}/blog/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${article.slug}</guid>
      <pubDate>${new Date(`${article.publishedDate}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(article.description)}</description>
    </item>`).join('\n');
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PDF by ib Learning Center</title>
    <description>Practical browser-based PDF guides and tutorials.</description>
    <link>${siteUrl}/blog</link>
${rssItems}
  </channel>
</rss>
`;

await mkdir('public', { recursive: true });
await Promise.all([
    writeFile('robots.txt', robots),
    writeFile('sitemap.xml', sitemap),
    writeFile('public/robots.txt', robots),
    writeFile('public/sitemap.xml', sitemap),
    writeFile('rss.xml', rss),
    writeFile('public/rss.xml', rss),
]);

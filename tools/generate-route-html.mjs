import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const siteUrl = 'https://pdfbyib.com';
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const homepageHtml = await readFile('dist/index.html', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

function routeHtml(canonical) {
    return homepageHtml
        .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i, `<link rel="canonical" href="${canonical}">`)
        .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:url" content="${canonical}">`);
}

for (const canonical of urls) {
    const url = new URL(canonical);
    if (url.origin !== siteUrl) throw new Error(`Sitemap URL uses an unexpected canonical origin: ${canonical}`);
    if (url.pathname === '/') continue;

    const relativePath = url.pathname.replace(/^\//, '');
    const html = routeHtml(canonical);
    const cleanUrlFile = path.join('dist', `${relativePath}.html`);
    const directoryIndex = path.join('dist', relativePath, 'index.html');
    await mkdir(path.dirname(cleanUrlFile), { recursive: true });
    await mkdir(path.dirname(directoryIndex), { recursive: true });
    await Promise.all([writeFile(cleanUrlFile, html), writeFile(directoryIndex, html)]);
}

console.log(`Generated self-canonical HTML entry points for ${urls.length} indexable routes.`);

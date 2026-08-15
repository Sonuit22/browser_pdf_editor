import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const siteUrl = 'https://pdfbyib.com';
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const rows = [];

for (const expected of urls) {
    const url = new URL(expected);
    const relativePath = url.pathname === '/' ? 'index.html' : `${url.pathname.replace(/^\//, '')}.html`;
    const html = await readFile(path.join('dist', relativePath), 'utf8');
    const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi)].map((match) => match[1]);
    const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"\s*\/?\s*>/i)?.[1] ?? '';
    const actual = canonicals.join(', ') || 'Missing';
    const cleanUrl = url.origin === siteUrl && !url.search && !url.hash && (url.pathname === '/' || !url.pathname.endsWith('/'));
    const status = canonicals.length === 1 && actual === expected && cleanUrl && !/noindex/i.test(robots) ? 'PASS' : 'FAIL';
    rows.push({ route: url.pathname, expected, actual, status });
}

const table = [
    '# Canonical URL audit',
    '',
    '| Route | Expected canonical | Actual canonical | Status |',
    '| --- | --- | --- | --- |',
    ...rows.map(({ route, expected, actual, status }) => `| ${route} | ${expected} | ${actual} | ${status} |`),
    '',
];

await mkdir('reports', { recursive: true });
await writeFile('reports/canonical-audit.md', table.join('\n'));

const failures = rows.filter((row) => row.status !== 'PASS');
if (failures.length) {
    console.error(table.join('\n'));
    throw new Error(`${failures.length} canonical audit entries failed.`);
}

console.log(`Canonical audit passed for ${rows.length} indexable routes. Report: reports/canonical-audit.md`);

import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredPaths = [
    'index.html',
    'robots.txt',
    'sitemap.xml',
    'manifest.json',
    'README.md',
    'package.json',
    'vite.config.js',
    'vercel.json',
    '.gitignore',
    '.gitattributes',
    'SECURITY.md',
    'src',
    'docs',
    'tests',
];

const htmlFiles = ['index.html'];

const errors = [];

async function exists(relativePath) {
    try {
        await access(path.join(root, relativePath), constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function localTargetFromUrl(value, fromFile) {
    if (
        value.startsWith('http:') ||
        value.startsWith('https:') ||
        value.startsWith('mailto:') ||
        value.startsWith('tel:') ||
        value.startsWith('#') ||
        value.startsWith('data:')
    ) {
        return null;
    }

    const cleanValue = value.split('#')[0].split('?')[0];
    if (!cleanValue) {
        return null;
    }

    if (cleanValue.startsWith('/')) {
        return cleanValue.slice(1) || 'index.html';
    }

    return path.normalize(path.join(path.dirname(fromFile), cleanValue)).replaceAll('\\', '/');
}

async function validateJson(relativePath) {
    try {
        JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
    } catch (error) {
        errors.push(`${relativePath}: invalid JSON (${error.message})`);
    }
}

async function validateHtml(relativePath) {
    const html = await readFile(path.join(root, relativePath), 'utf8');

    if (!html.trimStart().toLowerCase().startsWith('<!doctype html>')) {
        errors.push(`${relativePath}: missing HTML5 doctype`);
    }

    for (const token of [
        '<meta charset="UTF-8">',
        'name="viewport"',
        'name="description"',
        'rel="canonical"',
        'id="root"',
        'src="/src/main.tsx"',
    ]) {
        if (!html.includes(token)) {
            errors.push(`${relativePath}: missing ${token}`);
        }
    }

    const idMatches = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const duplicateIds = idMatches.filter((id, index) => idMatches.indexOf(id) !== index);
    for (const id of new Set(duplicateIds)) {
        errors.push(`${relativePath}: duplicate id "${id}"`);
    }

    const links = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const link of links) {
        const target = localTargetFromUrl(link, relativePath);
        if (target && !(await exists(target))) {
            errors.push(`${relativePath}: missing linked asset ${link}`);
        }
    }
}

async function run() {
    for (const requiredPath of requiredPaths) {
        if (!(await exists(requiredPath))) {
            errors.push(`Missing required path: ${requiredPath}`);
        }
    }

    await validateJson('package.json');
    await validateJson('manifest.json');
    await validateJson('vercel.json');

    for (const htmlFile of htmlFiles) {
        if (await exists(htmlFile)) {
            await validateHtml(htmlFile);
        }
    }

    const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
    if (!sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) {
        errors.push('sitemap.xml: missing urlset root');
    }

    if (errors.length) {
        console.error(errors.map((error) => `- ${error}`).join('\n'));
        process.exit(1);
    }

    console.log('Project validation passed.');
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});

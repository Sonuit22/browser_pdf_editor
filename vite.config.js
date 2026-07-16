import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';

function copyRootAssets() {
    const rootFiles = ['manifest.json', 'robots.txt', 'sitemap.xml', 'sw.js'];
    const assetFolders = ['assets/css', 'assets/icons', 'assets/images', 'assets/js'];

    return {
        name: 'copy-root-assets',
        async closeBundle() {
            await mkdir('dist', { recursive: true });

            await Promise.all([
                ...rootFiles.map((file) => copyFile(file, path.join('dist', file))),
                ...assetFolders.map((folder) => cp(folder, path.join('dist', folder), { recursive: true })),
            ]);

            await Promise.all(
                ['index.html', 'privacy.html', 'terms.html', 'pages/no-javascript.html'].map(async (file) => {
                    const outputPath = path.join('dist', file);
                    const html = await readFile(outputPath, 'utf8');
                    const normalized = html
                        .replace(/href="\/assets\/manifest-[^"]+\.json"/g, 'href="/manifest.json"')
                        .replace(/href="\/assets\/favicon-[^"]+\.svg"/g, 'href="/assets/icons/favicon.svg"')
                        .replace(/href="\/assets\/app-icon-[^"]+\.svg"/g, 'href="/assets/icons/app-icon.svg"');

                    await writeFile(outputPath, normalized);
                })
            );
        },
    };
}

export default defineConfig({
    appType: 'mpa',
    plugins: [copyRootAssets()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: 'index.html',
                privacy: 'privacy.html',
                terms: 'terms.html',
                noJavascript: 'pages/no-javascript.html',
            },
        },
    },
});

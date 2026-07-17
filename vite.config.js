import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function copyRootAssets() {
    const rootFiles = ['manifest.json', 'robots.txt', 'sitemap.xml'];
    const assetFolders = ['assets/icons', 'assets/images'];

    return {
        name: 'copy-root-assets',
        async closeBundle() {
            await mkdir('dist', { recursive: true });

            await Promise.all([
                ...rootFiles.map((file) => copyFile(file, path.join('dist', file))),
                ...assetFolders.map((folder) => cp(folder, path.join('dist', folder), { recursive: true })),
            ]);

            await Promise.all(
                ['index.html'].map(async (file) => {
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
    plugins: [react(), copyRootAssets()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'pdf-engine': ['pdfjs-dist', 'pdf-lib'],
                    'ui-icons': ['lucide-react'],
                },
            },
        },
    },
});

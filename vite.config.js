import { copyFile, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function copyRootAssets() {
    const rootFiles = ['manifest.json', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml'];
    const assetFolders = ['assets/icons', 'assets/images', 'pages'];

    return {
        name: 'copy-root-assets',
        async closeBundle() {
            await mkdir('dist', { recursive: true });

            await Promise.all([
                ...rootFiles.map((file) => copyFile(file, path.join('dist', file))),
                ...assetFolders.map((folder) => cp(folder, path.join('dist', folder), { recursive: true })),
            ]);

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

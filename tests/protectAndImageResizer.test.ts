import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { filterTools, toolRegistry } from '../src/config/toolRegistry';
import { getSeoForPath } from '../src/config/seo';
import { PDF as LibPDF } from '@libpdf/core';
import { PDFDocument } from 'pdf-lib';
import { protectPdf } from '../src/modules/protection/protectPdfService';

describe('Protect PDF and Image Resizer production surfaces', () => {
    it('registers searchable aliases and dedicated routes', () => {
        const protect = toolRegistry.find((tool) => tool.id === 'protect');
        const image = toolRegistry.find((tool) => tool.id === 'image-resizer');
        expect(protect?.aliases).toEqual(expect.arrayContaining(['protect pdf', 'password pdf', 'secure pdf', 'lock pdf']));
        expect(image?.aliases).toEqual(expect.arrayContaining(['resize image', 'image resizer', 'change image dimensions', 'reduce image size', 'compress image']));
        expect(filterTools('All', 'lock pdf').map((tool) => tool.id)).toContain('protect');
        expect(filterTools('All', 'image resizer').map((tool) => tool.id)).toContain('image-resizer');
        expect(getSeoForPath('/protect-pdf').description).toContain('AES encryption');
        expect(getSeoForPath('/image-resizer').description).toContain('JPG, PNG, and WebP');
    });

    it('keeps processing client-side and avoids sensitive analytics fields', async () => {
        const protect = await readFile('src/modules/protection/protectPdfService.ts', 'utf8');
        const image = await readFile('src/modules/imageResizer/imageResizeService.ts', 'utf8');
        const analytics = await readFile('src/utils/analytics.ts', 'utf8');
        expect(protect).toContain("algorithm: 'AES-256'");
        expect(protect).not.toMatch(/fetch\(|XMLHttpRequest|localStorage/);
        expect(image).toContain("document.createElement('canvas')");
        expect(image).not.toMatch(/fetch\(|XMLHttpRequest|localStorage/);
        expect(analytics).not.toMatch(/password\??:|filename\??:|file_name\??:/);
    });

    it('bounds target-size image resizing attempts', async () => {
        const source = await readFile('src/modules/imageResizer/imageResizeService.ts', 'utf8');
        expect(source).toContain('const maxAttempts = settings.targetBytes ? 5 : 1');
        expect(source).toContain('quality <= 40');
        expect(source).toContain('settings.targetBytes * 1.08');
    });

    it('creates an authenticated encrypted PDF and preserves every page', async () => {
        const source = await PDFDocument.create();
        source.addPage([300, 400]);
        source.addPage([400, 300]);
        const bytes = await source.save();
        const file = Object.assign(new Blob([bytes], { type: 'application/pdf' }), { name: 'two-pages.pdf', lastModified: 0 }) as File;
        const protectedBlob = await protectPdf(file, 'Test-Only-Strong-42!');
        const protectedBytes = new Uint8Array(await protectedBlob.arrayBuffer());

        const unlocked = await LibPDF.load(protectedBytes, { credentials: 'Test-Only-Strong-42!' });
        expect(unlocked.isEncrypted).toBe(true);
        expect(unlocked.isAuthenticated).toBe(true);
        expect(unlocked.getPages()).toHaveLength(2);

        const wrong = await LibPDF.load(protectedBytes, { credentials: 'wrong-password' });
        expect(wrong.isEncrypted).toBe(true);
        expect(wrong.isAuthenticated).toBe(false);
    });
});

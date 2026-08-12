import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { findToolByRoute } from '../src/config/toolRegistry';

describe('custom browser PDF compression workflow', () => {
    it('publishes Compress PDF as an honest beta workspace', () => {
        expect(findToolByRoute('/compress-pdf')).toMatchObject({ status: 'beta', surface: 'pdf-workspace', enabled: true });
    });

    it('keeps process, result, recompress, and explicit download as separate states', async () => {
        const source = await readFile('src/modules/pdf/compression/CompressionWorkspace.tsx', 'utf8');
        expect(source).toContain('Compress &amp; Preview Size');
        expect(source).toContain('Compression Result');
        expect(source).toContain('Recompress');
        expect(source).toContain('Download Compressed PDF');
        expect(source).not.toMatch(/compressPdf[\s\S]{0,300}downloadBlob/);
    });

    it('implements distinct DPI, pixel scale, JPEG quality, cancellation, and bounded target attempts', async () => {
        const service = await readFile('src/modules/pdf/compression/compressionService.ts', 'utf8');
        expect(service).toContain('settings.dpi / 72');
        expect(service).toContain('settings.imageScale / 100');
        expect(service).toContain("'image/jpeg', quality");
        expect(service).toContain('const maxAttempts = options.settings.targetBytes ? 4 : 1');
        expect(service).toContain("task.cancel()");
        expect(service).toContain("strategy: 'preserve-original'");
    });
});

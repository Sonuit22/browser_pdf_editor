import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { filterTools, toolRegistry } from '../src/config/toolRegistry';
import { getSeoForPath } from '../src/config/seo';
import { createWorkingPdf } from '../src/modules/pdf/editor/services/pdfExportService';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';
import { defaultUtilitySettings } from '../src/modules/pdf/utilities/types/utilities';
import { readFile } from 'node:fs/promises';
import { watermarkSettingsForExport } from '../src/modules/pdf/utilities/utils/watermarkExportSettings';

describe('Watermark PDF tool', () => {
    it('is searchable, indexable, and connected to the PDF workspace', () => {
        expect(filterTools('All', 'add watermark').map((tool) => tool.id)).toContain('watermark');
        expect(toolRegistry.find((tool) => tool.id === 'watermark')).toMatchObject({ title: 'Watermark PDF', route: '/watermark-pdf', status: 'available', surface: 'pdf-workspace' });
        expect(getSeoForPath('/watermark-pdf')).toMatchObject({ index: true });
    });

    it('uses live touch-compatible color input and responsive controls', async () => {
        const [workspace, watermarkWorkspace, viewer, preview, previewStyle, css] = await Promise.all([
            readFile('src/modules/pdf/utilities/components/UtilityWorkspace.tsx', 'utf8'),
            readFile('src/modules/pdf/utilities/components/WatermarkWorkspace.tsx', 'utf8'),
            readFile('src/modules/pdf/viewer/PdfViewer.tsx', 'utf8'),
            readFile('src/modules/pdf/utilities/components/UtilityPreviewOverlay.tsx', 'utf8'),
            readFile('src/modules/pdf/utilities/utils/watermarkPreviewStyle.ts', 'utf8'),
            readFile('src/styles.css', 'utf8'),
        ]);
        expect(workspace).toContain('aria-label="Watermark color"');
        expect(workspace).toContain('onInput={(event) => utilities.updateWatermark');
        expect(previewStyle).toContain('color: watermark.color');
        expect(previewStyle).toContain('opacity: watermark.opacity');
        expect(previewStyle).toContain('fontSize: watermark.fontSize * viewport.scale');
        expect(preview).toContain('showImageWatermark');
        expect(watermarkWorkspace).toContain('watermark-workspace__layout');
        expect(watermarkWorkspace).toContain('Apply settings to update the preview.');
        expect(viewer).toContain("isWatermarkWorkspace ? 'Download watermarked PDF'");
        expect(css).toContain('@media (max-width: 899px) { .watermark-workspace__layout { grid-template-columns: minmax(0, 1fr); }');
        expect(css).toContain('.pdf-viewer--watermark .watermark-actions { display: none; }');
        expect(css).toContain('.utility-section input[type="color"]');
        expect(css).toContain('min-height: 44px');
    });

    it('applies the current page target automatically when mobile download is used', () => {
        const pages: WorkingPage[] = [
            { id: 'page-1', kind: 'blank', sourceDocumentId: null, sourcePageIndex: null, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null },
            { id: 'page-2', kind: 'blank', sourceDocumentId: null, sourcePageIndex: null, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null },
        ];
        const utilities = { ...defaultUtilitySettings, watermark: { ...defaultUtilitySettings.watermark, enabled: false, text: 'PRIVATE', applicationMode: 'selected' as const } };
        const prepared = watermarkSettingsForExport(utilities, pages, ['page-2'], 'page-1');
        expect(prepared.watermark).toMatchObject({ enabled: true, pageIds: ['page-2'] });
        expect(prepared.settings.watermark.pageIds).toEqual(['page-2']);
    });

    it('blocks incomplete text and image watermarks before download', () => {
        const pages: WorkingPage[] = [{ id: 'page-1', kind: 'blank', sourceDocumentId: null, sourcePageIndex: null, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null }];
        expect(() => watermarkSettingsForExport({ ...defaultUtilitySettings, watermark: { ...defaultUtilitySettings.watermark, text: '' } }, pages, [], 'page-1')).toThrow('Enter watermark text');
        expect(() => watermarkSettingsForExport({ ...defaultUtilitySettings, watermark: { ...defaultUtilitySettings.watermark, kind: 'image', imageSource: null } }, pages, [], 'page-1')).toThrow('Choose a watermark image');
    });

    it('exports a valid locally watermarked PDF', async () => {
        const page: WorkingPage = { id: 'page-1', kind: 'blank', sourceDocumentId: null, sourcePageIndex: null, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null };
        const bytes = await createWorkingPdf({
            pages: [page], annotationsByPageId: {}, getSourceFile: () => null,
            utilities: { ...defaultUtilitySettings, watermark: { ...defaultUtilitySettings.watermark, enabled: true, text: 'CONFIDENTIAL', color: '#ff0000', pageIds: [page.id] } },
        });
        const output = await PDFDocument.load(bytes);
        expect(output.getPageCount()).toBe(1);
        expect(bytes.byteLength).toBeGreaterThan(600);
        const rendered = await getDocument({ data: bytes.slice(), disableWorker: true }).promise;
        const operators = await (await rendered.getPage(1)).getOperatorList();
        const colorIndex = operators.fnArray.findIndex((operator) => operator === OPS.setFillRGBColor);
        expect(colorIndex).toBeGreaterThanOrEqual(0);
        const rawColor = operators.argsArray[colorIndex] as unknown[];
        expect(rawColor).toEqual(['#ff0000']);
    });
});

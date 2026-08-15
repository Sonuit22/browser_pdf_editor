import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { filterTools, toolRegistry } from '../src/config/toolRegistry';
import { getSeoForPath } from '../src/config/seo';
import { createWorkingPdf } from '../src/modules/pdf/editor/services/pdfExportService';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';
import { defaultUtilitySettings } from '../src/modules/pdf/utilities/types/utilities';

describe('Watermark PDF tool', () => {
    it('is searchable, indexable, and connected to the PDF workspace', () => {
        expect(filterTools('All', 'add watermark').map((tool) => tool.id)).toContain('watermark');
        expect(toolRegistry.find((tool) => tool.id === 'watermark')).toMatchObject({ title: 'Watermark PDF', route: '/watermark-pdf', status: 'available', surface: 'pdf-workspace' });
        expect(getSeoForPath('/watermark-pdf')).toMatchObject({ index: true });
    });

    it('exports a valid locally watermarked PDF', async () => {
        const page: WorkingPage = { id: 'page-1', kind: 'blank', sourceDocumentId: null, sourcePageIndex: null, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null };
        const bytes = await createWorkingPdf({
            pages: [page], annotationsByPageId: {}, getSourceFile: () => null,
            utilities: { ...defaultUtilitySettings, watermark: { ...defaultUtilitySettings.watermark, enabled: true, text: 'CONFIDENTIAL', pageIds: [page.id] } },
        });
        const output = await PDFDocument.load(bytes);
        expect(output.getPageCount()).toBe(1);
        expect(bytes.byteLength).toBeGreaterThan(600);
    });
});

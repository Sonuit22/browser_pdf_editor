import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createWorkingPdf } from '../src/modules/pdf/editor/services/pdfExportService';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';

async function fixture() {
    const source = await PDFDocument.create();
    [[300, 500], [400, 500], [500, 500]].forEach(([width, height]) => source.addPage([width, height]));
    const file = new File([await source.save()], 'source.pdf', { type: 'application/pdf' });
    const pages: WorkingPage[] = [0, 1, 2].map((sourcePageIndex) => ({
        id: `page-${sourcePageIndex + 1}`,
        kind: 'source',
        sourceDocumentId: 'root',
        sourcePageIndex,
        width: 300 + sourcePageIndex * 100,
        height: 500,
        rotation: 0,
        duplicatedFromPageId: null,
    }));
    const create = async (next: WorkingPage[]) => PDFDocument.load(await createWorkingPdf({
        pages: next,
        annotationsByPageId: {},
        getSourceFile: () => file,
    }));
    return { pages, create };
}

describe('remove, extract, and organize output flows', () => {
    it('exports only the selected page for extraction', async () => {
        const { pages, create } = await fixture();
        const output = await create([pages[1]]);
        expect(output.getPages().map((page) => page.getWidth())).toEqual([400]);
    });

    it('excludes selected pages while preserving remaining order for removal', async () => {
        const { pages, create } = await fixture();
        const output = await create([pages[0], pages[2]]);
        expect(output.getPages().map((page) => page.getWidth())).toEqual([300, 500]);
    });

    it('preserves visible reorder and rotation in organized output', async () => {
        const { pages, create } = await fixture();
        const output = await create([pages[1], { ...pages[0], rotation: 90 }, pages[2]]);
        expect(output.getPages().map((page) => page.getWidth())).toEqual([400, 300, 500]);
        expect(output.getPages().map((page) => page.getRotation().angle)).toEqual([0, 90, 0]);
    });
});

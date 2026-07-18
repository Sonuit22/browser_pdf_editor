import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createWorkingPdf } from '../src/modules/pdf/editor/services/pdfExportService';
import type { HighlightAnnotation, ImageAnnotation, ShapeAnnotation, TextAnnotation } from '../src/modules/pdf/editor/types/annotations';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/2p7nGQAAAABJRU5ErkJggg==';
const page: WorkingPage = { id: 'page-1', kind: 'blank', width: 612, height: 792, rotation: 0, sourceDocumentId: null, sourcePageIndex: null };
const base = { pageId: page.id, x: 50, y: 50, width: 100, height: 80, zIndex: 1, opacity: .8, rotation: 0, strokeColor: '#178a49', strokeWidth: 2, fillColor: 'transparent', createdAt: 1, updatedAt: 1 };

describe('editor export', () => {
    it('embeds locally added images and supported shapes into a valid PDF', async () => {
        const image: ImageAnnotation = { ...base, id: 'image-1', type: 'image', source: png, mimeType: 'image/png', aspectRatio: 1 };
        const shapes: ShapeAnnotation[] = [
            { ...base, id: 'shape-1', type: 'rounded-rectangle' },
            { ...base, id: 'shape-2', type: 'triangle' },
        ];
        const highlight: HighlightAnnotation = { ...base, id: 'highlight-1', type: 'highlight', color: '#ffe066', opacity: .3, strokeWidth: 18, points: [{ x: 50, y: 200 }, { x: 250, y: 200 }] };
        const text: TextAnnotation = { ...base, id: 'text-1', type: 'text', text: 'First line\nSecond line', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111111', backgroundColor: '#ffffff', backgroundOpacity: .25, borderColor: '#178a49', borderWidth: 1, padding: 6, lineHeight: 1.3, letterSpacing: 0, align: 'left' };
        const bytes = await createWorkingPdf({ pages: [page], annotationsByPageId: { [page.id]: [image, text, highlight, ...shapes] }, getSourceFile: () => null });
        const output = await PDFDocument.load(bytes);
        expect(output.getPageCount()).toBe(1);
        expect(bytes.byteLength).toBeGreaterThan(500);
    });
});

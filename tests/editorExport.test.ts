import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createWorkingPdf, rotatePdfPoint } from '../src/modules/pdf/editor/services/pdfExportService';
import type { DrawAnnotation, HighlightAnnotation, ImageAnnotation, ShapeAnnotation, SignatureAnnotation, TextAnnotation } from '../src/modules/pdf/editor/types/annotations';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/2p7nGQAAAABJRU5ErkJggg==';
const page: WorkingPage = { id: 'page-1', kind: 'blank', width: 612, height: 792, rotation: 0, sourceDocumentId: null, sourcePageIndex: null };
const base = { pageId: page.id, x: 50, y: 50, width: 100, height: 80, zIndex: 1, opacity: .8, rotation: 0, strokeColor: '#178a49', strokeWidth: 2, fillColor: 'transparent', createdAt: 1, updatedAt: 1 };

describe('editor export', () => {
    it('embeds locally added images and supported shapes into a valid PDF', async () => {
        const image: ImageAnnotation = { ...base, id: 'image-1', type: 'image', source: png, mimeType: 'image/png', aspectRatio: 1, rotation: 20 };
        const signature: SignatureAnnotation = { ...base, id: 'signature-1', type: 'signature', source: png, signatureKind: 'drawn', aspectRatio: 1, rotation: -15 };
        const date: SignatureAnnotation = { ...base, id: 'date-1', type: 'signature', source: png, signatureKind: 'date', aspectRatio: 3.5 };
        const checkmark: SignatureAnnotation = { ...base, id: 'checkmark-1', type: 'signature', source: png, signatureKind: 'checkmark', aspectRatio: 1 };
        const shapes: ShapeAnnotation[] = [
            { ...base, id: 'shape-1', type: 'rounded-rectangle', rotation: 12 },
            { ...base, id: 'shape-2', type: 'ellipse', rotation: 18 },
            { ...base, id: 'shape-3', type: 'line', rotation: 25 },
            { ...base, id: 'shape-4', type: 'arrow', rotation: -25 },
            { ...base, id: 'shape-5', type: 'triangle', rotation: 30 },
        ];
        const highlight: HighlightAnnotation = { ...base, id: 'highlight-1', type: 'highlight', color: '#ffe066', opacity: .3, strokeWidth: 18, points: [{ x: 50, y: 200 }, { x: 250, y: 200 }] };
        const drawing: DrawAnnotation = { ...base, id: 'draw-1', type: 'draw', color: '#178a49', strokeWidth: 3, points: [{ x: 50, y: 250 }, { x: 100, y: 275 }, { x: 160, y: 245 }] };
        const text: TextAnnotation = { ...base, id: 'text-1', type: 'text', text: 'First line\nSecond line', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111111', backgroundColor: '#ffffff', backgroundOpacity: .25, borderColor: '#178a49', borderWidth: 1, padding: 6, lineHeight: 1.3, letterSpacing: 0, align: 'left', rotation: 10 };
        const bytes = await createWorkingPdf({ pages: [page], annotationsByPageId: { [page.id]: [image, signature, date, checkmark, text, highlight, drawing, ...shapes] }, getSourceFile: () => null });
        const output = await PDFDocument.load(bytes);
        expect(output.getPageCount()).toBe(1);
        expect(bytes.byteLength).toBeGreaterThan(500);
    });

    it('rotates export geometry around the same center pivot as the overlay', () => {
        const rotated = rotatePdfPoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);
        expect(rotated.x).toBeCloseTo(0);
        expect(rotated.y).toBeCloseTo(10);
        expect(rotatePdfPoint({ x: 10, y: 5 }, { x: 2, y: 3 }, 360)).toEqual({ x: 10, y: 5 });
    });
});

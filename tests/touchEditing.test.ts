import { describe, expect, it } from 'vitest';
import { constrainBounds, resizeBounds } from '../src/modules/pdf/editor/utils/touchGeometry';
import { clampPdfPoint } from '../src/modules/pdf/editor/utils/coordinates';
import type { ImageAnnotation, SignatureAnnotation, TextAnnotation } from '../src/modules/pdf/editor/types/annotations';

const base = { id: 'object-1', pageId: 'page-1', x: 100, y: 100, width: 200, height: 100, rotation: 0, opacity: 1, zIndex: 1, strokeColor: '#000', strokeWidth: 0, fillColor: 'transparent', createdAt: 1, updatedAt: 1 };

describe('mobile object gestures', () => {
    it('constrains moved objects to the current PDF page', () => {
        expect(constrainBounds({ x: -50, y: 900, width: 200, height: 100 }, 612, 792)).toEqual({ x: 0, y: 692, width: 200, height: 100 });
    });

    it('preserves image aspect ratio from corner resize handles', () => {
        const image: ImageAnnotation = { ...base, type: 'image', source: 'data:image/png;base64,AA==', mimeType: 'image/png', aspectRatio: 2 };
        const resized = resizeBounds(image, 100, 80, 'se');
        expect(resized.width).toBe(300);
        expect(resized.height).toBe(150);
    });

    it('keeps text boxes above a touch-friendly minimum size', () => {
        const text: TextAnnotation = { ...base, type: 'text', text: 'Editable', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111', backgroundColor: '#fff', backgroundOpacity: 0, borderColor: '#000', borderWidth: 0, padding: 4, lineHeight: 1.2, letterSpacing: 0, align: 'left' };
        expect(resizeBounds(text, -500, 500, 'se')).toMatchObject({ width: 80, height: 36 });
    });

    it('keeps movable date objects in bounds and preserves their aspect ratio when resized', () => {
        const date: SignatureAnnotation = { ...base, type: 'signature', source: 'data:image/png;base64,AA==', signatureKind: 'date', aspectRatio: 3.5 };
        const resized = resizeBounds(date, 80, 50, 'se');
        expect(resized.width / resized.height).toBeCloseTo(3.5);
        expect(constrainBounds({ ...resized, x: 580, y: 770 }, 612, 792)).toMatchObject({ x: 332, y: 712 });
    });

    it('clamps free-draw points to the active PDF page', () => {
        expect(clampPdfPoint({ x: -20, y: 840 }, 612, 792)).toEqual({ x: 0, y: 792 });
        expect(clampPdfPoint({ x: 310, y: 420 }, 612, 792)).toEqual({ x: 310, y: 420 });
    });
});

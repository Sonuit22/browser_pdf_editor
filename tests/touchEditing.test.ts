import { describe, expect, it } from 'vitest';
import { constrainAnnotationBounds, constrainBounds, resizeBounds, resizeHandleForPageRotation } from '../src/modules/pdf/editor/utils/touchGeometry';
import { clampPdfPoint, clientPointToPdfPoint } from '../src/modules/pdf/editor/utils/coordinates';
import type { ImageAnnotation, SignatureAnnotation, TextAnnotation } from '../src/modules/pdf/editor/types/annotations';
import type { PageViewport } from 'pdfjs-dist';

const base = { id: 'object-1', pageId: 'page-1', x: 100, y: 100, width: 200, height: 100, rotation: 0, opacity: 1, zIndex: 1, strokeColor: '#000', strokeWidth: 0, fillColor: 'transparent', createdAt: 1, updatedAt: 1 };

describe('mobile object gestures', () => {
    it('constrains moved objects to the current PDF page', () => {
        expect(constrainBounds({ x: -50, y: 900, width: 200, height: 100 }, 612, 792)).toEqual({ x: 0, y: 692, width: 200, height: 100 });
    });

    it('preserves image aspect ratio from corner resize handles', () => {
        const image: ImageAnnotation = { ...base, type: 'image', source: 'data:image/png;base64,AA==', mimeType: 'image/png', aspectRatio: 2 };
        const resized = resizeBounds(image, 100, -50, 'se');
        expect(resized.width).toBe(300);
        expect(resized.height).toBe(150);
    });

    it('lets a vertical corner gesture drive aspect-ratio resizing', () => {
        const image: ImageAnnotation = { ...base, type: 'image', source: 'data:image/png;base64,AA==', mimeType: 'image/png', aspectRatio: 2 };
        const resized = resizeBounds(image, 0, -100, 'se');
        expect(resized.width).toBe(400);
        expect(resized.height).toBe(200);
    });

    it('keeps text boxes above a touch-friendly minimum size', () => {
        const text: TextAnnotation = { ...base, type: 'text', text: 'Editable', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111', backgroundColor: '#fff', backgroundOpacity: 0, borderColor: '#000', borderWidth: 0, padding: 4, lineHeight: 1.2, letterSpacing: 0, align: 'left' };
        expect(resizeBounds(text, -500, 500, 'se')).toMatchObject({ width: 80, height: 36 });
    });

    it('keeps movable date objects in bounds and preserves their aspect ratio when resized', () => {
        const date: SignatureAnnotation = { ...base, type: 'signature', source: 'data:image/png;base64,AA==', signatureKind: 'date', aspectRatio: 3.5 };
        const resized = resizeBounds(date, 80, 0, 'se');
        expect(resized.width / resized.height).toBeCloseTo(3.5);
        const constrained = constrainBounds({ ...resized, x: 580, y: 770 }, 612, 792);
        expect(constrained.x + constrained.width).toBeLessThanOrEqual(612);
        expect(constrained.y + constrained.height).toBeLessThanOrEqual(792);
    });

    it('keeps oversized visual objects in bounds without distorting them', () => {
        const signature: SignatureAnnotation = { ...base, type: 'signature', source: 'data:image/png;base64,AA==', signatureKind: 'drawn', aspectRatio: 2 };
        const constrained = constrainAnnotationBounds(signature, { x: -50, y: 100, width: 900, height: 450 }, 612, 792);
        expect(constrained).toMatchObject({ x: 0, width: 612, height: 306 });
    });

    it('maps screen resize handles to PDF axes on rotated pages', () => {
        expect(resizeHandleForPageRotation('e', 90)).toBe('n');
        expect(resizeHandleForPageRotation('se', 90)).toBe('ne');
        expect(resizeHandleForPageRotation('nw', 180)).toBe('se');
        expect(resizeHandleForPageRotation('ne', 270)).toBe('se');
    });

    it('clamps free-draw points to the active PDF page', () => {
        expect(clampPdfPoint({ x: -20, y: 840 }, 612, 792)).toEqual({ x: 0, y: 792 });
        expect(clampPdfPoint({ x: 310, y: 420 }, 612, 792)).toEqual({ x: 310, y: 420 });
    });

    it('converts client coordinates through the page rectangle and PDF viewport', () => {
        const element = { getBoundingClientRect: () => ({ left: 120, top: 80 }) } as HTMLElement;
        const viewport = { convertToPdfPoint: (x: number, y: number) => [x / 2, 500 - y / 2] } as unknown as PageViewport;
        const pointer = { clientX: 320, clientY: 280 } as PointerEvent;
        expect(clientPointToPdfPoint(pointer, element, viewport)).toEqual({ x: 100, y: 400 });
    });
});

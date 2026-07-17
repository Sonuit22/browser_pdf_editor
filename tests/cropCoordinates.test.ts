import { describe, expect, it } from 'vitest';
import { cropMarginsToViewportRect, normalizeCropMargins, projectCropMargins, viewportRectToCropMargins } from '../src/modules/pdf/utilities/utils/cropCoordinates';

const page = { width: 600, height: 800 };
const crop = { left: 20, right: 40, top: 30, bottom: 50 };

function viewport(rotation: 0 | 90 | 180 | 270, scale = 1) {
    const width = rotation === 90 || rotation === 270 ? page.height * scale : page.width * scale;
    const height = rotation === 90 || rotation === 270 ? page.width * scale : page.height * scale;
    const toViewport = (x: number, y: number): [number, number] => {
        if (rotation === 90) return [y * scale, x * scale];
        if (rotation === 180) return [(page.width - x) * scale, y * scale];
        if (rotation === 270) return [(page.height - y) * scale, (page.width - x) * scale];
        return [x * scale, (page.height - y) * scale];
    };
    const toPdf = (x: number, y: number): [number, number] => {
        if (rotation === 90) return [y / scale, x / scale];
        if (rotation === 180) return [page.width - x / scale, y / scale];
        if (rotation === 270) return [page.width - y / scale, page.height - x / scale];
        return [x / scale, page.height - y / scale];
    };
    return { width, height, convertToViewportPoint: toViewport, convertToPdfPoint: toPdf } as never;
}

describe('crop coordinates', () => {
    it('round-trips PDF crop margins through portrait and rotated viewports', () => {
        for (const rotation of [0, 90, 180, 270] as const) {
            const activeViewport = viewport(rotation);
            const rect = cropMarginsToViewportRect(crop, page, activeViewport);
            expect(viewportRectToCropMargins(rect, page, activeViewport)).toEqual(crop);
        }
    });

    it('keeps crop values independent of viewport zoom', () => {
        const small = cropMarginsToViewportRect(crop, page, viewport(0, .5));
        const large = cropMarginsToViewportRect(crop, page, viewport(0, 2));
        expect(large.width / small.width).toBe(4);
        expect(viewportRectToCropMargins(small, page, viewport(0, .5))).toEqual(crop);
        expect(viewportRectToCropMargins(large, page, viewport(0, 2))).toEqual(crop);
    });

    it('applies absolute or proportional crop margins to mixed page sizes', () => {
        expect(projectCropMargins({ left: 60, right: 30, top: 80, bottom: 40 }, page, { width: 300, height: 400 }, 'absolute')).toEqual({ left: 60, right: 30, top: 80, bottom: 40 });
        expect(projectCropMargins({ left: 60, right: 30, top: 80, bottom: 40 }, page, { width: 300, height: 400 }, 'proportional')).toEqual({ left: 30, right: 15, top: 40, bottom: 20 });
    });

    it('clamps invalid bounds while retaining a non-empty PDF crop area', () => {
        expect(normalizeCropMargins({ left: -20, right: 900, top: 1000, bottom: -4 }, page)).toEqual({ left: 0, right: 588, top: 788, bottom: 0 });
    });
});

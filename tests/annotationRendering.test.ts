import { describe, expect, it } from 'vitest';
import {
    HIGHLIGHTER_OPACITY_MAX,
    HIGHLIGHTER_OPACITY_MIN,
    HIGHLIGHTER_SIZE_MAX,
    HIGHLIGHTER_SIZE_MIN,
    appendDistinctPathPoints,
    hexToRgb,
    normalizeHexColor,
    normalizeHighlighterSettings,
    pathCommandsToSvg,
    pathPaint,
    screenStrokeWidthToPdf,
    smoothPathCommands,
} from '../src/modules/pdf/editor/utils/annotationRendering';
import type { DrawAnnotation, HighlightAnnotation } from '../src/modules/pdf/editor/types/annotations';

const annotationBase = {
    id: 'annotation-1', pageId: 'page-1', x: 0, y: 0, width: 2, height: 2,
    zIndex: 1, rotation: 0, strokeColor: '#178a49', fillColor: 'transparent',
    createdAt: 1, updatedAt: 1,
};

describe('annotation rendering normalization', () => {
    it('normalizes valid hex colors and safely falls back for invalid values', () => {
        expect(normalizeHexColor('#AbC', '#ffffff')).toBe('#aabbcc');
        expect(normalizeHexColor('not-a-color', '#FFE066')).toBe('#ffe066');
        expect(normalizeHexColor('invalid', 'also-invalid')).toBe('#178a49');
        expect(hexToRgb('#09f')).toEqual({ r: 0, g: 153, b: 255 });
    });

    it('clamps highlighter settings and replaces non-finite values', () => {
        expect(normalizeHighlighterSettings({ color: '#f0a', opacity: 2, strokeWidth: 1 })).toEqual({
            color: '#ff00aa', opacity: HIGHLIGHTER_OPACITY_MAX, strokeWidth: HIGHLIGHTER_SIZE_MIN,
        });
        expect(normalizeHighlighterSettings({ color: 'bad', opacity: Number.NaN, strokeWidth: Number.POSITIVE_INFINITY })).toEqual({
            color: '#ffe066', opacity: 0.3, strokeWidth: 20,
        });
        expect(normalizeHighlighterSettings({ opacity: 0, strokeWidth: 80 })).toMatchObject({
            opacity: HIGHLIGHTER_OPACITY_MIN, strokeWidth: HIGHLIGHTER_SIZE_MAX,
        });
    });

    it('converts clamped screen pixels into PDF units using the viewport scale', () => {
        expect(screenStrokeWidthToPdf(20, 2)).toBe(10);
        expect(screenStrokeWidthToPdf(2, 0.5)).toBe(16);
        expect(screenStrokeWidthToPdf(100, 2)).toBe(20);
        expect(screenStrokeWidthToPdf(Number.NaN, 0)).toBe(20);
    });

    it('produces consistent path paint for highlights and drawings', () => {
        const highlight: HighlightAnnotation = {
            ...annotationBase, type: 'highlight', points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
            color: 'invalid', opacity: 0.9, strokeWidth: 12,
        };
        const draw: DrawAnnotation = {
            ...annotationBase, id: 'draw-1', type: 'draw', points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
            color: '#0a0', opacity: -1, strokeWidth: 3,
        };

        expect(pathPaint(highlight, 1.5)).toEqual({
            color: '#ffe066', opacity: 0.6, width: 18, lineCap: 'butt', lineJoin: 'round',
        });
        expect(pathPaint(draw, 2)).toEqual({
            color: '#00aa00', opacity: 0, width: 6, lineCap: 'round', lineJoin: 'round',
        });
    });

    it('appends only finite points separated by the requested PDF distance', () => {
        const original = [{ x: 0, y: 0 }];
        const result = appendDistinctPathPoints(original, [
            { x: 0.2, y: 0.2 },
            { x: 1, y: 0 },
            { x: Number.NaN, y: 3 },
            { x: 1.4, y: 0 },
            { x: 2, y: 0 },
        ], 0.75);

        expect(result).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);
        expect(original).toEqual([{ x: 0, y: 0 }]);
    });

    it('creates deterministic quadratic geometry that preserves path endpoints', () => {
        const commands = smoothPathCommands([
            { x: 0, y: 2 },
            { x: 4, y: 6 },
            { x: 10, y: 4 },
        ]);

        expect(commands).toEqual([
            { type: 'move', point: { x: 0, y: 2 } },
            { type: 'quadratic', control: { x: 4, y: 6 }, end: { x: 7, y: 5 } },
            { type: 'quadratic', control: { x: 10, y: 4 }, end: { x: 10, y: 4 } },
        ]);
        expect(pathCommandsToSvg(commands)).toBe('M 0 2 Q 4 6 7 5 Q 10 4 10 4');
        expect(pathCommandsToSvg(commands, { invertY: true })).toBe('M 0 -2 Q 4 -6 7 -5 Q 10 -4 10 -4');
    });

    it('handles empty, single-point, and two-point paths without inventing endpoints', () => {
        expect(smoothPathCommands([])).toEqual([]);
        expect(pathCommandsToSvg(smoothPathCommands([{ x: 1, y: 2 }]))).toBe('M 1 2');
        expect(pathCommandsToSvg(smoothPathCommands([{ x: 1, y: 2 }, { x: 5, y: 8 }]))).toBe('M 1 2 Q 5 8 5 8');
    });
});

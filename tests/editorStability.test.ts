import { describe, expect, it } from 'vitest';
import { createAnnotation } from '../src/modules/pdf/editor/utils/createAnnotation';
import { editorReducer, initialEditorState } from '../src/modules/pdf/editor/state/editorReducer';

const settings = {
    text: { color: '#123456', fontSize: 24 },
    draw: { color: '#654321', opacity: .55, strokeWidth: 7 },
    shape: { strokeColor: '#abcdef', strokeWidth: 5, fillColor: '#fedcba', opacity: .7 },
};

describe('stable floating tool settings', () => {
    it('applies text, draw, and shape defaults without committing document history', () => {
        const text = createAnnotation('text', 'page-1', { x: 10, y: 20 }, undefined, 1, settings);
        const draw = createAnnotation('draw', 'page-1', { x: 10, y: 20 }, undefined, 1, settings);
        const shape = createAnnotation('ellipse', 'page-1', { x: 10, y: 20 }, undefined, 1, settings);

        expect(text?.type === 'text' && { color: text.color, fontSize: text.fontSize }).toEqual(settings.text);
        expect(draw?.type === 'draw' && { color: draw.color, opacity: draw.opacity, strokeWidth: draw.strokeWidth }).toEqual(settings.draw);
        expect(shape?.type === 'ellipse' && { strokeColor: shape.strokeColor, strokeWidth: shape.strokeWidth, fillColor: shape.fillColor, opacity: shape.opacity }).toEqual(settings.shape);

        const changed = editorReducer(initialEditorState, { type: 'shape-settings', settings: { strokeWidth: 8 } });
        expect(changed.past).toHaveLength(0);
        expect(changed.present.dirty).toBe(false);
        expect(changed.present.shapeSettings.strokeWidth).toBe(8);
    });
});

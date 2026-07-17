import { describe, expect, it } from 'vitest';
import { editorReducer, initialEditorState } from '../src/modules/pdf/editor/state/editorReducer';
import type { PdfAnnotation } from '../src/modules/pdf/editor/types/annotations';
import { alignAnnotations, snapValue } from '../src/modules/pdf/editor/utils/professionalEditing';

function text(id: string, x: number, y: number, width = 40, height = 20): PdfAnnotation {
    return { id, pageId: 'page-1', type: 'text', x, y, width, height, zIndex: 1, opacity: 1, rotation: 0, strokeColor: '#000000', strokeWidth: 1, fillColor: '#ffffff', createdAt: 1, updatedAt: 1, text: id, fontSize: 12, fontFamily: 'Helvetica', bold: false, italic: false, color: '#000000', backgroundColor: 'transparent', align: 'left' };
}

describe('professional editing utilities', () => {
    it('aligns and distributes selected annotations predictably', () => {
        const items = [text('a', 10, 20), text('b', 110, 40), text('c', 210, 60)];
        expect(alignAnnotations(items, 'left').map((item) => item.x)).toEqual([10, 10, 10]);
        expect(alignAnnotations(items, 'center-vertical').map((item) => item.y)).toEqual([40, 40, 40]);
        expect(alignAnnotations(items, 'distribute-horizontal').map((item) => item.x)).toEqual([10, 110, 210]);
    });

    it('snaps coordinates to the configured grid', () => {
        expect(snapValue(34, 18)).toBe(36);
        expect(snapValue(34, 0)).toBe(34);
    });

    it('keeps multi-selection outside the undoable annotation history', () => {
        const selected = editorReducer(initialEditorState, { type: 'select-many', ids: ['a', 'b'] });
        expect(selected.present.selectedIds).toEqual(['a', 'b']);
        expect(selected.past).toHaveLength(0);
    });
});

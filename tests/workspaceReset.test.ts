import { describe, expect, it } from 'vitest';
import { editorReducer, initialEditorState } from '../src/modules/pdf/editor/state/editorReducer';
import type { TextAnnotation } from '../src/modules/pdf/editor/types/annotations';

const text: TextAnnotation = {
    id: 'text-1', pageId: 'page-1', type: 'text', x: 10, y: 10, width: 180, height: 72,
    zIndex: 1, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0,
    fillColor: 'transparent', createdAt: 1, updatedAt: 1, text: 'Unsaved', fontSize: 16,
    fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111111',
    backgroundColor: '#ffffff', backgroundOpacity: 0, borderColor: '#178a49', borderWidth: 0,
    padding: 6, lineHeight: 1.3, letterSpacing: 0, align: 'left',
};

describe('tool workspace reset', () => {
    it('clears annotations, selections, active tools, undo and redo when the document changes', () => {
        const withEdit = editorReducer(initialEditorState, {
            type: 'commit',
            next: { ...initialEditorState.present, documentId: 'old-document', activeTool: 'text', selectedId: text.id, selectedIds: [text.id], annotationsByPageId: { [text.pageId]: [text] } },
        });
        const reset = editorReducer(withEdit, { type: 'reset', documentId: null });
        expect(reset.present.annotationsByPageId).toEqual({});
        expect(reset.present.selectedIds).toEqual([]);
        expect(reset.present.activeTool).toBe('select');
        expect(reset.present.dirty).toBe(false);
        expect(reset.past).toEqual([]);
        expect(reset.future).toEqual([]);
    });

    it('preserves highlighter choices inside the editor and restores defaults on reset', () => {
        const customized = editorReducer(initialEditorState, { type: 'highlighter-settings', settings: { color: '#ff9fca', opacity: .6, strokeWidth: 32 } });
        expect(customized.present.highlighterSettings).toEqual({ color: '#ff9fca', opacity: .6, strokeWidth: 32 });
        const reset = editorReducer(customized, { type: 'reset', documentId: null });
        expect(reset.present.highlighterSettings).toEqual({ color: '#ffe066', opacity: .3, strokeWidth: 20 });
    });
});

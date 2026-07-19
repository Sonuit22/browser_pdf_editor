import { describe, expect, it } from 'vitest';
import { editorReducer, initialEditorState } from '../src/modules/pdf/editor/state/editorReducer';
import type { DrawAnnotation, EditorHistoryState, HighlightAnnotation, PdfAnnotation, TextAnnotation } from '../src/modules/pdf/editor/types/annotations';

const base = {
    pageId: 'page-1', zIndex: 1, opacity: 1, rotation: 0, strokeColor: '#000000',
    strokeWidth: 2, fillColor: 'transparent', createdAt: 1, updatedAt: 1,
};
const text: TextAnnotation = {
    ...base, id: 'text-1', type: 'text', x: 10, y: 20, width: 180, height: 72,
    text: 'Movable', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false,
    underline: false, color: '#111111', backgroundColor: '#ffffff', backgroundOpacity: 0,
    borderColor: '#000000', borderWidth: 0, padding: 6, lineHeight: 1.3,
    letterSpacing: 0, align: 'left',
};
const drawing: DrawAnnotation = {
    ...base, id: 'draw-1', type: 'draw', x: 30, y: 30, width: 40, height: 20,
    points: [{ x: 30, y: 30 }, { x: 50, y: 42 }, { x: 70, y: 50 }], color: '#178a49',
};
const highlight: HighlightAnnotation = {
    ...base, id: 'highlight-1', type: 'highlight', x: 80, y: 80, width: 60, height: 10,
    points: [{ x: 80, y: 80 }, { x: 140, y: 82 }], color: '#ffe066',
};

function commit(state: EditorHistoryState, annotations: PdfAnnotation[]) {
    return editorReducer(state, {
        type: 'commit',
        next: { ...state.present, annotationsByPageId: { 'page-1': annotations } },
    });
}

describe('editor object history', () => {
    it('records add, move, resize, drawing, highlight, and delete mutations', () => {
        const added = commit(initialEditorState, [text]);
        const movedText = { ...text, x: 90, y: 120 };
        const moved = commit(added, [movedText]);
        const resizedText = { ...movedText, width: 260, height: 110 };
        const resized = commit(moved, [resizedText]);
        const drew = commit(resized, [resizedText, drawing]);
        const highlighted = commit(drew, [resizedText, drawing, highlight]);
        const deleted = commit(highlighted, [drawing, highlight]);

        expect(deleted.past).toHaveLength(6);
        const restoreDelete = editorReducer(deleted, { type: 'undo' });
        expect(restoreDelete.present.annotationsByPageId['page-1']).toEqual([resizedText, drawing, highlight]);
        const removeHighlight = editorReducer(restoreDelete, { type: 'undo' });
        expect(removeHighlight.present.annotationsByPageId['page-1']).toEqual([resizedText, drawing]);
        const removeDrawing = editorReducer(removeHighlight, { type: 'undo' });
        expect(removeDrawing.present.annotationsByPageId['page-1']).toEqual([resizedText]);
        const restoreSize = editorReducer(removeDrawing, { type: 'undo' });
        expect(restoreSize.present.annotationsByPageId['page-1']?.[0]).toMatchObject({ width: 180, height: 72, x: 90, y: 120 });
        const restorePosition = editorReducer(restoreSize, { type: 'undo' });
        expect(restorePosition.present.annotationsByPageId['page-1']?.[0]).toMatchObject({ x: 10, y: 20 });
        const redoMove = editorReducer(restorePosition, { type: 'redo' });
        expect(redoMove.present.annotationsByPageId['page-1']?.[0]).toMatchObject({ x: 90, y: 120 });
    });

    it('does not reactivate temporary tools or stale selections during undo and redo', () => {
        const highlighting = editorReducer(initialEditorState, { type: 'tool', tool: 'highlight' });
        const added = editorReducer(highlighting, {
            type: 'commit',
            next: { ...highlighting.present, annotationsByPageId: { 'page-1': [highlight] }, selectedId: highlight.id, selectedIds: [highlight.id] },
        });
        const completed = editorReducer(added, { type: 'tool', tool: 'select' });
        const undone = editorReducer(completed, { type: 'undo' });
        expect(undone.present.activeTool).toBe('select');
        expect(undone.present.selectedIds).toEqual([]);
        const redone = editorReducer(undone, { type: 'redo' });
        expect(redone.present.activeTool).toBe('select');
        expect(redone.present.annotationsByPageId['page-1']).toEqual([highlight]);
    });
});

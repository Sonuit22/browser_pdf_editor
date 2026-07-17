import type { EditorHistoryState, EditorPresent, PdfAnnotation } from '../types/annotations';

const LIMIT = 100;
const createPresent = (): EditorPresent => ({ documentId: null, annotationsByPageId: {}, selectedId: null, selectedIds: [], activeTool: 'select', clipboard: null, formValues: {}, flattenForms: false, layout: { showRulers: false, rulerUnit: 'pt', showGrid: false, snapToGrid: false, gridSpacing: 18, snapToGuides: false, guides: [] }, dirty: false });
export const initialEditorState: EditorHistoryState = { present: createPresent(), past: [], future: [] };
export type EditorAction = { type: 'reset'; documentId: string | null } | { type: 'commit'; next: EditorPresent } | { type: 'select'; id: string | null; append?: boolean } | { type: 'select-many'; ids: string[] } | { type: 'tool'; tool: EditorPresent['activeTool'] } | { type: 'clipboard'; annotation: EditorPresent['clipboard'] } | { type: 'sync-page-copies'; copies: Record<string, PdfAnnotation[]> } | { type: 'undo' } | { type: 'redo' };

export function editorReducer(state: EditorHistoryState, action: EditorAction): EditorHistoryState {
    if (action.type === 'reset') return { present: { ...createPresent(), documentId: action.documentId }, past: [], future: [] };
    if (action.type === 'select') { const selectedIds = action.id === null ? [] : action.append ? state.present.selectedIds.includes(action.id) ? state.present.selectedIds.filter((id) => id !== action.id) : [...state.present.selectedIds, action.id] : [action.id]; return { ...state, present: { ...state.present, selectedId: selectedIds[selectedIds.length - 1] ?? null, selectedIds } }; }
    if (action.type === 'select-many') return { ...state, present: { ...state.present, selectedIds: action.ids, selectedId: action.ids[action.ids.length - 1] ?? null } };
    if (action.type === 'tool') return { ...state, present: { ...state.present, activeTool: action.tool, selectedId: action.tool === 'select' ? state.present.selectedId : null, selectedIds: action.tool === 'select' ? state.present.selectedIds : [] } };
    if (action.type === 'clipboard') return { ...state, present: { ...state.present, clipboard: action.annotation } };
    if (action.type === 'sync-page-copies') {
        const annotationsByPageId = { ...state.present.annotationsByPageId };
        for (const [pageId, annotations] of Object.entries(action.copies)) if (!(pageId in annotationsByPageId)) annotationsByPageId[pageId] = annotations;
        return { ...state, present: { ...state.present, annotationsByPageId } };
    }
    if (action.type === 'commit') return { present: { ...action.next, dirty: true }, past: [...state.past, state.present].slice(-LIMIT), future: [] };
    if (action.type === 'undo' && state.past.length) { const previous = state.past[state.past.length - 1]; return { present: previous, past: state.past.slice(0, -1), future: [state.present, ...state.future].slice(0, LIMIT) }; }
    if (action.type === 'redo' && state.future.length) { const [next, ...future] = state.future; return { present: next, past: [...state.past, state.present].slice(-LIMIT), future }; }
    return state;
}

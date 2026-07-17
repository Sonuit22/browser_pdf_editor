import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { cloneAnnotation } from '../utils/annotationUtils';
import { editorReducer, initialEditorState } from '../state/editorReducer';
import { PdfEditorContext } from './editorStore';
import type { EditorPresent, EditorTool, PdfAnnotation } from '../types/annotations';

function modifyAnnotation(present: EditorPresent, id: string, updater: (annotation: PdfAnnotation) => PdfAnnotation) {
    const annotationsByPageId = Object.fromEntries(Object.entries(present.annotationsByPageId).map(([page, annotations]) => [page, annotations.map((annotation) => annotation.id === id ? updater(annotation) : annotation)]));
    return { ...present, annotationsByPageId };
}

export function PdfEditorProvider({ children }: { children: ReactNode }) {
    const { documentId, pages } = usePdfPageOperations();
    const [state, dispatch] = useReducer(editorReducer, initialEditorState);
    const stateRef = useRef(state);
    stateRef.current = state;
    useEffect(() => { dispatch({ type: 'reset', documentId }); }, [documentId]);
    useEffect(() => {
        const copies: Record<string, PdfAnnotation[]> = {};
        for (const page of pages) {
            if (page.duplicatedFromPageId && !stateRef.current.present.annotationsByPageId[page.id]) {
                copies[page.id] = (stateRef.current.present.annotationsByPageId[page.duplicatedFromPageId] ?? []).map((annotation) => cloneAnnotation(annotation, page.id));
            }
        }
        if (Object.keys(copies).length) dispatch({ type: 'sync-page-copies', copies });
    }, [pages]);
    const commit = useCallback((next: EditorPresent) => dispatch({ type: 'commit', next }), []);
    const add = useCallback((annotation: PdfAnnotation) => { const present = stateRef.current.present; const page = present.annotationsByPageId[annotation.pageId] ?? []; commit({ ...present, annotationsByPageId: { ...present.annotationsByPageId, [annotation.pageId]: [...page, annotation] }, selectedId: annotation.id }); }, [commit]);
    const update = useCallback((id: string, patch: Partial<PdfAnnotation>) => { const present = stateRef.current.present; commit(modifyAnnotation(present, id, (annotation) => ({ ...annotation, ...patch, updatedAt: Date.now() } as PdfAnnotation))); }, [commit]);
    const remove = useCallback((id: string) => { const present = stateRef.current.present; const annotationsByPageId = Object.fromEntries(Object.entries(present.annotationsByPageId).map(([page, annotations]) => [page, annotations.filter((annotation) => annotation.id !== id)])); commit({ ...present, annotationsByPageId, selectedId: present.selectedId === id ? null : present.selectedId }); }, [commit]);
    const duplicate = useCallback((id: string) => { const present = stateRef.current.present; for (const annotations of Object.values(present.annotationsByPageId)) { const source = annotations.find((annotation) => annotation.id === id); if (source) { add({ ...cloneAnnotation(source), x: source.x + 12, y: source.y - 12 }); return; } } }, [add]);
    const copy = useCallback((id: string) => { for (const annotations of Object.values(stateRef.current.present.annotationsByPageId)) { const source = annotations.find((annotation) => annotation.id === id); if (source) dispatch({ type: 'clipboard', annotation: source }); } }, []);
    const paste = useCallback((pageId: string) => { const clipboard = stateRef.current.present.clipboard; if (clipboard) add({ ...cloneAnnotation(clipboard, pageId), x: clipboard.x + 16, y: clipboard.y - 16 }); }, [add]);
    const reorder = useCallback((id: string, direction: 'forward' | 'backward') => { const present = stateRef.current.present; const annotationsByPageId = Object.fromEntries(Object.entries(present.annotationsByPageId).map(([page, annotations]) => { const index = annotations.findIndex((annotation) => annotation.id === id); if (index < 0) return [page, annotations]; const target = Math.max(0, Math.min(annotations.length - 1, index + (direction === 'forward' ? 1 : -1))); const next = [...annotations]; [next[index], next[target]] = [next[target], next[index]]; return [page, next.map((annotation, zIndex) => ({ ...annotation, zIndex, updatedAt: annotation.id === id ? Date.now() : annotation.updatedAt }))]; })); commit({ ...present, annotationsByPageId }); }, [commit]);
    const value = useMemo(() => ({ activeTool: state.present.activeTool, selectedId: state.present.selectedId, annotationsByPageId: state.present.annotationsByPageId, dirty: state.present.dirty, canUndo: state.past.length > 0, canRedo: state.future.length > 0, setTool: (tool: EditorTool) => dispatch({ type: 'tool', tool }), select: (id: string | null) => dispatch({ type: 'select', id }), add, update, remove, duplicate, undo: () => dispatch({ type: 'undo' }), redo: () => dispatch({ type: 'redo' }), copy, paste, reorder }), [add, copy, duplicate, paste, remove, reorder, state, update]);
    return <PdfEditorContext.Provider value={value}>{children}</PdfEditorContext.Provider>;
}

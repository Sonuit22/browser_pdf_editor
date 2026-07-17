import { createContext } from 'react';
import type { EditorTool, PdfAnnotation } from '../types/annotations';

export type PdfEditorValue = { activeTool: EditorTool; selectedId: string | null; annotationsByPageId: Record<string, PdfAnnotation[]>; dirty: boolean; canUndo: boolean; canRedo: boolean; setTool: (tool: EditorTool) => void; select: (id: string | null) => void; add: (annotation: PdfAnnotation) => void; update: (id: string, patch: Partial<PdfAnnotation>) => void; remove: (id: string) => void; duplicate: (id: string) => void; undo: () => void; redo: () => void; copy: (id: string) => void; paste: (pageId: string) => void; reorder: (id: string, direction: 'forward' | 'backward') => void };
export const PdfEditorContext = createContext<PdfEditorValue | null>(null);

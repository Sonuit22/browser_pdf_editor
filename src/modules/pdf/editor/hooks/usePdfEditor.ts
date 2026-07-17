import { useContext } from 'react';
import { PdfEditorContext } from '../context/editorStore';
export function usePdfEditor() { const editor = useContext(PdfEditorContext); if (!editor) throw new Error('usePdfEditor must be used inside PdfEditorProvider'); return editor; }

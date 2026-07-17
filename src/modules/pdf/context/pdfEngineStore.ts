import { createContext } from 'react';
import type { usePdfViewer } from '../hooks/usePdfViewer';

export type PdfEngineValue = ReturnType<typeof usePdfViewer> & { openFilePicker: () => void };
export const PdfEngineContext = createContext<PdfEngineValue | null>(null);

import { createContext } from 'react';
import type { usePdfViewer } from '../hooks/usePdfViewer';

export type PdfEngineValue = ReturnType<typeof usePdfViewer> & {
    openFilePicker: () => void;
    stagedFile: File | null;
    stageFile: (file: File) => void;
    clearStagedFile: () => void;
    openStagedFile: () => Promise<boolean>;
};
export const PdfEngineContext = createContext<PdfEngineValue | null>(null);

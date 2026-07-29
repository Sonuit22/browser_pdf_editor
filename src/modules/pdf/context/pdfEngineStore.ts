import { createContext } from 'react';
import type { usePdfViewer } from '../hooks/usePdfViewer';

export interface PendingPdfFile {
    file: File;
    source: 'landing-page';
    selectedAt: number;
}

export type PdfEngineValue = ReturnType<typeof usePdfViewer> & {
    openFilePicker: () => void;
    pendingPdfFile: PendingPdfFile | null;
    stagedFile: File | null;
    stageFile: (file: File) => void;
    clearStagedFile: () => void;
    openStagedFile: () => Promise<boolean>;
    consumePendingPdf: () => Promise<boolean>;
};
export const PdfEngineContext = createContext<PdfEngineValue | null>(null);

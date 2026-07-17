import { createContext } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { PageId, PageInsertion, PageSelectionMode, WorkingPage } from '../types/pages';

export type BlankPageDimensions = { width: number; height: number };

export type PdfPageOperationsValue = {
    documentId: string | null;
    pages: WorkingPage[];
    selectedPageIds: PageId[];
    activePageId: PageId | null;
    activePage: WorkingPage | null;
    isInitializing: boolean;
    canUndo: boolean;
    canRedo: boolean;
    select: (pageId: PageId | null, mode: PageSelectionMode) => void;
    setActivePage: (pageId: PageId | null) => void;
    selectAll: () => void;
    clearSelection: () => void;
    invertSelection: () => void;
    reorder: (targetId: PageId, placement: 'before' | 'after') => void;
    moveActive: (direction: -1 | 1) => void;
    deleteSelected: () => boolean;
    duplicateSelected: () => void;
    insertBlank: (dimensions: BlankPageDimensions, insertion: PageInsertion) => void;
    rotateSelected: (delta: -90 | 90) => void;
    rotateAll: (delta: -90 | 90) => void;
    undo: () => void;
    redo: () => void;
    importPages: (file: File, pageIndices: number[], insertion: PageInsertion) => Promise<void>;
    getPage: (page: WorkingPage) => Promise<PDFPageProxy>;
    getSourceFile: (sourceDocumentId: string) => File | null;
    getPageNumber: (pageId: PageId) => number;
};

export const PdfPageOperationsContext = createContext<PdfPageOperationsValue | null>(null);

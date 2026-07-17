import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';

export const MAX_PDF_FILE_SIZE = 100 * 1024 * 1024;
export type PdfPhase = 'idle' | 'loading' | 'ready' | 'error';
export type ZoomPreset = 'fit-width' | 'fit-page' | 25 | 50 | 75 | 100 | 125 | 150 | 200 | 300;
export type PdfRotation = 0 | 90 | 180 | 270 | 360;

export type PdfDocumentInfo = {
    filename: string; pageCount: number; fileSize: string; version: string; author: string; subject: string; title: string; keywords: string; creator: string; producer: string; creationDate: string; modificationDate: string;
};

export type PdfViewerState = {
    phase: PdfPhase; document: PDFDocumentProxy | null; loadingTask: PDFDocumentLoadingTask | null; info: PdfDocumentInfo | null; progress: number; currentPage: number; zoom: ZoomPreset; rotation: PdfRotation; error: string | null;
};

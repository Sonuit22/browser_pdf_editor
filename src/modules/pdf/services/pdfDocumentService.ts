import { getDocument, version, type OnProgressParameters, type PDFDocumentLoadingTask, type PDFDocumentProxy } from 'pdfjs-dist';
import type { PdfDocumentInfo } from '../types/pdf';
import { configurePdfWorker } from '../workers/pdfWorker';

function displayValue(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : 'Not Available';
}

export function formatFileSize(size: number) {
    return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function createDocumentLoadingTask(data: Uint8Array, onProgress: (progress: number) => void): PDFDocumentLoadingTask {
    configurePdfWorker();
    const task = getDocument({ data, stopAtErrors: false, disableAutoFetch: false, disableStream: false });
    task.onProgress = ({ loaded, total }: OnProgressParameters) => onProgress(total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0);
    return task;
}

export async function getPdfDocumentInfo(document: PDFDocumentProxy, file: File): Promise<PdfDocumentInfo> {
    const metadata = await document.getMetadata().catch(() => null);
    const info = metadata?.info as Record<string, unknown> | undefined;
    return {
        filename: file.name, pageCount: document.numPages, fileSize: formatFileSize(file.size), version: displayValue(info?.PDFFormatVersion ?? version), author: displayValue(info?.Author), subject: displayValue(info?.Subject), title: displayValue(info?.Title), keywords: displayValue(info?.Keywords), creator: displayValue(info?.Creator), producer: displayValue(info?.Producer), creationDate: displayValue(info?.CreationDate), modificationDate: displayValue(info?.ModDate),
    };
}

export async function releasePdfDocument(task: PDFDocumentLoadingTask | null, document: PDFDocumentProxy | null) {
    await task?.destroy().catch(() => undefined);
    await document?.cleanup().catch(() => undefined);
}

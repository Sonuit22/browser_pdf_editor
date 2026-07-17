import { PDFDocument } from 'pdf-lib';
import { MAX_PDF_FILE_SIZE } from '../types/pdf';

const acceptedMimeTypes = new Set(['application/pdf', 'application/x-pdf']);

export async function validatePdfFile(file: File) {
    if (!file || file.size === 0) throw new Error('The selected file is empty. Choose a PDF with content.');
    if (file.size > MAX_PDF_FILE_SIZE) throw new Error(`The selected PDF is larger than the ${Math.round(MAX_PDF_FILE_SIZE / 1024 / 1024)} MB limit.`);

    const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf');
    const hasAcceptedType = !file.type || acceptedMimeTypes.has(file.type.toLowerCase());
    if (!hasPdfExtension || !hasAcceptedType) throw new Error('Only PDF files can be opened in this viewer.');

    let data: Uint8Array;
    try { data = new Uint8Array(await file.arrayBuffer()); } catch { throw new Error('The selected file could not be read by the browser.'); }

    if (!new TextDecoder('ascii').decode(data.slice(0, 8)).startsWith('%PDF-')) throw new Error('The selected file does not contain a valid PDF header.');

    try { await PDFDocument.load(data.slice(), { ignoreEncryption: true, throwOnInvalidObject: true, updateMetadata: false }); } catch { throw new Error('The selected file is corrupted or is not a readable PDF.'); }
    return data;
}

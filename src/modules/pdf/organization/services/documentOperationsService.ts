import { PDFDocument } from 'pdf-lib';
import { validatePdfFile } from '../../services/pdfValidationService';
import { downloadPdf } from '../utils/pdfDownload';

export async function mergePdfFiles(files: File[], onProgress?: (percent: number) => void) {
    if (files.length < 2) throw new Error('Choose at least two PDF files to merge.');
    const output = await PDFDocument.create();
    for (let index = 0; index < files.length; index += 1) {
        const data = await validatePdfFile(files[index]);
        const source = await PDFDocument.load(data.slice(), { ignoreEncryption: false, updateMetadata: false });
        const copied = await output.copyPages(source, source.getPageIndices());
        for (const page of copied) output.addPage(page);
        onProgress?.(Math.round(((index + 1) / files.length) * 100));
    }
    return output.save();
}

export function downloadSequentialPdfs(files: Array<{ bytes: Uint8Array; filename: string }>) {
    if (files.length > 10) throw new Error('Refine the split to ten files or fewer before downloading.');
    for (const file of files) downloadPdf(file.bytes, file.filename);
}

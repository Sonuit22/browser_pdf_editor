import { PDFDocument, StandardFonts, degrees, rgb, type PDFPage } from 'pdf-lib';
import type { WorkingPage } from '../../organization/types/pages';
import type { PdfAnnotation } from '../types/annotations';
import { safePdfFilename } from '../../organization/utils/pageUtils';
import { downloadPdf } from '../../organization/utils/pdfDownload';

type PdfExportInput = {
    pages: WorkingPage[];
    annotationsByPageId: Record<string, PdfAnnotation[]>;
    getSourceFile: (sourceDocumentId: string) => File | null;
    filename: string;
    onProgress?: (percent: number) => void;
};

function color(value: string) {
    const hex = value.replace('#', '');
    const normalized = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
    const number = Number.parseInt(normalized, 16);
    return rgb(((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255);
}

function fontName(annotation: Extract<PdfAnnotation, { type: 'text' }>) {
    if (annotation.fontFamily === 'Courier') return annotation.bold ? StandardFonts.CourierBold : StandardFonts.Courier;
    if (annotation.fontFamily === 'Times-Roman') return annotation.bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
    return annotation.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
}

async function drawAnnotations(pdf: PDFDocument, page: PDFPage, annotations: PdfAnnotation[]) {
    for (const annotation of annotations) {
        const shared = { opacity: annotation.opacity, rotate: degrees(annotation.rotation) };
        if (annotation.type === 'text') {
            const font = await pdf.embedFont(fontName(annotation));
            page.drawText(annotation.text, { x: annotation.x, y: annotation.y, size: annotation.fontSize, font, color: color(annotation.color), ...shared });
        } else if (annotation.type === 'highlight') {
            page.drawRectangle({ x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height, color: color(annotation.color), opacity: annotation.opacity });
        } else if (annotation.type === 'draw') {
            for (let point = 1; point < annotation.points.length; point += 1) {
                page.drawLine({ start: annotation.points[point - 1], end: annotation.points[point], color: color(annotation.color), thickness: annotation.strokeWidth, opacity: annotation.opacity });
            }
        } else if (annotation.type === 'rectangle') {
            page.drawRectangle({ x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height, borderColor: color(annotation.strokeColor), borderWidth: annotation.strokeWidth, color: color(annotation.fillColor), ...shared });
        } else if (annotation.type === 'ellipse') {
            page.drawEllipse({ x: annotation.x + annotation.width / 2, y: annotation.y + annotation.height / 2, xScale: annotation.width / 2, yScale: annotation.height / 2, borderColor: color(annotation.strokeColor), borderWidth: annotation.strokeWidth, color: color(annotation.fillColor), ...shared });
        } else if (annotation.type === 'line' || annotation.type === 'arrow') {
            page.drawLine({ start: { x: annotation.x, y: annotation.y }, end: { x: annotation.x + annotation.width, y: annotation.y + annotation.height }, color: color(annotation.strokeColor), thickness: annotation.strokeWidth, opacity: annotation.opacity });
        } else if (annotation.type === 'image' || annotation.type === 'signature') {
            const bytes = await fetch(annotation.source).then((response) => response.arrayBuffer());
            const isPng = annotation.type === 'image' ? annotation.mimeType === 'image/png' : annotation.source.startsWith('data:image/png');
            const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
            page.drawImage(image, { x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height, ...shared });
        }
    }
}

export async function createWorkingPdf({ pages, annotationsByPageId, getSourceFile, onProgress }: Omit<PdfExportInput, 'filename'>) {
    if (!pages.length) throw new Error('Add at least one page before exporting.');
    const output = await PDFDocument.create();
    const sourceDocuments = new Map<string, PDFDocument>();
    for (let index = 0; index < pages.length; index += 1) {
        const workingPage = pages[index];
        let page: PDFPage;
        if (workingPage.kind === 'blank') {
            page = output.addPage([workingPage.width, workingPage.height]);
        } else {
            if (!workingPage.sourceDocumentId || workingPage.sourcePageIndex === null) throw new Error('A source page is missing its document reference.');
            let source = sourceDocuments.get(workingPage.sourceDocumentId);
            if (!source) {
                const file = getSourceFile(workingPage.sourceDocumentId);
                if (!file) throw new Error('A source document is no longer available. Re-import the page and try again.');
                source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false, updateMetadata: false });
                sourceDocuments.set(workingPage.sourceDocumentId, source);
            }
            [page] = await output.copyPages(source, [workingPage.sourcePageIndex]);
            output.addPage(page);
        }
        const existingRotation = page.getRotation().angle;
        page.setRotation(degrees((existingRotation + workingPage.rotation) % 360));
        await drawAnnotations(output, page, annotationsByPageId[workingPage.id] ?? []);
        onProgress?.(Math.round(((index + 1) / pages.length) * 100));
    }
    return output.save();
}

export async function exportWorkingPdf(input: PdfExportInput) {
    const bytes = await createWorkingPdf(input);
    downloadPdf(bytes, input.filename);
}

export function editedFilename(filename: string) {
    return safePdfFilename(filename, 'edited');
}

import { PDFDocument, StandardFonts, degrees, rgb, type PDFPage } from 'pdf-lib';
import type { WorkingPage } from '../../organization/types/pages';
import type { PdfAnnotation } from '../types/annotations';
import { safePdfFilename } from '../../organization/utils/pageUtils';
import { downloadPdf } from '../../organization/utils/pdfDownload';
import type { HeaderFooterSettings, UtilitySettings } from '../../utilities/types/utilities';
import { cropBoxFromMargins, expandTemplate, formatPageNumber, isPageTargeted, metadataValue, positionFor } from '../../utilities/utils/utilityFormatters';

type PdfExportInput = {
    pages: WorkingPage[];
    annotationsByPageId: Record<string, PdfAnnotation[]>;
    getSourceFile: (sourceDocumentId: string) => File | null;
    filename: string;
    onProgress?: (percent: number) => void;
    utilities?: UtilitySettings;
    sourceFilename?: string;
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

function alignedX(page: PDFPage, text: string, size: number, alignment: 'left' | 'center' | 'right', margin: number) {
    const width = page.getWidth();
    const textWidth = text.length * size * .52;
    return alignment === 'left' ? margin : alignment === 'right' ? width - margin - textWidth : (width - textWidth) / 2;
}

function drawHeaderFooter(page: PDFPage, settings: HeaderFooterSettings, values: { page: number; pages: number; totalPages: number; filename: string; date: string }) {
    const rows: Array<[string, 'left' | 'center' | 'right', number]> = [
        [settings.headerLeft, 'left', page.getHeight() - settings.margin], [settings.headerCenter, 'center', page.getHeight() - settings.margin], [settings.headerRight, 'right', page.getHeight() - settings.margin],
        [settings.footerLeft, 'left', settings.margin], [settings.footerCenter, 'center', settings.margin], [settings.footerRight, 'right', settings.margin],
    ];
    for (const [template, alignment, y] of rows) {
        const text = expandTemplate(template, values);
        if (text) page.drawText(text, { x: alignedX(page, text, settings.fontSize, alignment, settings.margin), y, size: settings.fontSize, color: color(settings.color) });
    }
}

async function drawUtilities(pdf: PDFDocument, page: PDFPage, pageId: string, pageIndex: number, targetedPageIndex: number, pageCount: number, sourceFilename: string, utilities?: UtilitySettings) {
    if (!utilities) return;
    const pageNumber = pageIndex + 1;
    if (utilities.watermark.enabled && isPageTargeted(utilities.watermark.pageIds, pageId)) {
        const watermark = utilities.watermark;
        const point = positionFor(page.getWidth(), page.getHeight(), watermark.position, 36, { x: watermark.x, y: watermark.y });
        if (watermark.kind === 'image' && watermark.imageSource) {
            const bytes = await fetch(watermark.imageSource).then((response) => response.arrayBuffer());
            const image = watermark.imageSource.startsWith('data:image/png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
            const scale = Math.min(180 / image.width, 120 / image.height, 1);
            page.drawImage(image, { x: point.x - image.width * scale / 2, y: point.y - image.height * scale / 2, width: image.width * scale, height: image.height * scale, opacity: watermark.opacity, rotate: degrees(watermark.rotation) });
        } else if (watermark.text.trim()) {
            const text = watermark.text.slice(0, 160);
            const x = point.x - text.length * watermark.fontSize * .28;
            page.drawText(text, { x, y: point.y, size: watermark.fontSize, color: color(watermark.color), opacity: watermark.opacity, rotate: degrees(watermark.rotation) });
        }
    }
    if (utilities.pageNumbers.enabled && isPageTargeted(utilities.pageNumbers.pageIds, pageId)) {
        const settings = utilities.pageNumbers;
        const text = formatPageNumber(settings, pageIndex, targetedPageIndex);
        const alignment = settings.position.endsWith('left') ? 'left' : settings.position.endsWith('right') ? 'right' : 'center';
        const y = settings.position.startsWith('top') ? page.getHeight() - settings.margin : settings.margin;
        page.drawText(text, { x: alignedX(page, text, settings.fontSize, alignment, settings.margin), y, size: settings.fontSize, color: color(settings.color) });
    }
    if (utilities.headerFooter.enabled && isPageTargeted(utilities.headerFooter.pageIds, pageId)) {
        drawHeaderFooter(page, utilities.headerFooter, { page: pageNumber, pages: pageCount, totalPages: pageCount, filename: sourceFilename, date: new Date().toISOString().slice(0, 10) });
    }
    const crop = utilities.cropsByPageId[pageId];
    if (crop) {
        const box = cropBoxFromMargins(page.getWidth(), page.getHeight(), crop);
        page.setCropBox(box.x, box.y, box.width, box.height);
    }
}

function applyMetadata(pdf: PDFDocument, utilities?: UtilitySettings) {
    if (!utilities) return;
    const { metadata } = utilities;
    pdf.setTitle(metadataValue(metadata.title));
    pdf.setAuthor(metadataValue(metadata.author));
    pdf.setSubject(metadataValue(metadata.subject));
    pdf.setKeywords(metadata.keywords.split(',').map((keyword) => metadataValue(keyword.trim())).filter(Boolean).slice(0, 30));
    pdf.setCreator(metadataValue(metadata.creator));
    pdf.setProducer(metadataValue(metadata.producer));
}

export async function createWorkingPdf({ pages, annotationsByPageId, getSourceFile, onProgress, utilities, sourceFilename = 'document.pdf' }: Omit<PdfExportInput, 'filename'>) {
    if (!pages.length) throw new Error('Add at least one page before exporting.');
    const output = await PDFDocument.create();
    const sourceDocuments = new Map<string, PDFDocument>();
    let targetedPageIndex = 0;
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
        const isNumbered = Boolean(utilities?.pageNumbers.enabled && isPageTargeted(utilities.pageNumbers.pageIds, workingPage.id));
        await drawUtilities(output, page, workingPage.id, index, targetedPageIndex, pages.length, sourceFilename, utilities);
        if (isNumbered) targetedPageIndex += 1;
        await drawAnnotations(output, page, annotationsByPageId[workingPage.id] ?? []);
        onProgress?.(Math.round(((index + 1) / pages.length) * 100));
    }
    applyMetadata(output, utilities);
    return output.save();
}

export async function exportWorkingPdf(input: PdfExportInput) {
    const bytes = await createWorkingPdf(input);
    downloadPdf(bytes, input.filename);
}

export function editedFilename(filename: string) {
    return safePdfFilename(filename, 'edited');
}

import { configurePdfWorker } from '../pdf/workers/pdfWorker';
import { validatePdfFileSelection } from '../pdf/services/pdfValidationService';
import { validateImageFile } from '../../utils/imageFiles';

export type Progress = (current: number, total: number, label: string) => void;
export type CancelSignal = { cancelled: boolean };

export async function loadPdf(file: File) {
    validatePdfFileSelection(file);
    configurePdfWorker();
    const { getDocument } = await import('pdfjs-dist');
    const task = getDocument({ data: new Uint8Array(await file.arrayBuffer()), stopAtErrors: true });
    try {
        return await task.promise;
    } catch (error) {
        await task.destroy().catch(() => undefined);
        const message = error instanceof Error ? error.message : '';
        if (/password/i.test(message)) throw new Error('Password-protected PDFs are not supported. Remove the password and try again.');
        throw new Error('This PDF is corrupted, invalid, or cannot be read.');
    }
}

export async function releaseLoadedPdf(pdf: Awaited<ReturnType<typeof loadPdf>>) {
    await pdf.cleanup().catch(() => undefined);
    const destroy = (pdf as unknown as { destroy?: () => Promise<void> }).destroy;
    await destroy?.call(pdf).catch(() => undefined);
}

export async function renderPageToBlob(page: Awaited<ReturnType<Awaited<ReturnType<typeof loadPdf>>['getPage']>>, scale: number, quality: number) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    try {
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not encode this page.')), 'image/jpeg', quality));
        return { blob, width: viewport.width, height: viewport.height };
    } finally {
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
    }
}

async function normalizeImage(file: File, quality: number) {
    validateImageFile(file);
    let bitmap: ImageBitmap | null = null;
    const canvas = document.createElement('canvas');
    try {
        bitmap = await createImageBitmap(file);
        const width = bitmap.width;
        const height = bitmap.height;
        if (!width || !height) throw new Error('The image has invalid dimensions.');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas image conversion is unavailable in this browser.');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`Could not process ${file.name}.`)), 'image/jpeg', quality));
        return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
    } catch (error) {
        if (error instanceof Error && /limited|dimensions|Canvas/.test(error.message)) throw error;
        throw new Error(`${file.name} is corrupted or cannot be decoded as an image.`);
    } finally {
        bitmap?.close();
        canvas.width = 0;
        canvas.height = 0;
    }
}

export async function imagesToPdf(files: File[], options: { pageSize: 'a4' | 'letter' | 'fit'; orientation: 'portrait' | 'landscape'; margin: number; quality: number }, progress: Progress, signal: CancelSignal) {
    if (!files.length) throw new Error('Choose at least one image before converting.');
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.create();
    for (let index = 0; index < files.length; index += 1) {
        if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
        progress(index + 1, files.length, `Adding ${files[index].name}`);
        const image = await normalizeImage(files[index], options.quality);
        const embedded = await pdf.embedJpg(image.bytes);
        let size: [number, number] = options.pageSize === 'a4' ? [595.28, 841.89] : options.pageSize === 'letter' ? [612, 792] : [image.width, image.height];
        if (options.orientation === 'landscape' && size[1] > size[0]) size = [size[1], size[0]];
        if (options.orientation === 'portrait' && size[0] > size[1]) size = [size[1], size[0]];
        const page = pdf.addPage(size);
        const availableWidth = Math.max(1, size[0] - options.margin * 2);
        const availableHeight = Math.max(1, size[1] - options.margin * 2);
        const ratio = Math.min(availableWidth / image.width, availableHeight / image.height);
        const width = image.width * ratio;
        const height = image.height * ratio;
        page.drawImage(embedded, { x: (size[0] - width) / 2, y: (size[1] - height) / 2, width, height });
    }
    const bytes = await pdf.save();
    return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: 'application/pdf' });
}

export async function pdfToJpg(file: File, pages: number[], scale: number, quality: number, progress: Progress, signal: CancelSignal) {
    const pdf = await loadPdf(file);
    const output: { name: string; blob: Blob }[] = [];
    try {
        for (let index = 0; index < pages.length; index += 1) {
            if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
            progress(index + 1, pages.length, `Rendering page ${pages[index]}`);
            const page = await pdf.getPage(pages[index]);
            const { blob } = await renderPageToBlob(page, scale, quality);
            output.push({ name: `page-${String(pages[index]).padStart(3, '0')}.jpg`, blob });
        }
    } finally { await releaseLoadedPdf(pdf); }
    if (output.length === 1) return output[0].blob;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    output.forEach((item) => zip.file(item.name, item.blob));
    progress(output.length, output.length, 'Creating ZIP');
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export async function pdfToPpt(file: File, pages: number[], progress: Progress, signal: CancelSignal) {
    const pdf = await loadPdf(file);
    try {
        if (!pages.length) throw new Error('Select at least one page.');
        const PptxGenJS = (await import('pptxgenjs')).default;
        const pptx = new PptxGenJS();
        const first = await pdf.getPage(pages[0]);
        let wide: boolean;
        try {
            const view = first.getViewport({ scale: 1 });
            wide = view.width >= view.height;
        } finally {
            first.cleanup();
        }
        pptx.defineLayout({ name: 'PDF_PAGE', width: wide ? 13.333 : 7.5, height: wide ? 7.5 : 10 });
        pptx.layout = 'PDF_PAGE';
        for (let index = 0; index < pages.length; index += 1) {
            if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
            progress(index + 1, pages.length, `Creating slide ${index + 1}`);
            const page = await pdf.getPage(pages[index]);
            const { blob } = await renderPageToBlob(page, 2, .92);
            const data = await blobToDataUrl(blob);
            const slide = pptx.addSlide();
            slide.addImage({ data, x: 0, y: 0, w: wide ? 13.333 : 7.5, h: wide ? 7.5 : 10 });
        }
        const result = await pptx.write({ outputType: 'blob' });
        return result as Blob;
    } finally {
        await releaseLoadedPdf(pdf);
    }
}

function linesFromText(items: Array<{ str?: string; transform?: number[] }>) {
    const lines: { y: number; text: string }[] = [];
    items.forEach((item) => {
        const text = item.str?.trim();
        if (!text) return;
        const y = Math.round(item.transform?.[5] ?? 0);
        const line = lines.find((entry) => Math.abs(entry.y - y) <= 2);
        if (line) line.text += ` ${text}`;
        else lines.push({ y, text });
    });
    return lines.sort((a, b) => b.y - a.y).map((line) => line.text);
}

export async function pdfToWord(file: File, progress: Progress, signal: CancelSignal) {
    const pdf = await loadPdf(file);
    const { Document, Packer, Paragraph } = await import('docx');
    const children: InstanceType<typeof Paragraph>[] = [];
    try {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
            progress(pageNumber, pdf.numPages, `Extracting page ${pageNumber}`);
            const page = await pdf.getPage(pageNumber);
            try {
                const content = await page.getTextContent();
                linesFromText(content.items as Array<{ str?: string; transform?: number[] }>).forEach((text, index) => children.push(new Paragraph({ text, pageBreakBefore: pageNumber > 1 && index === 0 })));
            } finally {
                page.cleanup();
            }
        }
    } finally { await releaseLoadedPdf(pdf); }
    if (!children.length) throw new Error('No extractable text was found in this PDF.');
    const documentFile = new Document({ sections: [{ children }] });
    return Packer.toBlob(documentFile);
}

export async function docxToHtml(file: File) {
    if (/\.doc$/i.test(file.name)) throw new Error('Old .doc files are not supported. Save the document as .docx and try again.');
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const DOMPurify = (await import('dompurify')).default;
    const html = DOMPurify.sanitize(result.value, { USE_PROFILES: { html: true } });
    if (!html.replace(/<[^>]*>/g, '').trim() && !/<img/i.test(html)) throw new Error('This DOCX is empty or has no convertible content.');
    return { html, warnings: result.messages.map((message: { message: string }) => message.message) };
}

export async function htmlToPdf(element: HTMLElement, progress: Progress, signal: CancelSignal) {
    progress(1, 2, 'Rendering document preview');
    if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(element, { scale: 1.6, useCORS: true, backgroundColor: '#ffffff', logging: false });
    try {
        const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageHeight = canvas.height * pageWidth / canvas.width;
        const image = canvas.toDataURL('image/jpeg', .92);
        for (let y = 0, page = 0; y < imageHeight; y += pageHeight, page += 1) {
            if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
            if (page) pdf.addPage();
            pdf.addImage(image, 'JPEG', 0, -y, pageWidth, imageHeight);
        }
        progress(2, 2, 'Creating PDF');
        return pdf.output('blob');
    } finally {
        canvas.width = 0;
        canvas.height = 0;
    }
}

export function blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('The generated file could not be read.'));
        reader.onabort = () => reject(new DOMException('File reading was cancelled.', 'AbortError'));
        reader.readAsDataURL(blob);
    });
}

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

export type CompressionSettings = {
    dpi: number;
    imageScale: number;
    imageQuality: number;
    targetBytes: number | null;
};

export type CompressionAnalysis = {
    kind: 'image-heavy' | 'text-vector';
    sampledPages: number;
    imagePageRatio: number;
    averageTextCharacters: number;
};

export type CompressionProgress = { page: number; pageCount: number; attempt: number; maxAttempts: number };
export type CompressionOutput = {
    blob: Blob;
    settings: CompressionSettings;
    attempts: number;
    strategy: 'scanned-raster' | 'preserve-original';
};

const abortError = () => new DOMException('Compression cancelled.', 'AbortError');
const assertActive = (signal: AbortSignal) => { if (signal.aborted) throw abortError(); };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function imageDimensions(operations: { paintInlineImageXObject: number; paintImageXObject: number; paintImageMaskXObject: number }, operation: number, args: unknown[]) {
    if (operation === operations.paintInlineImageXObject) {
        const image = args[0] as { width?: number; height?: number } | undefined;
        return [image?.width ?? 0, image?.height ?? 0] as const;
    }
    if (operation === operations.paintImageXObject || operation === operations.paintImageMaskXObject) {
        return [Number(args[1]) || 0, Number(args[2]) || 0] as const;
    }
    return [0, 0] as const;
}

export async function analyzePdfForCompression(document: PDFDocumentProxy, signal: AbortSignal): Promise<CompressionAnalysis> {
    const { OPS } = await import('pdfjs-dist');
    const sampleCount = Math.min(document.numPages, 8);
    const pageNumbers = Array.from({ length: sampleCount }, (_, index) => Math.max(1, Math.round(1 + index * (document.numPages - 1) / Math.max(1, sampleCount - 1))));
    let imagePages = 0;
    let textCharacters = 0;
    for (const pageNumber of pageNumbers) {
        assertActive(signal);
        const page = await document.getPage(pageNumber);
        const [text, operators] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
        textCharacters += text.items.reduce((total, item) => total + ('str' in item ? item.str.length : 0), 0);
        const hasLargeRaster = operators.fnArray.some((operation, index) => {
            const [width, height] = imageDimensions(OPS, operation, operators.argsArray[index] as unknown[]);
            return width * height >= 250_000;
        });
        if (hasLargeRaster) imagePages += 1;
        page.cleanup();
    }
    const imagePageRatio = imagePages / sampleCount;
    const averageTextCharacters = textCharacters / sampleCount;
    return {
        kind: imagePageRatio >= .6 && averageTextCharacters < 80 ? 'image-heavy' : 'text-vector',
        sampledPages: sampleCount,
        imagePageRatio,
        averageTextCharacters,
    };
}

async function canvasJpeg(canvas: HTMLCanvasElement, quality: number, signal: AbortSignal) {
    assertActive(signal);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('The browser could not encode a compressed page.')), 'image/jpeg', quality));
    assertActive(signal);
    return blob;
}

async function renderPage(page: PDFPageProxy, settings: CompressionSettings, signal: AbortSignal) {
    const baseScale = settings.dpi / 72;
    const renderScale = baseScale * settings.imageScale / 100;
    const initialViewport = page.getViewport({ scale: renderScale });
    const maxPixels = 24_000_000;
    const pixelLimiter = Math.min(1, Math.sqrt(maxPixels / Math.max(1, initialViewport.width * initialViewport.height)));
    const viewport = pixelLimiter < 1 ? page.getViewport({ scale: renderScale * pixelLimiter }) : initialViewport;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    try {
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('The browser could not create a compression canvas.');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        const task = page.render({ canvas, canvasContext: context, viewport });
        const cancel = () => task.cancel();
        signal.addEventListener('abort', cancel, { once: true });
        try {
            await task.promise;
        } catch (error) {
            if (signal.aborted) throw abortError();
            throw error;
        } finally {
            signal.removeEventListener('abort', cancel);
        }
        return await canvasJpeg(canvas, settings.imageQuality / 100, signal);
    } finally {
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
    }
}

async function createScannedPdf(document: PDFDocumentProxy, settings: CompressionSettings, signal: AbortSignal, attempt: number, maxAttempts: number, onProgress: (progress: CompressionProgress) => void) {
    const output = await PDFDocument.create();
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        assertActive(signal);
        onProgress({ page: pageNumber, pageCount: document.numPages, attempt, maxAttempts });
        const sourcePage = await document.getPage(pageNumber);
        const sourceViewport = sourcePage.getViewport({ scale: 1 });
        const jpegBlob = await renderPage(sourcePage, settings, signal);
        const jpeg = await output.embedJpg(await jpegBlob.arrayBuffer());
        assertActive(signal);
        const targetPage = output.addPage([sourceViewport.width, sourceViewport.height]);
        targetPage.drawImage(jpeg, { x: 0, y: 0, width: sourceViewport.width, height: sourceViewport.height });
    }
    const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
    assertActive(signal);
    return new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
}

function nextTargetSettings(current: CompressionSettings, actualBytes: number, targetBytes: number) {
    const ratio = clamp(Math.sqrt(targetBytes / actualBytes), .55, .94);
    const nextQuality = clamp(Math.round(current.imageQuality * ratio), 40, 100);
    if (nextQuality < current.imageQuality) return { ...current, imageQuality: nextQuality };
    return { ...current, dpi: clamp(Math.round(current.dpi * .85), 72, 300), imageScale: clamp(current.imageScale - 25, 25, 100) };
}

export async function compressPdf(options: {
    file: File;
    document: PDFDocumentProxy;
    analysis: CompressionAnalysis;
    settings: CompressionSettings;
    signal: AbortSignal;
    onProgress: (progress: CompressionProgress) => void;
}): Promise<CompressionOutput> {
    const { file, document, analysis, signal, onProgress } = options;
    assertActive(signal);
    if (analysis.kind !== 'image-heavy') {
        onProgress({ page: document.numPages, pageCount: document.numPages, attempt: 1, maxAttempts: 1 });
        return { blob: file.slice(0, file.size, 'application/pdf'), settings: options.settings, attempts: 1, strategy: 'preserve-original' };
    }

    const maxAttempts = options.settings.targetBytes ? 4 : 1;
    let settings = { ...options.settings };
    let best: Blob | null = null;
    let bestSettings = settings;
    let attempts = 0;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        assertActive(signal);
        attempts = attempt;
        const candidate = await createScannedPdf(document, settings, signal, attempt, maxAttempts, onProgress);
        if (!best || Math.abs(candidate.size - (options.settings.targetBytes ?? candidate.size)) < Math.abs(best.size - (options.settings.targetBytes ?? best.size))) {
            best = candidate;
            bestSettings = settings;
        }
        const target = options.settings.targetBytes;
        if (!target || candidate.size <= target * 1.08 || settings.imageQuality <= 40 && settings.dpi <= 72 && settings.imageScale <= 50) break;
        settings = nextTargetSettings(settings, candidate.size, target);
    }
    if (!best) throw new Error('Compression did not produce an output file.');
    return { blob: best, settings: bestSettings, attempts, strategy: 'scanned-raster' };
}

export type ImageOutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
export type ImageResizeSettings = { quality: number; width: number; height: number; format: ImageOutputFormat; targetBytes: number | null };
export type ImageResizeOutput = { blob: Blob; width: number; height: number; mimeType: string; quality: number; attempts: number };

const abortError = () => new DOMException('Image compression cancelled.', 'AbortError');
const active = (signal: AbortSignal) => { if (signal.aborted) throw abortError(); };
const canvasBlob = (canvas: HTMLCanvasElement, mimeType: string, quality: number) => new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The browser could not encode this image.')), mimeType, quality));

export async function createImagePreview(bitmap: ImageBitmap) {
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    try {
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser cannot create an image preview.');
        context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return await canvasBlob(canvas, 'image/webp', .84);
    } finally { canvas.width = 0; canvas.height = 0; }
}

export async function createOutputPreview(blob: Blob) {
    const bitmap = await createImageBitmap(blob);
    try { return await createImagePreview(bitmap); }
    finally { bitmap.close(); }
}

export async function decodeImage(file: File) {
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        if (!bitmap.width || !bitmap.height) { bitmap.close(); throw new Error('The image has invalid dimensions.'); }
        if (bitmap.width * bitmap.height > 45_000_000) { bitmap.close(); throw new Error('This image is too large for your device to process safely. Try a smaller image or desktop browser.'); }
        return bitmap;
    } catch (error) {
        if (error instanceof Error && error.message.includes('too large')) throw error;
        throw new Error('This image is corrupted or its format is not supported by this browser.');
    }
}

function resolveMime(format: ImageOutputFormat, originalMime: string) {
    return format === 'original' ? originalMime : format;
}

async function encode(bitmap: ImageBitmap, settings: ImageResizeSettings, originalMime: string, quality: number, signal: AbortSignal) {
    active(signal);
    if (settings.width * settings.height > 32_000_000) throw new Error('The requested output dimensions require too much memory. Choose smaller dimensions.');
    const mimeType = resolveMime(settings.format, originalMime);
    const canvas = document.createElement('canvas');
    canvas.width = settings.width; canvas.height = settings.height;
    try {
        const context = canvas.getContext('2d', { alpha: mimeType !== 'image/jpeg' });
        if (!context) throw new Error('This browser cannot create an image-processing canvas.');
        if (mimeType === 'image/jpeg') { context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); }
        context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await canvasBlob(canvas, mimeType, quality / 100);
        active(signal);
        return { blob, mimeType };
    } finally { canvas.width = 0; canvas.height = 0; }
}

export async function resizeImage(bitmap: ImageBitmap, originalMime: string, settings: ImageResizeSettings, signal: AbortSignal): Promise<ImageResizeOutput> {
    const mimeType = resolveMime(settings.format, originalMime);
    if (settings.targetBytes && mimeType === 'image/png') throw new Error('Target Size is available for JPEG and WebP output. PNG uses lossless encoding.');
    const maxAttempts = settings.targetBytes ? 5 : 1;
    let quality = settings.quality;
    let best: Awaited<ReturnType<typeof encode>> | null = null;
    let bestQuality = quality;
    let attempts = 0;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        active(signal); attempts = attempt;
        const candidate = await encode(bitmap, settings, originalMime, quality, signal);
        if (!best || !settings.targetBytes || Math.abs(candidate.blob.size - settings.targetBytes) < Math.abs(best.blob.size - settings.targetBytes)) { best = candidate; bestQuality = quality; }
        if (!settings.targetBytes || candidate.blob.size <= settings.targetBytes * 1.08 || quality <= 40) break;
        quality = Math.max(40, Math.round(quality * Math.max(.58, Math.min(.92, Math.sqrt(settings.targetBytes / candidate.blob.size)))));
    }
    if (!best) throw new Error('Image compression did not produce an output.');
    return { blob: best.blob, width: settings.width, height: settings.height, mimeType: best.mimeType, quality: bestQuality, attempts };
}

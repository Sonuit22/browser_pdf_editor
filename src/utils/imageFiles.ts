export const MAX_IMAGE_FILE_SIZE = 25 * 1024 * 1024;

const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const supportedExtension = /\.(jpe?g|png|webp)$/i;

export type BrowserImage = {
    data: string;
    mimeType: 'image/png' | 'image/jpeg';
    width: number;
    height: number;
};

export function validateImageFile(file: File) {
    if (!file || file.size === 0) throw new Error('Choose a non-empty JPG, JPEG, PNG, or WebP image.');
    if (file.size > MAX_IMAGE_FILE_SIZE) {
        throw new Error(`Images are limited to ${Math.round(MAX_IMAGE_FILE_SIZE / 1024 / 1024)} MB each.`);
    }
    const hasSupportedType = !file.type || supportedMimeTypes.has(file.type.toLowerCase());
    if (!hasSupportedType || !supportedExtension.test(file.name)) {
        throw new Error('Choose a JPG, JPEG, PNG, or WebP image.');
    }
}

function readAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('The image could not be read.'));
        reader.onabort = () => reject(new DOMException('Image reading was cancelled.', 'AbortError'));
        reader.readAsDataURL(file);
    });
}

function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('The image is corrupted or cannot be decoded.'));
        image.src = source;
    });
}

export async function readBrowserImage(file: File): Promise<BrowserImage> {
    validateImageFile(file);
    const data = await readAsDataUrl(file);
    const image = await loadImage(data);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) throw new Error('The image has invalid dimensions.');

    if (file.type !== 'image/webp' && !file.name.toLowerCase().endsWith('.webp')) {
        return { data, mimeType: file.type === 'image/png' || file.name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg', width, height };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    try {
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas image conversion is unavailable in this browser.');
        context.drawImage(image, 0, 0);
        return { data: canvas.toDataURL('image/png'), mimeType: 'image/png', width, height };
    } finally {
        canvas.width = 0;
        canvas.height = 0;
    }
}

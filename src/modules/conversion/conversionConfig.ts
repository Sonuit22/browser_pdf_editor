export const conversionLimits = {
    desktop: { images: 100, pdfPages: 100, docxBytes: 25 * 1024 * 1024, pptxBytes: 30 * 1024 * 1024 },
    mobile: { images: 30, pdfPages: 30, docxBytes: 10 * 1024 * 1024, pptxBytes: 10 * 1024 * 1024 },
} as const;

export function isMobileDevice() {
    return typeof window !== 'undefined' && (window.matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 1);
}

export function activeConversionLimits() {
    return isMobileDevice() ? conversionLimits.mobile : conversionLimits.desktop;
}

export const conversionAccept: Record<string, string> = {
    'jpg-to-pdf': '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
    'pdf-to-jpg': '.pdf,application/pdf',
    'pdf-to-ppt': '.pdf,application/pdf',
    'pdf-to-word': '.pdf,application/pdf',
    'word-to-pdf': '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt-to-pdf': '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

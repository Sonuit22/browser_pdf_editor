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

export type ConversionToolKey = 'jpg-to-pdf' | 'pdf-to-jpg' | 'pdf-to-ppt' | 'pdf-to-word' | 'word-to-pdf';

export const conversionAccept: Record<ConversionToolKey, string> = {
    'jpg-to-pdf': '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
    'pdf-to-jpg': '.pdf,application/pdf',
    'pdf-to-ppt': '.pdf,application/pdf',
    'pdf-to-word': '.pdf,application/pdf',
    'word-to-pdf': '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function sourceBaseName(name: string) {
    const withoutExtension = name.replace(/\.[^.]+$/, '');
    return (withoutExtension || 'document').replace(/[<>:"/\\|?*]+/g, '-').slice(0, 120);
}

export function conversionOutputFilename(tool: ConversionToolKey, files: File[], selectedPages: number[] = []) {
    const base = sourceBaseName(files[0]?.name ?? 'document');
    if (tool === 'jpg-to-pdf') return files.length > 1 ? `${base}-and-${files.length - 1}-more.pdf` : `${base}.pdf`;
    if (tool === 'pdf-to-jpg') return selectedPages.length === 1
        ? `${base}-page-${String(selectedPages[0]).padStart(3, '0')}.jpg`
        : `${base}-pages.zip`;
    if (tool === 'pdf-to-ppt') return `${base}.pptx`;
    if (tool === 'pdf-to-word') return `${base}.docx`;
    return `${base}.pdf`;
}

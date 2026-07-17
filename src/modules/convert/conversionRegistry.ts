import { FileImage, FileText, FileType2, Images, type LucideIcon } from 'lucide-react';

export type ConversionTab = 'pdf-to-other' | 'other-to-pdf' | 'image-conversion';
export type ConversionStatus = 'available' | 'experimental' | 'coming-later';
export type ConversionTool = { id: string; title: string; description: string; icon: LucideIcon; aliases: string[]; category: ConversionTab; status: ConversionStatus; browserOnly: true; route: string; supportedFormats: string[] };

const createTool = (id: string, title: string, description: string, category: ConversionTab, status: ConversionStatus, aliases: string[], supportedFormats: string[], icon: LucideIcon = FileType2): ConversionTool => ({ id, title, description, icon, aliases, category, status, browserOnly: true, route: `/convert/${id}`, supportedFormats });

export const conversionTabs: Array<{ id: ConversionTab; label: string }> = [{ id: 'pdf-to-other', label: 'PDF to Other' }, { id: 'other-to-pdf', label: 'Other to PDF' }, { id: 'image-conversion', label: 'Image Conversion' }];

export const conversionTools: ConversionTool[] = [
    createTool('pdf-to-jpg', 'PDF to JPG', 'Export PDF pages as JPG images.', 'pdf-to-other', 'coming-later', ['pdf jpg', 'image', 'images'], ['PDF', 'JPG'], Images),
    createTool('pdf-to-png', 'PDF to PNG', 'Export PDF pages as PNG images.', 'pdf-to-other', 'coming-later', ['pdf png', 'image', 'images'], ['PDF', 'PNG'], Images),
    createTool('pdf-to-images', 'PDF to Images', 'Export selected PDF pages as images.', 'pdf-to-other', 'coming-later', ['pdf image', 'pages', 'jpg', 'png'], ['PDF', 'JPG', 'PNG'], Images),
    createTool('pdf-to-text', 'PDF to Text', 'Extract selectable text from a PDF.', 'pdf-to-other', 'coming-later', ['pdf text', 'txt'], ['PDF', 'TXT'], FileText),
    createTool('pdf-to-html', 'PDF to HTML', 'Experimental layout extraction from PDFs.', 'pdf-to-other', 'experimental', ['pdf html'], ['PDF', 'HTML'], FileText),
    createTool('pdf-to-svg', 'PDF to SVG', 'Vector page export is not yet reliable.', 'pdf-to-other', 'coming-later', ['pdf svg'], ['PDF', 'SVG'], FileImage),
    createTool('jpg-to-pdf', 'JPG to PDF', 'Create a PDF from JPG images.', 'other-to-pdf', 'coming-later', ['jpg jpeg image'], ['JPG', 'PDF'], FileImage),
    createTool('png-to-pdf', 'PNG to PDF', 'Create a PDF from PNG images.', 'other-to-pdf', 'coming-later', ['png image'], ['PNG', 'PDF'], FileImage),
    createTool('webp-to-pdf', 'WebP to PDF', 'Create a PDF from WebP images.', 'other-to-pdf', 'coming-later', ['webp image'], ['WebP', 'PDF'], FileImage),
    createTool('svg-to-pdf', 'SVG to PDF', 'Create a PDF from SVG artwork.', 'other-to-pdf', 'coming-later', ['svg image'], ['SVG', 'PDF'], FileImage),
    createTool('bmp-to-pdf', 'BMP to PDF', 'Create a PDF from BMP images.', 'other-to-pdf', 'coming-later', ['bmp image'], ['BMP', 'PDF'], FileImage),
    createTool('images-to-pdf', 'Multiple Images to PDF', 'Combine ordered images into one PDF.', 'other-to-pdf', 'coming-later', ['image images jpg png webp'], ['Images', 'PDF'], Images),
    createTool('text-to-pdf', 'Text to PDF', 'Turn plain text into a formatted PDF.', 'other-to-pdf', 'coming-later', ['text txt'], ['TXT', 'PDF'], FileText),
    createTool('html-to-pdf', 'HTML to PDF', 'Print basic HTML as a PDF.', 'other-to-pdf', 'coming-later', ['html'], ['HTML', 'PDF'], FileText),
    createTool('jpg-png-webp', 'JPG, PNG, and WebP', 'Convert between browser-supported image formats.', 'image-conversion', 'coming-later', ['jpg png webp image'], ['JPG', 'PNG', 'WebP'], FileImage),
    createTool('bmp-image', 'BMP to JPG or PNG', 'Convert BMP images to common web formats.', 'image-conversion', 'coming-later', ['bmp jpg png image'], ['BMP', 'JPG', 'PNG'], FileImage),
    createTool('tiff-image', 'TIFF to JPG or PNG', 'Requires a browser-safe TIFF decoder.', 'image-conversion', 'coming-later', ['tiff tif jpg png image'], ['TIFF', 'JPG', 'PNG'], FileImage),
];

export const officeConversions = ['PDF to Word', 'PDF to Excel', 'PDF to PowerPoint', 'Word to PDF', 'Excel to PDF', 'PowerPoint to PDF'];
export function findConversions(query: string, tab: ConversionTab) { const normalized = query.trim().toLowerCase(); return conversionTools.filter((tool) => (!normalized || [tool.title, tool.description, ...tool.aliases].join(' ').toLowerCase().includes(normalized)) && (normalized || tool.category === tab)); }

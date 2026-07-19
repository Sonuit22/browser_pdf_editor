import {
    Archive, FileImage, FilePenLine, FileText, Files, Images, LockKeyhole,
    Presentation, Scissors, Signature, Trash2, type LucideIcon,
} from 'lucide-react';

export type ToolCategory = 'PDF management' | 'PDF conversion' | 'PDF editing and security';
export type ToolStatus = 'available' | 'basic' | 'beta' | 'coming-soon';
export type ToolSurface = 'pdf-workspace' | 'conversion-workspace' | 'tool-info';
export type ToolDefinition = {
    id: string; title: string; category: ToolCategory; aliases: string[];
    icon: LucideIcon; route: string; surface: ToolSurface; browserOnly: true; implemented: boolean; enabled: boolean;
    description: string; status: ToolStatus; badge?: 'Basic' | 'Beta' | 'Coming Soon'; limitations: readonly string[];
};

const tool = (id: string, title: string, description: string, category: ToolCategory, aliases: string[], icon: LucideIcon, route: string, surface: ToolSurface, status: ToolStatus = 'available', limitations: readonly string[] = []): ToolDefinition => ({
    id, title, description, category, aliases, icon, route, surface, status, limitations, browserOnly: true,
    implemented: status !== 'coming-soon', enabled: status !== 'coming-soon',
    badge: status === 'basic' ? 'Basic' : status === 'beta' ? 'Beta' : status === 'coming-soon' ? 'Coming Soon' : undefined,
});

export const toolRegistry: ToolDefinition[] = [
    tool('merge', 'Merge PDF', 'Combine multiple PDF files into one document.', 'PDF management', ['combine'], Files, '/merge', 'pdf-workspace'),
    tool('split', 'Split PDF', 'Separate a PDF using page ranges or selected pages.', 'PDF management', ['separate'], Scissors, '/split', 'pdf-workspace'),
    tool('remove-pages', 'Remove Pages from PDF', 'Delete unwanted pages from a PDF.', 'PDF management', ['remove pages delete pages'], Trash2, '/remove-pages', 'pdf-workspace'),
    tool('extract-pages', 'Extract Pages', 'Create a new PDF from selected pages.', 'PDF management', ['copy pages'], Archive, '/extract-pages', 'pdf-workspace'),
    tool('organize', 'Organize PDF', 'Reorder, rotate, duplicate, or remove PDF pages.', 'PDF management', ['reorder rotate delete'], Files, '/organize', 'pdf-workspace'),
    tool('compress', 'Compress PDF', 'Reduce PDF file size using selectable compression levels.', 'PDF management', ['reduce size'], Archive, '/compress', 'tool-info', 'coming-soon', ['Reliable local PDF compression is not yet implemented.']),
    tool('jpg-pdf', 'JPG to PDF', 'Convert one or more JPG images into a PDF.', 'PDF conversion', ['jpeg image png webp'], Images, '/jpg-to-pdf', 'conversion-workspace'),
    tool('word-pdf', 'Word to PDF', 'Convert DOCX content into a PDF with basic formatting.', 'PDF conversion', ['docx'], FileText, '/word-to-pdf', 'conversion-workspace', 'basic', ['Complex layouts, custom fonts, headers, footers, floating elements, and exact pagination may change.']),
    tool('ppt-pdf', 'PPT to PDF', 'Convert PPTX slides into PDF pages.', 'PDF conversion', ['powerpoint slides'], Presentation, '/ppt-to-pdf', 'tool-info', 'coming-soon', ['Reliable browser-only PPTX reconstruction is not yet implemented.']),
    tool('pdf-jpg', 'PDF to JPG', 'Export selected PDF pages as JPG images.', 'PDF conversion', ['jpeg image zip'], FileImage, '/pdf-to-jpg', 'conversion-workspace'),
    tool('pdf-word', 'PDF to Word', 'Extract editable text from a PDF into a DOCX file.', 'PDF conversion', ['docx editable text'], FileText, '/pdf-to-word', 'conversion-workspace', 'basic', ['Complex formatting, tables, columns, and images may not be preserved.']),
    tool('pdf-ppt', 'PDF to PPT', 'Place each PDF page as an image on a PowerPoint slide.', 'PDF conversion', ['powerpoint slides pptx'], Presentation, '/pdf-to-ppt', 'conversion-workspace', 'basic', ['Slides contain page images; text and page elements are not individually editable.']),
    tool('protect', 'Protect PDF', 'Add password protection where browser support permits.', 'PDF editing and security', ['password secure'], LockKeyhole, '/protect-pdf', 'tool-info', 'coming-soon', ['Password encryption is not available in the current browser engine.']),
    tool('sign', 'Sign PDF', 'Add drawn, typed, or uploaded signatures to a PDF.', 'PDF editing and security', ['signature initials date checkmark'], Signature, '/sign-pdf', 'pdf-workspace'),
    tool('edit', 'Edit PDF', 'Add text, images, shapes, drawings, and highlights.', 'PDF editing and security', ['text image draw shape highlight'], FilePenLine, '/edit', 'pdf-workspace'),
];

export function filterTools(category: ToolCategory | 'All', query: string) {
    const value = query.trim().toLowerCase();
    return toolRegistry.filter((item) => (category === 'All' || item.category === category) && (!value || [item.title, ...item.aliases].join(' ').toLowerCase().includes(value)));
}

export function findToolByRoute(route: string) {
    return toolRegistry.find((item) => item.route === route);
}

export const toolRoutesBySurface: Record<ToolSurface, string[]> = {
    'pdf-workspace': toolRegistry.filter((item) => item.surface === 'pdf-workspace').map((item) => item.route),
    'conversion-workspace': toolRegistry.filter((item) => item.surface === 'conversion-workspace').map((item) => item.route),
    'tool-info': toolRegistry.filter((item) => item.surface === 'tool-info').map((item) => item.route),
};

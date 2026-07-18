import {
    Archive, FileImage, FilePenLine, FileText, Files, Images, LockKeyhole,
    Presentation, Scissors, Signature, Trash2, type LucideIcon,
} from 'lucide-react';

export type ToolCategory = 'Edit' | 'Organize' | 'Convert' | 'Forms & Sign' | 'Security';
export type ToolStatus = 'available' | 'basic' | 'beta' | 'coming-soon';
export type ToolCard = {
    id: string; title: string; category: ToolCategory; aliases: string[];
    icon: LucideIcon; route: string; browserOnly: true; implemented: boolean; enabled: boolean;
    description: string; status: ToolStatus; badge?: 'Basic' | 'Beta' | 'Coming Soon'; limitation?: string;
};

const tool = (id: string, title: string, description: string, category: ToolCategory, aliases: string[], icon: LucideIcon, route: string, status: ToolStatus = 'available', limitation?: string): ToolCard => ({
    id, title, description, category, aliases, icon, route, status, limitation, browserOnly: true,
    implemented: status !== 'coming-soon', enabled: status !== 'coming-soon',
    badge: status === 'basic' ? 'Basic' : status === 'beta' ? 'Beta' : status === 'coming-soon' ? 'Coming Soon' : undefined,
});

export const toolRegistry: ToolCard[] = [
    tool('merge', 'Merge PDF', 'Combine multiple PDFs and rearrange pages.', 'Organize', ['combine'], Files, '/merge'),
    tool('split', 'Split PDF', 'Split a PDF by range or selected pages.', 'Organize', ['separate'], Scissors, '/split'),
    tool('remove-pages', 'Remove Pages', 'Delete unwanted pages from your PDF.', 'Organize', ['delete pages'], Trash2, '/remove-pages'),
    tool('extract-pages', 'Extract Pages', 'Create a new PDF from selected pages.', 'Organize', ['copy pages'], Archive, '/extract-pages'),
    tool('organize', 'Organize PDF', 'Reorder, rotate, duplicate, or delete pages.', 'Organize', ['reorder rotate delete'], Files, '/organize'),
    tool('compress', 'Compress PDF', 'Reduce PDF file size with quality controls.', 'Convert', ['reduce size'], Archive, '/compress', 'coming-soon', 'Reliable local PDF compression is still under development.'),
    tool('jpg-pdf', 'JPG to PDF', 'Convert and combine images into one PDF.', 'Convert', ['jpeg image png webp'], Images, '/jpg-to-pdf'),
    tool('word-pdf', 'Word to PDF', 'Convert basic DOCX content into PDF.', 'Convert', ['docx'], FileText, '/word-to-pdf', 'basic', 'Complex layouts, headers, fonts, and pagination may change.'),
    tool('ppt-pdf', 'PPT to PDF', 'Convert basic PPTX slides into PDF pages.', 'Convert', ['powerpoint slides'], Presentation, '/ppt-to-pdf', 'coming-soon', 'Animations, charts, SmartArt, videos, and complex layouts may not be preserved.'),
    tool('pdf-jpg', 'PDF to JPG', 'Convert selected PDF pages into JPG images.', 'Convert', ['jpeg image zip'], FileImage, '/pdf-to-jpg'),
    tool('pdf-word', 'PDF to Word', 'Extract editable text from PDF into DOCX.', 'Convert', ['docx editable text'], FileText, '/pdf-to-word', 'basic', 'Complex formatting, tables, columns, and images may not be preserved.'),
    tool('pdf-ppt', 'PDF to PPT', 'Place each PDF page onto a PowerPoint slide.', 'Convert', ['powerpoint slides pptx'], Presentation, '/pdf-to-ppt', 'basic', 'Each page is inserted as an image and is not fully editable.'),
    tool('protect', 'Protect PDF', 'Add password protection to your PDF.', 'Security', ['password secure'], LockKeyhole, '/protect-pdf', 'coming-soon', 'Password encryption is not yet available in the local browser engine.'),
    tool('sign', 'Sign PDF', 'Add signatures, initials, dates, and marks.', 'Forms & Sign', ['signature'], Signature, '/sign-pdf'),
    tool('edit', 'Edit PDF', 'Add text, images, drawings, shapes, and highlights.', 'Edit', ['text image draw shape highlight'], FilePenLine, '/edit'),
];

export function filterTools(category: ToolCategory | 'All', query: string) {
    const value = query.trim().toLowerCase();
    return toolRegistry.filter((item) => (category === 'All' || item.category === category) && (!value || [item.title, ...item.aliases].join(' ').toLowerCase().includes(value)));
}

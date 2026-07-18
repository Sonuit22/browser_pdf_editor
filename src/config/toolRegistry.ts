import {
    Archive, FileImage, FilePenLine, FileText, Files, Images, LockKeyhole,
    Presentation, Scissors, Signature, Trash2, type LucideIcon,
} from 'lucide-react';

export type ToolCategory = 'Edit' | 'Organize' | 'Convert' | 'Forms & Sign' | 'Security';
export type ToolCard = {
    id: string; title: string; category: ToolCategory; aliases: string[];
    icon: LucideIcon; route: string; browserOnly: true; implemented: boolean;
    limitation?: string;
};

const tool = (id: string, title: string, category: ToolCategory, aliases: string[], icon: LucideIcon, route: string, implemented = true, limitation?: string): ToolCard =>
    ({ id, title, category, aliases, icon, route, browserOnly: true, implemented, limitation });

export const toolRegistry: ToolCard[] = [
    tool('merge', 'Merge PDF', 'Organize', ['combine'], Files, '/merge'),
    tool('split', 'Split PDF', 'Organize', ['separate'], Scissors, '/split'),
    tool('remove-pages', 'Remove Pages', 'Organize', ['delete pages'], Trash2, '/remove-pages'),
    tool('extract-pages', 'Extract Pages', 'Organize', ['copy pages'], Archive, '/extract-pages'),
    tool('organize', 'Organize PDF', 'Organize', ['reorder rotate delete'], Files, '/organize'),
    tool('compress', 'Compress PDF', 'Convert', ['reduce size'], Archive, '/compress', false, 'Compression results vary by document. This browser edition does not claim a target output size.'),
    tool('jpg-pdf', 'JPG to PDF', 'Convert', ['jpeg image png webp'], Images, '/jpg-to-pdf'),
    tool('word-pdf', 'Word to PDF', 'Convert', ['docx'], FileText, '/word-to-pdf'),
    tool('ppt-pdf', 'PPT to PDF', 'Convert', ['powerpoint slides'], Presentation, '/ppt-to-pdf', false, 'Complex PowerPoint formatting cannot currently be reproduced reliably in this browser-only edition.'),
    tool('pdf-jpg', 'PDF to JPG', 'Convert', ['jpeg image zip'], FileImage, '/pdf-to-jpg'),
    tool('pdf-word', 'PDF to Word', 'Convert', ['docx editable text'], FileText, '/pdf-to-word'),
    tool('pdf-ppt', 'PDF to PPT', 'Convert', ['powerpoint slides pptx'], Presentation, '/pdf-to-ppt'),
    tool('protect', 'Protect PDF', 'Security', ['password secure'], LockKeyhole, '/protect-pdf', false, 'Password encryption is not yet available in the local browser engine.'),
    tool('sign', 'Sign PDF', 'Forms & Sign', ['signature'], Signature, '/sign-pdf'),
    tool('edit', 'Edit PDF', 'Edit', ['text image draw shape highlight'], FilePenLine, '/edit'),
];

export function filterTools(category: ToolCategory | 'All', query: string) {
    const value = query.trim().toLowerCase();
    return toolRegistry.filter((item) => (category === 'All' || item.category === category) && (!value || [item.title, ...item.aliases].join(' ').toLowerCase().includes(value)));
}

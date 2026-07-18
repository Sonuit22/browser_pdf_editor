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
    tool('jpg-pdf', 'JPG to PDF', 'Convert', ['jpeg image'], Images, '/jpg-to-pdf', false, 'Image conversion is being prepared for a reliable local-only release.'),
    tool('word-pdf', 'Word to PDF', 'Convert', ['doc docx'], FileText, '/word-to-pdf', false, 'Complex Word formatting cannot currently be reproduced reliably in this browser-only edition.'),
    tool('ppt-pdf', 'PPT to PDF', 'Convert', ['powerpoint slides'], Presentation, '/ppt-to-pdf', false, 'Complex PowerPoint formatting cannot currently be reproduced reliably in this browser-only edition.'),
    tool('pdf-jpg', 'PDF to JPG', 'Convert', ['jpeg image'], FileImage, '/pdf-to-jpg', false, 'Page image export is not yet available in this browser-only edition.'),
    tool('pdf-word', 'PDF to Word', 'Convert', ['doc docx'], FileText, '/pdf-to-word', false, 'Complex PDF layouts cannot currently be converted to editable Word documents reliably.'),
    tool('pdf-ppt', 'PDF to PPT', 'Convert', ['powerpoint slides'], Presentation, '/pdf-to-ppt', false, 'Complex PDF layouts cannot currently be converted to editable slides reliably.'),
    tool('protect', 'Protect PDF', 'Security', ['password secure'], LockKeyhole, '/protect-pdf', false, 'Password encryption is not yet available in the local browser engine.'),
    tool('sign', 'Sign PDF', 'Forms & Sign', ['signature'], Signature, '/sign-pdf'),
    tool('edit', 'Edit PDF', 'Edit', ['text image draw shape highlight'], FilePenLine, '/edit'),
];

export function filterTools(category: ToolCategory | 'All', query: string) {
    const value = query.trim().toLowerCase();
    return toolRegistry.filter((item) => (category === 'All' || item.category === category) && (!value || [item.title, ...item.aliases].join(' ').toLowerCase().includes(value)));
}

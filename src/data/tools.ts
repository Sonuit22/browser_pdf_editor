import {
    Archive,
    FilePenLine,
    FileSearch,
    FileStack,
    LockKeyhole,
    Minimize2,
    PenTool,
    RotateCw,
    Scissors,
    type LucideIcon,
} from 'lucide-react';

export type ToolDefinition = {
    path: string;
    name: string;
    summary: string;
    icon: LucideIcon;
    group: 'Create' | 'Organize' | 'Optimize' | 'Protect';
};

export const tools: ToolDefinition[] = [
    { path: '/view', name: 'View PDF', summary: 'Inspect pages and document details.', icon: FileSearch, group: 'Create' },
    { path: '/edit', name: 'Edit PDF', summary: 'Prepare a focused editing workspace.', icon: FilePenLine, group: 'Create' },
    { path: '/merge', name: 'Merge PDFs', summary: 'Combine documents in a chosen order.', icon: FileStack, group: 'Organize' },
    { path: '/split', name: 'Split PDF', summary: 'Separate pages into new documents.', icon: Scissors, group: 'Organize' },
    { path: '/rotate', name: 'Rotate Pages', summary: 'Adjust page orientation in bulk.', icon: RotateCw, group: 'Organize' },
    { path: '/compress', name: 'Compress PDF', summary: 'Prepare documents for lighter sharing.', icon: Minimize2, group: 'Optimize' },
    { path: '/sign', name: 'Sign PDF', summary: 'Set up a streamlined signing flow.', icon: PenTool, group: 'Protect' },
    { path: '/protect', name: 'Protect PDF', summary: 'Plan permissions and document security.', icon: LockKeyhole, group: 'Protect' },
    { path: '/organize', name: 'Organize PDF', summary: 'Reorder, extract, and manage pages.', icon: Archive, group: 'Organize' },
    { path: '/optimize', name: 'Optimize PDF', summary: 'Review output quality and file size.', icon: Minimize2, group: 'Optimize' },
];

export const toolByPath = new Map(tools.map((tool) => [tool.path, tool]));

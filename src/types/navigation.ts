import type { LucideIcon } from 'lucide-react';

export type NavigationItem = {
    label: string;
    path: string;
    icon: LucideIcon;
    section: 'Workspace' | 'Resources';
};

export type WorkspaceRoute = {
    title: string;
    eyebrow: string;
    description: string;
};

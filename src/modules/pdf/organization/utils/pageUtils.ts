import type { PageId, PageRotation, WorkingPage } from '../types/pages';

export function createPageId(): PageId {
    return globalThis.crypto?.randomUUID?.() ?? `page-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function normalizePageRotation(value: number): PageRotation {
    const normalized = ((Math.round(value / 90) * 90) % 360 + 360) % 360;
    return normalized as PageRotation;
}

export function rotatePage(page: WorkingPage, delta: -90 | 90): WorkingPage {
    return { ...page, rotation: normalizePageRotation(page.rotation + delta) };
}

export function pageIndexById(pages: WorkingPage[], id: PageId | null): number {
    return id ? pages.findIndex((page) => page.id === id) : -1;
}

export function orderedPageIds(pages: WorkingPage[], ids: PageId[]): PageId[] {
    const selected = new Set(ids);
    return pages.filter((page) => selected.has(page.id)).map((page) => page.id);
}

export function safePdfFilename(filename: string, suffix: string): string {
    const base = filename.replace(/[\\/:*?"<>|]/g, '-').replace(/\.pdf$/i, '').trim() || 'document';
    return `${base}-${suffix}.pdf`;
}

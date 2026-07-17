import type { PageId, PageOrganizationHistory, PageOrganizationPresent, PageSelectionMode, WorkingPage } from '../types/pages';
import { orderedPageIds, pageIndexById, rotatePage } from '../utils/pageUtils';

const HISTORY_LIMIT = 100;
const emptyPresent = (): PageOrganizationPresent => ({ documentId: null, pages: [], selectedPageIds: [], activePageId: null });
export const initialPageOrganizationState: PageOrganizationHistory = { present: emptyPresent(), past: [], future: [] };

type CommitAction = { type: 'commit'; next: PageOrganizationPresent };
export type PageOrganizationAction =
    | { type: 'reset'; documentId: string | null; pages: WorkingPage[] }
    | CommitAction
    | { type: 'select'; pageId: PageId | null; mode: PageSelectionMode }
    | { type: 'active'; pageId: PageId | null }
    | { type: 'undo' }
    | { type: 'redo' };

function normalize(next: PageOrganizationPresent): PageOrganizationPresent {
    const pageIds = new Set(next.pages.map((page) => page.id));
    const selectedPageIds = next.selectedPageIds.filter((id, index, ids) => pageIds.has(id) && ids.indexOf(id) === index);
    const activePageId = next.activePageId && pageIds.has(next.activePageId) ? next.activePageId : next.pages[0]?.id ?? null;
    return { ...next, selectedPageIds, activePageId };
}

function commit(state: PageOrganizationHistory, next: PageOrganizationPresent): PageOrganizationHistory {
    return { present: normalize(next), past: [...state.past, state.present].slice(-HISTORY_LIMIT), future: [] };
}

export function pageOrganizationReducer(state: PageOrganizationHistory, action: PageOrganizationAction): PageOrganizationHistory {
    if (action.type === 'reset') return { present: normalize({ documentId: action.documentId, pages: action.pages, selectedPageIds: [], activePageId: action.pages[0]?.id ?? null }), past: [], future: [] };
    if (action.type === 'commit') return commit(state, action.next);
    if (action.type === 'active') return { ...state, present: normalize({ ...state.present, activePageId: action.pageId }) };
    if (action.type === 'select') {
        const { pages, selectedPageIds, activePageId } = state.present;
        if (action.mode === 'clear') return { ...state, present: { ...state.present, selectedPageIds: [] } };
        if (action.mode === 'all') return { ...state, present: { ...state.present, selectedPageIds: pages.map((page) => page.id) } };
        if (action.mode === 'invert') return { ...state, present: { ...state.present, selectedPageIds: pages.filter((page) => !selectedPageIds.includes(page.id)).map((page) => page.id) } };
        if (!action.pageId) return state;
        if (action.mode === 'replace') return { ...state, present: { ...state.present, activePageId: action.pageId, selectedPageIds: [action.pageId] } };
        if (action.mode === 'toggle') {
            const selected = selectedPageIds.includes(action.pageId) ? selectedPageIds.filter((id) => id !== action.pageId) : [...selectedPageIds, action.pageId];
            return { ...state, present: { ...state.present, activePageId: action.pageId, selectedPageIds: selected } };
        }
        const anchor = pageIndexById(pages, activePageId);
        const target = pageIndexById(pages, action.pageId);
        if (anchor < 0 || target < 0) return state;
        const [start, end] = [Math.min(anchor, target), Math.max(anchor, target)];
        return { ...state, present: { ...state.present, activePageId: action.pageId, selectedPageIds: pages.slice(start, end + 1).map((page) => page.id) } };
    }
    if (action.type === 'undo' && state.past.length) {
        const previous = state.past[state.past.length - 1];
        return { present: previous, past: state.past.slice(0, -1), future: [state.present, ...state.future].slice(0, HISTORY_LIMIT) };
    }
    if (action.type === 'redo' && state.future.length) {
        const [next, ...future] = state.future;
        return { present: next, past: [...state.past, state.present].slice(-HISTORY_LIMIT), future };
    }
    return state;
}

export function reorderWorkingPages(present: PageOrganizationPresent, movingIds: PageId[], targetId: PageId, placement: 'before' | 'after'): PageOrganizationPresent {
    const orderedIds = orderedPageIds(present.pages, movingIds);
    if (!orderedIds.length || orderedIds.includes(targetId)) return present;
    const moving = new Set(orderedIds);
    const remaining = present.pages.filter((page) => !moving.has(page.id));
    const targetIndex = remaining.findIndex((page) => page.id === targetId);
    if (targetIndex < 0) return present;
    const pagesToMove = present.pages.filter((page) => moving.has(page.id));
    const insertionIndex = targetIndex + (placement === 'after' ? 1 : 0);
    return { ...present, pages: [...remaining.slice(0, insertionIndex), ...pagesToMove, ...remaining.slice(insertionIndex)], selectedPageIds: orderedIds, activePageId: orderedIds[0] };
}

export function deleteWorkingPages(present: PageOrganizationPresent, ids: PageId[]): PageOrganizationPresent | null {
    const removed = new Set(ids);
    const pages = present.pages.filter((page) => !removed.has(page.id));
    if (!pages.length) return null;
    const formerIndex = Math.max(0, present.pages.findIndex((page) => page.id === present.activePageId));
    return { ...present, pages, selectedPageIds: [], activePageId: pages[Math.min(formerIndex, pages.length - 1)]?.id ?? null };
}

export function duplicateWorkingPages(present: PageOrganizationPresent, ids: PageId[], copies: WorkingPage[]): PageOrganizationPresent {
    const selected = orderedPageIds(present.pages, ids);
    if (!selected.length) return present;
    const copiedBySource = new Map<string, WorkingPage[]>();
    for (const page of copies) copiedBySource.set(page.duplicatedFromPageId ?? '', [...(copiedBySource.get(page.duplicatedFromPageId ?? '') ?? []), page]);
    const pages = present.pages.flatMap((page) => [...[page], ...(copiedBySource.get(page.id) ?? [])]);
    return { ...present, pages, selectedPageIds: copies.map((page) => page.id), activePageId: copies[0]?.id ?? present.activePageId };
}

export function rotateWorkingPages(present: PageOrganizationPresent, ids: PageId[], delta: -90 | 90): PageOrganizationPresent {
    const selected = new Set(ids);
    return { ...present, pages: present.pages.map((page) => selected.has(page.id) ? rotatePage(page, delta) : page) };
}

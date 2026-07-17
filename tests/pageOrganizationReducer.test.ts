import { describe, expect, it } from 'vitest';
import { deleteWorkingPages, duplicateWorkingPages, initialPageOrganizationState, pageOrganizationReducer, reorderWorkingPages, rotateWorkingPages } from '../src/modules/pdf/organization/state/pageOrganizationReducer';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';

const pages: WorkingPage[] = ['a', 'b', 'c', 'd'].map((id, sourcePageIndex) => ({ id, kind: 'source', sourceDocumentId: 'root', sourcePageIndex, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null }));
const present = { documentId: 'root', pages, selectedPageIds: ['b', 'c'], activePageId: 'b' };

describe('page organization reducer', () => {
    it('keeps multi-page relative order when it reorders pages', () => {
        const next = reorderWorkingPages(present, ['b', 'c'], 'd', 'after');
        expect(next.pages.map((page) => page.id)).toEqual(['a', 'd', 'b', 'c']);
        expect(next.selectedPageIds).toEqual(['b', 'c']);
    });

    it('prevents deletion of every page and restores a deleted page through undo', () => {
        expect(deleteWorkingPages({ ...present, selectedPageIds: pages.map((page) => page.id) }, pages.map((page) => page.id))).toBeNull();
        const state = pageOrganizationReducer(initialPageOrganizationState, { type: 'reset', documentId: 'root', pages });
        const deleted = deleteWorkingPages({ ...state.present, selectedPageIds: ['b'], activePageId: 'b' }, ['b']);
        const committed = pageOrganizationReducer(state, { type: 'commit', next: deleted! });
        expect(committed.present.pages.map((page) => page.id)).toEqual(['a', 'c', 'd']);
        expect(pageOrganizationReducer(committed, { type: 'undo' }).present.pages.map((page) => page.id)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('duplicates a page with a distinct stable ID and preserves rotation', () => {
        const copy: WorkingPage = { ...pages[1], id: 'b-copy', rotation: 90, duplicatedFromPageId: 'b' };
        const next = duplicateWorkingPages(present, ['b'], [copy]);
        expect(next.pages.map((page) => page.id)).toEqual(['a', 'b', 'b-copy', 'c', 'd']);
        expect(next.pages[2].rotation).toBe(90);
        expect(next.pages[2].id).not.toBe(next.pages[1].id);
    });

    it('stores permanent rotation as a page property without moving the page identity', () => {
        const next = rotateWorkingPages(present, ['c'], 90);
        expect(next.pages.find((page) => page.id === 'c')).toMatchObject({ id: 'c', rotation: 90 });
    });
});

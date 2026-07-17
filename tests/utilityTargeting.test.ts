import { describe, expect, it } from 'vitest';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';
import { resolveCropTarget, resolveUtilityTarget } from '../src/modules/pdf/utilities/utils/utilityTargeting';

const pages: WorkingPage[] = Array.from({ length: 10 }, (_, index) => ({ id: `page-${index + 1}`, kind: 'source', sourceDocumentId: 'document-1', sourcePageIndex: index, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null }));

describe('utility page targeting', () => {
    it('resolves custom one-based ranges to document-order page IDs', () => {
        expect(resolveUtilityTarget({ applicationMode: 'custom', customRange: '1-3, 5, 8-10', pages, selectedPageIds: [], activePageId: null })).toMatchObject({ pageIds: ['page-1', 'page-2', 'page-3', 'page-5', 'page-8', 'page-9', 'page-10'], normalizedRange: '1-3, 5, 8-10', affectedPageCount: 7, errors: [], canApply: true });
    });

    it('reports range validation errors and blocks application', () => {
        expect(resolveUtilityTarget({ applicationMode: 'custom', customRange: '0, 11, 7-3', pages, selectedPageIds: [], activePageId: null })).toMatchObject({ affectedPageCount: 0, errors: expect.arrayContaining(['0: Page numbers must be positive integers.']), canApply: false });
    });

    it('uses document order for selected-page targets and falls back to the active page', () => {
        expect(resolveUtilityTarget({ applicationMode: 'selected', customRange: '', pages, selectedPageIds: ['page-8', 'page-2'], activePageId: 'page-5' })).toMatchObject({ pageIds: ['page-2', 'page-8'], normalizedRange: '2, 8', affectedPageCount: 2, canApply: true });
        expect(resolveUtilityTarget({ applicationMode: 'selected', customRange: '', pages, selectedPageIds: [], activePageId: 'page-5' })).toMatchObject({ pageIds: ['page-5'], normalizedRange: '5', canApply: true });
    });

    it('uses the active page for the crop current-page mode', () => {
        expect(resolveCropTarget({ applicationMode: 'current', customRange: '', pages, selectedPageIds: ['page-2'], activePageId: 'page-5' })).toMatchObject({ pageIds: ['page-5'], normalizedRange: '5', affectedPageCount: 1, canApply: true });
    });
});

import { formatPageRange, parsePageRange } from '../../organization/utils/pageRangeParser';
import type { WorkingPage } from '../../organization/types/pages';
import type { UtilityApplicationMode, UtilityTarget } from '../types/utilities';

export type ResolvedUtilityTarget = {
    pageIds: string[];
    affectedPageCount: number;
    normalizedRange: string;
    errors: string[];
    canApply: boolean;
};

type ResolveUtilityTargetInput = Pick<UtilityTarget, 'applicationMode' | 'customRange'> & {
    pages: WorkingPage[];
    selectedPageIds: string[];
    activePageId: string | null;
};

export function resolveUtilityTarget({ applicationMode, customRange, pages, selectedPageIds, activePageId }: ResolveUtilityTargetInput): ResolvedUtilityTarget {
    const allIndices = pages.map((_, index) => index);
    if (applicationMode === 'all') return targetFromIndices(allIndices, pages);
    if (applicationMode === 'selected') {
        const selected = new Set(selectedPageIds.length ? selectedPageIds : activePageId ? [activePageId] : []);
        return targetFromIndices(pages.flatMap((page, index) => selected.has(page.id) ? [index] : []), pages);
    }

    const result = parsePageRange(customRange, { pageCount: pages.length, preserveOrder: false });
    const target = targetFromIndices(result.indices, pages);
    return { ...target, errors: result.errors.map((error) => `${error.token}: ${error.message}`), canApply: result.errors.length === 0 && target.affectedPageCount > 0 };
}

function targetFromIndices(indices: number[], pages: WorkingPage[]): ResolvedUtilityTarget {
    const pageIds = indices.map((index) => pages[index]?.id).filter((pageId): pageId is string => Boolean(pageId));
    return { pageIds, affectedPageCount: pageIds.length, normalizedRange: formatPageRange(indices), errors: [], canApply: pageIds.length > 0 };
}

export function applicationModeLabel(mode: UtilityApplicationMode) {
    return mode === 'all' ? 'All pages' : mode === 'selected' ? 'Selected pages' : 'Custom range';
}

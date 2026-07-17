export type PageId = string;
export type PageSourceId = string;
export type PageRotation = 0 | 90 | 180 | 270;
export type PageKind = 'source' | 'blank';

export type WorkingPage = {
    id: PageId;
    kind: PageKind;
    sourceDocumentId: PageSourceId | null;
    sourcePageIndex: number | null;
    width: number;
    height: number;
    rotation: PageRotation;
    duplicatedFromPageId: PageId | null;
};

export type PageSource = {
    id: PageSourceId;
    file: File;
    pageCount: number;
};

export type PageSelectionMode = 'replace' | 'toggle' | 'range' | 'clear' | 'all' | 'invert';

export type PageOrganizationPresent = {
    documentId: string | null;
    pages: WorkingPage[];
    selectedPageIds: PageId[];
    activePageId: PageId | null;
};

export type PageOrganizationHistory = {
    present: PageOrganizationPresent;
    past: PageOrganizationPresent[];
    future: PageOrganizationPresent[];
};

export type PageInsertion = 'before-active' | 'after-active' | 'beginning' | 'end';

export const A4_PORTRAIT = { width: 595.28, height: 841.89 };
export const LETTER_PORTRAIT = { width: 612, height: 792 };

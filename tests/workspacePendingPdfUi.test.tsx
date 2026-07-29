import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PdfEngineValue } from '../src/modules/pdf/context/pdfEngineStore';

const mocks = vi.hoisted(() => ({
    engine: {} as PdfEngineValue,
}));

vi.mock('../src/modules/pdf/hooks/usePdfEngine', () => ({
    usePdfEngine: () => mocks.engine,
}));
vi.mock('../src/contexts/ShellContext', () => ({
    useShell: () => ({ requestNavigation: vi.fn() }),
}));
vi.mock('../src/layouts/RightPanel', () => ({
    RightPanel: () => null,
}));

import WorkspacePage from '../src/pages/WorkspacePage';

function renderWorkspace(route: string) {
    return renderToStaticMarkup(
        <MemoryRouter initialEntries={[{ pathname: route, state: { fromLandingFile: true } }]}>
            <WorkspacePage />
        </MemoryRouter>,
    );
}

describe('destination pending PDF UI', () => {
    beforeEach(() => {
        mocks.engine = {
            phase: 'idle',
            progress: 0,
            error: null,
            pendingPdfFile: null,
            consumePendingPdf: vi.fn(async () => false),
            retry: vi.fn(),
            setUploadError: vi.fn(),
            openFile: vi.fn(async () => false),
            openFilePicker: vi.fn(),
        } as unknown as PdfEngineValue;
    });

    it.each(['/sign-pdf', '/compress', '/split', '/remove-pages', '/extract-pages', '/organize'])(
        'shows loading instead of a second upload prompt while %s receives the pending File',
        (route) => {
            const file = new File(['%PDF-1.7'], 'same-selected-file.pdf', { type: 'application/pdf' });
            mocks.engine.pendingPdfFile = { file, source: 'landing-page', selectedAt: 123 };

            const html = renderWorkspace(route);
            expect(html).toContain('Loading PDF');
            expect(html).not.toContain('Select PDF');
        },
    );

    it('shows the exact normal-upload refresh fallback when memory state is gone', () => {
        const html = renderWorkspace('/split');
        expect(html).toContain('The previously selected PDF is no longer available. Please choose it again.');
        expect(html).toContain('Select PDF');
    });

    it('keeps manual upload available after pending-file loading fails', () => {
        mocks.engine.phase = 'error';
        mocks.engine.error = 'The selected file is corrupted or is not a readable PDF.';

        const html = renderWorkspace('/organize');
        expect(html).toContain('The selected file is corrupted or is not a readable PDF.');
        expect(html).toContain('Select PDF');
    });
});

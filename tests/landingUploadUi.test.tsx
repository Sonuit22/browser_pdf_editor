import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HomePage from '../src/pages/HomePage';
import { PdfEngineContext, type PdfEngineValue } from '../src/modules/pdf/context/pdfEngineStore';

function renderLanding(stagedFile: File | null) {
    const engine = {
        stagedFile,
        stageFile: () => undefined,
        clearStagedFile: () => undefined,
        openStagedFile: async () => Boolean(stagedFile),
        consumePendingPdf: async () => Boolean(stagedFile),
    } as PdfEngineValue;
    return renderToStaticMarkup(
        <MemoryRouter>
            <PdfEngineContext.Provider value={engine}>
                <HomePage />
            </PdfEngineContext.Provider>
        </MemoryRouter>,
    );
}

describe('landing upload UI states', () => {
    it('shows one initial chooser without mounting editor controls', () => {
        const html = renderLanding(null);
        expect(html).toContain('Drop your PDF here');
        expect(html).toContain('Choose PDF');
        expect(html).not.toContain('Choose what you want to do');
        expect(html).not.toContain('PDF editing controls');
    });

    it('shows file details and all tool choices only after a file is staged', () => {
        const html = renderLanding(new File(['%PDF-1.7'], 'selected.pdf', { type: 'application/pdf' }));
        expect(html).toContain('selected.pdf');
        expect(html).toContain('Replace file');
        expect(html).toContain('Remove file');
        expect(html).toContain('Choose what you want to do');
        for (const label of ['Sign PDF', 'Compress PDF', 'Split PDF', 'Remove Pages from PDF', 'Extract Pages', 'Organize PDF']) {
            expect(html).toContain(label);
        }
        expect(html).not.toContain('>Choose PDF<');
        expect(html).not.toContain('PDF editing controls');
        expect(html).toContain('File name:');
        expect(html).toContain('PDF • 1 KB');
    });

    it('keeps a long complete filename in the accessible title while displaying file actions first', () => {
        const filename = 'a-very-long-document-name-that-needs-two-safe-lines-before-the-user-selects-a-tool.pdf';
        const html = renderLanding(new File(['%PDF-1.7'], filename, { type: 'application/pdf' }));
        expect(html).toContain(`title="${filename}"`);
        expect(html.indexOf('Replace file')).toBeLessThan(html.indexOf('File name:'));
        expect(html.indexOf('Remove file')).toBeLessThan(html.indexOf('File name:'));
    });
});

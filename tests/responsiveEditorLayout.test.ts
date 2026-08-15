import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('responsive PDF editor workspace', () => {
    it('uses intentional tablet and phone breakpoints without changing desktop mode', async () => {
        const css = await readFile('src/styles.css', 'utf8');

        expect(css).toContain('@media (max-width: 1199px)');
        expect(css).toContain('@media (max-width: 767px)');
        expect(css).toContain('@media (min-width: 1200px)');
        expect(css).toContain('.tool-workspace-shell--editor > .right-panel');
        expect(css).toContain('.pdf-toolbar__responsive-actions');
        expect(css).toContain('.thumbnail-sidebar.is-open');
        expect(css).toContain('min-height: 44px');
        expect(css).toContain('overflow-x: auto');
    });

    it('keeps critical actions outside the horizontally scrolling tool strip', async () => {
        const [viewer, editorToolbar] = await Promise.all([
            readFile('src/modules/pdf/viewer/PdfViewer.tsx', 'utf8'),
            readFile('src/modules/pdf/editor/components/EditorToolbar.tsx', 'utf8'),
        ]);

        expect(viewer).toContain('aria-label="Critical editor actions"');
        expect(viewer).toContain('className="pdf-responsive-export"');
        expect(viewer).toContain('aria-controls="responsive-page-drawer"');
        expect(viewer).toContain('exportingRef.current');
        expect(editorToolbar).toContain('className="editor-toolbar__tools"');
    });

    it('measures Fit Width from the actual canvas viewport and handles orientation changes', async () => {
        const canvas = await readFile('src/modules/pdf/viewer/PdfPageCanvas.tsx', 'utf8');

        expect(canvas).toContain('element.clientWidth');
        expect(canvas).toContain('window.visualViewport?.addEventListener');
        expect(canvas).toContain("window.addEventListener('orientationchange', measure)");
        expect(canvas).toContain('(size.width - fitMargin) / baseViewport.width');
    });

    it('keeps the Sign PDF drawing pad and signing objects pointer-safe', async () => {
        const [signingToolbar, viewer, css] = await Promise.all([
            readFile('src/modules/pdf/editor/components/SigningToolbar.tsx', 'utf8'),
            readFile('src/modules/pdf/viewer/PdfViewer.tsx', 'utf8'),
            readFile('src/styles.css', 'utf8'),
        ]);

        expect(signingToolbar).toContain('onPointerCancel');
        expect(signingToolbar).toContain('setPointerCapture');
        expect(signingToolbar).toContain('getCoalescedEvents');
        expect(signingToolbar).toContain('Undo stroke');
        expect(signingToolbar).toContain('Apply ${kind}');
        expect(signingToolbar).toContain('className="signature-modal"');
        expect(css).toContain('.signature-canvas');
        expect(css).toContain('touch-action: none');
        expect(css).toContain('.pdf-viewer--signing .annotation-image-wrap');
        expect(css).toContain('@media (max-height: 500px) and (orientation: landscape)');
        expect(viewer).toContain('notify(DOWNLOAD_SUCCESS_MESSAGE)');
        expect(viewer).toContain("pathname === '/sign-pdf' ? 'Download failed. Please try again.'");
    });

    it('shows selected-object actions immediately on touch layouts', async () => {
        const [overlay, css] = await Promise.all([
            readFile('src/modules/pdf/editor/components/AnnotationOverlay.tsx', 'utf8'),
            readFile('src/styles.css', 'utf8'),
        ]);

        expect(overlay).toContain("selectedIds.length === 1");
        expect(overlay).toContain('aria-label="Selected object actions"');
        expect(overlay).toContain('Edit text');
        expect(overlay).toContain('Change date');
        expect(overlay).toContain('>Delete</button>');
        expect(overlay).toContain('ObjectEditDialog');
        expect(css).toContain('grid-template-columns: repeat(auto-fit, minmax(92px, 1fr))');
        expect(css).toContain('min-height: 44px');
    });
});

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Files, Info, Redo2, RotateCw, SlidersHorizontal, Undo2, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { usePdfEngine } from '../hooks/usePdfEngine';
import { usePdfPageOperations } from '../organization/hooks/usePdfPageOperations';
import type { PdfRotation, ZoomPreset } from '../types/pdf';
import { AnnotationOverlay } from '../editor/components/AnnotationOverlay';
import { EditorToolbar } from '../editor/components/EditorToolbar';
import { usePdfEditor } from '../editor/hooks/usePdfEditor';
import { editedFilename, exportWorkingPdf } from '../editor/services/pdfExportService';
import { PdfPageCanvas } from './PdfPageCanvas';
import { PageThumbnailPanel } from '../organization/components/PageThumbnailPanel';
import { usePdfUtilities } from '../utilities/hooks/usePdfUtilities';
import { UtilityPreviewOverlay } from '../utilities/components/UtilityPreviewOverlay';
import { CropOverlay } from '../utilities/components/CropOverlay';
import { notify } from '../../../components/feedback/notifications';
import { Modal } from '../../../components/ui/Modal';
import { RightPanel } from '../../../layouts/RightPanel';
import { SigningToolbar } from '../editor/components/SigningToolbar';
import { useLocation } from 'react-router-dom';
import type { PdfAnnotation } from '../editor/types/annotations';
import { getProcessingErrorMessage } from '../../../utils/processingErrors';
import { FillFormToolbar } from '../forms/FillFormToolbar';
import { createFilledPdf, filledFilename } from '../forms/fillFormService';
import { downloadPdf } from '../organization/utils/pdfDownload';

const zoomOptions: Array<[string, ZoomPreset]> = [['Fit width', 'fit-width'], ['Fit page', 'fit-page'], ['25%', 25], ['50%', 50], ['75%', 75], ['100%', 100], ['125%', 125], ['150%', 150], ['200%', 200], ['300%', 300]];
const rotationOptions: PdfRotation[] = [0, 90, 180, 270, 360];

export function PdfViewer() {
    const { pathname } = useLocation();
    const { info, zoom, rotation, setZoom, setRotation, closeDocument, failViewer } = usePdfEngine();
    const { documentId, pages, activePageId, activePage, isInitializing, setActivePage, reorderPages, getPage, getSourceFile } = usePdfPageOperations();
    const editor = usePdfEditor();
    const { annotationsByPageId, formValues, flattenForms, dirty } = editor;
    const utilities = usePdfUtilities();
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportProgress, setExportProgress] = useState(0);
    const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
    const [documentToolsOpen, setDocumentToolsOpen] = useState(false);
    const [pagesOpen, setPagesOpen] = useState(false);
    const [annotationPreview, setAnnotationPreview] = useState<PdfAnnotation | null>(null);
    const exportingRef = useRef(false);
    const currentPage = Math.max(1, pages.findIndex((page) => page.id === activePageId) + 1);
    const pageCount = pages.length;
    const handleAnnotationPreview = useCallback((annotation: PdfAnnotation | null) => setAnnotationPreview(annotation), []);
    const handleRenderError = useCallback(() => failViewer('A page could not be rendered safely. Please retry the document.'), [failViewer]);
    const handleThumbnailSelect = useCallback((pageId: string) => {
        setActivePage(pageId);
        if (window.matchMedia('(max-width: 767px)').matches) setPagesOpen(false);
    }, [setActivePage]);
    const handleThumbnailReorder = useCallback((movingIds: string[], targetId: string, placement: 'before' | 'after') => reorderPages(movingIds, targetId, placement), [reorderPages]);

    useEffect(() => { setAnnotationPreview(null); }, [activePageId, documentId]);
    useEffect(() => {
        const closeResponsivePanels = () => {
            if (window.innerWidth >= 1200) setPagesOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setPagesOpen(false);
        };
        window.addEventListener('resize', closeResponsivePanels);
        window.addEventListener('orientationchange', closeResponsivePanels);
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            window.removeEventListener('resize', closeResponsivePanels);
            window.removeEventListener('orientationchange', closeResponsivePanels);
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)) return;
            const index = pages.findIndex((page) => page.id === activePageId);
            if (event.key === 'ArrowLeft' && pages[index - 1]) { event.preventDefault(); setActivePage(pages[index - 1].id); }
            if (event.key === 'ArrowRight' && pages[index + 1]) { event.preventDefault(); setActivePage(pages[index + 1].id); }
            if (event.key === 'Home' && pages[0]) { event.preventDefault(); setActivePage(pages[0].id); }
            if (event.key === 'End' && pages[pages.length - 1]) { event.preventDefault(); setActivePage(pages[pages.length - 1]?.id ?? null); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activePageId, pages, setActivePage]);

    if (!info || isInitializing || !activePage || !pageCount) return <div className="pdf-loading" role="status">Preparing document pages...</div>;

    const exportDocument = async () => {
        if (exportingRef.current) return;
        exportingRef.current = true;
        let completed = false;
        setExporting(true);
        setExportProgress(0);
        setExportError(null);
        try {
            if (pathname === '/fill-pdf-form') {
                const sourceDocumentId = pages.find((page) => page.sourceDocumentId)?.sourceDocumentId;
                const file = sourceDocumentId ? getSourceFile(sourceDocumentId) : null;
                if (!file) throw new Error('The original PDF is no longer available.');
                const bytes = await createFilledPdf(file, pages, annotationsByPageId, formValues);
                downloadPdf(bytes, filledFilename(info.filename));
                setExportProgress(100);
            } else {
                await exportWorkingPdf({ pages, annotationsByPageId, getSourceFile, filename: editedFilename(info.filename), utilities, sourceFilename: info.filename, formValues, flattenForms, onProgress: setExportProgress });
            }
            notify(pathname === '/sign-pdf' ? 'Document downloaded' : pathname === '/fill-pdf-form' ? 'Document downloaded' : flattenForms ? 'PDF exported with flattened form fields.' : 'PDF export completed.');
            completed = true;
        } catch (error) {
            const message = getProcessingErrorMessage(error, 'Export failed. Keep the document open, check available browser memory, and try again.');
            setExportError(message);
            notify(pathname === '/sign-pdf' ? 'Download failed. Please try again.' : pathname === '/fill-pdf-form' ? 'Download failed. Please try again.' : message, 'error');
        } finally {
            exportingRef.current = false;
            setExporting(false);
        }
        if (completed) closeDocument();
    };

    const jumpToPage = (value: number) => setActivePage(pages[Math.min(Math.max(1, value), pageCount) - 1]?.id ?? null);
    return (
        <section className={`pdf-viewer${pathname === '/sign-pdf' ? ' pdf-viewer--signing' : ''}${pathname === '/fill-pdf-form' ? ' pdf-viewer--fill-form' : ''}`} aria-label={`${info.filename} viewer`}>
            <div className="pdf-toolbar" aria-label="PDF viewer controls">
                <div className="pdf-toolbar__group">
                    <button className="icon-button" type="button" onClick={() => jumpToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" title="Previous page"><ChevronLeft size={19} aria-hidden="true" /></button>
                    <label className="page-jump">Page <input type="number" min="1" max={pageCount} value={currentPage} onChange={(event) => jumpToPage(Number(event.target.value))} aria-label="Current page" /> <span>of {pageCount}</span></label>
                    <button className="icon-button" type="button" onClick={() => jumpToPage(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Next page" title="Next page"><ChevronRight size={19} aria-hidden="true" /></button>
                </div>
                <div className="pdf-toolbar__group pdf-toolbar__group--settings">
                    <label className="toolbar-select"><span>Zoom</span><select value={String(zoom)} onChange={(event) => setZoom((event.target.value === 'fit-width' || event.target.value === 'fit-page' ? event.target.value : Number(event.target.value)) as ZoomPreset)}>{zoomOptions.map(([label, value]) => <option key={String(value)} value={String(value)}>{label}</option>)}</select></label>
                    <label className="toolbar-select"><RotateCw size={16} aria-hidden="true" /><span className="sr-only">Temporary view rotation</span><select value={rotation} onChange={(event) => setRotation(Number(event.target.value) as PdfRotation)}>{rotationOptions.map((value) => <option key={value} value={value}>{value} degrees</option>)}</select></label>
                    <Button className="pdf-toolbar__desktop-close" variant="secondary" size="compact" type="button" disabled={exporting} onClick={() => dirty ? setCloseConfirmOpen(true) : closeDocument()} title={dirty ? 'Closing will discard unsaved edits' : 'Close document'}><X size={16} aria-hidden="true" />Close</Button>
                    <button className="icon-button pdf-toolbar__desktop-info" type="button" disabled={exporting} onClick={() => setDocumentToolsOpen(true)} aria-label="Open document tools" title="Document tools"><SlidersHorizontal size={16} aria-hidden="true" /></button>
                </div>
                <div className="pdf-toolbar__responsive-actions" role="toolbar" aria-label="Critical editor actions">
                    <button type="button" className="pdf-responsive-action" onClick={() => setPagesOpen(true)} aria-expanded={pagesOpen} aria-controls="responsive-page-drawer"><Files size={17} aria-hidden="true" /><span>Pages</span></button>
                    <button type="button" className="pdf-responsive-action" onClick={() => setDocumentToolsOpen(true)}><Info size={17} aria-hidden="true" /><span>Info</span></button>
                    <button type="button" className="pdf-responsive-action pdf-responsive-action--icon" onClick={editor.undo} disabled={!editor.canUndo} aria-label="Undo"><Undo2 size={18} aria-hidden="true" /></button>
                    <button type="button" className="pdf-responsive-action pdf-responsive-action--icon" onClick={editor.redo} disabled={!editor.canRedo} aria-label="Redo"><Redo2 size={18} aria-hidden="true" /></button>
                    <button type="button" className="pdf-responsive-action" disabled={exporting} onClick={() => dirty ? setCloseConfirmOpen(true) : closeDocument()}><X size={17} aria-hidden="true" /><span>Close</span></button>
                    <button type="button" className="pdf-responsive-export" onClick={() => void exportDocument()} disabled={exporting} aria-label={pathname === '/fill-pdf-form' ? 'Download filled PDF' : 'Export edited PDF'}><Download size={18} aria-hidden="true" />{exporting ? `${exportProgress}%` : pathname === '/fill-pdf-form' ? 'Download' : 'Export'}</button>
                </div>
            </div>
            {pathname === '/sign-pdf' ? <SigningToolbar onExport={() => void exportDocument()} exporting={exporting} /> : pathname === '/fill-pdf-form' ? <FillFormToolbar onExport={() => void exportDocument()} exporting={exporting} /> : <EditorToolbar onExport={() => void exportDocument()} exporting={exporting} />}
            {exporting && <p className="pdf-export-progress" role="status">Preparing export: {exportProgress}%</p>}
            {pageCount >= 200 && <p className="pdf-export-progress" role="status">Large document: rendering the active page and nearby thumbnails on demand.</p>}
            {exportError && <p className="pdf-export-error" role="alert">{exportError}</p>}
            <div className={`pdf-viewer__body${pagesOpen ? ' has-pages-open' : ''}`}>
                {pagesOpen && <button className="thumbnail-drawer-scrim" type="button" onClick={() => setPagesOpen(false)} aria-label="Close pages drawer" />}
                <aside id="responsive-page-drawer" className={`thumbnail-sidebar${pagesOpen ? ' is-open' : ''}`} aria-label="Page thumbnails"><div className="thumbnail-sidebar__header"><strong>Pages</strong><button className="icon-button" type="button" onClick={() => setPagesOpen(false)} aria-label="Close pages drawer"><X size={18} aria-hidden="true" /></button></div><PageThumbnailPanel pages={pages} activePageId={activePageId} getPage={getPage} reorderEnabled annotationsByPageId={annotationsByPageId} previewAnnotation={annotationPreview} formValues={formValues} onSelect={handleThumbnailSelect} onReorder={handleThumbnailReorder} /></aside>
                <PdfPageCanvas page={activePage} pageNumber={currentPage} getPage={getPage} zoom={zoom} rotation={rotation} onRenderError={handleRenderError}>{(layout) => <><AnnotationOverlay pageId={activePage.id} layout={layout} onPreviewChange={handleAnnotationPreview} /><CropOverlay page={activePage} layout={layout} /><UtilityPreviewOverlay pageId={activePage.id} pageNumber={currentPage} pageCount={pageCount} filename={info.filename} /></>}</PdfPageCanvas>
            </div>
            {closeConfirmOpen && <Modal title="Discard unsaved work" onClose={() => setCloseConfirmOpen(false)}><p>Close this document and discard unsaved edits?</p><div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setCloseConfirmOpen(false)}>Keep editing</Button><Button type="button" onClick={() => { setCloseConfirmOpen(false); closeDocument(); }}>Discard work</Button></div></Modal>}
            {documentToolsOpen && <Modal title="Document tools" onClose={() => setDocumentToolsOpen(false)}><RightPanel /></Modal>}
        </section>
    );
}

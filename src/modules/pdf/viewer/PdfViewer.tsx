import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { usePdfEngine } from '../hooks/usePdfEngine';
import { usePdfPageOperations } from '../organization/hooks/usePdfPageOperations';
import type { PdfRotation, ZoomPreset } from '../types/pdf';
import { AnnotationOverlay } from '../editor/components/AnnotationOverlay';
import { EditorToolbar } from '../editor/components/EditorToolbar';
import { usePdfEditor } from '../editor/hooks/usePdfEditor';
import { editedFilename, exportWorkingPdf } from '../editor/services/pdfExportService';
import { PdfPageCanvas } from './PdfPageCanvas';
import { PdfThumbnail } from './PdfThumbnail';
import { usePdfUtilities } from '../utilities/hooks/usePdfUtilities';
import { UtilityPreviewOverlay } from '../utilities/components/UtilityPreviewOverlay';
import { CropOverlay } from '../utilities/components/CropOverlay';

const zoomOptions: Array<[string, ZoomPreset]> = [['Fit width', 'fit-width'], ['Fit page', 'fit-page'], ['25%', 25], ['50%', 50], ['75%', 75], ['100%', 100], ['125%', 125], ['150%', 150], ['200%', 200], ['300%', 300]];
const rotationOptions: PdfRotation[] = [0, 90, 180, 270, 360];

export function PdfViewer() {
    const { info, zoom, rotation, setZoom, setRotation, closeDocument, failViewer } = usePdfEngine();
    const { pages, activePageId, activePage, isInitializing, setActivePage, getPage, getSourceFile } = usePdfPageOperations();
    const { annotationsByPageId, formValues, flattenForms } = usePdfEditor();
    const utilities = usePdfUtilities();
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const currentPage = Math.max(1, pages.findIndex((page) => page.id === activePageId) + 1);
    const pageCount = pages.length;

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
        if (exporting) return;
        setExporting(true);
        setExportError(null);
        try {
            await exportWorkingPdf({ pages, annotationsByPageId, getSourceFile, filename: editedFilename(info.filename), utilities, sourceFilename: info.filename, formValues, flattenForms });
        } catch {
            setExportError('The modified PDF could not be exported. Check the source files and try again.');
        } finally {
            setExporting(false);
        }
    };

    const jumpToPage = (value: number) => setActivePage(pages[Math.min(Math.max(1, value), pageCount) - 1]?.id ?? null);
    return (
        <section className="pdf-viewer" aria-label={`${info.filename} viewer`}>
            <div className="pdf-toolbar" aria-label="PDF viewer controls">
                <div className="pdf-toolbar__group">
                    <button className="icon-button" type="button" onClick={() => jumpToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" title="Previous page"><ChevronLeft size={19} aria-hidden="true" /></button>
                    <label className="page-jump">Page <input type="number" min="1" max={pageCount} value={currentPage} onChange={(event) => jumpToPage(Number(event.target.value))} aria-label="Current page" /> <span>of {pageCount}</span></label>
                    <button className="icon-button" type="button" onClick={() => jumpToPage(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Next page" title="Next page"><ChevronRight size={19} aria-hidden="true" /></button>
                </div>
                <div className="pdf-toolbar__group pdf-toolbar__group--settings">
                    <label className="toolbar-select"><span>Zoom</span><select value={String(zoom)} onChange={(event) => setZoom((event.target.value === 'fit-width' || event.target.value === 'fit-page' ? event.target.value : Number(event.target.value)) as ZoomPreset)}>{zoomOptions.map(([label, value]) => <option key={String(value)} value={String(value)}>{label}</option>)}</select></label>
                    <label className="toolbar-select"><RotateCw size={16} aria-hidden="true" /><span className="sr-only">Temporary view rotation</span><select value={rotation} onChange={(event) => setRotation(Number(event.target.value) as PdfRotation)}>{rotationOptions.map((value) => <option key={value} value={value}>{value} degrees</option>)}</select></label>
                    <Button variant="secondary" size="compact" type="button" onClick={closeDocument}><X size={16} aria-hidden="true" />Close</Button>
                </div>
            </div>
            <EditorToolbar onExport={() => void exportDocument()} exporting={exporting} />
            {exportError && <p className="pdf-export-error" role="alert">{exportError}</p>}
            <div className="pdf-viewer__body">
                <aside className="thumbnail-sidebar" aria-label="Page thumbnails">
                    {pages.map((page, index) => <PdfThumbnail key={page.id} page={page} pageNumber={index + 1} active={activePageId === page.id} rotation={rotation} getPage={getPage} onSelect={(pageId) => setActivePage(pageId)} />)}
                </aside>
                <PdfPageCanvas page={activePage} pageNumber={currentPage} getPage={getPage} zoom={zoom} rotation={rotation} onRenderError={() => failViewer('A page could not be rendered safely. Please retry the document.')}>{(layout) => <><AnnotationOverlay pageId={activePage.id} layout={layout} /><CropOverlay page={activePage} layout={layout} /><UtilityPreviewOverlay pageId={activePage.id} pageNumber={currentPage} pageCount={pageCount} filename={info.filename} /></>}</PdfPageCanvas>
            </div>
        </section>
    );
}

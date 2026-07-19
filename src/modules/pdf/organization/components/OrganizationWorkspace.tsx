import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Copy, Download, FilePlus2, FolderInput, Redo2, RotateCcw, RotateCw, Scissors, Trash2, Undo2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { usePdfEditor } from '../../editor/hooks/usePdfEditor';
import { exportWorkingPdf } from '../../editor/services/pdfExportService';
import { usePdfEngine } from '../../hooks/usePdfEngine';
import { PdfThumbnail } from '../../viewer/PdfThumbnail';
import { usePdfPageOperations } from '../hooks/usePdfPageOperations';
import type { PageId, WorkingPage } from '../types/pages';
import { A4_PORTRAIT, LETTER_PORTRAIT } from '../types/pages';
import { safePdfFilename } from '../utils/pageUtils';
import { usePdfUtilities } from '../../utilities/hooks/usePdfUtilities';
import { notify } from '../../../../components/feedback/notifications';

const blankPresets = {
    'Same as active': null,
    'A4 portrait': A4_PORTRAIT,
    'A4 landscape': { width: A4_PORTRAIT.height, height: A4_PORTRAIT.width },
    'Letter portrait': LETTER_PORTRAIT,
    'Letter landscape': { width: LETTER_PORTRAIT.height, height: LETTER_PORTRAIT.width },
};

export function OrganizationWorkspace() {
    const { closeDocument, info } = usePdfEngine();
    const { annotationsByPageId } = usePdfEditor();
    const utilities = usePdfUtilities();
    const operations = usePdfPageOperations();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [preset, setPreset] = useState<keyof typeof blankPresets>('Same as active');
    const [importPosition, setImportPosition] = useState<'before-active' | 'after-active' | 'beginning' | 'end'>('after-active');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const busyRef = useRef(false);
    const selectedIds = operations.selectedPageIds.length ? operations.selectedPageIds : operations.activePageId ? [operations.activePageId] : [];
    const selectedPages = operations.pages.filter((page) => selectedIds.includes(page.id));
    const activeDimensions = operations.activePage ? { width: operations.activePage.width, height: operations.activePage.height } : A4_PORTRAIT;

    const exportPages = async (pages: WorkingPage[], suffix: string) => {
        if (!info || busyRef.current || !pages.length) return;
        busyRef.current = true;
        let completed = false;
        setBusy(true);
        setMessage(null);
        try {
            await exportWorkingPdf({ pages, annotationsByPageId, getSourceFile: operations.getSourceFile, filename: safePdfFilename(info.filename, suffix), utilities, sourceFilename: info.filename });
            notify('PDF downloaded successfully.');
            completed = true;
        } catch {
            setMessage('The selected pages could not be exported. Check every source PDF and try again.');
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
        if (completed) closeDocument();
    };
    const insertBlank = () => {
        const dimensions = blankPresets[preset] ?? activeDimensions;
        operations.insertBlank(dimensions, 'after-active');
    };
    const confirmDelete = () => {
        if (!operations.deleteSelected()) setMessage('At least one page must remain in the document.'); else notify('Selected pages deleted. You can undo this operation.');
        setDeleteOpen(false);
    };
    const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const [file] = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (!file || busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setMessage(null);
        try {
            await operations.importPages(file, [], importPosition);
            notify('PDF pages imported successfully.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'The pages could not be imported.');
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    };
    return (
        <section className="organize-workspace" aria-label="Organize PDF pages">
            <div className="organize-toolbar" aria-label="Page operations">
                <div className="organize-toolbar__group">
                    <button className="icon-button" type="button" onClick={() => operations.rotateSelected(-90)} disabled={!selectedIds.length} aria-label="Rotate selected pages left" title="Rotate left"><RotateCcw size={17} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={() => operations.rotateSelected(90)} disabled={!selectedIds.length} aria-label="Rotate selected pages right" title="Rotate right"><RotateCw size={17} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={() => operations.moveActive(-1)} disabled={!operations.activePageId} aria-label="Move active page earlier" title="Move earlier"><ArrowUp size={17} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={() => operations.moveActive(1)} disabled={!operations.activePageId} aria-label="Move active page later" title="Move later"><ArrowDown size={17} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={() => setDeleteOpen(true)} disabled={!selectedIds.length || selectedIds.length >= operations.pages.length} aria-label="Delete selected pages" title="Delete"><Trash2 size={17} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={operations.duplicateSelected} disabled={!selectedIds.length} aria-label="Duplicate selected pages" title="Duplicate"><Copy size={17} aria-hidden="true" /></button>
                </div>
                <div className="organize-toolbar__group">
                    <label className="toolbar-select"><span className="sr-only">Blank page size</span><select value={preset} onChange={(event) => setPreset(event.target.value as keyof typeof blankPresets)}>{Object.keys(blankPresets).map((label) => <option key={label}>{label}</option>)}</select></label>
                    <button className="icon-button" type="button" onClick={insertBlank} aria-label="Insert blank page after active page" title="Insert blank page"><FilePlus2 size={17} aria-hidden="true" /></button>
                    <label className="toolbar-select"><span className="sr-only">Imported-page position</span><select value={importPosition} onChange={(event) => setImportPosition(event.target.value as typeof importPosition)}><option value="before-active">Before active</option><option value="after-active">After active</option><option value="beginning">At beginning</option><option value="end">At end</option></select></label>
                    <button className="icon-button" type="button" onClick={() => importInputRef.current?.click()} disabled={busy} aria-label="Import pages from another PDF" title="Import pages"><FolderInput size={17} aria-hidden="true" /></button>
                    <input ref={importInputRef} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(event) => void importFile(event)} />
                </div>
                <div className="organize-toolbar__group organize-toolbar__group--actions">
                    <button className="icon-button" type="button" onClick={operations.undo} disabled={!operations.canUndo} aria-label="Undo page operation" title="Undo"><Undo2 size={17} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={operations.redo} disabled={!operations.canRedo} aria-label="Redo page operation" title="Redo"><Redo2 size={17} aria-hidden="true" /></button>
                    <Button variant="secondary" size="compact" type="button" onClick={() => void exportPages(selectedPages, `pages-${selectedPages.map((page) => operations.getPageNumber(page.id)).join('-')}`)} disabled={!selectedPages.length || busy}><Scissors size={16} aria-hidden="true" />Extract</Button>
                    <Button variant="primary" size="compact" type="button" onClick={() => void exportPages(operations.pages, 'edited')} disabled={busy}><Download size={16} aria-hidden="true" />{busy ? 'Working' : 'Export'}</Button>
                </div>
            </div>
            <div className="organize-selection" role="status" aria-live="polite"><span>{selectedIds.length} selected</span><button type="button" onClick={operations.selectAll}>Select all</button><button type="button" onClick={operations.clearSelection}>Clear</button><button type="button" onClick={operations.invertSelection}>Invert</button><button type="button" onClick={() => operations.rotateAll(90)}>Rotate all</button></div>
            {message && <p className="pdf-export-error" role="alert">{message}</p>}
            <div className="organize-grid" role="list" aria-label="Document pages">
                {operations.pages.map((page, index) => <OrganizePageCard key={page.id} page={page} pageNumber={index + 1} selected={selectedIds.includes(page.id)} operations={operations} />)}
            </div>
            {deleteOpen && <Modal title="Delete selected pages" onClose={() => setDeleteOpen(false)}><p>Delete {selectedIds.length} selected page{selectedIds.length === 1 ? '' : 's'}? Their annotations are hidden from the document and will return if you undo this page operation.</p><div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button type="button" onClick={confirmDelete}>Delete pages</Button></div></Modal>}
        </section>
    );
}

function OrganizePageCard({ page, pageNumber, selected, operations }: { page: WorkingPage; pageNumber: number; selected: boolean; operations: ReturnType<typeof usePdfPageOperations> }) {
    const [dropTarget, setDropTarget] = useState(false);
    const selectPage = (pageId: PageId, event: React.MouseEvent<HTMLButtonElement>) => {
        operations.select(pageId, event.shiftKey ? 'range' : event.metaKey || event.ctrlKey ? 'toggle' : 'replace');
    };
    const dragOver = (event: DragEvent<HTMLElement>) => { event.preventDefault(); setDropTarget(true); };
    const drop = (event: DragEvent<HTMLElement>) => { event.preventDefault(); setDropTarget(false); operations.reorder(page.id, event.clientY - event.currentTarget.getBoundingClientRect().top > event.currentTarget.getBoundingClientRect().height / 2 ? 'after' : 'before'); };
    return <article className={`organize-page-card${selected ? ' is-selected' : ''}${dropTarget ? ' is-drop-target' : ''}`} role="listitem" draggable onDragStart={() => { if (!selected) operations.select(page.id, 'replace'); }} onDragOver={dragOver} onDragLeave={() => setDropTarget(false)} onDrop={drop}>
        <label className="page-select"><input type="checkbox" checked={selected} onChange={() => operations.select(page.id, 'toggle')} aria-label={`Select page ${pageNumber}`} /><span>Page {pageNumber}</span></label>
        <PdfThumbnail page={page} pageNumber={pageNumber} active={operations.activePageId === page.id} rotation={0} getPage={operations.getPage} onSelect={selectPage} />
        <footer><span>{page.rotation ? `${page.rotation} degrees` : '0 degrees'}</span><span aria-hidden="true">Drag to reorder</span></footer>
    </article>;
}

import { useRef, useState, type DragEvent, type MouseEvent, type PointerEvent } from 'react';
import { GripVertical, RotateCw, Copy, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { PdfAnnotation } from '../../editor/types/annotations';
import type { PageId, WorkingPage } from '../types/pages';
import { PdfThumbnail } from '../../viewer/PdfThumbnail';

type Props = {
    pages: WorkingPage[]; activePageId: PageId | null; selectedPageIds?: PageId[];
    getPage: (page: WorkingPage) => Promise<PDFPageProxy>;
    onSelect: (pageId: PageId, mode: 'replace' | 'toggle' | 'range') => void;
    onReorder?: (movingIds: PageId[], targetId: PageId, placement: 'before' | 'after') => void;
    onRotate?: (pageId: PageId) => void; onDuplicate?: (pageId: PageId) => void; onDelete?: (pageId: PageId) => void;
    selectionEnabled?: boolean; reorderEnabled?: boolean; label?: string; layout?: 'strip' | 'grid';
    annotationsByPageId?: Record<string, PdfAnnotation[]>;
    previewAnnotation?: PdfAnnotation | null;
    formValues?: Record<string, string | boolean | string[]>;
};

export function PageThumbnailPanel({ pages, activePageId, selectedPageIds = [], getPage, onSelect, onReorder, onRotate, onDuplicate, onDelete, selectionEnabled = false, reorderEnabled = false, label = 'Document pages', layout = 'strip', annotationsByPageId, previewAnnotation, formValues }: Props) {
    const dragging = useRef<PageId | null>(null);
    const [drop, setDrop] = useState<{ id: PageId; placement: 'before' | 'after' } | null>(null);
    const choose = (id: PageId, event: MouseEvent<HTMLButtonElement>) => onSelect(id, event.shiftKey ? 'range' : event.ctrlKey || event.metaKey ? 'toggle' : 'replace');
    const placementFor = (element: HTMLElement, x: number, y: number) => layout === 'strip' ? x > element.getBoundingClientRect().left + element.clientWidth / 2 ? 'after' : 'before' : y > element.getBoundingClientRect().top + element.clientHeight / 2 ? 'after' : 'before';
    const finish = (targetId: PageId, placement: 'before' | 'after') => { if (dragging.current && dragging.current !== targetId) onReorder?.([dragging.current], targetId, placement); dragging.current = null; setDrop(null); };
    const cancelDrag = () => { dragging.current = null; setDrop(null); };
    const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
        if (!dragging.current) return;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-page-id]');
        if (target?.dataset.pageId) setDrop({ id: target.dataset.pageId, placement: placementFor(target, event.clientX, event.clientY) });
    };
    return <div className={`page-thumbnail-panel page-thumbnail-panel--${layout}`} role="list" aria-label={label}>
        {pages.map((page, index) => {
            const selected = selectedPageIds.includes(page.id); const target = drop?.id === page.id ? ` is-drop-${drop.placement}` : '';
            return <article key={page.id} data-page-id={page.id} className={`shared-page-thumbnail${selected ? ' is-selected' : ''}${target}`} role="listitem" draggable={reorderEnabled}
                onDragStart={() => { dragging.current = page.id; }} onDragEnd={cancelDrag} onDragOver={(event: DragEvent<HTMLElement>) => { if (!reorderEnabled) return; event.preventDefault(); setDrop({ id: page.id, placement: placementFor(event.currentTarget, event.clientX, event.clientY) }); }} onDrop={(event) => { event.preventDefault(); finish(page.id, drop?.placement ?? 'before'); }}>
                {reorderEnabled && <button className="page-drag-handle" type="button" aria-label={`Drag page ${index + 1}`} title="Drag to reorder" onPointerDown={(event) => { if (event.pointerType === 'touch' && !event.isPrimary) return; event.preventDefault(); dragging.current = page.id; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={pointerMove} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); if (drop) finish(drop.id, drop.placement); else cancelDrag(); }} onPointerCancel={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); cancelDrag(); }}><GripVertical size={18} /></button>}
                {selectionEnabled && <input type="checkbox" checked={selected} onChange={() => onSelect(page.id, 'toggle')} aria-label={`Select page ${index + 1}`} />}
                <PdfThumbnail page={page} pageNumber={index + 1} active={activePageId === page.id} rotation={0} getPage={getPage} onSelect={choose} annotations={annotationsByPageId?.[page.id]} previewAnnotation={previewAnnotation?.pageId === page.id ? previewAnnotation : null} formValues={formValues} />
                <div className="page-thumbnail-actions">
                    {reorderEnabled && <><button type="button" disabled={index === 0} onClick={() => onReorder?.([page.id], pages[index - 1].id, 'before')} aria-label={`Move page ${index + 1} left`}><ArrowLeft size={14} /></button><button type="button" disabled={index === pages.length - 1} onClick={() => onReorder?.([page.id], pages[index + 1].id, 'after')} aria-label={`Move page ${index + 1} right`}><ArrowRight size={14} /></button></>}
                    {onRotate && <button type="button" onClick={() => onRotate(page.id)} aria-label={`Rotate page ${index + 1}`}><RotateCw size={14} /></button>}
                    {onDuplicate && <button type="button" onClick={() => onDuplicate(page.id)} aria-label={`Duplicate page ${index + 1}`}><Copy size={14} /></button>}
                    {onDelete && <button type="button" onClick={() => onDelete(page.id)} aria-label={`Delete page ${index + 1}`}><Trash2 size={14} /></button>}
                </div>
            </article>;
        })}
    </div>;
}

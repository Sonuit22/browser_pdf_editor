import { memo, useEffect, useState } from 'react';
import { ChevronDown, FileText, RotateCcw, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { usePdfEditor } from '../modules/pdf/editor/hooks/usePdfEditor';
import { usePdfPageOperations } from '../modules/pdf/organization/hooks/usePdfPageOperations';
import { workspaceRoutes } from '../config/navigation';
import type { PdfAnnotation } from '../modules/pdf/editor/types/annotations';
import { useShell } from '../contexts/ShellContext';

export const RightPanel = memo(function RightPanel() {
    const [open, setOpen] = useState(true);
    const { pathname } = useLocation();
    const { info, phase, progress, openFilePicker, closeDocument } = usePdfEngine();
    const { pages, activePageId } = usePdfPageOperations();
    const editor = usePdfEditor();
    const { resetToolWorkspace } = useShell();
    const selected = Object.values(editor.annotationsByPageId).flat().find((item) => item.id === editor.selectedId);
    useEffect(() => { if (selected) setOpen(true); }, [selected]);
    const route = workspaceRoutes[pathname];
    const currentPage = Math.max(1, pages.findIndex((page) => page.id === activePageId) + 1);
    const update = (patch: Partial<PdfAnnotation>) => { if (selected) editor.update(selected.id, patch); };
    return <aside className={`right-panel document-details${open ? ' is-open' : ''}${selected ? ' has-selection' : ''}`} aria-label="Document details">
        <button className="details-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span>Document details</span><ChevronDown size={18} /></button>
        {open && <div className="document-details__body">
            <div className="details-file-icon"><FileText size={28} /></div>
            <dl>
                <div><dt>Selected tool</dt><dd>{route?.title ?? 'PDF tool'}</dd></div>
                <div><dt>Status</dt><dd>{phase === 'ready' ? 'Ready' : phase === 'loading' ? `Loading ${progress}%` : 'Waiting for file'}</dd></div>
                {info && <><div><dt>File name</dt><dd title={info.filename}>{info.filename}</dd></div><div><dt>File size</dt><dd>{info.fileSize}</dd></div><div><dt>Pages</dt><dd>{info.pageCount}</dd></div><div><dt>Type</dt><dd>PDF</dd></div>{pathname === '/edit' && <div><dt>Current page</dt><dd>{currentPage} of {pages.length}</dd></div>}</>}
            </dl>
            {info && <div className="details-actions"><button type="button" onClick={openFilePicker}><RotateCcw size={16} />Replace file</button><button type="button" onClick={closeDocument}><Trash2 size={16} />Remove file</button><button type="button" onClick={resetToolWorkspace}>Clear workspace</button></div>}
            {selected && <section className="selected-properties"><h3>Selected {selected.type.replace('-', ' ')}</h3>
                <label>Opacity<input type="range" min="0.1" max="1" step=".05" value={selected.opacity} onChange={(event) => update({ opacity: Number(event.target.value) })} /></label>
                <label>Rotation <output>{Math.round(selected.rotation)}°</output><input type="range" min="-180" max="180" value={selected.rotation} onChange={(event) => update({ rotation: Number(event.target.value) || 0 })} /></label>
                {selected.type === 'text' && <><label>Text<textarea rows={4} value={selected.text} onChange={(event) => update({ text: event.target.value })} /></label><label>Font<select value={selected.fontFamily} onChange={(event) => update({ fontFamily: event.target.value as typeof selected.fontFamily })}><option value="Helvetica">Arial / Helvetica</option><option value="Times-Roman">Times New Roman / Georgia</option><option value="Courier">Courier New</option></select></label><label>Font size<input type="number" min="6" max="96" value={selected.fontSize} onChange={(event) => update({ fontSize: Number(event.target.value) })} /></label><div className="inline-options"><label><input type="checkbox" checked={selected.bold} onChange={(event) => update({ bold: event.target.checked })} />Bold</label><label><input type="checkbox" checked={selected.italic} onChange={(event) => update({ italic: event.target.checked })} />Italic</label><label><input type="checkbox" checked={selected.underline} onChange={(event) => update({ underline: event.target.checked })} />Underline</label></div><label>Alignment<select value={selected.align} onChange={(event) => update({ align: event.target.value as typeof selected.align })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label><label>Line height<input type="number" min="1" max="3" step=".1" value={selected.lineHeight} onChange={(event) => update({ lineHeight: Number(event.target.value) })} /></label><label>Text color<input type="color" value={selected.color} onChange={(event) => update({ color: event.target.value })} /></label><label>Background<input type="color" value={selected.backgroundColor} onChange={(event) => update({ backgroundColor: event.target.value })} /></label><label>Background opacity<input type="range" min="0" max="1" step=".05" value={selected.backgroundOpacity} onChange={(event) => update({ backgroundOpacity: Number(event.target.value) })} /></label><label>Border color<input type="color" value={selected.borderColor} onChange={(event) => update({ borderColor: event.target.value })} /></label><label>Border width<input type="number" min="0" max="12" value={selected.borderWidth} onChange={(event) => update({ borderWidth: Number(event.target.value) })} /></label><label>Padding<input type="number" min="0" max="40" value={selected.padding} onChange={(event) => update({ padding: Number(event.target.value) })} /></label></>}
                {!['draw', 'highlight', 'form-checkbox'].includes(selected.type) && <div className="property-dimensions"><label>Width<input type="number" min="20" value={Math.round(selected.width)} onChange={(event) => update({ width: Number(event.target.value) })} /></label><label>Height<input type="number" min="20" value={Math.round(selected.height)} onChange={(event) => update({ height: Number(event.target.value) })} /></label></div>}
                {selected.type === 'signature' && <p className="property-note">Signature type: {selected.signatureKind}. Stored only for this editing session.</p>}
                {['rectangle', 'rounded-rectangle', 'ellipse', 'line', 'arrow', 'triangle'].includes(selected.type) && <><label>Stroke<input type="color" value={selected.strokeColor} onChange={(event) => update({ strokeColor: event.target.value })} /></label><label>Border width<input type="range" min="1" max="12" value={selected.strokeWidth} onChange={(event) => update({ strokeWidth: Number(event.target.value) })} /></label><label>Fill<input type="color" value={selected.fillColor === 'transparent' ? '#ffffff' : selected.fillColor} onChange={(event) => update({ fillColor: event.target.value })} /></label><label><input type="checkbox" checked={selected.fillColor === 'transparent'} onChange={(event) => update({ fillColor: event.target.checked ? 'transparent' : '#ffffff' })} />No fill</label></>}
                {selected.type === 'draw' && <><label>Stroke color<input type="color" value={selected.color} onChange={(event) => update({ color: event.target.value })} /></label><label>Stroke width<input type="range" min="1" max="20" value={selected.strokeWidth} onChange={(event) => update({ strokeWidth: Number(event.target.value) })} /></label></>}
                <div className="details-actions"><button type="button" onClick={() => editor.reorder(selected.id, 'forward')}>Bring forward</button><button type="button" onClick={() => editor.reorder(selected.id, 'backward')}>Send backward</button><button type="button" onClick={() => editor.duplicate(selected.id)}>Duplicate</button><button type="button" onClick={() => editor.remove(selected.id)}>Delete</button></div>
            </section>}
        </div>}
    </aside>;
});

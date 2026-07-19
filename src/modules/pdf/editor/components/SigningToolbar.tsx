import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react';
import { CalendarDays, Check, PenTool, Type, Upload, UserRoundPen } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { createAnnotationId } from '../utils/annotationUtils';
import type { SignatureAnnotation, TextAnnotation } from '../types/annotations';
import { EditorToolbar } from './EditorToolbar';
import { notify } from '../../../../components/feedback/notifications';
import { readBrowserImage } from '../../../../utils/imageFiles';

export function SigningToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const editor = usePdfEditor(); const { activePage } = usePdfPageOperations();
    const [modalKind, setModalKind] = useState<'signature' | 'initials' | null>(null);
    const addText = (text: string, width = 130) => {
        if (!activePage) return; const now = Date.now();
        const annotation: TextAnnotation = { id: createAnnotationId(), pageId: activePage.id, type: 'text', text, x: (activePage.width - width) / 2, y: activePage.height / 2, width, height: 42, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: now, updatedAt: now, fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111111', backgroundColor: '#ffffff', backgroundOpacity: 0, borderColor: '#178a49', borderWidth: 0, padding: 5, lineHeight: 1.2, letterSpacing: 0, align: 'center' };
        editor.add(annotation); editor.setTool('select');
    };
    return <><div className="signing-actions" role="toolbar" aria-label="Signing tools">
        <button type="button" onClick={() => setModalKind('signature')}><PenTool size={17} />Add Signature</button>
        <button type="button" onClick={() => setModalKind('initials')}><UserRoundPen size={17} />Add Initials</button>
        <button type="button" onClick={() => addText(new Date().toLocaleDateString())}><CalendarDays size={17} />Add Date</button>
        <button type="button" onClick={() => addText('✓', 58)}><Check size={17} />Add Checkmark</button>
    </div><EditorToolbar onExport={onExport} exporting={exporting} />
    {modalKind && <SignatureModal kind={modalKind} onClose={() => setModalKind(null)} onInsert={(source, signatureKind, aspectRatio) => {
        if (!activePage) return; const width = Math.min(220, activePage.width * .45); const now = Date.now();
        const annotation: SignatureAnnotation = { id: createAnnotationId(), pageId: activePage.id, type: 'signature', source, signatureKind, aspectRatio, x: (activePage.width - width) / 2, y: (activePage.height - width / aspectRatio) / 2, width, height: width / aspectRatio, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: now, updatedAt: now };
        editor.add(annotation); editor.setTool('select'); setModalKind(null);
    }} />}</>;
}

function SignatureModal({ kind, onClose, onInsert }: { kind: 'signature' | 'initials'; onClose: () => void; onInsert: (source: string, type: SignatureAnnotation['signatureKind'], aspectRatio: number) => void }) {
    const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw'); const [name, setName] = useState(''); const [uploaded, setUploaded] = useState<{ source: string; aspectRatio: number } | null>(null); const [uploadBusy, setUploadBusy] = useState(false);
    const canvas = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const fileInput = useRef<HTMLInputElement>(null); const inserted = useRef(false);
    const point = (event: PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width), y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height) }; };
    const begin = (event: PointerEvent<HTMLCanvasElement>) => { if (event.pointerType === 'touch' && !event.isPrimary) return; event.preventDefault(); drawing.current = true; const p = point(event); const context = event.currentTarget.getContext('2d'); context?.beginPath(); context?.moveTo(p.x, p.y); event.currentTarget.setPointerCapture(event.pointerId); };
    const move = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawing.current || (event.pointerType === 'touch' && !event.isPrimary)) return; event.preventDefault(); const p = point(event); const context = event.currentTarget.getContext('2d'); if (context) { context.strokeStyle = '#111111'; context.lineWidth = 3; context.lineCap = 'round'; context.lineJoin = 'round'; context.lineTo(p.x, p.y); context.stroke(); } };
    const upload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file || uploadBusy) return;
        setUploadBusy(true);
        setUploaded(null);
        try {
            const image = await readBrowserImage(file);
            setUploaded({ source: image.data, aspectRatio: image.width / image.height });
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The signature image could not be loaded.', 'error');
        } finally {
            setUploadBusy(false);
        }
    };
    const insert = () => {
        if (inserted.current) return;
        if (tab === 'draw' && canvas.current) {
            inserted.current = true;
            onInsert(canvas.current.toDataURL('image/png'), 'drawn', canvas.current.width / canvas.current.height);
        }
        if (tab === 'type' && name.trim()) {
            const output = document.createElement('canvas'); output.width = 560; output.height = 160;
            try {
                const context = output.getContext('2d'); if (!context) return;
                context.font = kind === 'initials' ? 'bold italic 84px Georgia' : 'italic 72px Georgia'; context.fillStyle = '#111111'; context.textAlign = 'center'; context.fillText(name.trim(), 280, 105);
                inserted.current = true;
                onInsert(output.toDataURL('image/png'), 'typed', 3.5);
            } finally {
                output.width = 0;
                output.height = 0;
            }
        }
        if (tab === 'upload' && uploaded) {
            inserted.current = true;
            onInsert(uploaded.source, 'uploaded', uploaded.aspectRatio);
        }
    };
    return <Modal title={`Add ${kind === 'signature' ? 'Signature' : 'Initials'}`} onClose={onClose}><div className="signature-tabs">{(['draw', 'type', 'upload'] as const).map((value) => <button type="button" key={value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)}>{value === 'draw' ? <PenTool size={16} /> : value === 'type' ? <Type size={16} /> : <Upload size={16} />}{value}</button>)}</div>
        {tab === 'draw' && <><canvas ref={canvas} className="signature-canvas" width="560" height="180" onPointerDown={begin} onPointerMove={move} onPointerUp={(event) => { drawing.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drawing.current = false; }} /><button type="button" onClick={() => canvas.current?.getContext('2d')?.clearRect(0, 0, 560, 180)}>Clear and redraw</button></>}
        {tab === 'type' && <label>{kind === 'signature' ? 'Signer name' : 'Initials'}<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>}
        {tab === 'upload' && <><input ref={fileInput} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp" disabled={uploadBusy} onChange={(event) => void upload(event)} /><Button type="button" variant="secondary" disabled={uploadBusy} onClick={() => fileInput.current?.click()}>{uploadBusy ? 'Loading…' : 'Choose image'}</Button>{uploaded && <img className="signature-preview" src={uploaded.source} alt="Signature preview" />}</>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" onClick={insert} disabled={uploadBusy || (tab === 'type' ? !name.trim() : tab === 'upload' ? !uploaded : false)}>Insert {kind}</Button></div>
    </Modal>;
}

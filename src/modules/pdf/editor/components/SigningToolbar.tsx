import { useRef, useState, type ChangeEvent } from 'react';
import { CalendarDays, Check, PenTool, Type, Upload, UserRoundPen } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { createAnnotationId } from '../utils/annotationUtils';
import type { SignatureAnnotation } from '../types/annotations';
import { EditorToolbar } from './EditorToolbar';
import { notify } from '../../../../components/feedback/notifications';
import { readBrowserImage } from '../../../../utils/imageFiles';

export function SigningToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const editor = usePdfEditor(); const { activePage } = usePdfPageOperations();
    const [modalKind, setModalKind] = useState<'signature' | 'initials' | null>(null);
    const addSigningObject = (source: string, signatureKind: SignatureAnnotation['signatureKind'], aspectRatio: number, preferredWidth: number) => {
        if (!activePage) return;
        const width = Math.min(preferredWidth, activePage.width * .45);
        const height = width / aspectRatio;
        const now = Date.now();
        const annotation: SignatureAnnotation = { id: createAnnotationId(), pageId: activePage.id, type: 'signature', source, signatureKind, aspectRatio, x: Math.max(0, (activePage.width - width) / 2), y: Math.max(0, (activePage.height - height) / 2), width, height, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: now, updatedAt: now };
        editor.add(annotation); editor.setTool('select');
    };
    const addDate = () => {
        try {
            const visual = renderSigningObject(new Date().toLocaleDateString(), { width: 560, height: 160, font: '600 64px Arial, sans-serif' });
            addSigningObject(visual.source, 'date', visual.aspectRatio, 150);
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The date could not be created.', 'error');
        }
    };
    const addCheckmark = () => {
        try {
            const visual = renderSigningObject('✓', { width: 180, height: 180, font: '700 132px Arial, sans-serif' });
            addSigningObject(visual.source, 'checkmark', visual.aspectRatio, 52);
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The checkmark could not be created.', 'error');
        }
    };
    return <><div className="signing-actions" role="toolbar" aria-label="Signing tools">
        <button type="button" onClick={() => setModalKind('signature')}><PenTool size={17} />Add Signature</button>
        <button type="button" onClick={() => setModalKind('initials')}><UserRoundPen size={17} />Add Initials</button>
        <button type="button" onClick={addDate}><CalendarDays size={17} />Add Date</button>
        <button type="button" onClick={addCheckmark}><Check size={17} />Add Checkmark</button>
    </div><EditorToolbar onExport={onExport} exporting={exporting} />
    {modalKind && <SignatureModal kind={modalKind} onClose={() => setModalKind(null)} onFreeDraw={() => {
        editor.setTool('draw');
        setModalKind(null);
    }} onInsert={(source, signatureKind, aspectRatio) => {
        addSigningObject(source, signatureKind, aspectRatio, 220);
        setModalKind(null);
    }} />}</>;
}

function renderSigningObject(text: string, options: { width: number; height: number; font: string }) {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    try {
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser could not create the signing object.');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#111111';
        context.font = options.font;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        return { source: canvas.toDataURL('image/png'), aspectRatio: canvas.width / canvas.height };
    } finally {
        canvas.width = 0;
        canvas.height = 0;
    }
}

function SignatureModal({ kind, onClose, onFreeDraw, onInsert }: { kind: 'signature' | 'initials'; onClose: () => void; onFreeDraw: () => void; onInsert: (source: string, type: SignatureAnnotation['signatureKind'], aspectRatio: number) => void }) {
    const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw'); const [name, setName] = useState(''); const [uploaded, setUploaded] = useState<{ source: string; aspectRatio: number } | null>(null); const [uploadBusy, setUploadBusy] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null); const inserted = useRef(false);
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
        {tab === 'draw' && <div className="signature-free-draw"><PenTool size={28} aria-hidden="true" /><p>Draw directly anywhere on the visible PDF page. Lift your pointer to finish each stroke.</p></div>}
        {tab === 'type' && <label>{kind === 'signature' ? 'Signer name' : 'Initials'}<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>}
        {tab === 'upload' && <><input ref={fileInput} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp" disabled={uploadBusy} onChange={(event) => void upload(event)} /><Button type="button" variant="secondary" disabled={uploadBusy} onClick={() => fileInput.current?.click()}>{uploadBusy ? 'Loading…' : 'Choose image'}</Button>{uploaded && <img className="signature-preview" src={uploaded.source} alt="Signature preview" />}</>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" onClick={tab === 'draw' ? onFreeDraw : insert} disabled={uploadBusy || (tab === 'type' ? !name.trim() : tab === 'upload' ? !uploaded : false)}>{tab === 'draw' ? 'Draw on PDF' : `Insert ${kind}`}</Button></div>
    </Modal>;
}

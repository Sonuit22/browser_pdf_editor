import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react';
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
import { formatSigningDate, renderSigningVisual } from '../utils/signingVisual';

export function SigningToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const editor = usePdfEditor(); const { activePage } = usePdfPageOperations();
    const [modalKind, setModalKind] = useState<'signature' | 'initials' | null>(null);
    const addSigningObject = (source: string, signatureKind: SignatureAnnotation['signatureKind'], aspectRatio: number, preferredWidth: number, metadata: Pick<SignatureAnnotation, 'dateValue'> = {}) => {
        if (!activePage) return;
        const width = Math.min(preferredWidth, activePage.width * .45);
        const height = width / aspectRatio;
        const now = Date.now();
        const annotation: SignatureAnnotation = { id: createAnnotationId(), pageId: activePage.id, type: 'signature', source, signatureKind, aspectRatio, ...metadata, x: Math.max(0, (activePage.width - width) / 2), y: Math.max(0, (activePage.height - height) / 2), width, height, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: now, updatedAt: now };
        editor.add(annotation); editor.setTool('select');
    };
    const addDate = () => {
        try {
            const dateValue = new Date().toISOString().slice(0, 10);
            const visual = renderSigningVisual(formatSigningDate(dateValue), { width: 560, height: 160, font: '600 64px Arial, sans-serif' });
            addSigningObject(visual.source, 'date', visual.aspectRatio, 150, { dateValue });
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The date could not be created.', 'error');
        }
    };
    const addCheckmark = () => {
        try {
            const visual = renderSigningVisual('✓', { width: 180, height: 180, font: '700 132px Arial, sans-serif' });
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
    {modalKind && <SignatureModal kind={modalKind} onClose={() => setModalKind(null)} onInsert={(source, signatureKind, aspectRatio) => {
        addSigningObject(source, signatureKind, aspectRatio, 220);
        setModalKind(null);
    }} />}</>;
}

function SignatureModal({ kind, onClose, onInsert }: { kind: 'signature' | 'initials'; onClose: () => void; onInsert: (source: string, type: SignatureAnnotation['signatureKind'], aspectRatio: number) => void }) {
    const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw'); const [name, setName] = useState(''); const [uploaded, setUploaded] = useState<{ source: string; aspectRatio: number } | null>(null); const [uploadBusy, setUploadBusy] = useState(false);
    const [drawingReady, setDrawingReady] = useState(false);
    const drawingPad = useRef<SignatureDrawingPadHandle>(null);
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
        if (tab === 'draw') {
            const output = drawingPad.current?.exportImage();
            if (!output) return;
            inserted.current = true;
            onInsert(output.source, 'drawn', output.aspectRatio);
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
    return <Modal className="signature-modal" title={`Add ${kind === 'signature' ? 'Signature' : 'Initials'}`} onClose={onClose}><div className="signature-tabs">{(['draw', 'type', 'upload'] as const).map((value) => <button type="button" key={value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)}>{value === 'draw' ? <PenTool size={16} /> : value === 'type' ? <Type size={16} /> : <Upload size={16} />}{value}</button>)}</div>
        {tab === 'draw' && <SignatureDrawingPad ref={drawingPad} onAvailabilityChange={setDrawingReady} />}
        {tab === 'type' && <label>{kind === 'signature' ? 'Signer name' : 'Initials'}<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>}
        {tab === 'upload' && <><input ref={fileInput} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp" disabled={uploadBusy} onChange={(event) => void upload(event)} /><Button type="button" variant="secondary" disabled={uploadBusy} onClick={() => fileInput.current?.click()}>{uploadBusy ? 'Loading…' : 'Choose image'}</Button>{uploaded && <img className="signature-preview" src={uploaded.source} alt="Signature preview" />}</>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" onClick={insert} disabled={uploadBusy || (tab === 'draw' ? !drawingReady : tab === 'type' ? !name.trim() : !uploaded)}>{tab === 'draw' ? `Apply ${kind}` : `Insert ${kind}`}</Button></div>
    </Modal>;
}

type SignaturePoint = { x: number; y: number };
type SignatureDrawingPadHandle = { exportImage: () => { source: string; aspectRatio: number } | null };

const SignatureDrawingPad = forwardRef<SignatureDrawingPadHandle, { onAvailabilityChange: (available: boolean) => void }>(function SignatureDrawingPad({ onAvailabilityChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<SignaturePoint[][]>([]);
    const activeStrokeRef = useRef<SignaturePoint[] | null>(null);
    const activePointerRef = useRef<number | null>(null);
    const frameRef = useRef(0);
    const pixelRatioRef = useRef(1);
    const [strokeCount, setStrokeCount] = useState(0);

    const draw = useCallback(() => {
        frameRef.current = 0;
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;
        const pixelRatio = pixelRatioRef.current;
        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, height);
        context.strokeStyle = '#111111';
        context.fillStyle = '#111111';
        context.lineWidth = 2.8;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        for (const stroke of strokesRef.current) {
            if (!stroke.length) continue;
            if (stroke.length === 1) {
                context.beginPath();
                context.arc(stroke[0].x * width, stroke[0].y * height, 1.4, 0, Math.PI * 2);
                context.fill();
                continue;
            }
            context.beginPath();
            context.moveTo(stroke[0].x * width, stroke[0].y * height);
            for (let index = 1; index < stroke.length; index += 1) context.lineTo(stroke[index].x * width, stroke[index].y * height);
            context.stroke();
        }
    }, []);

    const scheduleDraw = useCallback(() => {
        if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
    }, [draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
            const width = Math.max(1, Math.round(rect.width * pixelRatio));
            const height = Math.max(1, Math.round(rect.height * pixelRatio));
            pixelRatioRef.current = pixelRatio;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            draw();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        window.addEventListener('orientationchange', resize);
        resize();
        return () => {
            observer.disconnect();
            window.removeEventListener('orientationchange', resize);
            cancelAnimationFrame(frameRef.current);
        };
    }, [draw]);

    useEffect(() => onAvailabilityChange(strokeCount > 0), [onAvailabilityChange, strokeCount]);

    const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement> | globalThis.PointerEvent): SignaturePoint => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
            y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
        };
    };
    const appendPoint = (stroke: SignaturePoint[], point: SignaturePoint) => {
        const previous = stroke[stroke.length - 1];
        if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > .0005) stroke.push(point);
    };
    const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>, cancelled = false) => {
        if (activePointerRef.current !== event.pointerId) return;
        const canvas = event.currentTarget;
        if (!cancelled && activeStrokeRef.current) appendPoint(activeStrokeRef.current, pointFromEvent(event));
        if (cancelled && activeStrokeRef.current) strokesRef.current = strokesRef.current.filter((stroke) => stroke !== activeStrokeRef.current);
        activeStrokeRef.current = null;
        activePointerRef.current = null;
        try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch { /* Pointer capture may already be released. */ }
        setStrokeCount(strokesRef.current.length);
        scheduleDraw();
    };
    const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
        event.preventDefault();
        const stroke = [pointFromEvent(event)];
        strokesRef.current.push(stroke);
        activeStrokeRef.current = stroke;
        activePointerRef.current = event.pointerId;
        try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer may end before capture. */ }
        scheduleDraw();
    };
    const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (activePointerRef.current !== event.pointerId || !activeStrokeRef.current) return;
        event.preventDefault();
        const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
        for (const sample of samples) appendPoint(activeStrokeRef.current, pointFromEvent(sample));
        appendPoint(activeStrokeRef.current, pointFromEvent(event));
        scheduleDraw();
    };
    const clear = () => {
        strokesRef.current = [];
        activeStrokeRef.current = null;
        activePointerRef.current = null;
        setStrokeCount(0);
        draw();
    };
    const undoStroke = () => {
        strokesRef.current = strokesRef.current.slice(0, -1);
        setStrokeCount(strokesRef.current.length);
        draw();
    };

    useImperativeHandle(ref, () => ({
        exportImage: () => {
            const canvas = canvasRef.current;
            if (!canvas || !strokesRef.current.length) return null;
            draw();
            return { source: canvas.toDataURL('image/png'), aspectRatio: canvas.width / canvas.height };
        },
    }), [draw]);

    return <div className="signature-drawing-pad">
        <canvas ref={canvasRef} className="signature-canvas" aria-label="Signature drawing canvas" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishStroke} onPointerCancel={(event) => finishStroke(event, true)} onLostPointerCapture={(event) => { if (activePointerRef.current === event.pointerId) finishStroke(event); }} />
        <p className="signature-canvas-hint">Draw with a finger, stylus, or mouse. You can use multiple strokes before applying.</p>
        <div className="signature-drawing-actions"><Button type="button" variant="secondary" onClick={undoStroke} disabled={!strokeCount}>Undo stroke</Button><Button type="button" variant="secondary" onClick={clear} disabled={!strokeCount}>Clear</Button></div>
    </div>;
});

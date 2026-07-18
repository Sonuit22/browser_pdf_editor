import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PdfPageLayout } from '../../viewer/PdfPageCanvas';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { boundsFromPoints, createAnnotationId } from '../utils/annotationUtils';
import { clientPointToPdfPoint, pdfBoundsToViewport, pdfPointToViewport } from '../utils/coordinates';
import type { EditorTool, PdfAnnotation, Point } from '../types/annotations';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type Gesture = { mode: 'create' | 'move' | 'resize'; start: Point; annotation: PdfAnnotation; handle?: ResizeHandle };
const base = (pageId: string, type: PdfAnnotation['type'], point: Point): Omit<PdfAnnotation, 'type'> & { type: PdfAnnotation['type'] } => ({ id: createAnnotationId(), pageId, type, x: point.x, y: point.y, width: 2, height: 2, zIndex: Date.now(), opacity: type === 'highlight' ? .3 : .9, rotation: 0, strokeColor: '#178a49', strokeWidth: 2, fillColor: 'transparent', createdAt: Date.now(), updatedAt: Date.now() } as PdfAnnotation);

function createAnnotation(tool: EditorTool, pageId: string, point: Point): PdfAnnotation | null {
    if (tool === 'text') return { ...base(pageId, 'text', point), type: 'text', width: 180, height: 72, text: '', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111111', backgroundColor: '#ffffff', backgroundOpacity: 0, borderColor: '#178a49', borderWidth: 0, padding: 6, lineHeight: 1.3, letterSpacing: 0, align: 'left' };
    if (tool === 'highlight') return { ...base(pageId, 'highlight', point), type: 'highlight', color: '#ffe066', strokeWidth: 18, points: [point] };
    if (tool === 'draw') return { ...base(pageId, 'draw', point), type: 'draw', points: [point], color: '#0f6aa6' };
    if (['rectangle', 'rounded-rectangle', 'ellipse', 'line', 'arrow', 'triangle'].includes(tool)) return { ...base(pageId, tool as 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'line' | 'arrow' | 'triangle', point), type: tool as 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'line' | 'arrow' | 'triangle' };
    if (tool === 'stamp') return { ...base(pageId, 'stamp', point), type: 'stamp', width: 150, height: 52, text: 'APPROVED', color: '#16794c', opacity: .82 };
    if (tool === 'form-text') return { ...base(pageId, 'form-text', point), type: 'form-text', width: 180, height: 30, name: `text_${Date.now()}`, required: false, multiline: false, defaultValue: '' };
    if (tool === 'form-checkbox') return { ...base(pageId, 'form-checkbox', point), type: 'form-checkbox', width: 22, height: 22, name: `checkbox_${Date.now()}`, required: false, defaultValue: false };
    if (tool === 'form-signature') return { ...base(pageId, 'form-signature', point), type: 'form-signature', width: 180, height: 42, name: `signature_${Date.now()}`, required: false, defaultValue: '' };
    return null;
}

export function AnnotationOverlay({ pageId, layout }: { pageId: string; layout: PdfPageLayout }) {
    const { annotationsByPageId, activeTool, selectedIds, add, update, select, setTool, removeSelected, setFormValue, formValues } = usePdfEditor();
    const overlayRef = useRef<HTMLDivElement>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const frameRef = useRef(0);
    const pendingDraftRef = useRef<PdfAnnotation | null>(null);
    const [draft, setDraft] = useState<PdfAnnotation | null>(null);
    const annotations = annotationsByPageId[pageId] ?? [];
    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);
    useEffect(() => {
        const keydown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target?.matches('textarea,input,select')) return;
            if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length) { event.preventDefault(); removeSelected(); }
            if (event.key === 'Escape') { select(null); setTool('select'); }
        };
        window.addEventListener('keydown', keydown);
        return () => window.removeEventListener('keydown', keydown);
    }, [removeSelected, select, selectedIds.length, setTool]);

    const getPoint = (event: PointerEvent<HTMLDivElement>) => overlayRef.current ? clientPointToPdfPoint(event, overlayRef.current, layout.viewport) : { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const point = getPoint(event);
        const selected = (event.target as HTMLElement).closest<HTMLElement>('[data-annotation-id]')?.dataset.annotationId;
        const handle = (event.target as HTMLElement).dataset.resizeHandle as ResizeHandle | undefined;
        if (activeTool === 'select' && selected) {
            const annotation = annotations.find((item) => item.id === selected);
            if (annotation) { select(annotation.id, event.shiftKey); gestureRef.current = { mode: handle ? 'resize' : 'move', start: point, annotation, handle }; event.currentTarget.setPointerCapture(event.pointerId); }
            return;
        }
        if (activeTool === 'select') { if (!event.shiftKey) select(null); return; }
        const annotation = createAnnotation(activeTool, pageId, point);
        if (!annotation) return;
        if (annotation.type === 'text') { add(annotation); setTool('select'); return; }
        select(annotation.id); setDraft(annotation); gestureRef.current = { mode: 'create', start: point, annotation }; event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        const point = getPoint(event);
        const next = gesture.mode === 'resize'
            ? { ...gesture.annotation, ...resizeBounds(gesture.annotation, point.x - gesture.start.x, point.y - gesture.start.y, gesture.handle ?? 'se'), updatedAt: Date.now() }
            : (gesture.annotation.type === 'draw' || gesture.annotation.type === 'highlight') && gesture.mode === 'create'
            ? { ...gesture.annotation, points: [...gesture.annotation.points, point], updatedAt: Date.now() }
            : gesture.mode === 'move'
                ? gesture.annotation.type === 'draw' || gesture.annotation.type === 'highlight'
                    ? { ...gesture.annotation, points: gesture.annotation.points.map((item) => ({ x: item.x + point.x - gesture.start.x, y: item.y + point.y - gesture.start.y })), updatedAt: Date.now() }
                    : { ...gesture.annotation, x: gesture.annotation.x + point.x - gesture.start.x, y: gesture.annotation.y + point.y - gesture.start.y, updatedAt: Date.now() }
                : { ...gesture.annotation, ...boundsFromPoints(gesture.start, point), updatedAt: Date.now() };
        pendingDraftRef.current = next as PdfAnnotation;
        if (!frameRef.current) frameRef.current = requestAnimationFrame(() => { frameRef.current = 0; setDraft(pendingDraftRef.current); });
    };
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        const latestDraft = pendingDraftRef.current ?? draft;
        if (!gesture || !latestDraft) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (gesture.mode === 'create') add(latestDraft); else update(latestDraft.id, latestDraft);
        gestureRef.current = null; pendingDraftRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; setDraft(null);
    };
    const rendered = draft && !annotations.some((annotation) => annotation.id === draft.id) ? [...annotations, draft] : annotations.map((annotation) => annotation.id === draft?.id ? draft : annotation);
    return <div ref={overlayRef} className={`annotation-overlay annotation-overlay--${activeTool}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { gestureRef.current = null; setDraft(null); }}>{rendered.map((annotation) => <AnnotationItem key={annotation.id} annotation={annotation} viewport={layout.viewport} selected={selectedIds.includes(annotation.id)} onUpdate={(patch) => update(annotation.id, patch)} formValues={formValues} onFormValue={setFormValue} />)}</div>;
}

function AnnotationItem({ annotation, viewport, selected, onUpdate, formValues, onFormValue }: { annotation: PdfAnnotation; viewport: PdfPageLayout['viewport']; selected: boolean; onUpdate: (patch: Partial<PdfAnnotation>) => void; formValues: Record<string, string | boolean | string[]>; onFormValue: (name: string, value: string | boolean | string[]) => void }) {
    const box = pdfBoundsToViewport(annotation, viewport);
    const style = { left: box.left, top: box.top, width: box.width, height: box.height, opacity: annotation.opacity, zIndex: annotation.zIndex, transform: `rotate(${annotation.rotation}deg)` };
    const selectedClass = selected ? ' annotation-item--selected' : '';
    if (annotation.type === 'draw' || annotation.type === 'highlight') { const points = annotation.points.map((point) => { const output = pdfPointToViewport(point, viewport); return `${output.x},${output.y}`; }).join(' '); return <svg data-annotation-id={annotation.id} className={`annotation-item annotation-path${annotation.type === 'highlight' ? ' annotation-highlight-path' : ''}${selectedClass}`} style={{ ...style, left: 0, top: 0, width: '100%', height: '100%' }}><polyline points={points} fill="none" stroke={annotation.color} strokeOpacity={annotation.opacity} strokeWidth={annotation.strokeWidth * viewport.scale} strokeLinecap="round" strokeLinejoin="round" /></svg>; }
    if (annotation.type === 'text') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-text${selectedClass}`} style={{ ...style, padding: annotation.padding, border: `${annotation.borderWidth}px solid ${annotation.borderColor}`, background: hexWithOpacity(annotation.backgroundColor, annotation.backgroundOpacity) }}><EditableText annotation={annotation} scale={viewport.scale} onUpdate={onUpdate} />{selected && <ResizeHandles />}</div>;
    if (annotation.type === 'image' || annotation.type === 'signature') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-image-wrap${selectedClass}`} style={style}><img className="annotation-image" src={annotation.source} alt={annotation.type === 'signature' ? 'Visual signature' : 'Added annotation'} draggable={false} />{selected && <ResizeHandles />}</div>;
    if (annotation.type === 'stamp') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-stamp${selectedClass}`} style={{ ...style, color: annotation.color, borderColor: annotation.color }}>{annotation.text}</div>;
    if (annotation.type === 'form-text' || annotation.type === 'form-signature') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-form${selectedClass}`} style={style} aria-label={annotation.name} placeholder={annotation.type === 'form-signature' ? 'Signature' : annotation.name} value={String(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.value)} />;
    if (annotation.type === 'form-checkbox') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-checkbox${selectedClass}`} style={style} aria-label={annotation.name} type="checkbox" checked={Boolean(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.checked)} />;
    return <div data-annotation-id={annotation.id} className={`annotation-item annotation-shape-wrap${selectedClass}`} style={style}><svg className="annotation-shape" viewBox={`0 0 ${Math.max(2, box.width)} ${Math.max(2, box.height)}`}><Shape annotation={annotation} width={box.width} height={box.height} /></svg>{selected && <ResizeHandles />}</div>;
}

function ResizeHandles() { return <>{(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => <i key={handle} className={`resize-handle resize-handle--${handle}`} data-resize-handle={handle} aria-hidden="true" />)}</>; }
function EditableText({ annotation, scale, onUpdate }: { annotation: Extract<PdfAnnotation, { type: 'text' }>; scale: number; onUpdate: (patch: Partial<PdfAnnotation>) => void }) {
    const [value, setValue] = useState(annotation.text);
    useEffect(() => setValue(annotation.text), [annotation.text]);
    return <textarea autoFocus={!annotation.text} aria-label="Editable PDF text" value={value} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => setValue(event.target.value)} onBlur={(event) => onUpdate({ text: value, height: Math.max(annotation.height, event.currentTarget.scrollHeight / scale) })} onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.blur(); }} style={{ color: annotation.color, fontSize: annotation.fontSize * scale, fontFamily: annotation.fontFamily, fontWeight: annotation.bold ? 700 : 400, fontStyle: annotation.italic ? 'italic' : 'normal', textDecoration: annotation.underline ? 'underline' : 'none', textAlign: annotation.align, lineHeight: annotation.lineHeight, letterSpacing: annotation.letterSpacing }} />;
}
function resizeBounds(annotation: PdfAnnotation, dx: number, dy: number, handle: ResizeHandle) {
    let { x, y, width, height } = annotation;
    if (handle.includes('e')) width += dx;
    if (handle.includes('w')) { x += dx; width -= dx; }
    if (handle.includes('n')) height += dy;
    if (handle.includes('s')) { y += dy; height -= dy; }
    const minWidth = annotation.type === 'text' ? 80 : 20;
    const minHeight = annotation.type === 'text' ? 36 : 20;
    return { x, y, width: Math.max(minWidth, width), height: Math.max(minHeight, height) };
}
function hexWithOpacity(hex: string, opacity: number) {
    if (hex === 'transparent' || opacity === 0) return 'transparent';
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((part) => part + part).join('') : value;
    return `rgba(${Number.parseInt(full.slice(0, 2), 16)},${Number.parseInt(full.slice(2, 4), 16)},${Number.parseInt(full.slice(4, 6), 16)},${opacity})`;
}

function Shape({ annotation, width, height }: { annotation: Extract<PdfAnnotation, { type: 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'line' | 'arrow' | 'triangle' }>; width: number; height: number }) {
    const common = { stroke: annotation.strokeColor, strokeWidth: annotation.strokeWidth, fill: ['rectangle', 'rounded-rectangle', 'ellipse', 'triangle'].includes(annotation.type) ? annotation.fillColor : 'none' };
    if (annotation.type === 'ellipse') return <ellipse cx={width / 2} cy={height / 2} rx={Math.max(1, width / 2 - 1)} ry={Math.max(1, height / 2 - 1)} {...common} />;
    if (annotation.type === 'rectangle' || annotation.type === 'rounded-rectangle') return <rect x="1" y="1" rx={annotation.type === 'rounded-rectangle' ? 10 : 0} width={Math.max(1, width - 2)} height={Math.max(1, height - 2)} {...common} />;
    if (annotation.type === 'triangle') return <polygon points={`${width / 2},1 ${width - 1},${height - 1} 1,${height - 1}`} {...common} />;
    return <><line x1="1" y1={height - 1} x2={width - 1} y2="1" {...common} />{annotation.type === 'arrow' && <polygon points={`${width - 1},1 ${width - 10},3 ${width - 3},10`} fill={annotation.strokeColor} />}</>;
}

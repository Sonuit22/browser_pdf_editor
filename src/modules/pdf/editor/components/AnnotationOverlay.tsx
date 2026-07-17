import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PdfPageLayout } from '../../viewer/PdfPageCanvas';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { boundsFromPoints, createAnnotationId } from '../utils/annotationUtils';
import { clientPointToPdfPoint, pdfBoundsToViewport, pdfPointToViewport } from '../utils/coordinates';
import type { EditorTool, PdfAnnotation, Point } from '../types/annotations';

type Gesture = { mode: 'create' | 'move'; start: Point; annotation: PdfAnnotation };
const base = (pageId: string, type: PdfAnnotation['type'], point: Point): Omit<PdfAnnotation, 'type'> & { type: PdfAnnotation['type'] } => ({ id: createAnnotationId(), pageId, type, x: point.x, y: point.y, width: 2, height: 2, zIndex: Date.now(), opacity: .8, rotation: 0, strokeColor: '#0f6aa6', strokeWidth: 2, fillColor: '#f4cd55', createdAt: Date.now(), updatedAt: Date.now() } as PdfAnnotation);

function createAnnotation(tool: EditorTool, pageId: string, point: Point): PdfAnnotation | null {
    if (tool === 'text') return { ...base(pageId, 'text', point), type: 'text', width: 160, height: 36, text: 'Added text', fontSize: 16, fontFamily: 'Helvetica', bold: false, italic: false, color: '#172433', backgroundColor: 'transparent', align: 'left' };
    if (tool === 'highlight') return { ...base(pageId, 'highlight', point), type: 'highlight', color: '#ffe066' };
    if (tool === 'draw') return { ...base(pageId, 'draw', point), type: 'draw', points: [point], color: '#0f6aa6' };
    if (['rectangle', 'ellipse', 'line', 'arrow'].includes(tool)) return { ...base(pageId, tool as 'rectangle' | 'ellipse' | 'line' | 'arrow', point), type: tool as 'rectangle' | 'ellipse' | 'line' | 'arrow' };
    if (tool === 'stamp') return { ...base(pageId, 'stamp', point), type: 'stamp', width: 150, height: 52, text: 'APPROVED', color: '#16794c', opacity: .82 };
    if (tool === 'form-text') return { ...base(pageId, 'form-text', point), type: 'form-text', width: 180, height: 30, name: `text_${Date.now()}`, required: false, multiline: false, defaultValue: '' };
    if (tool === 'form-checkbox') return { ...base(pageId, 'form-checkbox', point), type: 'form-checkbox', width: 22, height: 22, name: `checkbox_${Date.now()}`, required: false, defaultValue: false };
    if (tool === 'form-signature') return { ...base(pageId, 'form-signature', point), type: 'form-signature', width: 180, height: 42, name: `signature_${Date.now()}`, required: false, defaultValue: '' };
    return null;
}

export function AnnotationOverlay({ pageId, layout }: { pageId: string; layout: PdfPageLayout }) {
    const { annotationsByPageId, activeTool, selectedIds, add, update, select, setFormValue, formValues } = usePdfEditor();
    const overlayRef = useRef<HTMLDivElement>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const frameRef = useRef(0);
    const pendingDraftRef = useRef<PdfAnnotation | null>(null);
    const [draft, setDraft] = useState<PdfAnnotation | null>(null);
    const annotations = annotationsByPageId[pageId] ?? [];
    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const getPoint = (event: PointerEvent<HTMLDivElement>) => overlayRef.current ? clientPointToPdfPoint(event, overlayRef.current, layout.viewport) : { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const point = getPoint(event);
        const selected = (event.target as HTMLElement).closest<HTMLElement>('[data-annotation-id]')?.dataset.annotationId;
        if (activeTool === 'select' && selected) {
            const annotation = annotations.find((item) => item.id === selected);
            if (annotation) { select(annotation.id, event.shiftKey); gestureRef.current = { mode: 'move', start: point, annotation }; event.currentTarget.setPointerCapture(event.pointerId); }
            return;
        }
        if (activeTool === 'select') { if (!event.shiftKey) select(null); return; }
        const annotation = createAnnotation(activeTool, pageId, point);
        if (!annotation) return;
        if (annotation.type === 'text') { add(annotation); return; }
        select(annotation.id); setDraft(annotation); gestureRef.current = { mode: 'create', start: point, annotation }; event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        const point = getPoint(event);
        const next = gesture.annotation.type === 'draw'
            ? { ...gesture.annotation, points: [...gesture.annotation.points, point], updatedAt: Date.now() }
            : gesture.mode === 'move'
                ? { ...gesture.annotation, x: gesture.annotation.x + point.x - gesture.start.x, y: gesture.annotation.y + point.y - gesture.start.y, updatedAt: Date.now() }
                : { ...gesture.annotation, ...boundsFromPoints(gesture.start, point), updatedAt: Date.now() };
        pendingDraftRef.current = next as PdfAnnotation;
        if (!frameRef.current) frameRef.current = requestAnimationFrame(() => { frameRef.current = 0; setDraft(pendingDraftRef.current); });
    };
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        const latestDraft = pendingDraftRef.current ?? draft;
        if (!gesture || !latestDraft) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (gesture.mode === 'move') update(latestDraft.id, { x: latestDraft.x, y: latestDraft.y, width: latestDraft.width, height: latestDraft.height }); else add(latestDraft);
        gestureRef.current = null; pendingDraftRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; setDraft(null);
    };
    const rendered = draft && !annotations.some((annotation) => annotation.id === draft.id) ? [...annotations, draft] : annotations.map((annotation) => annotation.id === draft?.id ? draft : annotation);
    return <div ref={overlayRef} className={`annotation-overlay annotation-overlay--${activeTool}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { gestureRef.current = null; setDraft(null); }}>{rendered.map((annotation) => <AnnotationItem key={annotation.id} annotation={annotation} viewport={layout.viewport} selected={selectedIds.includes(annotation.id)} formValues={formValues} onFormValue={setFormValue} />)}</div>;
}

function AnnotationItem({ annotation, viewport, selected, formValues, onFormValue }: { annotation: PdfAnnotation; viewport: PdfPageLayout['viewport']; selected: boolean; formValues: Record<string, string | boolean | string[]>; onFormValue: (name: string, value: string | boolean | string[]) => void }) {
    const box = pdfBoundsToViewport(annotation, viewport);
    const style = { left: box.left, top: box.top, width: box.width, height: box.height, opacity: annotation.opacity, zIndex: annotation.zIndex, transform: `rotate(${annotation.rotation}deg)` };
    const selectedClass = selected ? ' annotation-item--selected' : '';
    if (annotation.type === 'draw') { const points = annotation.points.map((point) => { const output = pdfPointToViewport(point, viewport); return `${output.x},${output.y}`; }).join(' '); return <svg data-annotation-id={annotation.id} className={`annotation-item annotation-path${selectedClass}`} style={{ ...style, left: 0, top: 0, width: '100%', height: '100%' }}><polyline points={points} fill="none" stroke={annotation.color} strokeWidth={annotation.strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></svg>; }
    if (annotation.type === 'text') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-text${selectedClass}`} style={{ ...style, color: annotation.color, fontSize: annotation.fontSize, fontFamily: annotation.fontFamily, fontWeight: annotation.bold ? 700 : 400, fontStyle: annotation.italic ? 'italic' : 'normal', textAlign: annotation.align, background: annotation.backgroundColor }}>{annotation.text}</div>;
    if (annotation.type === 'image' || annotation.type === 'signature') return <img data-annotation-id={annotation.id} className={`annotation-item annotation-image${selectedClass}`} style={style} src={annotation.source} alt={annotation.type === 'signature' ? 'Visual signature' : 'Added annotation'} draggable={false} />;
    if (annotation.type === 'stamp') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-stamp${selectedClass}`} style={{ ...style, color: annotation.color, borderColor: annotation.color }}>{annotation.text}</div>;
    if (annotation.type === 'form-text' || annotation.type === 'form-signature') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-form${selectedClass}`} style={style} aria-label={annotation.name} placeholder={annotation.type === 'form-signature' ? 'Signature' : annotation.name} value={String(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.value)} />;
    if (annotation.type === 'form-checkbox') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-checkbox${selectedClass}`} style={style} aria-label={annotation.name} type="checkbox" checked={Boolean(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.checked)} />;
    if (annotation.type === 'highlight') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-highlight${selectedClass}`} style={{ ...style, background: annotation.color }} />;
    return <svg data-annotation-id={annotation.id} className={`annotation-item annotation-shape${selectedClass}`} style={style} viewBox={`0 0 ${Math.max(2, box.width)} ${Math.max(2, box.height)}`}><Shape annotation={annotation} width={box.width} height={box.height} /></svg>;
}

function Shape({ annotation, width, height }: { annotation: Extract<PdfAnnotation, { type: 'rectangle' | 'ellipse' | 'line' | 'arrow' }>; width: number; height: number }) {
    const common = { stroke: annotation.strokeColor, strokeWidth: annotation.strokeWidth, fill: annotation.type === 'rectangle' || annotation.type === 'ellipse' ? annotation.fillColor : 'none' };
    if (annotation.type === 'ellipse') return <ellipse cx={width / 2} cy={height / 2} rx={Math.max(1, width / 2 - 1)} ry={Math.max(1, height / 2 - 1)} {...common} />;
    if (annotation.type === 'rectangle') return <rect x="1" y="1" width={Math.max(1, width - 2)} height={Math.max(1, height - 2)} {...common} />;
    return <><line x1="1" y1={height - 1} x2={width - 1} y2="1" {...common} />{annotation.type === 'arrow' && <polygon points={`${width - 1},1 ${width - 10},3 ${width - 3},10`} fill={annotation.strokeColor} />}</>;
}

import { useRef, useState, type PointerEvent } from 'react';
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
    return null;
}

export function AnnotationOverlay({ pageId, layout }: { pageId: string; layout: PdfPageLayout }) {
    const { annotationsByPageId, activeTool, selectedId, add, update, select } = usePdfEditor();
    const overlayRef = useRef<HTMLDivElement>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const [draft, setDraft] = useState<PdfAnnotation | null>(null);
    const annotations = annotationsByPageId[pageId] ?? [];

    const getPoint = (event: PointerEvent<HTMLDivElement>) => overlayRef.current ? clientPointToPdfPoint(event, overlayRef.current, layout.viewport) : { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const point = getPoint(event);
        const selected = (event.target as HTMLElement).closest<HTMLElement>('[data-annotation-id]')?.dataset.annotationId;
        if (activeTool === 'select' && selected) {
            const annotation = annotations.find((item) => item.id === selected);
            if (annotation) { select(annotation.id); gestureRef.current = { mode: 'move', start: point, annotation }; event.currentTarget.setPointerCapture(event.pointerId); }
            return;
        }
        if (activeTool === 'select') { select(null); return; }
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
        setDraft(next as PdfAnnotation);
    };
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture || !draft) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (gesture.mode === 'move') update(draft.id, { x: draft.x, y: draft.y, width: draft.width, height: draft.height }); else add(draft);
        gestureRef.current = null; setDraft(null);
    };
    const rendered = draft && !annotations.some((annotation) => annotation.id === draft.id) ? [...annotations, draft] : annotations.map((annotation) => annotation.id === draft?.id ? draft : annotation);
    return <div ref={overlayRef} className={`annotation-overlay annotation-overlay--${activeTool}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { gestureRef.current = null; setDraft(null); }}>{rendered.map((annotation) => <AnnotationItem key={annotation.id} annotation={annotation} viewport={layout.viewport} selected={annotation.id === selectedId} />)}</div>;
}

function AnnotationItem({ annotation, viewport, selected }: { annotation: PdfAnnotation; viewport: PdfPageLayout['viewport']; selected: boolean }) {
    const box = pdfBoundsToViewport(annotation, viewport);
    const style = { left: box.left, top: box.top, width: box.width, height: box.height, opacity: annotation.opacity, zIndex: annotation.zIndex, transform: `rotate(${annotation.rotation}deg)` };
    const selectedClass = selected ? ' annotation-item--selected' : '';
    if (annotation.type === 'draw') { const points = annotation.points.map((point) => { const output = pdfPointToViewport(point, viewport); return `${output.x},${output.y}`; }).join(' '); return <svg data-annotation-id={annotation.id} className={`annotation-item annotation-path${selectedClass}`} style={{ ...style, left: 0, top: 0, width: '100%', height: '100%' }}><polyline points={points} fill="none" stroke={annotation.color} strokeWidth={annotation.strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></svg>; }
    if (annotation.type === 'text') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-text${selectedClass}`} style={{ ...style, color: annotation.color, fontSize: annotation.fontSize, fontFamily: annotation.fontFamily, fontWeight: annotation.bold ? 700 : 400, fontStyle: annotation.italic ? 'italic' : 'normal', textAlign: annotation.align, background: annotation.backgroundColor }}>{annotation.text}</div>;
    if (annotation.type === 'image' || annotation.type === 'signature') return <img data-annotation-id={annotation.id} className={`annotation-item annotation-image${selectedClass}`} style={style} src={annotation.source} alt={annotation.type === 'signature' ? 'Visual signature' : 'Added annotation'} draggable={false} />;
    if (annotation.type === 'highlight') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-highlight${selectedClass}`} style={{ ...style, background: annotation.color }} />;
    return <svg data-annotation-id={annotation.id} className={`annotation-item annotation-shape${selectedClass}`} style={style} viewBox={`0 0 ${Math.max(2, box.width)} ${Math.max(2, box.height)}`}><Shape annotation={annotation} width={box.width} height={box.height} /></svg>;
}

function Shape({ annotation, width, height }: { annotation: Extract<PdfAnnotation, { type: 'rectangle' | 'ellipse' | 'line' | 'arrow' }>; width: number; height: number }) {
    const common = { stroke: annotation.strokeColor, strokeWidth: annotation.strokeWidth, fill: annotation.type === 'rectangle' || annotation.type === 'ellipse' ? annotation.fillColor : 'none' };
    if (annotation.type === 'ellipse') return <ellipse cx={width / 2} cy={height / 2} rx={Math.max(1, width / 2 - 1)} ry={Math.max(1, height / 2 - 1)} {...common} />;
    if (annotation.type === 'rectangle') return <rect x="1" y="1" width={Math.max(1, width - 2)} height={Math.max(1, height - 2)} {...common} />;
    return <><line x1="1" y1={height - 1} x2={width - 1} y2="1" {...common} />{annotation.type === 'arrow' && <polygon points={`${width - 1},1 ${width - 10},3 ${width - 3},10`} fill={annotation.strokeColor} />}</>;
}

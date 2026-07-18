import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp, Copy, Pencil, RotateCw, Trash2 } from 'lucide-react';
import type { PdfPageLayout } from '../../viewer/PdfPageCanvas';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { boundsFromPoints } from '../utils/annotationUtils';
import { createAnnotation } from '../utils/createAnnotation';
import { clientPointToPdfPoint, pdfBoundsToViewport, pdfPointToViewport } from '../utils/coordinates';
import { constrainBounds, resizeBounds, type ResizeHandle } from '../utils/touchGeometry';
import type { PdfAnnotation, Point } from '../types/annotations';

type Gesture = { mode: 'create' | 'move' | 'resize' | 'rotate'; start: Point; annotation: PdfAnnotation; handle?: ResizeHandle; moved: boolean };
export function AnnotationOverlay({ pageId, layout }: { pageId: string; layout: PdfPageLayout }) {
    const { annotationsByPageId, activeTool, highlighterSettings, selectedIds, add, update, select, setTool, removeSelected, setFormValue, formValues, duplicate, remove, reorder } = usePdfEditor();
    const overlayRef = useRef<HTMLDivElement>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const frameRef = useRef(0);
    const pendingDraftRef = useRef<PdfAnnotation | null>(null);
    const longPressRef = useRef<number | null>(null);
    const activePointerRef = useRef<number | null>(null);
    const [draft, setDraft] = useState<PdfAnnotation | null>(null);
    const [menuId, setMenuId] = useState<string | null>(null);
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
    const cancelLongPress = () => { if (longPressRef.current !== null) window.clearTimeout(longPressRef.current); longPressRef.current = null; };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch' && !event.isPrimary) {
            cancelLongPress(); gestureRef.current = null; pendingDraftRef.current = null; setDraft(null);
            if (activePointerRef.current !== null && event.currentTarget.hasPointerCapture(activePointerRef.current)) event.currentTarget.releasePointerCapture(activePointerRef.current);
            activePointerRef.current = null; return;
        }
        const point = getPoint(event);
        const selected = (event.target as HTMLElement).closest<HTMLElement>('[data-annotation-id]')?.dataset.annotationId;
        const handle = (event.target as HTMLElement).dataset.resizeHandle as ResizeHandle | undefined;
        const rotate = Boolean((event.target as HTMLElement).closest('[data-rotate-handle]'));
        if (activeTool === 'select' && selected) {
            const annotation = annotations.find((item) => item.id === selected);
            if (annotation) {
                select(annotation.id, event.shiftKey);
                if (annotation.locked) return;
                event.preventDefault();
                const gesture: Gesture = { mode: rotate ? 'rotate' : handle ? 'resize' : 'move', start: point, annotation, handle, moved: false };
                gestureRef.current = gesture; pendingDraftRef.current = annotation; setDraft(annotation);
                activePointerRef.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId);
                if (!handle && !rotate && event.pointerType === 'touch') longPressRef.current = window.setTimeout(() => { gestureRef.current = null; setDraft(null); setMenuId(annotation.id); }, 550);
            }
            return;
        }
        if (activeTool === 'select') { if (!event.shiftKey) select(null); setMenuId(null); return; }
        const annotation = createAnnotation(activeTool, pageId, point, highlighterSettings);
        if (!annotation) return;
        if (annotation.type === 'text') { add(annotation); setTool('select'); return; }
        event.preventDefault(); select(annotation.id); setDraft(annotation); pendingDraftRef.current = annotation; gestureRef.current = { mode: 'create', start: point, annotation, moved: false }; activePointerRef.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        if (event.pointerType === 'touch' && !event.isPrimary) return;
        event.preventDefault();
        const point = getPoint(event);
        const dx = point.x - gesture.start.x; const dy = point.y - gesture.start.y;
        if (Math.hypot(dx, dy) > 3) { gesture.moved = true; cancelLongPress(); }
        const next = gesture.mode === 'rotate'
            ? { ...gesture.annotation, rotation: rotationFromPointer(gesture.annotation, gesture.start, point), updatedAt: Date.now() }
            : gesture.mode === 'resize'
            ? { ...gesture.annotation, ...constrainBounds(resizeBounds(gesture.annotation, dx, dy, gesture.handle ?? 'se'), layout.viewport.width / layout.viewport.scale, layout.viewport.height / layout.viewport.scale), updatedAt: Date.now() }
            : (gesture.annotation.type === 'draw' || gesture.annotation.type === 'highlight') && gesture.mode === 'create'
            ? { ...gesture.annotation, points: [...gesture.annotation.points, point], updatedAt: Date.now() }
            : gesture.mode === 'move'
                ? gesture.annotation.type === 'draw' || gesture.annotation.type === 'highlight'
                    ? { ...gesture.annotation, points: movePointsWithinPage(gesture.annotation.points, dx, dy, layout.viewport.width / layout.viewport.scale, layout.viewport.height / layout.viewport.scale), updatedAt: Date.now() }
                    : { ...gesture.annotation, ...constrainBounds({ ...gesture.annotation, x: gesture.annotation.x + dx, y: gesture.annotation.y + dy }, layout.viewport.width / layout.viewport.scale, layout.viewport.height / layout.viewport.scale), updatedAt: Date.now() }
                : { ...gesture.annotation, ...boundsFromPoints(gesture.start, point), updatedAt: Date.now() };
        pendingDraftRef.current = next as PdfAnnotation;
        if (!frameRef.current) frameRef.current = requestAnimationFrame(() => { frameRef.current = 0; setDraft(pendingDraftRef.current); });
    };
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        cancelLongPress();
        const gesture = gestureRef.current;
        const latestDraft = pendingDraftRef.current ?? draft;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (!gesture || !latestDraft) { gestureRef.current = null; pendingDraftRef.current = null; activePointerRef.current = null; setDraft(null); return; }
        if (gesture.mode === 'create') add(latestDraft); else if (gesture.moved) update(latestDraft.id, latestDraft);
        gestureRef.current = null; pendingDraftRef.current = null; activePointerRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; setDraft(null);
    };
    const cancelGesture = (event: PointerEvent<HTMLDivElement>) => { cancelLongPress(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); gestureRef.current = null; pendingDraftRef.current = null; activePointerRef.current = null; setDraft(null); };
    const editText = (id: string) => { setMenuId(null); window.setTimeout(() => overlayRef.current?.querySelector<HTMLTextAreaElement>(`[data-annotation-id="${id}"] textarea`)?.focus(), 0); };
    const rendered = draft && !annotations.some((annotation) => annotation.id === draft.id) ? [...annotations, draft] : annotations.map((annotation) => annotation.id === draft?.id ? draft : annotation);
    return <div ref={overlayRef} className={`annotation-overlay annotation-overlay--${activeTool}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={cancelGesture}>{rendered.map((annotation) => <AnnotationItem key={annotation.id} annotation={annotation} viewport={layout.viewport} selected={selectedIds.includes(annotation.id)} onUpdate={(patch) => update(annotation.id, patch)} onDuplicate={() => duplicate(annotation.id)} onDelete={() => remove(annotation.id)} onForward={() => reorder(annotation.id, 'forward')} onBackward={() => reorder(annotation.id, 'backward')} onEdit={() => editText(annotation.id)} formValues={formValues} onFormValue={setFormValue} />)}
        {menuId && <div className="mobile-object-menu" role="menu" aria-label="Object actions">{annotations.some((item) => item.id === menuId && item.type === 'text') && <button type="button" onClick={() => editText(menuId)}><Pencil size={17} />Edit</button>}<button type="button" onClick={() => { duplicate(menuId); setMenuId(null); }}><Copy size={17} />Duplicate</button><button type="button" onClick={() => { reorder(menuId, 'forward'); setMenuId(null); }}><ArrowUp size={17} />Bring Forward</button><button type="button" onClick={() => { reorder(menuId, 'backward'); setMenuId(null); }}><ArrowDown size={17} />Send Backward</button><button type="button" onClick={() => { remove(menuId); setMenuId(null); }}><Trash2 size={17} />Delete</button></div>}
    </div>;
}

function AnnotationItem({ annotation, viewport, selected, onUpdate, onDuplicate, onDelete, onForward, onBackward, onEdit, formValues, onFormValue }: { annotation: PdfAnnotation; viewport: PdfPageLayout['viewport']; selected: boolean; onUpdate: (patch: Partial<PdfAnnotation>) => void; onDuplicate: () => void; onDelete: () => void; onForward: () => void; onBackward: () => void; onEdit: () => void; formValues: Record<string, string | boolean | string[]>; onFormValue: (name: string, value: string | boolean | string[]) => void }) {
    const box = pdfBoundsToViewport(annotation, viewport);
    const style = { left: box.left, top: box.top, width: box.width, height: box.height, opacity: annotation.opacity, zIndex: annotation.zIndex, transform: `rotate(${annotation.rotation}deg)` };
    const selectedClass = selected ? ' annotation-item--selected' : '';
    const controls = selected && <ObjectControls onEdit={annotation.type === 'text' ? onEdit : undefined} onDuplicate={onDuplicate} onDelete={onDelete} onForward={onForward} onBackward={onBackward} />;
    const selectionHandles = selected && <><ResizeHandles /><i className="rotation-handle" data-rotate-handle aria-label="Rotate object"><RotateCw size={14} /></i>{controls}</>;
    if (annotation.type === 'draw' || annotation.type === 'highlight') { const points = annotation.points.map((point) => { const output = pdfPointToViewport(point, viewport); return `${output.x},${output.y}`; }).join(' '); return <svg className={`annotation-item annotation-path${annotation.type === 'highlight' ? ' annotation-highlight-path' : ''}`} style={{ ...style, left: 0, top: 0, width: '100%', height: '100%' }}><polyline data-annotation-id={annotation.id} points={points} fill="none" stroke="transparent" strokeWidth={Math.max(22, annotation.strokeWidth * viewport.scale + 12)} strokeLinecap="round" strokeLinejoin="round" />{selected && <polyline points={points} fill="none" pointerEvents="none" stroke="#178a49" strokeWidth={annotation.strokeWidth * viewport.scale + 8} strokeDasharray="5 5" strokeOpacity=".9" strokeLinecap="round" strokeLinejoin="round" />}<polyline points={points} fill="none" pointerEvents="none" stroke={annotation.color} strokeOpacity={annotation.opacity} strokeWidth={annotation.strokeWidth * viewport.scale} strokeLinecap="round" strokeLinejoin="round" /></svg>; }
    if (annotation.type === 'text') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-text${selectedClass}`} style={{ ...style, padding: annotation.padding, border: `${annotation.borderWidth}px solid ${annotation.borderColor}`, background: hexWithOpacity(annotation.backgroundColor, annotation.backgroundOpacity) }}><EditableText annotation={annotation} scale={viewport.scale} selected={selected} onUpdate={onUpdate} />{selectionHandles}</div>;
    if (annotation.type === 'image' || annotation.type === 'signature') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-image-wrap${selectedClass}`} style={style}><img className="annotation-image" src={annotation.source} alt={annotation.type === 'signature' ? 'Visual signature' : 'Added annotation'} draggable={false} />{selectionHandles}</div>;
    if (annotation.type === 'stamp') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-stamp${selectedClass}`} style={{ ...style, color: annotation.color, borderColor: annotation.color }}>{annotation.text}</div>;
    if (annotation.type === 'form-text' || annotation.type === 'form-signature') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-form${selectedClass}`} style={style} aria-label={annotation.name} placeholder={annotation.type === 'form-signature' ? 'Signature' : annotation.name} value={String(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.value)} />;
    if (annotation.type === 'form-checkbox') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-checkbox${selectedClass}`} style={style} aria-label={annotation.name} type="checkbox" checked={Boolean(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.checked)} />;
    return <div data-annotation-id={annotation.id} className={`annotation-item annotation-shape-wrap${selectedClass}`} style={style}><svg className="annotation-shape" viewBox={`0 0 ${Math.max(2, box.width)} ${Math.max(2, box.height)}`}><Shape annotation={annotation} width={box.width} height={box.height} /></svg>{selectionHandles}</div>;
}

function ResizeHandles() { return <>{(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => <i key={handle} className={`resize-handle resize-handle--${handle}`} data-resize-handle={handle} aria-hidden="true" />)}</>; }
function ObjectControls({ onEdit, onDuplicate, onDelete, onForward, onBackward }: { onEdit?: () => void; onDuplicate: () => void; onDelete: () => void; onForward: () => void; onBackward: () => void }) { const action = (callback: () => void) => (event: PointerEvent<HTMLButtonElement>) => { event.stopPropagation(); callback(); }; return <div className="object-quick-actions">{onEdit && <button type="button" aria-label="Edit text" onPointerDown={(event) => event.stopPropagation()} onClick={onEdit}><Pencil size={14} /></button>}<button type="button" aria-label="Duplicate object" onPointerDown={(event) => event.stopPropagation()} onClick={onDuplicate}><Copy size={14} /></button><button type="button" aria-label="Bring forward" onPointerDown={action(onForward)}><ArrowUp size={14} /></button><button type="button" aria-label="Send backward" onPointerDown={action(onBackward)}><ArrowDown size={14} /></button><button type="button" aria-label="Delete object" onPointerDown={action(onDelete)}><Trash2 size={14} /></button></div>; }
function EditableText({ annotation, scale, selected, onUpdate }: { annotation: Extract<PdfAnnotation, { type: 'text' }>; scale: number; selected: boolean; onUpdate: (patch: Partial<PdfAnnotation>) => void }) {
    const [value, setValue] = useState(annotation.text);
    useEffect(() => setValue(annotation.text), [annotation.text]);
    return <textarea autoFocus={!annotation.text} readOnly={!selected} aria-label="Editable PDF text" value={value} onDoubleClick={(event) => event.currentTarget.focus()} onPointerDown={(event) => { if (document.activeElement === event.currentTarget) event.stopPropagation(); }} onChange={(event) => setValue(event.target.value)} onBlur={(event) => onUpdate({ text: value, height: Math.max(annotation.height, event.currentTarget.scrollHeight / scale) })} onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.blur(); }} style={{ color: annotation.color, fontSize: annotation.fontSize * scale, fontFamily: annotation.fontFamily, fontWeight: annotation.bold ? 700 : 400, fontStyle: annotation.italic ? 'italic' : 'normal', textDecoration: annotation.underline ? 'underline' : 'none', textAlign: annotation.align, lineHeight: annotation.lineHeight, letterSpacing: annotation.letterSpacing }} />;
}
function movePointsWithinPage(points: Point[], dx: number, dy: number, pageWidth: number, pageHeight: number) {
    const minX = Math.min(...points.map((point) => point.x)); const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y)); const maxY = Math.max(...points.map((point) => point.y));
    const safeDx = Math.max(-minX, Math.min(pageWidth - maxX, dx)); const safeDy = Math.max(-minY, Math.min(pageHeight - maxY, dy));
    return points.map((point) => ({ x: point.x + safeDx, y: point.y + safeDy }));
}
function rotationFromPointer(annotation: PdfAnnotation, start: Point, current: Point) {
    const center = { x: annotation.x + annotation.width / 2, y: annotation.y + annotation.height / 2 };
    const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
    const currentAngle = Math.atan2(current.y - center.y, current.x - center.x);
    return Math.round(annotation.rotation + (currentAngle - startAngle) * 180 / Math.PI);
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

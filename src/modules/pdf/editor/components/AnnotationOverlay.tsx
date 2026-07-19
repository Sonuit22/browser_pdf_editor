import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Copy, Pencil, RotateCw, Trash2 } from 'lucide-react';
import type { PdfPageLayout } from '../../viewer/PdfPageCanvas';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { boundsFromPoints } from '../utils/annotationUtils';
import { createAnnotation } from '../utils/createAnnotation';
import { clampPdfPoint, clientPointToPdfPoint, pdfBoundsToViewport, pdfPageSize, pdfPointToViewport } from '../utils/coordinates';
import { constrainAnnotationBounds, constrainBounds, resizeBounds, resizeHandleForPageRotation, type ResizeHandle } from '../utils/touchGeometry';
import type { PdfAnnotation, Point } from '../types/annotations';

type Gesture = { mode: 'create' | 'move' | 'resize' | 'rotate'; start: Point; startClient: Point; annotation: PdfAnnotation; handle?: ResizeHandle; moved: boolean };
type CursorPosition = { clientX: number; clientY: number; pointerType: string };
function safelyCapturePointer(element: HTMLElement, pointerId: number) {
    try {
        element.setPointerCapture(pointerId);
    } catch {
        // The browser may have already ended or cancelled this pointer.
    }
}
function safelyReleasePointer(element: HTMLElement | null, pointerId: number | null) {
    if (!element || pointerId === null) return;
    try {
        if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    } catch {
        // Pointer capture is already gone; the local gesture still needs cleanup.
    }
}
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
    const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
    const [isCursorOverPdf, setCursorOverPdf] = useState(false);
    const [activePointerType, setActivePointerType] = useState<string | null>(null);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [isObjectGestureActive, setObjectGestureActive] = useState(false);
    const isHighlighterActive = activeTool === 'highlight';
    const highlighterColor = highlighterSettings.color;
    const highlighterSize = highlighterSettings.strokeWidth;
    const annotations = annotationsByPageId[pageId] ?? [];
    const pageSize = pdfPageSize(layout.viewport);
    useEffect(() => () => {
        cancelAnimationFrame(frameRef.current);
        if (longPressRef.current !== null) window.clearTimeout(longPressRef.current);
        safelyReleasePointer(overlayRef.current, activePointerRef.current);
        gestureRef.current = null;
        pendingDraftRef.current = null;
        activePointerRef.current = null;
    }, []);
    useEffect(() => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        const pending = pendingDraftRef.current;
        if (gesture.mode === 'create' && pending && isPathAnnotation(pending) && pending.points.length > 1) add(pending);
        const overlay = overlayRef.current;
        const pointerId = activePointerRef.current;
        safelyReleasePointer(overlay, pointerId);
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        gestureRef.current = null;
        pendingDraftRef.current = null;
        activePointerRef.current = null;
        setObjectGestureActive(false);
        setDraft(null);
    }, [activeTool, add]);
    useEffect(() => {
        if (!isHighlighterActive) {
            setCursorPosition(null);
            setCursorOverPdf(false);
            setActivePointerType(null);
            setIsHighlighting(false);
        }
    }, [isHighlighterActive]);
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

    const getPoint = (event: PointerEvent<HTMLDivElement> | globalThis.PointerEvent) => overlayRef.current ? clampPdfPoint(clientPointToPdfPoint(event, overlayRef.current, layout.viewport), pageSize.width, pageSize.height) : { x: 0, y: 0 };
    const getStrokePoints = (event: PointerEvent<HTMLDivElement>) => {
        const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [];
        const samples = coalesced.length ? [...coalesced, event.nativeEvent] : [event.nativeEvent];
        return samples.map(getPoint);
    };
    const isInsidePage = (event: PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    };
    const updateCursorPosition = (event: PointerEvent<HTMLDivElement>) => {
        if (!isHighlighterActive) return;
        const highlighting = gestureRef.current?.mode === 'create' && gestureRef.current.annotation.type === 'highlight';
        if (event.pointerType !== 'mouse' && !highlighting) return;
        setActivePointerType(event.pointerType);
        setCursorPosition({ clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType });
        setCursorOverPdf(true);
    };
    const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
        if (!isHighlighterActive || event.pointerType !== 'mouse') return;
        setActivePointerType('mouse');
        setCursorPosition({ clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType });
        setCursorOverPdf(true);
    };
    const cancelLongPress = () => { if (longPressRef.current !== null) window.clearTimeout(longPressRef.current); longPressRef.current = null; };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch' && !event.isPrimary) {
            cancelLongPress(); gestureRef.current = null; pendingDraftRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; setObjectGestureActive(false); setDraft(null);
            safelyReleasePointer(event.currentTarget, activePointerRef.current);
            activePointerRef.current = null; return;
        }
        if (isHighlighterActive) {
            setActivePointerType(event.pointerType);
            setCursorPosition({ clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType });
            setCursorOverPdf(true);
            setIsHighlighting(true);
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
                const gesture: Gesture = { mode: rotate ? 'rotate' : handle ? 'resize' : 'move', start: point, startClient: { x: event.clientX, y: event.clientY }, annotation, handle, moved: false };
                gestureRef.current = gesture; pendingDraftRef.current = annotation; setDraft(annotation);
                setObjectGestureActive(true);
                activePointerRef.current = event.pointerId; safelyCapturePointer(event.currentTarget, event.pointerId);
                if (!handle && !rotate && event.pointerType === 'touch') {
                    const overlay = event.currentTarget;
                    const pointerId = event.pointerId;
                    longPressRef.current = window.setTimeout(() => {
                        if (gestureRef.current?.moved) return;
                        safelyReleasePointer(overlay, pointerId);
                        cancelAnimationFrame(frameRef.current);
                        frameRef.current = 0;
                        gestureRef.current = null;
                        pendingDraftRef.current = null;
                        activePointerRef.current = null;
                        setObjectGestureActive(false);
                        setDraft(null);
                        setMenuId(annotation.id);
                    }, 550);
                }
            }
            return;
        }
        if (activeTool === 'select') { if (!event.shiftKey) select(null); setMenuId(null); return; }
        const annotation = createAnnotation(activeTool, pageId, point, highlighterSettings);
        if (!annotation) return;
        if (annotation.type === 'text') { add(annotation); setTool('select'); return; }
        event.preventDefault(); select(annotation.id); setDraft(annotation); pendingDraftRef.current = annotation; gestureRef.current = { mode: 'create', start: point, startClient: { x: event.clientX, y: event.clientY }, annotation, moved: false }; activePointerRef.current = event.pointerId; safelyCapturePointer(event.currentTarget, event.pointerId);
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        updateCursorPosition(event);
        const gesture = gestureRef.current;
        if (!gesture) return;
        if (activePointerRef.current !== event.pointerId) return;
        if (event.pointerType === 'touch' && !event.isPrimary) return;
        event.preventDefault();
        const point = getPoint(event);
        const dx = point.x - gesture.start.x; const dy = point.y - gesture.start.y;
        if (Math.hypot(event.clientX - gesture.startClient.x, event.clientY - gesture.startClient.y) > 3) { gesture.moved = true; cancelLongPress(); }
        const currentPath = pendingDraftRef.current && isPathAnnotation(pendingDraftRef.current) ? pendingDraftRef.current : isPathAnnotation(gesture.annotation) ? gesture.annotation : null;
        const next = gesture.mode === 'rotate'
            ? { ...gesture.annotation, rotation: rotationFromPointer(gesture.annotation, gesture.start, point), updatedAt: Date.now() }
            : gesture.mode === 'resize'
            ? { ...gesture.annotation, ...constrainAnnotationBounds(gesture.annotation, resizeBounds(gesture.annotation, dx, dy, resizeHandleForPageRotation(gesture.handle ?? 'se', layout.viewport.rotation)), pageSize.width, pageSize.height), updatedAt: Date.now() }
            : currentPath && gesture.mode === 'create'
            ? { ...currentPath, points: appendDistinctPoints(currentPath.points, getStrokePoints(event)), updatedAt: Date.now() }
            : gesture.mode === 'move'
                ? gesture.annotation.type === 'draw' || gesture.annotation.type === 'highlight'
                    ? { ...gesture.annotation, points: movePointsWithinPage(gesture.annotation.points, dx, dy, pageSize.width, pageSize.height), updatedAt: Date.now() }
                    : { ...gesture.annotation, ...constrainBounds({ ...gesture.annotation, x: gesture.annotation.x + dx, y: gesture.annotation.y + dy }, pageSize.width, pageSize.height), updatedAt: Date.now() }
                : { ...gesture.annotation, ...boundsFromPoints(gesture.start, point), updatedAt: Date.now() };
        pendingDraftRef.current = next as PdfAnnotation;
        if (gesture.mode === 'create' && currentPath && !isInsidePage(event)) {
            completeGesture(event, false);
            return;
        }
        if (!frameRef.current) frameRef.current = requestAnimationFrame(() => { frameRef.current = 0; setDraft(pendingDraftRef.current); });
    };
    function completeGesture(event: PointerEvent<HTMLDivElement>, appendFinalPoint = true) {
        if (activePointerRef.current !== null && activePointerRef.current !== event.pointerId) return;
        cancelLongPress();
        const gesture = gestureRef.current;
        let latestDraft = pendingDraftRef.current ?? draft;
        if (appendFinalPoint && gesture?.mode === 'create' && latestDraft && isPathAnnotation(latestDraft)) {
            latestDraft = { ...latestDraft, points: appendDistinctPoints(latestDraft.points, [getPoint(event)]), updatedAt: Date.now() };
        }
        safelyReleasePointer(event.currentTarget, event.pointerId);
        if (!gesture || !latestDraft) { gestureRef.current = null; pendingDraftRef.current = null; activePointerRef.current = null; setObjectGestureActive(false); setDraft(null); return; }
        const completedHighlight = gesture.mode === 'create' && latestDraft.type === 'highlight';
        if (gesture.mode === 'create') {
            if (!isPathAnnotation(latestDraft) || latestDraft.points.length > 1) add(latestDraft);
        } else if (gesture.moved) update(latestDraft.id, latestDraft);
        gestureRef.current = null; pendingDraftRef.current = null; activePointerRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; setObjectGestureActive(false); setDraft(null);
        if (completedHighlight) {
            setCursorPosition(null);
            setCursorOverPdf(false);
            setActivePointerType(null);
            setIsHighlighting(false);
            setTool('select');
        }
    }
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => completeGesture(event);
    const cancelGesture = (event: PointerEvent<HTMLDivElement>) => {
        if (activePointerRef.current !== null && activePointerRef.current !== event.pointerId) return;
        const cancelledPath = gestureRef.current?.mode === 'create' && isPathAnnotation(gestureRef.current.annotation);
        if (cancelledPath) {
            completeGesture(event, false);
            return;
        }
        cancelLongPress();
        safelyReleasePointer(event.currentTarget, event.pointerId);
        gestureRef.current = null; pendingDraftRef.current = null; activePointerRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; setObjectGestureActive(false); setDraft(null);
    };
    const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (gesture?.mode === 'create' && isPathAnnotation(gesture.annotation)) completeGesture(event);
        else if (!gesture) {
            setCursorPosition(null);
            setCursorOverPdf(false);
            setActivePointerType(null);
        }
    };
    const editText = (id: string) => { setMenuId(null); window.setTimeout(() => overlayRef.current?.querySelector<HTMLTextAreaElement>(`[data-annotation-id="${id}"] textarea`)?.focus(), 0); };
    const rendered = draft && !annotations.some((annotation) => annotation.id === draft.id) ? [...annotations, draft] : annotations.map((annotation) => annotation.id === draft?.id ? draft : annotation);
    const showHighlighterCursor = isHighlighterActive && isCursorOverPdf && cursorPosition && (activePointerType === 'mouse' || isHighlighting);
    const cursorDiameter = Math.max(12, Math.min(56, highlighterSize * layout.viewport.scale));
    const highlighterCursor = showHighlighterCursor && typeof document !== 'undefined'
        ? createPortal(<span className={`highlighter-pointer-indicator${cursorPosition.pointerType === 'touch' ? ' is-touch' : ''}`} style={{ left: cursorPosition.clientX, top: cursorPosition.clientY, width: cursorDiameter, height: cursorDiameter, backgroundColor: highlighterColor }} aria-hidden="true" />, document.body)
        : null;
    return <><div ref={overlayRef} className={`annotation-overlay annotation-overlay--${activeTool}${showHighlighterCursor && activePointerType === 'mouse' ? ' annotation-overlay--custom-highlighter-cursor' : ''}${isHighlighting && activePointerType !== 'mouse' ? ' annotation-overlay--highlighting' : ''}${isObjectGestureActive ? ' annotation-overlay--object-gesture' : ''}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={cancelGesture} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>{rendered.map((annotation) => <AnnotationItem key={annotation.id} annotation={annotation} viewport={layout.viewport} selected={selectedIds.includes(annotation.id)} onUpdate={(patch) => update(annotation.id, patch)} onDuplicate={() => duplicate(annotation.id)} onDelete={() => remove(annotation.id)} onForward={() => reorder(annotation.id, 'forward')} onBackward={() => reorder(annotation.id, 'backward')} onEdit={() => editText(annotation.id)} formValues={formValues} onFormValue={setFormValue} />)}
        {menuId && <div className="mobile-object-menu" role="menu" aria-label="Object actions">{annotations.some((item) => item.id === menuId && item.type === 'text') && <button type="button" onClick={() => editText(menuId)}><Pencil size={17} />Edit</button>}<button type="button" onClick={() => { duplicate(menuId); setMenuId(null); }}><Copy size={17} />Duplicate</button><button type="button" onClick={() => { reorder(menuId, 'forward'); setMenuId(null); }}><ArrowUp size={17} />Bring Forward</button><button type="button" onClick={() => { reorder(menuId, 'backward'); setMenuId(null); }}><ArrowDown size={17} />Send Backward</button><button type="button" onClick={() => { remove(menuId); setMenuId(null); }}><Trash2 size={17} />Delete</button></div>}
    </div>{highlighterCursor}</>;
}

function AnnotationItem({ annotation, viewport, selected, onUpdate, onDuplicate, onDelete, onForward, onBackward, onEdit, formValues, onFormValue }: { annotation: PdfAnnotation; viewport: PdfPageLayout['viewport']; selected: boolean; onUpdate: (patch: Partial<PdfAnnotation>) => void; onDuplicate: () => void; onDelete: () => void; onForward: () => void; onBackward: () => void; onEdit: () => void; formValues: Record<string, string | boolean | string[]>; onFormValue: (name: string, value: string | boolean | string[]) => void }) {
    const box = pdfBoundsToViewport(annotation, viewport);
    const style = { left: box.left, top: box.top, width: box.width, height: box.height, opacity: annotation.opacity, zIndex: selected ? 2_147_480_000 : annotation.zIndex, transform: `rotate(${annotation.rotation}deg)` };
    const selectedClass = selected ? ' annotation-item--selected' : '';
    const controls = selected && <ObjectControls onEdit={annotation.type === 'text' ? onEdit : undefined} onDuplicate={onDuplicate} onDelete={onDelete} onForward={onForward} onBackward={onBackward} />;
    const selectionHandles = selected && <><ResizeHandles /><i className="rotation-handle" data-rotate-handle aria-label="Rotate object"><RotateCw size={14} /></i>{controls}</>;
    if (annotation.type === 'draw' || annotation.type === 'highlight') { const points = annotation.points.map((point) => { const output = pdfPointToViewport(point, viewport); return `${output.x},${output.y}`; }).join(' '); return <svg className={`annotation-item annotation-path${annotation.type === 'highlight' ? ' annotation-highlight-path' : ''}`} style={{ ...style, left: 0, top: 0, width: '100%', height: '100%' }}><polyline data-annotation-id={annotation.id} points={points} fill="none" stroke="transparent" strokeWidth={Math.max(22, annotation.strokeWidth * viewport.scale + 12)} strokeLinecap="round" strokeLinejoin="round" />{selected && <polyline points={points} fill="none" pointerEvents="none" stroke="#178a49" strokeWidth={annotation.strokeWidth * viewport.scale + 8} strokeDasharray="5 5" strokeOpacity=".9" strokeLinecap="round" strokeLinejoin="round" />}<polyline points={points} fill="none" pointerEvents="none" stroke={annotation.color} strokeOpacity={annotation.opacity} strokeWidth={annotation.strokeWidth * viewport.scale} strokeLinecap="round" strokeLinejoin="round" /></svg>; }
    if (annotation.type === 'text') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-text${selectedClass}`} style={{ ...style, padding: annotation.padding, border: `${annotation.borderWidth}px solid ${annotation.borderColor}`, background: hexWithOpacity(annotation.backgroundColor, annotation.backgroundOpacity) }}><EditableText annotation={annotation} scale={viewport.scale} selected={selected} onUpdate={onUpdate} />{selectionHandles}</div>;
    if (annotation.type === 'image' || annotation.type === 'signature') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-image-wrap${selectedClass}`} style={style}><img className="annotation-image" src={annotation.source} alt={annotation.type === 'image' ? 'Added annotation' : annotation.signatureKind === 'date' ? 'Added date' : annotation.signatureKind === 'checkmark' ? 'Added checkmark' : 'Visual signature'} draggable={false} />{selectionHandles}</div>;
    if (annotation.type === 'stamp') return <div data-annotation-id={annotation.id} className={`annotation-item annotation-stamp${selectedClass}`} style={{ ...style, color: annotation.color, borderColor: annotation.color }}>{annotation.text}</div>;
    if (annotation.type === 'form-text' || annotation.type === 'form-signature') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-form${selectedClass}`} style={style} aria-label={annotation.name} placeholder={annotation.type === 'form-signature' ? 'Signature' : annotation.name} value={String(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.value)} />;
    if (annotation.type === 'form-checkbox') return <input data-annotation-id={annotation.id} className={`annotation-item annotation-checkbox${selectedClass}`} style={style} aria-label={annotation.name} type="checkbox" checked={Boolean(formValues[annotation.name] ?? annotation.defaultValue)} onChange={(event) => onFormValue(annotation.name, event.target.checked)} />;
    return <div data-annotation-id={annotation.id} className={`annotation-item annotation-shape-wrap${selectedClass}`} style={style}><svg className="annotation-shape" viewBox={`0 0 ${Math.max(2, box.width)} ${Math.max(2, box.height)}`}><Shape annotation={annotation} width={box.width} height={box.height} /></svg>{selectionHandles}</div>;
}

function ResizeHandles() { return <>{(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => <i key={handle} className={`resize-handle resize-handle--${handle}`} data-resize-handle={handle} aria-hidden="true" />)}</>; }
function ObjectControls({ onEdit, onDuplicate, onDelete, onForward, onBackward }: { onEdit?: () => void; onDuplicate: () => void; onDelete: () => void; onForward: () => void; onBackward: () => void }) { const action = (callback: () => void) => (event: PointerEvent<HTMLButtonElement>) => { event.stopPropagation(); callback(); }; return <div className="object-quick-actions">{onEdit && <button type="button" aria-label="Edit text" onPointerDown={(event) => event.stopPropagation()} onClick={onEdit}><Pencil size={14} /></button>}<button type="button" aria-label="Duplicate object" onPointerDown={(event) => event.stopPropagation()} onClick={onDuplicate}><Copy size={14} /></button><button type="button" aria-label="Bring forward" onPointerDown={action(onForward)}><ArrowUp size={14} /></button><button type="button" aria-label="Send backward" onPointerDown={action(onBackward)}><ArrowDown size={14} /></button><button type="button" aria-label="Delete object" onPointerDown={action(onDelete)}><Trash2 size={14} /></button></div>; }
function EditableText({ annotation, scale, selected, onUpdate }: { annotation: Extract<PdfAnnotation, { type: 'text' }>; scale: number; selected: boolean; onUpdate: (patch: Partial<PdfAnnotation>) => void }) {
    const [value, setValue] = useState(annotation.text);
    const [editing, setEditing] = useState(!annotation.text);
    useEffect(() => setValue(annotation.text), [annotation.text]);
    useEffect(() => { if (!selected) setEditing(false); }, [selected]);
    const finishEditing = (element: HTMLTextAreaElement) => {
        setEditing(false);
        const height = Math.max(annotation.height, element.scrollHeight / scale);
        if (value !== annotation.text || height !== annotation.height) onUpdate({ text: value, height });
    };
    return <textarea autoFocus={!annotation.text} readOnly={!selected || !editing} aria-label="Editable PDF text" value={value} onFocus={() => setEditing(true)} onDoubleClick={(event) => { event.stopPropagation(); setEditing(true); event.currentTarget.focus(); }} onPointerDown={(event) => { if (editing) event.stopPropagation(); else event.preventDefault(); }} onChange={(event) => setValue(event.target.value)} onBlur={(event) => finishEditing(event.currentTarget)} onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.blur(); }} style={{ color: annotation.color, fontSize: annotation.fontSize * scale, fontFamily: annotation.fontFamily, fontWeight: annotation.bold ? 700 : 400, fontStyle: annotation.italic ? 'italic' : 'normal', textDecoration: annotation.underline ? 'underline' : 'none', textAlign: annotation.align, lineHeight: annotation.lineHeight, letterSpacing: annotation.letterSpacing }} />;
}
function movePointsWithinPage(points: Point[], dx: number, dy: number, pageWidth: number, pageHeight: number) {
    const minX = Math.min(...points.map((point) => point.x)); const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y)); const maxY = Math.max(...points.map((point) => point.y));
    const safeDx = Math.max(-minX, Math.min(pageWidth - maxX, dx)); const safeDy = Math.max(-minY, Math.min(pageHeight - maxY, dy));
    return points.map((point) => ({ x: point.x + safeDx, y: point.y + safeDy }));
}
function isPathAnnotation(annotation: PdfAnnotation): annotation is Extract<PdfAnnotation, { type: 'draw' | 'highlight' }> {
    return annotation.type === 'draw' || annotation.type === 'highlight';
}
function appendDistinctPoints(points: Point[], additions: Point[]) {
    const output = [...points];
    for (const point of additions) {
        const last = output[output.length - 1];
        if (!last || Math.hypot(point.x - last.x, point.y - last.y) > .1) output.push(point);
    }
    return output;
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

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { WorkingPage } from '../../organization/types/pages';
import type { PdfPageLayout } from '../../viewer/PdfPageCanvas';
import { usePdfUtilities } from '../hooks/usePdfUtilities';
import type { CropBox } from '../types/utilities';
import { cropMarginsToViewportRect, moveViewportRect, resizeViewportRect, viewportRectToCropMargins, type CropHandle, type ViewportRect } from '../utils/cropCoordinates';
import { cropAreaDescription } from '../../../../components/ui/accessibility';

type Gesture = { handle: CropHandle; start: { x: number; y: number }; rect: ViewportRect; crop: CropBox };
const handles: Array<Exclude<CropHandle, 'move' | 'create'>> = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export function CropOverlay({ page, layout }: { page: WorkingPage; layout: PdfPageLayout }) {
    const { crop, cropsByPageId, setCropDraft, cancelCrop } = usePdfUtilities();
    const overlayRef = useRef<HTMLDivElement>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const frameRef = useRef(0);
    const pendingRectRef = useRef<ViewportRect | null>(null);
    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);
    if (!crop.isEditing) return null;
    const dimensions = { width: page.width, height: page.height };
    const currentCrop = crop.draftByPageId[page.id] ?? cropsByPageId[page.id] ?? { left: 0, right: 0, top: 0, bottom: 0 };
    const cropRect = cropMarginsToViewportRect(currentCrop, dimensions, layout.viewport);
    const descriptionId = `crop-description-${page.id}`;
    const viewportPoint = (event: PointerEvent<HTMLDivElement>) => {
        const rect = overlayRef.current?.getBoundingClientRect();
        return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
    };
    const setFromRect = (rect: ViewportRect) => setCropDraft(page.id, viewportRectToCropMargins(rect, dimensions, layout.viewport));
    const scheduleRect = (rect: ViewportRect) => { pendingRectRef.current = rect; if (!frameRef.current) frameRef.current = requestAnimationFrame(() => { frameRef.current = 0; if (pendingRectRef.current) setFromRect(pendingRectRef.current); }); };
    const release = (event: PointerEvent<HTMLDivElement>) => { if (pendingRectRef.current) setFromRect(pendingRectRef.current); pendingRectRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); gestureRef.current = null; };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        const target = event.target as HTMLElement;
        const handle = target.closest<HTMLElement>('[data-crop-handle]')?.dataset.cropHandle as CropHandle | undefined;
        const cropBody = Boolean(target.closest('[data-crop-body]'));
        const point = viewportPoint(event);
        const isFullPage = cropRect.width >= layout.width - 1 && cropRect.height >= layout.height - 1;
        gestureRef.current = { handle: handle ?? (cropBody && !isFullPage ? 'move' : 'create'), start: point, rect: cropRect, crop: currentCrop };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        const point = viewportPoint(event);
        const viewport = { width: layout.width, height: layout.height };
        const next = gesture.handle === 'create'
            ? { left: Math.min(gesture.start.x, point.x), top: Math.min(gesture.start.y, point.y), width: Math.abs(point.x - gesture.start.x), height: Math.abs(point.y - gesture.start.y) }
            : gesture.handle === 'move'
                ? moveViewportRect(gesture.rect, point.x - gesture.start.x, point.y - gesture.start.y, viewport)
                : resizeViewportRect(gesture.rect, gesture.handle, point, viewport);
        scheduleRect(next);
    };
    const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
        const gesture = gestureRef.current;
        if (gesture) setCropDraft(page.id, gesture.crop);
        pendingRectRef.current = null; cancelAnimationFrame(frameRef.current); frameRef.current = 0; release(event);
    };
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            const gesture = gestureRef.current;
            if (gesture) setCropDraft(page.id, gesture.crop); else cancelCrop(page.id);
            gestureRef.current = null;
            event.preventDefault();
            return;
        }
        const step = event.shiftKey ? 20 : 2;
        const offsets: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const offset = offsets[event.key];
        if (!offset) return;
        setFromRect(moveViewportRect(cropRect, offset[0], offset[1], { width: layout.width, height: layout.height }));
        event.preventDefault();
    };
    return <div ref={overlayRef} className="crop-overlay" role="group" aria-label="Interactive crop rectangle" aria-describedby={descriptionId} tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={release} onPointerCancel={onPointerCancel} onKeyDown={onKeyDown}>
        <span id={descriptionId} className="sr-only">{cropAreaDescription(page.width, page.height, currentCrop)}</span>
        <div className="crop-overlay__rectangle" data-crop-body style={{ left: cropRect.left, top: cropRect.top, width: cropRect.width, height: cropRect.height }}>{handles.map((handle) => <span key={handle} className={`crop-overlay__handle crop-overlay__handle--${handle}`} data-crop-handle={handle} aria-hidden="true" />)}</div>
    </div>;
}

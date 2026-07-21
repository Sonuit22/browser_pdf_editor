import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Download, Highlighter, ImagePlus, MousePointer2, Pencil, PenLine, Redo2, Shapes, Trash2, Undo2 } from 'lucide-react';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { createAnnotationId } from '../utils/annotationUtils';
import type { EditorTool, ImageAnnotation } from '../types/annotations';
import { notify } from '../../../../components/feedback/notifications';
import { readBrowserImage } from '../../../../utils/imageFiles';
import { normalizeHighlighterSettings } from '../utils/annotationRendering';

const mainTools: Array<[EditorTool, string, typeof Pencil]> = [
    ['select', 'Select objects', MousePointer2], ['text', 'Add Text', Pencil], ['image', 'Add Image', ImagePlus],
    ['draw', 'Draw', PenLine], ['rectangle', 'Add Shape', Shapes], ['highlight', 'Highlighter', Highlighter],
];
const highlightColors = [['Yellow', '#ffe066'], ['Light Green', '#9be7a5'], ['Light Blue', '#8fd3ff'], ['Pink', '#ff9fca'], ['Orange', '#ffbd70']];
const shapeTools: Array<[EditorTool, string]> = [['rectangle', 'Rectangle'], ['rounded-rectangle', 'Rounded rectangle'], ['ellipse', 'Ellipse / Circle'], ['line', 'Line'], ['arrow', 'Arrow'], ['triangle', 'Triangle']];
const HIGHLIGHTER_POPOVER_WIDTH = 300;

function highlighterPopoverPosition(button: HTMLButtonElement | null) {
    if (!button) return { left: 12, top: 12 };
    const rect = button.getBoundingClientRect();
    const width = Math.min(HIGHLIGHTER_POPOVER_WIDTH, window.innerWidth - 24);
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left));
    const estimatedHeight = 286;
    const below = rect.bottom + 8;
    const top = below + estimatedHeight <= window.innerHeight ? below : Math.max(12, rect.top - estimatedHeight - 8);
    return { left, top };
}

export function EditorToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const editor = usePdfEditor();
    const { activePage, activePageId } = usePdfPageOperations();
    const imageInput = useRef<HTMLInputElement>(null);
    const highlighterButton = useRef<HTMLButtonElement>(null);
    const previousPageId = useRef(activePageId);
    const [imageBusy, setImageBusy] = useState(false);
    const [isHighlighterPopoverOpen, setHighlighterPopoverOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ left: 12, top: 12 });
    const isHighlighterActive = editor.activeTool === 'highlight';
    const normalizedHighlighter = normalizeHighlighterSettings(editor.highlighterSettings);
    const highlighterColor = normalizedHighlighter.color;
    const highlighterSize = normalizedHighlighter.strokeWidth;
    const focusHighlighterButton = useCallback(() => {
        window.requestAnimationFrame(() => highlighterButton.current?.focus());
    }, []);
    const deactivateHighlighter = useCallback((restoreFocus = false) => {
        setHighlighterPopoverOpen(false);
        if (editor.activeTool === 'highlight') editor.setTool('select');
        if (restoreFocus) focusHighlighterButton();
    }, [editor, focusHighlighterButton]);
    const chooseTool = (tool: EditorTool) => {
        if (tool === 'image') {
            deactivateHighlighter();
            if (!imageBusy) imageInput.current?.click();
        } else if (tool === 'highlight') {
            setPopoverPosition(highlighterPopoverPosition(highlighterButton.current));
            editor.setTool('highlight');
            setHighlighterPopoverOpen(true);
        } else {
            setHighlighterPopoverOpen(false);
            editor.setTool(tool);
        }
    };
    useEffect(() => {
        if (!isHighlighterActive && isHighlighterPopoverOpen) {
            setHighlighterPopoverOpen(false);
            focusHighlighterButton();
        }
    }, [focusHighlighterButton, isHighlighterActive, isHighlighterPopoverOpen]);
    useEffect(() => {
        const previous = previousPageId.current;
        previousPageId.current = activePageId;
        if (previous && previous !== activePageId && isHighlighterActive) deactivateHighlighter();
    }, [activePageId, deactivateHighlighter, isHighlighterActive]);
    useEffect(() => {
        if (!isHighlighterPopoverOpen) return;
        const updatePosition = () => setPopoverPosition(highlighterPopoverPosition(highlighterButton.current));
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isHighlighterPopoverOpen]);
    useEffect(() => {
        if (!isHighlighterPopoverOpen) return;
        const onDocumentPointerDown = (event: globalThis.PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('[data-highlighter-controls],[data-highlighter-trigger]')) return;
            if (target?.closest('.annotation-overlay')) return;
            deactivateHighlighter();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                deactivateHighlighter(true);
            }
        };
        document.addEventListener('pointerdown', onDocumentPointerDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onDocumentPointerDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [deactivateHighlighter, isHighlighterPopoverOpen]);
    const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file || !activePage || imageBusy) return;
        setImageBusy(true);
        try {
            const source = await readBrowserImage(file);
            const maxWidth = Math.min(activePage.width * .45, source.width);
            const width = Math.max(80, maxWidth);
            const height = width / (source.width / source.height);
            const now = Date.now();
            const annotation: ImageAnnotation = {
                id: createAnnotationId(), pageId: activePage.id, type: 'image', source: source.data, mimeType: source.mimeType,
                aspectRatio: source.width / source.height, x: (activePage.width - width) / 2, y: (activePage.height - height) / 2,
                width, height, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: now, updatedAt: now,
            };
            editor.add(annotation); editor.setTool('select'); notify('Image added to the current page.');
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The image could not be loaded. Choose a valid JPG, PNG, or WebP file.', 'error');
        }
        finally { setImageBusy(false); }
    };
    const updateHighlighter = (patch: Partial<typeof editor.highlighterSettings>) => {
        editor.updateHighlighterSettings(normalizeHighlighterSettings({ ...editor.highlighterSettings, ...patch }));
    };
    const highlighterPopover = isHighlighterPopoverOpen && isHighlighterActive && typeof document !== 'undefined'
        ? createPortal(<section id="highlighter-settings-popover" className="highlighter-settings highlighter-settings--popover" aria-label="Highlighter settings" data-highlighter-controls role="dialog" style={{ left: popoverPosition.left, top: popoverPosition.top, width: Math.min(HIGHLIGHTER_POPOVER_WIDTH, window.innerWidth - 24) }}>
            <div className="highlighter-settings__heading"><div><Highlighter size={18} aria-hidden="true" /><strong>Highlighter</strong></div><span className="highlighter-current-color"><i style={{ backgroundColor: highlighterColor }} aria-hidden="true" />Active color</span></div>
            <fieldset><legend>Color</legend><div className="color-swatches">{highlightColors.map(([label, color]) => {
                const selected = highlighterColor.toLowerCase() === color;
                return <button type="button" key={color} aria-label={`${label} highlighter`} title={label} aria-pressed={selected} className={selected ? 'is-selected' : ''} style={{ backgroundColor: color }} onClick={() => updateHighlighter({ color })}>{selected && <Check size={16} aria-hidden="true" />}</button>;
            })}<label className="custom-color" title="Custom highlight color"><span>Custom</span><input type="color" aria-label="Custom highlight color" value={highlighterColor} onChange={(event) => updateHighlighter({ color: event.target.value })} /></label></div></fieldset>
            <label className="highlighter-range"><span>Darkness <output>{Math.round(normalizedHighlighter.opacity * 100)}%</output></span><input type="range" min="10" max="60" step="1" value={Math.round(normalizedHighlighter.opacity * 100)} onChange={(event) => updateHighlighter({ opacity: Number(event.target.value) / 100 })} /></label>
            <label className="highlighter-range"><span>Marker size <output>{Math.round(highlighterSize)}px</output></span><input type="range" min="8" max="40" step="1" value={highlighterSize} onChange={(event) => updateHighlighter({ strokeWidth: Number(event.target.value) })} /></label>
        </section>, document.body)
        : null;
    return <><div className="editor-toolbar" aria-label="PDF editing controls">
        <input ref={imageInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => void addImage(event)} />
        <div className="editor-toolbar__row" role="toolbar" aria-label="Editing tools">
            <div className="editor-toolbar__tools">{mainTools.map(([tool, label, Icon]) => {
                const highlighter = tool === 'highlight';
                return <button ref={highlighter ? highlighterButton : undefined} key={tool} className={`editor-tool${editor.activeTool === tool ? ' is-active' : ''}`} type="button" disabled={tool === 'image' && imageBusy} onClick={() => chooseTool(tool)} aria-label={label} aria-pressed={editor.activeTool === tool} aria-expanded={highlighter ? isHighlighterPopoverOpen : undefined} aria-controls={highlighter ? 'highlighter-settings-popover' : undefined} data-highlighter-trigger={highlighter ? '' : undefined} title={label}><Icon size={18} aria-hidden="true" /><span>{tool === 'image' && imageBusy ? 'Loading…' : label}</span>{highlighter && isHighlighterActive && <i className="highlighter-tool-color" style={{ backgroundColor: highlighterColor }} aria-hidden="true" />}</button>;
            })}</div>
            <div className="editor-toolbar__actions">
                <button className="icon-button" type="button" onClick={editor.undo} disabled={!editor.canUndo} aria-label="Undo" title="Undo"><Undo2 size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.redo} disabled={!editor.canRedo} aria-label="Redo" title="Redo"><Redo2 size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.duplicateSelected} disabled={!editor.selectedIds.length} aria-label="Duplicate selected object" title="Duplicate"><Copy size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.removeSelected} disabled={!editor.selectedIds.length} aria-label="Delete selected object" title="Delete"><Trash2 size={18} /></button>
                <button className="button button--compact" type="button" onClick={onExport} disabled={exporting} aria-label="Export edited PDF"><Download size={16} />{exporting ? 'Exporting' : 'Export'}</button>
            </div>
        </div>
        {['rectangle', 'rounded-rectangle', 'ellipse', 'line', 'arrow', 'triangle'].includes(editor.activeTool) && <div className="editor-properties" aria-label="Shape options"><strong>Shape</strong>{shapeTools.map(([tool, label]) => <button type="button" className={editor.activeTool === tool ? 'is-active' : ''} key={tool} onClick={() => editor.setTool(tool)}>{label}</button>)}</div>}
    </div>{highlighterPopover}</>;
}

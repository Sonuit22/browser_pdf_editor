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
const shapeToolNames = shapeTools.map(([tool]) => tool);
const POPOVER_WIDTH = 300;

function popoverPosition(button: HTMLButtonElement | null) {
    if (!button) return { left: 12, top: 12 };
    const rect = button.getBoundingClientRect();
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - 24);
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
    const [highlighterOpen, setHighlighterOpen] = useState(false);
    const [highlighterPosition, setHighlighterPosition] = useState({ left: 12, top: 12 });
    const isHighlighterActive = editor.activeTool === 'highlight';
    const normalizedHighlighter = normalizeHighlighterSettings(editor.highlighterSettings);

    const focusHighlighterButton = useCallback(() => {
        window.requestAnimationFrame(() => highlighterButton.current?.focus({ preventScroll: true }));
    }, []);
    const deactivateHighlighter = useCallback((restoreFocus = false) => {
        setHighlighterOpen(false);
        if (editor.activeTool === 'highlight') editor.setTool('select');
        if (restoreFocus) focusHighlighterButton();
    }, [editor, focusHighlighterButton]);
    const chooseTool = (tool: EditorTool) => {
        if (tool === 'image') {
            deactivateHighlighter();
            if (!imageBusy) imageInput.current?.click();
            return;
        }
        if (tool === 'highlight') {
            setHighlighterPosition(popoverPosition(highlighterButton.current));
            editor.setTool('highlight');
            setHighlighterOpen(true);
            return;
        }
        setHighlighterOpen(false);
        editor.setTool(tool);
    };

    useEffect(() => {
        if (!isHighlighterActive && highlighterOpen) {
            setHighlighterOpen(false);
            focusHighlighterButton();
        }
    }, [focusHighlighterButton, highlighterOpen, isHighlighterActive]);
    useEffect(() => {
        const previous = previousPageId.current;
        previousPageId.current = activePageId;
        if (previous && previous !== activePageId && isHighlighterActive) deactivateHighlighter();
    }, [activePageId, deactivateHighlighter, isHighlighterActive]);
    useEffect(() => {
        if (!highlighterOpen) return;
        const updatePosition = () => setHighlighterPosition(popoverPosition(highlighterButton.current));
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [highlighterOpen]);
    useEffect(() => {
        if (!highlighterOpen) return;
        const onPointerDown = (event: globalThis.PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('[data-highlighter-controls],[data-highlighter-trigger],.annotation-overlay')) return;
            deactivateHighlighter();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                deactivateHighlighter(true);
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [deactivateHighlighter, highlighterOpen]);

    const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !activePage || imageBusy) return;
        setImageBusy(true);
        try {
            const source = await readBrowserImage(file);
            const width = Math.max(80, Math.min(activePage.width * .45, source.width));
            const height = width / (source.width / source.height);
            const now = Date.now();
            const annotation: ImageAnnotation = {
                id: createAnnotationId(), pageId: activePage.id, type: 'image', source: source.data, mimeType: source.mimeType,
                aspectRatio: source.width / source.height, x: (activePage.width - width) / 2, y: (activePage.height - height) / 2,
                width, height, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0,
                fillColor: 'transparent', createdAt: now, updatedAt: now,
            };
            editor.add(annotation);
            editor.setTool('select');
            notify('Image added to the current page.');
        } catch (error) {
            notify(error instanceof Error ? error.message : 'The image could not be loaded. Choose a valid JPG, PNG, or WebP file.', 'error');
        } finally {
            setImageBusy(false);
        }
    };
    const updateHighlighter = (patch: Partial<typeof editor.highlighterSettings>) => {
        editor.updateHighlighterSettings(normalizeHighlighterSettings({ ...editor.highlighterSettings, ...patch }));
    };

    const highlighterPopover = highlighterOpen && isHighlighterActive && typeof document !== 'undefined'
        ? createPortal(<section id="highlighter-settings-popover" className="highlighter-settings" aria-label="Highlighter settings" data-highlighter-controls role="dialog" style={{ left: highlighterPosition.left, top: highlighterPosition.top, width: Math.min(POPOVER_WIDTH, window.innerWidth - 24) }}>
            <div className="highlighter-settings__heading"><div><Highlighter size={18} aria-hidden="true" /><strong>Highlighter</strong></div><span className="highlighter-current-color"><i style={{ backgroundColor: normalizedHighlighter.color }} aria-hidden="true" />Active color</span></div>
            <fieldset><legend>Color</legend><div className="color-swatches">{highlightColors.map(([label, color]) => {
                const selected = normalizedHighlighter.color.toLowerCase() === color;
                return <button type="button" key={color} aria-label={`${label} highlighter`} title={label} aria-pressed={selected} className={selected ? 'is-selected' : ''} style={{ backgroundColor: color }} onClick={() => updateHighlighter({ color })}>{selected && <Check size={16} aria-hidden="true" />}</button>;
            })}<label className="custom-color" title="Custom highlight color"><span>Custom</span><input type="color" aria-label="Custom highlight color" value={normalizedHighlighter.color} onChange={(event) => updateHighlighter({ color: event.target.value })} /></label></div></fieldset>
            <label className="highlighter-range"><span>Darkness <output>{Math.round(normalizedHighlighter.opacity * 100)}%</output></span><input type="range" min="10" max="60" value={Math.round(normalizedHighlighter.opacity * 100)} onChange={(event) => updateHighlighter({ opacity: Number(event.target.value) / 100 })} /></label>
            <label className="highlighter-range"><span>Marker size <output>{Math.round(normalizedHighlighter.strokeWidth)}px</output></span><input type="range" min="8" max="40" value={normalizedHighlighter.strokeWidth} onChange={(event) => updateHighlighter({ strokeWidth: Number(event.target.value) })} /></label>
        </section>, document.body)
        : null;

    return <><div className="editor-toolbar" aria-label="PDF editing controls">
        <input ref={imageInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => void addImage(event)} />
        <div className="editor-toolbar__row" role="toolbar" aria-label="Editing tools">
            <div className="editor-toolbar__tools">{mainTools.map(([tool, label, Icon]) => {
                const highlighter = tool === 'highlight';
                const shapeActive = tool === 'rectangle' && shapeToolNames.includes(editor.activeTool);
                return <button ref={highlighter ? highlighterButton : undefined} key={tool} className={`editor-tool${editor.activeTool === tool || shapeActive ? ' is-active' : ''}`} type="button" disabled={tool === 'image' && imageBusy} onClick={() => chooseTool(tool)} aria-label={label} aria-pressed={editor.activeTool === tool || shapeActive} aria-expanded={highlighter ? highlighterOpen : undefined} aria-controls={highlighter ? 'highlighter-settings-popover' : undefined} data-highlighter-trigger={highlighter ? '' : undefined} data-editor-tool={tool} title={label}><Icon size={18} aria-hidden="true" /><span>{tool === 'image' && imageBusy ? 'Loading…' : label}</span>{highlighter && isHighlighterActive && <i className="highlighter-tool-color" style={{ backgroundColor: normalizedHighlighter.color }} aria-hidden="true" />}</button>;
            })}</div>
            <div className="editor-toolbar__actions">
                <button className="icon-button" type="button" onClick={editor.undo} disabled={!editor.canUndo} aria-label="Undo" title="Undo"><Undo2 size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.redo} disabled={!editor.canRedo} aria-label="Redo" title="Redo"><Redo2 size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.duplicateSelected} disabled={!editor.selectedIds.length} aria-label="Duplicate selected object" title="Duplicate"><Copy size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.removeSelected} disabled={!editor.selectedIds.length} aria-label="Delete selected object" title="Delete"><Trash2 size={18} /></button>
                <button className="button button--compact" type="button" onClick={onExport} disabled={exporting} aria-label="Export edited PDF"><Download size={16} />{exporting ? 'Exporting' : 'Export'}</button>
            </div>
        </div>
    </div>{highlighterPopover}<ToolSettingsPopover /></>;
}

function ToolSettingsPopover() {
    const editor = usePdfEditor();
    const kind = editor.activeTool === 'text' ? 'text' : editor.activeTool === 'draw' ? 'draw' : shapeToolNames.includes(editor.activeTool) ? 'shape' : null;
    const [position, setPosition] = useState({ left: 12, top: 12 });
    useEffect(() => {
        if (!kind) return;
        const selector = kind === 'shape' ? '[data-editor-tool="rectangle"]' : `[data-editor-tool="${kind}"]`;
        const update = () => setPosition(popoverPosition(document.querySelector<HTMLButtonElement>(selector)));
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [kind]);
    if (!kind || typeof document === 'undefined') return null;
    return createPortal(<section className="tool-settings-popover" role="dialog" aria-label={`${kind} settings`} data-tool-settings style={{ left: position.left, top: position.top, width: Math.min(POPOVER_WIDTH, window.innerWidth - 24) }}>
        {kind === 'text' && <><strong>Text settings</strong><label>Color <input type="color" value={editor.textSettings.color} onChange={(event) => editor.updateTextSettings({ color: event.target.value })} /></label><label>Font size <output>{editor.textSettings.fontSize}px</output><input type="range" min="6" max="72" value={editor.textSettings.fontSize} onChange={(event) => editor.updateTextSettings({ fontSize: Number(event.target.value) })} /></label></>}
        {kind === 'draw' && <><strong>Draw settings</strong><label>Color <input type="color" value={editor.drawSettings.color} onChange={(event) => editor.updateDrawSettings({ color: event.target.value })} /></label><label>Stroke width <output>{editor.drawSettings.strokeWidth}px</output><input type="range" min="1" max="20" value={editor.drawSettings.strokeWidth} onChange={(event) => editor.updateDrawSettings({ strokeWidth: Number(event.target.value) })} /></label><label>Opacity <output>{Math.round(editor.drawSettings.opacity * 100)}%</output><input type="range" min="10" max="100" value={Math.round(editor.drawSettings.opacity * 100)} onChange={(event) => editor.updateDrawSettings({ opacity: Number(event.target.value) / 100 })} /></label></>}
        {kind === 'shape' && <><strong>Shape settings</strong><div className="shape-options">{shapeTools.map(([tool, label]) => <button type="button" className={editor.activeTool === tool ? 'is-active' : ''} key={tool} onClick={() => editor.setTool(tool)}>{label}</button>)}</div><label>Stroke <input type="color" value={editor.shapeSettings.strokeColor} onChange={(event) => editor.updateShapeSettings({ strokeColor: event.target.value })} /></label><label>Border width <output>{editor.shapeSettings.strokeWidth}px</output><input type="range" min="1" max="12" value={editor.shapeSettings.strokeWidth} onChange={(event) => editor.updateShapeSettings({ strokeWidth: Number(event.target.value) })} /></label><label>Opacity <output>{Math.round(editor.shapeSettings.opacity * 100)}%</output><input type="range" min="10" max="100" value={Math.round(editor.shapeSettings.opacity * 100)} onChange={(event) => editor.updateShapeSettings({ opacity: Number(event.target.value) / 100 })} /></label></>}
    </section>, document.body);
}

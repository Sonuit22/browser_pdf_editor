import { useRef, useState, type ChangeEvent } from 'react';
import { Copy, Download, Highlighter, ImagePlus, MousePointer2, Pencil, PenLine, Redo2, Shapes, Trash2, Undo2 } from 'lucide-react';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { createAnnotationId } from '../utils/annotationUtils';
import type { EditorTool, ImageAnnotation } from '../types/annotations';
import { notify } from '../../../../components/feedback/notifications';

const mainTools: Array<[EditorTool, string, typeof Pencil]> = [
    ['select', 'Select objects', MousePointer2], ['text', 'Add Text', Pencil], ['image', 'Add Image', ImagePlus],
    ['draw', 'Draw', PenLine], ['rectangle', 'Add Shape', Shapes], ['highlight', 'Highlighter', Highlighter],
];
const highlightColors = [['Yellow', '#ffe066'], ['Light Green', '#9be7a5'], ['Light Blue', '#8fd3ff'], ['Pink', '#ff9fca'], ['Orange', '#ffbd70']];
const shapeTools: Array<[EditorTool, string]> = [['rectangle', 'Rectangle'], ['rounded-rectangle', 'Rounded rectangle'], ['ellipse', 'Ellipse / Circle'], ['line', 'Line'], ['arrow', 'Arrow'], ['triangle', 'Triangle']];

export function EditorToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const editor = usePdfEditor();
    const { activePage } = usePdfPageOperations();
    const imageInput = useRef<HTMLInputElement>(null);
    const [imageBusy, setImageBusy] = useState(false);
    const selected = Object.values(editor.annotationsByPageId).flat().find((item) => item.id === editor.selectedId);
    const selectedHighlight = selected?.type === 'highlight' ? selected : null;
    const visibleHighlighter = selectedHighlight ?? editor.highlighterSettings;
    const chooseTool = (tool: EditorTool) => tool === 'image' ? imageInput.current?.click() : editor.setTool(tool);
    const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file || !activePage) return;
        setImageBusy(true);
        try {
            const source = await readCompatibleImage(file);
            const dimensions = await imageDimensions(source);
            const maxWidth = Math.min(activePage.width * .45, dimensions.width);
            const width = Math.max(80, maxWidth);
            const height = width / (dimensions.width / dimensions.height);
            const now = Date.now();
            const annotation: ImageAnnotation = {
                id: createAnnotationId(), pageId: activePage.id, type: 'image', source: source.data, mimeType: source.mimeType,
                aspectRatio: dimensions.width / dimensions.height, x: (activePage.width - width) / 2, y: (activePage.height - height) / 2,
                width, height, zIndex: now, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: now, updatedAt: now,
            };
            editor.add(annotation); editor.setTool('select'); notify('Image added to the current page.');
        } catch { notify('The image could not be loaded. Choose a valid JPG, PNG, or WebP file.', 'error'); }
        finally { setImageBusy(false); }
    };
    const updateHighlighter = (patch: Partial<typeof editor.highlighterSettings>) => {
        editor.updateHighlighterSettings(patch);
        if (selectedHighlight) editor.update(selectedHighlight.id, patch);
    };
    return <div className="editor-toolbar" aria-label="PDF editing controls">
        <input ref={imageInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => void addImage(event)} />
        <div className="editor-toolbar__row" role="toolbar" aria-label="Editing tools">
            <div className="editor-toolbar__tools">{mainTools.map(([tool, label, Icon]) => <button key={tool} className={`editor-tool${editor.activeTool === tool ? ' is-active' : ''}`} type="button" onClick={() => chooseTool(tool)} aria-label={label} aria-pressed={editor.activeTool === tool} title={label}><Icon size={18} aria-hidden="true" /><span>{tool === 'image' && imageBusy ? 'Loading…' : label}</span></button>)}</div>
            <div className="editor-toolbar__actions">
                <button className="icon-button" type="button" onClick={editor.undo} disabled={!editor.canUndo} aria-label="Undo" title="Undo"><Undo2 size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.redo} disabled={!editor.canRedo} aria-label="Redo" title="Redo"><Redo2 size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.duplicateSelected} disabled={!editor.selectedIds.length} aria-label="Duplicate selected object" title="Duplicate"><Copy size={18} /></button>
                <button className="icon-button" type="button" onClick={editor.removeSelected} disabled={!editor.selectedIds.length} aria-label="Delete selected object" title="Delete"><Trash2 size={18} /></button>
                <button className="button button--compact" type="button" onClick={onExport} disabled={exporting} aria-label="Export edited PDF"><Download size={16} />{exporting ? 'Exporting' : 'Export'}</button>
            </div>
        </div>
        {['rectangle', 'rounded-rectangle', 'ellipse', 'line', 'arrow', 'triangle'].includes(editor.activeTool) && <div className="editor-properties" aria-label="Shape options"><strong>Shape</strong>{shapeTools.map(([tool, label]) => <button type="button" className={editor.activeTool === tool ? 'is-active' : ''} key={tool} onClick={() => editor.setTool(tool)}>{label}</button>)}</div>}
        {(editor.activeTool === 'highlight' || selectedHighlight) && <section className="highlighter-settings" aria-label="Highlighter Settings">
            <div className="highlighter-settings__heading"><div><Highlighter size={18} aria-hidden="true" /><strong>Highlighter Settings</strong></div>{selectedHighlight && <span>Editing selected highlight</span>}</div>
            <fieldset><legend>Color</legend><div className="color-swatches">{highlightColors.map(([label, color]) => <button type="button" key={color} aria-label={label} title={label} aria-pressed={visibleHighlighter.color.toLowerCase() === color} className={visibleHighlighter.color.toLowerCase() === color ? 'is-selected' : ''} style={{ background: color }} onClick={() => updateHighlighter({ color })} />)}<label className="custom-color" title="Custom highlight color"><span>Custom</span><input type="color" aria-label="Custom highlight color" value={visibleHighlighter.color} onChange={(event) => updateHighlighter({ color: event.target.value })} /></label></div></fieldset>
            <label className="highlighter-range"><span>Highlight darkness <output>{Math.round(visibleHighlighter.opacity * 100)}%</output></span><input type="range" min="10" max="70" step="1" value={Math.round(visibleHighlighter.opacity * 100)} onChange={(event) => updateHighlighter({ opacity: Number(event.target.value) / 100 })} /></label>
            <label className="highlighter-range"><span>Marker size <output>{Math.round(visibleHighlighter.strokeWidth)}px</output></span><input type="range" min="8" max="40" step="1" value={visibleHighlighter.strokeWidth} onChange={(event) => updateHighlighter({ strokeWidth: Number(event.target.value) })} /></label>
            <div className="highlight-preview"><span>Preview</span><p><mark style={{ backgroundColor: rgba(visibleHighlighter.color, visibleHighlighter.opacity) }}>Preview text</mark></p></div>
            {selectedHighlight && <div className="highlighter-settings__actions"><button type="button" onClick={() => editor.duplicate(selectedHighlight.id)}><Copy size={16} />Duplicate Highlight</button><button type="button" onClick={() => editor.remove(selectedHighlight.id)}><Trash2 size={16} />Delete Highlight</button></div>}
        </section>}
    </div>;
}

async function readCompatibleImage(file: File): Promise<{ data: string; mimeType: 'image/png' | 'image/jpeg' }> {
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    if (file.type !== 'image/webp') return { data, mimeType: file.type === 'image/png' ? 'image/png' : 'image/jpeg' };
    const img = await loadImage(data); const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d')?.drawImage(img, 0, 0); return { data: canvas.toDataURL('image/png'), mimeType: 'image/png' };
}
const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
async function imageDimensions(source: { data: string }) { const image = await loadImage(source.data); return { width: image.naturalWidth, height: image.naturalHeight }; }
function rgba(hex: string, opacity: number) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((part) => part + part).join('') : value;
    return `rgba(${Number.parseInt(full.slice(0, 2), 16)}, ${Number.parseInt(full.slice(2, 4), 16)}, ${Number.parseInt(full.slice(4, 6), 16)}, ${opacity})`;
}

import { Download, Pencil, Highlighter, PenLine, Redo2, Shapes, Trash2, Undo2, Copy, ImagePlus } from 'lucide-react';
import { usePdfEditor } from '../hooks/usePdfEditor';
import type { EditorTool } from '../types/annotations';

const tools: Array<[EditorTool, string, typeof Pencil]> = [
    ['text', 'Add Text', Pencil],
    ['image', 'Add Image', ImagePlus],
    ['draw', 'Draw', PenLine],
    ['rectangle', 'Add Shape', Shapes],
    ['highlight', 'Highlighter', Highlighter],
];

export function EditorToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const { activeTool, selectedIds, canUndo, canRedo, setTool, removeSelected, duplicateSelected, undo, redo } = usePdfEditor();
    return <div className="editor-toolbar" role="toolbar" aria-label="Annotation tools"><div className="editor-toolbar__tools" role="group" aria-label="Annotation tools">{tools.map(([tool, label, Icon]) => <button key={tool} className={`icon-button${activeTool === tool ? ' is-active' : ''}`} type="button" onClick={() => setTool(tool)} aria-label={label} aria-pressed={activeTool === tool} title={label}><Icon size={17} aria-hidden="true" /></button>)}</div><div className="editor-toolbar__actions" role="group" aria-label="Edit actions"><button className="icon-button" type="button" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo"><Undo2 size={17} aria-hidden="true" /></button><button className="icon-button" type="button" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo"><Redo2 size={17} aria-hidden="true" /></button><button className="icon-button" type="button" onClick={duplicateSelected} disabled={!selectedIds.length} aria-label="Duplicate selected annotations" title="Duplicate"><Copy size={17} aria-hidden="true" /></button><button className="icon-button" type="button" onClick={removeSelected} disabled={!selectedIds.length} aria-label="Delete selected annotations" title="Delete"><Trash2 size={17} aria-hidden="true" /></button><button className="button button--secondary button--compact" type="button" onClick={onExport} disabled={exporting} aria-label="Export edited PDF"><Download size={16} aria-hidden="true" />{exporting ? 'Exporting' : 'Export'}</button></div></div>;
}

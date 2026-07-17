import { memo, type ComponentType } from 'react';
import { AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical, History, Layers, MessageSquareText, SlidersHorizontal, type LucideProps } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { usePdfEditor } from '../modules/pdf/editor/hooks/usePdfEditor';

const panels: Array<[string, string, ComponentType<LucideProps>]> = [
    ['Properties', 'Document details will appear here.', SlidersHorizontal],
    ['Layers', 'Layer controls are reserved for editor tools.', Layers],
    ['Annotations', 'Comments and markup will appear here.', MessageSquareText],
    ['History', 'Document history will appear here.', History],
];

export const RightPanel = memo(function RightPanel() {
    const { info } = usePdfEngine();
    const { annotationsByPageId, selectedId, selectedIds, update, remove, duplicate, reorder, alignSelected, layout, updateLayout, flattenForms, setFlattenForms, history } = usePdfEditor();
    const selected = Object.values(annotationsByPageId).flat().find((annotation) => annotation.id === selectedId);
    return (
        <aside className="right-panel" aria-label="Future tools panel">
            <div className="right-panel__heading"><p className="eyebrow">Inspector</p><h2>Tools</h2></div>
            <div className="right-panel__cards">
                {info && <Card className="document-info"><h3>Document information</h3><dl><div><dt>Filename</dt><dd>{info.filename}</dd></div><div><dt>PDF version</dt><dd>{info.version}</dd></div><div><dt>Title</dt><dd>{info.title}</dd></div><div><dt>Author</dt><dd>{info.author}</dd></div><div><dt>Subject</dt><dd>{info.subject}</dd></div><div><dt>Created</dt><dd>{info.creationDate}</dd></div><div><dt>Modified</dt><dd>{info.modificationDate}</dd></div></dl></Card>}
                {selected && <Card className="document-info"><h3>Selected {selected.type}</h3><label>Opacity<input type="number" min="0" max="1" step="0.1" value={selected.opacity} onChange={(event) => update(selected.id, { opacity: Math.max(0, Math.min(1, Number(event.target.value))) })} /></label><label>Rotation<input type="number" value={selected.rotation} onChange={(event) => update(selected.id, { rotation: Number(event.target.value) || 0 })} /></label>{selected.type === 'text' && <label>Added text<input type="text" value={selected.text} onChange={(event) => update(selected.id, { text: event.target.value })} /></label>}{selected.type === 'stamp' && <label>Stamp text<input value={selected.text} onChange={(event) => update(selected.id, { text: event.target.value })} /></label>}{('name' in selected) && <><label>Field name<input value={selected.name} onChange={(event) => update(selected.id, { name: event.target.value })} /></label><label><input type="checkbox" checked={selected.required} onChange={(event) => update(selected.id, { required: event.target.checked })} /> Required</label></>}<div className="property-actions"><button type="button" onClick={() => reorder(selected.id, 'backward')}>Back</button><button type="button" onClick={() => reorder(selected.id, 'forward')}>Forward</button><button type="button" onClick={() => duplicate(selected.id)}>Duplicate</button><button type="button" onClick={() => remove(selected.id)}>Delete</button></div></Card>}
                <Card className="document-info"><h3>Professional editing</h3><label><input type="checkbox" checked={flattenForms} onChange={(event) => setFlattenForms(event.target.checked)} /> Flatten form on export</label><label><input type="checkbox" checked={layout.showRulers} onChange={(event) => updateLayout({ showRulers: event.target.checked })} /> Show rulers</label><label><input type="checkbox" checked={layout.showGrid} onChange={(event) => updateLayout({ showGrid: event.target.checked })} /> Show grid</label><label><input type="checkbox" checked={layout.snapToGrid} onChange={(event) => updateLayout({ snapToGrid: event.target.checked })} /> Snap to grid</label><label>Grid spacing<input type="number" min="4" value={layout.gridSpacing} onChange={(event) => updateLayout({ gridSpacing: Math.max(4, Number(event.target.value)) })} /></label><div className="property-actions"><button type="button" onClick={() => updateLayout({ guides: [...layout.guides, { id: `h-${Date.now()}`, axis: 'horizontal', position: 144 }] })}>Add horizontal guide</button><button type="button" onClick={() => updateLayout({ guides: [...layout.guides, { id: `v-${Date.now()}`, axis: 'vertical', position: 144 }] })}>Add vertical guide</button><button type="button" onClick={() => updateLayout({ guides: [] })}>Clear guides</button></div></Card>
                {selectedIds.length > 1 && <Card className="document-info"><h3>Align {selectedIds.length} annotations</h3><div className="property-actions"><button type="button" onClick={() => alignSelected('left')} aria-label="Align left"><AlignStartVertical size={15} /></button><button type="button" onClick={() => alignSelected('right')} aria-label="Align right"><AlignEndVertical size={15} /></button><button type="button" onClick={() => alignSelected('top')} aria-label="Align top"><AlignStartHorizontal size={15} /></button><button type="button" onClick={() => alignSelected('bottom')} aria-label="Align bottom"><AlignEndHorizontal size={15} /></button><button type="button" onClick={() => alignSelected('center-horizontal')} aria-label="Center horizontally"><AlignCenterHorizontal size={15} /></button><button type="button" onClick={() => alignSelected('center-vertical')} aria-label="Center vertically"><AlignCenterVertical size={15} /></button></div></Card>}
                <Card className="document-info"><h3>History</h3><p>{history.length} undoable edit{history.length === 1 ? '' : 's'} available.</p></Card>
                {panels.map(([title, description, Icon]) => (
                    <Card key={title} className="panel-card">
                        <Icon size={17} aria-hidden="true" />
                        <div><h3>{title}</h3><p>{description}</p></div>
                    </Card>
                ))}
            </div>
        </aside>
    );
});

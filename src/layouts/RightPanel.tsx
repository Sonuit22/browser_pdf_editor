import { memo, type ComponentType } from 'react';
import { History, Layers, MessageSquareText, SlidersHorizontal, type LucideProps } from 'lucide-react';
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
    const { annotationsByPageId, selectedId, update, remove, duplicate, reorder } = usePdfEditor();
    const selected = Object.values(annotationsByPageId).flat().find((annotation) => annotation.id === selectedId);
    return (
        <aside className="right-panel" aria-label="Future tools panel">
            <div className="right-panel__heading"><p className="eyebrow">Inspector</p><h2>Tools</h2></div>
            <div className="right-panel__cards">
                {info && <Card className="document-info"><h3>Document information</h3><dl><div><dt>Filename</dt><dd>{info.filename}</dd></div><div><dt>PDF version</dt><dd>{info.version}</dd></div><div><dt>Title</dt><dd>{info.title}</dd></div><div><dt>Author</dt><dd>{info.author}</dd></div><div><dt>Subject</dt><dd>{info.subject}</dd></div><div><dt>Created</dt><dd>{info.creationDate}</dd></div><div><dt>Modified</dt><dd>{info.modificationDate}</dd></div></dl></Card>}
                {selected && <Card className="document-info"><h3>Selected {selected.type}</h3><label>Opacity<input type="number" min="0" max="1" step="0.1" value={selected.opacity} onChange={(event) => update(selected.id, { opacity: Math.max(0, Math.min(1, Number(event.target.value))) })} /></label><label>Rotation<input type="number" value={selected.rotation} onChange={(event) => update(selected.id, { rotation: Number(event.target.value) || 0 })} /></label>{selected.type === 'text' && <label>Added text<input type="text" value={selected.text} onChange={(event) => update(selected.id, { text: event.target.value })} /></label>}<div className="property-actions"><button type="button" onClick={() => reorder(selected.id, 'backward')}>Back</button><button type="button" onClick={() => reorder(selected.id, 'forward')}>Forward</button><button type="button" onClick={() => duplicate(selected.id)}>Duplicate</button><button type="button" onClick={() => remove(selected.id)}>Delete</button></div></Card>}
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

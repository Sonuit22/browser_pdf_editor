import { memo, type ComponentType } from 'react';
import { Bot, History, Layers, MessageSquareText, SlidersHorizontal, type LucideProps } from 'lucide-react';
import { Card } from '../components/ui/Card';

const panels: Array<[string, string, ComponentType<LucideProps>]> = [
    ['Properties', 'Document details will appear here.', SlidersHorizontal],
    ['Layers', 'Layer controls are reserved for editor tools.', Layers],
    ['Annotations', 'Comments and markup will appear here.', MessageSquareText],
    ['History', 'Document history will appear here.', History],
    ['AI Assistant', 'Optional assistance will appear here.', Bot],
];

export const RightPanel = memo(function RightPanel() {
    return (
        <aside className="right-panel" aria-label="Future tools panel">
            <div className="right-panel__heading"><p className="eyebrow">Inspector</p><h2>Tools</h2></div>
            <div className="right-panel__cards">
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

import { Link } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export default function HomePage() {
    return <main className="tool-dashboard">
        <div className="tool-card-grid">{toolRegistry.map((tool) => {
            const Icon = tool.icon;
            const content = <><Icon size={26} strokeWidth={1.8} aria-hidden="true" /><strong>{tool.title}</strong><p>{tool.description}</p>{tool.badge && <span className="tool-status-badge">{tool.badge}</span>}</>;
            return tool.enabled
                ? <Link className={`tool-dashboard-card tool-dashboard-card--${tool.status}`} key={tool.id} to={tool.route} aria-label={`${tool.title}. ${tool.description}${tool.badge ? `. ${tool.badge}` : ''}`}>{content}</Link>
                : <article className="tool-dashboard-card tool-dashboard-card--disabled" key={tool.id} aria-disabled="true" aria-label={`${tool.title}, coming soon. ${tool.description}`}>{content}</article>;
        })}</div>
    </main>;
}

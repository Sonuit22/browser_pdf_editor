import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export default function AllToolsPage() {
    return <section className="info-page all-tools-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><p>Tool catalogue</p><h1>All PDF Tools</h1><span>Browse tools by their audited Available, Beta, or Coming Soon status.</span></header>
        <div className="tool-card-grid">{toolRegistry.map((tool) => {
            const content = <><span className="tool-card-icon"><tool.icon size={25} aria-hidden="true" /></span><strong>{tool.title}</strong><p>{tool.description}</p><span className={`tool-status-badge tool-status-badge--${tool.status}`}>{tool.status === 'available' && <CheckCircle2 size={12} aria-hidden="true" />}{tool.badge ?? 'Available'}</span></>;
            return tool.enabled
                ? <Link key={tool.id} className={`tool-dashboard-card tool-dashboard-card--${tool.status}`} to={tool.route}>{content}</Link>
                : <article key={tool.id} className="tool-dashboard-card tool-dashboard-card--disabled" aria-disabled="true">{content}</article>;
        })}</div>
    </section>;
}

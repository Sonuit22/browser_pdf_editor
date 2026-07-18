import { Link } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export default function HomePage() {
    return <main className="tool-dashboard">
        <div className="tool-card-grid">{toolRegistry.map((tool) => { const Icon = tool.icon; return <Link className="tool-dashboard-card" key={tool.id} to={tool.route} aria-label={tool.title}><Icon size={25} strokeWidth={1.8} aria-hidden="true" /><strong>{tool.title}</strong></Link>; })}</div>
    </main>;
}

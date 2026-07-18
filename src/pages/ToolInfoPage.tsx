import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export default function ToolInfoPage() {
    const { pathname } = useLocation();
    const tool = toolRegistry.find((item) => item.route === pathname);
    if (!tool) return null;
    return <section className="tool-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />All tools</Link>
        <div className="tool-page__heading"><tool.icon size={28} aria-hidden="true" /><div><p>Local browser tool</p><h1>{tool.title}</h1></div></div>
        <div className="coming-soon-panel" role="status"><span className="tool-status-badge">Coming Soon</span><h2>This tool is under development and will be available soon.</h2><p>{tool.limitation}</p><p>No upload or processing action is enabled until the complete workflow can produce a reliable output.</p></div>
    </section>;
}

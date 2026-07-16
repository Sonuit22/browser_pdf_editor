import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToolCard } from '../components/ToolCard';
import { tools } from '../data/tools';

export function HomePage() {
    return (
        <div className="workspace-page">
            <section className="workspace-intro" aria-labelledby="workspace-title">
                <div>
                    <p className="eyebrow">Workspace</p>
                    <h1 id="workspace-title">Choose a PDF tool</h1>
                    <p>Every workflow will run in the browser. Select a workspace to explore its planned interface.</p>
                </div>
                <div className="privacy-note">
                    <ShieldCheck size={22} aria-hidden="true" />
                    <div>
                        <strong>Local-first by design</strong>
                        <span>Processing controls will stay on-device as tools are introduced.</span>
                    </div>
                </div>
            </section>

            <section className="tool-section" aria-labelledby="tools-title">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">Planned tools</p>
                        <h2 id="tools-title">Document workflows</h2>
                    </div>
                    <Link className="text-link" to="/organize">
                        Explore organization <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                </div>
                <div className="tool-grid">
                    {tools.map((tool) => <ToolCard key={tool.path} tool={tool} />)}
                </div>
            </section>
        </div>
    );
}

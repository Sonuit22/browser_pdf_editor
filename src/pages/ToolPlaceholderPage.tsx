import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ToolDefinition } from '../data/tools';

export function ToolPlaceholderPage({ tool }: { tool: ToolDefinition }) {
    const Icon = tool.icon;

    return (
        <section className="tool-page" aria-labelledby="tool-title">
            <Link className="back-link" to="/">
                <ArrowLeft size={17} aria-hidden="true" />
                All tools
            </Link>
            <div className="tool-page__header">
                <span className="tool-page__icon" aria-hidden="true"><Icon size={30} strokeWidth={1.7} /></span>
                <div>
                    <p className="eyebrow">{tool.group}</p>
                    <h1 id="tool-title">{tool.name}</h1>
                    <p>{tool.summary}</p>
                </div>
            </div>
            <div className="empty-workspace" role="status">
                <Sparkles size={22} aria-hidden="true" />
                <div>
                    <strong>This workspace is being prepared.</strong>
                    <p>PDF processing is intentionally not enabled yet. The page is ready for the corresponding browser-only workflow.</p>
                </div>
            </div>
        </section>
    );
}

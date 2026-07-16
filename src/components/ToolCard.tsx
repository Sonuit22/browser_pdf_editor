import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ToolDefinition } from '../data/tools';

export function ToolCard({ tool }: { tool: ToolDefinition }) {
    const Icon = tool.icon;

    return (
        <Link className="tool-card" to={tool.path}>
            <span className="tool-card__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.8} />
            </span>
            <span className="tool-card__body">
                <span className="tool-card__title">{tool.name}</span>
                <span className="tool-card__summary">{tool.summary}</span>
            </span>
            <ArrowUpRight className="tool-card__arrow" size={18} aria-hidden="true" />
        </Link>
    );
}

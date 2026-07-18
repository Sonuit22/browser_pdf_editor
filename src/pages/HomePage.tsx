import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

const taglines = [
    'Edit smarter. Keep every file private.',
    'Powerful PDF tools, right in your browser.',
    'From document to done — beautifully simple.',
];

export default function HomePage() {
    const [phrase, setPhrase] = useState(0);
    const [length, setLength] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const current = taglines[phrase];
        const complete = length === current.length;
        const empty = length === 0;
        const delay = complete && !deleting ? 1800 : deleting ? 34 : 58;
        const timer = window.setTimeout(() => {
            if (complete && !deleting) setDeleting(true);
            else if (empty && deleting) {
                setDeleting(false);
                setPhrase((value) => (value + 1) % taglines.length);
            } else setLength((value) => value + (deleting ? -1 : 1));
        }, delay);
        return () => window.clearTimeout(timer);
    }, [deleting, length, phrase]);

    return <main className="tool-dashboard">
        <header className="landing-intro">
            <p className="landing-intro__eyebrow">PDF Editor by ib</p>
            <h1>Everything your PDF needs.</h1>
            <p className="dynamic-tagline" aria-hidden="true"><span>{taglines[phrase].slice(0, length)}</span><i /></p>
            <p className="sr-only">Powerful, private PDF tools that work in your browser.</p>
        </header>
        <div className="tool-card-grid">{toolRegistry.map((tool) => {
            const Icon = tool.icon;
            const content = <><Icon size={26} strokeWidth={1.8} aria-hidden="true" /><strong>{tool.title}</strong><p>{tool.description}</p>{tool.badge && <span className="tool-status-badge">{tool.badge}</span>}</>;
            return tool.enabled
                ? <Link className={`tool-dashboard-card tool-dashboard-card--${tool.status}`} key={tool.id} to={tool.route} aria-label={`${tool.title}. ${tool.description}${tool.badge ? `. ${tool.badge}` : ''}`}>{content}</Link>
                : <article className="tool-dashboard-card tool-dashboard-card--disabled" key={tool.id} aria-disabled="true" aria-label={`${tool.title}, coming soon. ${tool.description}`}>{content}</article>;
        })}</div>
    </main>;
}

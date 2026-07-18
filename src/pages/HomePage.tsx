import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { filterTools } from '../config/toolRegistry';

const messages = [
    'Your data stays in your browser.', 'No server upload required.', 'Fast. Secure. Private.',
    '100% Browser-Based PDF Editor.', 'Everything happens locally.', 'Your files never leave your device.',
];

function TypingTagline() {
    const [message, setMessage] = useState(0);
    const [length, setLength] = useState(0);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const text = messages[message];
        const atEnd = length === text.length;
        const atStart = length === 0;
        const delay = atEnd && !deleting ? 1400 : deleting ? 38 : 58;
        const timer = window.setTimeout(() => {
            if (atEnd && !deleting) setDeleting(true);
            else if (atStart && deleting) { setDeleting(false); setMessage((value) => (value + 1) % messages.length); }
            else setLength((value) => value + (deleting ? -1 : 1));
        }, delay);
        return () => window.clearTimeout(timer);
    }, [deleting, length, message]);
    return <p className="typing-tagline" aria-live="polite"><span>{messages[message].slice(0, length) || messages[0]}</span><i aria-hidden="true" /></p>;
}

export default function HomePage() {
    const [query, setQuery] = useState('');
    const tools = useMemo(() => filterTools('All', query), [query]);
    return <main className="tool-dashboard">
        <div className="home-brand"><h1>PDF Editor</h1><span>by ib</span></div>
        <TypingTagline />
        <label className="dashboard-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Search PDF tools</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PDF tools..." />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={17} aria-hidden="true" /></button>}</label>
        {tools.length ? <div className="tool-card-grid">{tools.map((tool) => { const Icon = tool.icon; return <Link className="tool-dashboard-card" key={tool.id} to={tool.route} aria-label={tool.title}><Icon size={25} strokeWidth={1.8} aria-hidden="true" /><strong>{tool.title}</strong></Link>; })}</div> : <div className="no-tools" role="status"><Search size={24} aria-hidden="true" /><strong>No tools found</strong><span>Try a different tool name.</span></div>}
    </main>;
}

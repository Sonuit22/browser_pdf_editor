import { memo, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export const Sidebar = memo(function Sidebar({ onNavigate }: { onNavigate: () => void }) {
    const aside = useRef<HTMLElement>(null);
    useEffect(() => { aside.current?.querySelector<HTMLAnchorElement>('a')?.focus(); }, []);
    return <aside ref={aside} id="tool-sidebar" className="sidebar" aria-label="PDF tools">
        <div className="sidebar__heading"><strong>PDF tools</strong><button className="icon-button" type="button" onClick={onNavigate} aria-label="Close tools"><X size={18} /></button></div>
        <nav>{toolRegistry.map((item) => { const Icon = item.icon; return <NavLink key={item.id} to={item.route} onClick={onNavigate} aria-label={item.title} data-tooltip={item.title}><Icon size={21} strokeWidth={1.8} aria-hidden="true" /><span>{item.title}</span></NavLink>; })}</nav>
    </aside>;
});

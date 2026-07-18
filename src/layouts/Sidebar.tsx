import { memo, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export const Sidebar = memo(function Sidebar({ onNavigate }: { onNavigate: () => void }) {
    const aside = useRef<HTMLElement>(null);
    useEffect(() => { aside.current?.querySelector<HTMLAnchorElement>('a')?.focus(); }, []);
    return <aside ref={aside} id="tool-sidebar" className="sidebar" aria-label="PDF tools">
        <nav>{toolRegistry.map((item) => { const Icon = item.icon; return <NavLink key={item.id} to={item.route} onClick={onNavigate} aria-label={item.title} data-tooltip={item.title}><Icon size={22} strokeWidth={1.8} aria-hidden="true" /><span className="sr-only">{item.title}</span></NavLink>; })}</nav>
    </aside>;
});

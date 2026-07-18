import { memo, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

export const Sidebar = memo(function Sidebar({ onNavigate, onClose }: { onNavigate: (destination: string) => void; onClose: () => void }) {
    const aside = useRef<HTMLElement>(null);
    useEffect(() => { aside.current?.querySelector<HTMLAnchorElement>('a')?.focus(); }, []);
    return <aside ref={aside} id="tool-sidebar" className="sidebar" aria-label="PDF tools">
        <div className="sidebar__heading"><strong>PDF tools</strong><button className="icon-button" type="button" onClick={onClose} aria-label="Close tools"><X size={18} /></button></div>
        <nav>{toolRegistry.map((item) => {
            const Icon = item.icon;
            return item.enabled
                ? <NavLink key={item.id} to={item.route} onClick={(event) => { event.preventDefault(); onNavigate(item.route); }} aria-label={`${item.title}. ${item.description}`} data-tooltip={item.title}><Icon size={21} strokeWidth={1.8} aria-hidden="true" /><span>{item.title}</span>{item.badge && <small className="sidebar-status">{item.badge}</small>}</NavLink>
                : <span key={item.id} className="sidebar-tool-disabled" aria-disabled="true" aria-label={`${item.title}, coming soon`} data-tooltip={`${item.title} · Coming Soon`}><Icon size={21} strokeWidth={1.8} aria-hidden="true" /><span>{item.title}</span><small className="sidebar-status">Soon</small></span>;
        })}</nav>
    </aside>;
});

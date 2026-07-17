import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../config/navigation';
import type { NavigationItem } from '../types/navigation';

type SidebarProps = { onNavigate: () => void };

export const Sidebar = memo(function Sidebar({ onNavigate }: SidebarProps) {
    return (
        <aside className="sidebar" aria-label="Application navigation">
            <nav>
                <SidebarGroup label="Document" onNavigate={onNavigate} items={navigationItems.filter((item) => item.section === 'Workspace')} />
            </nav>
        </aside>
    );
});

function SidebarGroup({ label, items, onNavigate }: { label: string; items: NavigationItem[]; onNavigate: () => void }) {
    return (
        <section className="sidebar__group" aria-label={label}>
            <p>{label}</p>
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onNavigate}>
                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </section>
    );
}

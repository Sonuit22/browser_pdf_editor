import { Menu } from 'lucide-react';

export function Header({ isSidebarOpen, onMenuToggle }: { isSidebarOpen: boolean; showNavigation?: boolean; onMenuToggle: () => void; onRequestUpload?: () => void }) {
    return <header className="app-header"><div className="app-header__inner">
        <button className="icon-button menu-button" type="button" onClick={onMenuToggle} aria-label="Open PDF tools" aria-controls="tool-sidebar" aria-expanded={isSidebarOpen} title="PDF tools"><Menu size={21} aria-hidden="true" /></button>
    </div></header>;
}

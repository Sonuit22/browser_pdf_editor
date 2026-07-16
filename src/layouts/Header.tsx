import { CircleHelp, Menu, Search, Settings, Upload, UserRound } from 'lucide-react';
import { Brand } from '../components/Brand';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/Button';

type HeaderProps = {
    isSidebarOpen: boolean;
    onMenuToggle: () => void;
    onRequestUpload: () => void;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
};

export function Header({ isSidebarOpen, onMenuToggle, onRequestUpload, onOpenSettings, onOpenHelp }: HeaderProps) {
    return (
        <header className="app-header">
            <div className="app-header__inner">
                <button className="icon-button menu-button" type="button" onClick={onMenuToggle} aria-label="Toggle navigation" aria-expanded={isSidebarOpen} title="Toggle navigation">
                    <Menu size={20} aria-hidden="true" />
                </button>
                <Brand />
                <label className="search-box">
                    <span className="sr-only">Search tools</span>
                    <Search size={18} aria-hidden="true" />
                    <input type="search" placeholder="Search tools" />
                </label>
                <div className="header-actions">
                    <Button type="button" size="compact" onClick={onRequestUpload}>
                        <Upload size={17} aria-hidden="true" />
                        <span>Upload PDF</span>
                    </Button>
                    <ThemeToggle />
                    <button className="icon-button" type="button" onClick={onOpenSettings} aria-label="Open settings" title="Settings"><Settings size={19} aria-hidden="true" /></button>
                    <button className="icon-button" type="button" onClick={onOpenHelp} aria-label="Open help" title="Help"><CircleHelp size={19} aria-hidden="true" /></button>
                    <button className="avatar-button" type="button" aria-label="User account placeholder" title="Account"><UserRound size={18} aria-hidden="true" /></button>
                </div>
            </div>
        </header>
    );
}

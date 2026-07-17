import { Menu, Upload } from 'lucide-react';
import { Brand } from '../components/Brand';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/Button';

type HeaderProps = {
    isSidebarOpen: boolean;
    onMenuToggle: () => void;
    onRequestUpload: () => void;
};

export function Header({ isSidebarOpen, onMenuToggle, onRequestUpload }: HeaderProps) {
    return (
        <header className="app-header">
            <div className="app-header__inner">
                <button className="icon-button menu-button" type="button" onClick={onMenuToggle} aria-label="Toggle navigation" aria-expanded={isSidebarOpen} title="Toggle navigation">
                    <Menu size={20} aria-hidden="true" />
                </button>
                <Brand />
                <div className="header-actions">
                    <Button type="button" size="compact" onClick={onRequestUpload}>
                        <Upload size={17} aria-hidden="true" />
                        <span>Upload PDF</span>
                    </Button>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

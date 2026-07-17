import { useState } from 'react';
import { Menu, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/ui/Button';

type HeaderProps = {
    isSidebarOpen: boolean;
    showNavigation: boolean;
    onMenuToggle: () => void;
    onRequestUpload: () => void;
};

export function Header({ isSidebarOpen, showNavigation, onMenuToggle, onRequestUpload }: HeaderProps) {
    const [isPublicMenuOpen, setIsPublicMenuOpen] = useState(false);

    return (
        <header className="app-header">
            <div className="app-header__inner">
                {showNavigation && <button className="icon-button menu-button" type="button" onClick={onMenuToggle} aria-label="Toggle navigation" aria-expanded={isSidebarOpen} title="Toggle navigation">
                    <Menu size={20} aria-hidden="true" />
                </button>}
                {!showNavigation && <button className="icon-button menu-button public-menu-button" type="button" onClick={() => setIsPublicMenuOpen((open) => !open)} aria-label="Toggle public navigation" aria-controls="public-navigation" aria-expanded={isPublicMenuOpen} title="Toggle navigation">
                    <Menu size={20} aria-hidden="true" />
                </button>}
                <Brand />
                <nav id="public-navigation" className={isPublicMenuOpen ? 'public-nav is-open' : 'public-nav'} aria-label="Primary navigation">
                    <Link to="/edit" onClick={() => setIsPublicMenuOpen(false)}>Edit PDF</Link>
                    <Link to="/#group-organize" onClick={() => setIsPublicMenuOpen(false)}>Organize</Link>
                    <Link to="/convert" onClick={() => setIsPublicMenuOpen(false)}>Convert</Link>
                    <Link to="/#group-forms-sign" onClick={() => setIsPublicMenuOpen(false)}>Forms &amp; Sign</Link>
                    <Link to="/#group-security" onClick={() => setIsPublicMenuOpen(false)}>Protect</Link>
                    <Link to="/" onClick={() => setIsPublicMenuOpen(false)}>All tools</Link>
                </nav>
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

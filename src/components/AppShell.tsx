import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
    { to: '/', label: 'Workspace', end: true },
    { to: '/organize', label: 'Organize' },
    { to: '/optimize', label: 'Optimize' },
    { to: '/protect', label: 'Protect' },
];

export function AppShell() {
    const location = useLocation();

    return (
        <div className="app-shell">
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <header className="app-header">
                <div className="app-header__inner">
                    <Brand />
                    <nav className="primary-nav" aria-label="Primary navigation">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <ThemeToggle />
                </div>
            </header>

            <main id="main-content" className="app-main" tabIndex={-1}>
                <p className="sr-only" aria-live="polite">{location.pathname === '/' ? 'Workspace' : 'Page changed'}</p>
                <Outlet />
            </main>

            <footer className="app-footer">
                <p>PDF Editor by ib</p>
                <nav aria-label="Footer navigation">
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                </nav>
            </footer>
        </div>
    );
}

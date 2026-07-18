import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShellContext } from '../contexts/ShellContext';
import { StatusBar } from '../components/workspace/StatusBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { NotificationRegion } from '../components/feedback/NotificationRegion';

export function AppLayout() {
    const { openFilePicker } = usePdfEngine();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const requestUpload = useCallback(openFilePicker, [openFilePicker]);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const shellValue = useMemo(() => ({ requestUpload }), [requestUpload]);
    const isToolDashboard = location.pathname === '/';
    const showSidebar = isSidebarOpen;

    useEffect(() => {
        const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeSidebar(); };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [closeSidebar]);

    return (
        <ShellContext.Provider value={shellValue}>
            <div className="app-shell">
                <a className="skip-link" href="#main-content">Skip to main content</a>
                <Header
                    isSidebarOpen={isSidebarOpen}
                    showNavigation
                    onMenuToggle={() => setIsSidebarOpen((open) => !open)}
                    onRequestUpload={requestUpload}
                />
                <div className={isToolDashboard ? 'app-body app-body--public' : 'app-body'}>
                    {showSidebar && <Sidebar onNavigate={closeSidebar} />}
                    {isSidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={closeSidebar} />}
                    <main id="main-content" className="app-main app-main--workspace" tabIndex={-1}>
                        <p className="sr-only" aria-live="polite">Page changed to {location.pathname === '/' ? 'home' : location.pathname.slice(1)}</p>
                        <Outlet />
                    </main>
                </div>
                <StatusBar />
                <Footer />
                <NotificationRegion />
            </div>
        </ShellContext.Provider>
    );
}

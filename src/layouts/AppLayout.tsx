import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShellContext } from '../contexts/ShellContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { StatusBar } from '../components/workspace/StatusBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { NotificationRegion } from '../components/feedback/NotificationRegion';

export function AppLayout() {
    const { openFilePicker } = usePdfEngine();
    const isMobile = useMediaQuery('(max-width: 920px)');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const requestUpload = useCallback(openFilePicker, [openFilePicker]);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const shellValue = useMemo(() => ({ requestUpload }), [requestUpload]);
    const showSidebar = !isMobile || isSidebarOpen;

    return (
        <ShellContext.Provider value={shellValue}>
            <div className="app-shell">
                <a className="skip-link" href="#main-content">Skip to main content</a>
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onMenuToggle={() => setIsSidebarOpen((open) => !open)}
                    onRequestUpload={requestUpload}
                />
                <div className="app-body">
                    {showSidebar && <Sidebar onNavigate={closeSidebar} />}
                    {isMobile && isSidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={closeSidebar} />}
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

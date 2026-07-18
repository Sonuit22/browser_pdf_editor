import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShellContext } from '../contexts/ShellContext';
import { StatusBar } from '../components/workspace/StatusBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { NotificationRegion } from '../components/feedback/NotificationRegion';
import { usePdfEditor } from '../modules/pdf/editor/hooks/usePdfEditor';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export function AppLayout() {
    const { openFilePicker, closeDocument } = usePdfEngine();
    const { dirty } = usePdfEditor();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [pendingDestination, setPendingDestination] = useState<string | 'back' | null>(null);
    const previousPath = useRef(location.pathname);

    const requestUpload = useCallback(openFilePicker, [openFilePicker]);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const resetToolWorkspace = useCallback(() => {
        closeDocument();
    }, [closeDocument]);
    const finishNavigation = useCallback((destination: string | 'back') => {
        resetToolWorkspace();
        closeSidebar();
        if (destination === 'back') navigate(-1);
        else navigate(destination);
    }, [closeSidebar, navigate, resetToolWorkspace]);
    const requestNavigation = useCallback((destination: string | 'back') => {
        if (destination !== 'back' && destination === location.pathname) { closeSidebar(); return; }
        if (location.pathname === '/edit' && dirty) setPendingDestination(destination);
        else finishNavigation(destination);
    }, [closeSidebar, dirty, finishNavigation, location.pathname]);
    const shellValue = useMemo(() => ({ requestUpload, resetToolWorkspace, requestNavigation }), [requestNavigation, requestUpload, resetToolWorkspace]);
    const isToolDashboard = location.pathname === '/';
    const showSidebar = isSidebarOpen;

    useEffect(() => {
        const close = (event: KeyboardEvent) => { if (event.key === 'Escape') closeSidebar(); };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [closeSidebar]);

    useEffect(() => {
        if (previousPath.current !== location.pathname) {
            resetToolWorkspace();
            previousPath.current = location.pathname;
        }
    }, [location.pathname, resetToolWorkspace]);

    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => { if (location.pathname === '/edit' && dirty) event.preventDefault(); };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty, location.pathname]);

    return (
        <ShellContext.Provider value={shellValue}>
            <div className="app-shell">
                <a className="skip-link" href="#main-content">Skip to main content</a>
                <Header
                    isSidebarOpen={isSidebarOpen}
                    showNavigation
                    onMenuToggle={() => setIsSidebarOpen((open) => !open)}
                    onRequestUpload={requestUpload}
                    onNavigateRequest={requestNavigation}
                />
                <div className={isToolDashboard ? 'app-body app-body--public' : 'app-body'}>
                    {showSidebar && <Sidebar onNavigate={requestNavigation} onClose={closeSidebar} />}
                    {isSidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={closeSidebar} />}
                    <main id="main-content" className="app-main app-main--workspace" tabIndex={-1}>
                        <p className="sr-only" aria-live="polite">Page changed to {location.pathname === '/' ? 'home' : location.pathname.slice(1)}</p>
                        <Outlet />
                    </main>
                </div>
                <StatusBar />
                <Footer />
                <NotificationRegion />
                {pendingDestination && <Modal title="Unsaved changes" onClose={() => setPendingDestination(null)}>
                    <p>You have unsaved changes. Leave this tool and discard them?</p>
                    <div className="modal-actions"><Button variant="secondary" type="button" onClick={() => setPendingDestination(null)}>Stay</Button><Button type="button" onClick={() => { const destination = pendingDestination; setPendingDestination(null); finishNavigation(destination); }}>Leave and discard</Button></div>
                </Modal>}
            </div>
        </ShellContext.Provider>
    );
}

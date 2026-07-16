import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShellContext } from '../contexts/ShellContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Modal } from '../components/ui/Modal';
import { StatusBar } from '../components/workspace/StatusBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { RightPanel } from './RightPanel';
import { Sidebar } from './Sidebar';

type DialogName = 'upload' | 'settings' | 'help' | null;

const dialogContent = {
    upload: { title: 'Upload PDF', body: 'File selection is not connected yet. This shell reserves the upload entry point for a future browser-only workflow.' },
    settings: { title: 'Settings', body: 'Workspace preferences will appear here. Theme selection is already available in the header.' },
    help: { title: 'Help', body: 'Support guidance and product documentation will appear here as the PDF workflows are introduced.' },
};

export function AppLayout() {
    const isMobile = useMediaQuery('(max-width: 920px)');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeDialog, setActiveDialog] = useState<DialogName>(null);
    const location = useLocation();

    const requestUpload = useCallback(() => setActiveDialog('upload'), []);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const shellValue = useMemo(() => ({ requestUpload }), [requestUpload]);
    const dialog = activeDialog ? dialogContent[activeDialog] : null;
    const showSidebar = !isMobile || isSidebarOpen;

    return (
        <ShellContext.Provider value={shellValue}>
            <div className="app-shell">
                <a className="skip-link" href="#main-content">Skip to main content</a>
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onMenuToggle={() => setIsSidebarOpen((open) => !open)}
                    onRequestUpload={requestUpload}
                    onOpenSettings={() => setActiveDialog('settings')}
                    onOpenHelp={() => setActiveDialog('help')}
                />
                <div className="app-body">
                    {showSidebar && <Sidebar onNavigate={closeSidebar} />}
                    {isMobile && isSidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={closeSidebar} />}
                    <main id="main-content" className="app-main" tabIndex={-1}>
                        <p className="sr-only" aria-live="polite">Page changed to {location.pathname === '/' ? 'home' : location.pathname.slice(1)}</p>
                        <Outlet />
                    </main>
                    <RightPanel />
                </div>
                <StatusBar />
                <Footer />
                {dialog && <Modal title={dialog.title} onClose={() => setActiveDialog(null)}><p>{dialog.body}</p></Modal>}
            </div>
        </ShellContext.Provider>
    );
}

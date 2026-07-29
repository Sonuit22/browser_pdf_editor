import { Outlet, useNavigate } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';
import { SeoManager } from '../components/SeoManager';

export default function PublicContentLayout() {
    const navigate = useNavigate();
    const requestNavigation = (destination: string | 'back') => {
        if (destination === 'back') navigate(-1);
        else navigate(destination);
    };
    return <div className="app-shell">
        <SeoManager />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header isSidebarOpen={false} onMenuToggle={() => requestNavigation('/all-tools')} onNavigateRequest={requestNavigation} />
        <div className="app-body app-body--public"><main id="main-content" className="app-main app-main--workspace" tabIndex={-1}><p className="sr-only" aria-live="polite">Learning Center page changed</p><Outlet /></main></div>
        <Footer />
    </div>;
}

import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { UnsupportedBrowser } from './components/UnsupportedBrowser';
import { hasPdfBrowserSupport } from './utils/browserSupport';
import { AppLayout } from './layouts/AppLayout';
import { PdfEngineProvider } from './modules/pdf/context/PdfEngineContext';
import { PdfEditorProvider } from './modules/pdf/editor/context/PdfEditorProvider';
import { PdfPageOperationsProvider } from './modules/pdf/organization/context/PdfPageOperationsProvider';
import { PdfUtilitiesProvider } from './modules/pdf/utilities/context/PdfUtilitiesProvider';

const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ConvertPage = lazy(() => import('./pages/ConvertPage'));
const workspacePaths = ['/edit', '/merge', '/split', '/organize', '/rotate'];

export default function App() {
    if (!hasPdfBrowserSupport()) return <UnsupportedBrowser />;
    return (
        <AppErrorBoundary><Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}>
            <Routes>
                <Route element={<PdfEngineProvider><PdfPageOperationsProvider><PdfEditorProvider><PdfUtilitiesProvider><AppLayout /></PdfUtilitiesProvider></PdfEditorProvider></PdfPageOperationsProvider></PdfEngineProvider>}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="convert" element={<ConvertPage />} />
                    {workspacePaths.map((path) => <Route key={path} path={path} element={<WorkspacePage />} />)}
                    <Route path="pricing" element={<PricingPage />} />
                    <Route path="privacy" element={<LegalPage kind="privacy" />} />
                    <Route path="terms" element={<LegalPage kind="terms" />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense></AppErrorBoundary>
    );
}

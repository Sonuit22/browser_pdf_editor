import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { UnsupportedBrowser } from './components/UnsupportedBrowser';
import { hasPdfBrowserSupport } from './utils/browserSupport';
import { AppLayout } from './layouts/AppLayout';
import { PdfEngineProvider } from './modules/pdf/context/PdfEngineContext';
import { PdfEditorProvider } from './modules/pdf/editor/context/PdfEditorProvider';
import { PdfPageOperationsProvider } from './modules/pdf/organization/context/PdfPageOperationsProvider';
import { PdfUtilitiesProvider } from './modules/pdf/utilities/context/PdfUtilitiesProvider';
import { toolRoutesBySurface } from './config/toolRegistry';
import { landingUploadToolRoutes } from './config/landingUploadTools';

const landingWorkspaceRoutes = new Set<string>(landingUploadToolRoutes);
const pdfWorkspaceRoutes = Array.from(new Set([...toolRoutesBySurface['pdf-workspace'], ...landingUploadToolRoutes.filter((route) => route !== '/compress')]));

const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ToolInfoPage = lazy(() => import('./pages/ToolInfoPage'));
const SimplePage = lazy(() => import('./pages/SimplePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ConversionWorkspace = lazy(() => import('./modules/conversion/ConversionWorkspace'));

function CompressRoute() {
    const location = useLocation();
    return (location.state as { fromLandingFile?: boolean } | null)?.fromLandingFile ? <WorkspacePage /> : <ToolInfoPage />;
}

export default function App() {
    if (!hasPdfBrowserSupport()) return <UnsupportedBrowser />;
    return (
        <AppErrorBoundary><Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}>
            <Routes>
                <Route element={<PdfEngineProvider><PdfPageOperationsProvider><PdfEditorProvider><PdfUtilitiesProvider><AppLayout /></PdfUtilitiesProvider></PdfEditorProvider></PdfPageOperationsProvider></PdfEngineProvider>}>
                    <Route path="/" element={<HomePage />} />
                    {pdfWorkspaceRoutes.map((path) => <Route key={path} path={path} element={<WorkspacePage />} />)}
                    <Route path="/compress" element={<CompressRoute />} />
                    {toolRoutesBySurface['conversion-workspace'].map((path) => <Route key={path} path={path} element={<ConversionWorkspace />} />)}
                    {toolRoutesBySurface['tool-info'].filter((path) => !landingWorkspaceRoutes.has(path)).map((path) => <Route key={path} path={path} element={<ToolInfoPage />} />)}
                    <Route path="contact" element={<SimplePage />} />
                    <Route path="support" element={<SimplePage />} />
                    <Route path="privacy" element={<LegalPage kind="privacy" />} />
                    <Route path="terms" element={<LegalPage kind="terms" />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense></AppErrorBoundary>
    );
}

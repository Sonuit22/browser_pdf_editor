import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { UnsupportedBrowser } from './components/UnsupportedBrowser';
import { hasPdfBrowserSupport } from './utils/browserSupport';
import { toolRoutesBySurface } from './config/toolRegistry';
import { landingUploadToolRoutes } from './config/landingUploadTools';

const landingWorkspaceRoutes = new Set<string>(landingUploadToolRoutes);
const pdfWorkspaceRoutes = Array.from(new Set([...toolRoutesBySurface['pdf-workspace'], ...landingUploadToolRoutes.filter((route) => route !== '/compress-pdf')]));

const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ToolInfoPage = lazy(() => import('./pages/ToolInfoPage'));
const SimplePage = lazy(() => import('./pages/SimplePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AllToolsPage = lazy(() => import('./pages/AllToolsPage'));
const ConversionWorkspace = lazy(() => import('./modules/conversion/ConversionWorkspace'));
const ToolShell = lazy(() => import('./layouts/ToolShell'));
const PublicContentLayout = lazy(() => import('./layouts/PublicContentLayout'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'));

function CompressRoute() {
    const location = useLocation();
    return (location.state as { fromLandingFile?: boolean } | null)?.fromLandingFile ? <WorkspacePage /> : <ToolInfoPage />;
}

export default function App() {
    if (!hasPdfBrowserSupport()) return <UnsupportedBrowser />;
    return (
        <AppErrorBoundary><Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}>
            <Routes>
                <Route element={<PublicContentLayout />}>
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogArticlePage />} />
                </Route>
                <Route element={<ToolShell />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/all-tools" element={<AllToolsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    {pdfWorkspaceRoutes.map((path) => <Route key={path} path={path} element={<WorkspacePage />} />)}
                    <Route path="/compress-pdf" element={<CompressRoute />} />
                    {toolRoutesBySurface['conversion-workspace'].map((path) => <Route key={path} path={path} element={<ConversionWorkspace />} />)}
                    {toolRoutesBySurface['tool-info'].filter((path) => !landingWorkspaceRoutes.has(path)).map((path) => <Route key={path} path={path} element={<ToolInfoPage />} />)}
                    <Route path="contact" element={<SimplePage />} />
                    <Route path="support" element={<SimplePage />} />
                    <Route path="privacy" element={<LegalPage kind="privacy" />} />
                    <Route path="terms" element={<LegalPage kind="terms" />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="/merge" element={<Navigate to="/merge-pdf" replace />} />
                    <Route path="/split" element={<Navigate to="/split-pdf" replace />} />
                    <Route path="/organize" element={<Navigate to="/organize-pdf" replace />} />
                    <Route path="/compress" element={<Navigate to="/compress-pdf" replace />} />
                    <Route path="/edit" element={<Navigate to="/edit-pdf" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense></AppErrorBoundary>
    );
}

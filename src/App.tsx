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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ToolInfoPage = lazy(() => import('./pages/ToolInfoPage'));
const SimplePage = lazy(() => import('./pages/SimplePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const ConversionWorkspace = lazy(() => import('./modules/conversion/ConversionWorkspace'));
const workspacePaths = ['/edit', '/sign-pdf', '/merge', '/split', '/organize', '/remove-pages', '/extract-pages'];
const conversionPaths = ['/jpg-to-pdf', '/word-to-pdf', '/pdf-to-jpg', '/pdf-to-word', '/pdf-to-ppt'];
const limitedPaths = ['/compress', '/protect-pdf', '/ppt-to-pdf'];

export default function App() {
    if (!hasPdfBrowserSupport()) return <UnsupportedBrowser />;
    return (
        <AppErrorBoundary><Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}>
            <Routes>
                <Route element={<PdfEngineProvider><PdfPageOperationsProvider><PdfEditorProvider><PdfUtilitiesProvider><AppLayout /></PdfUtilitiesProvider></PdfEditorProvider></PdfPageOperationsProvider></PdfEngineProvider>}>
                    <Route path="/" element={<HomePage />} />
                    {workspacePaths.map((path) => <Route key={path} path={path} element={<WorkspacePage />} />)}
                    {conversionPaths.map((path) => <Route key={path} path={path} element={<ConversionWorkspace />} />)}
                    {limitedPaths.map((path) => <Route key={path} path={path} element={<ToolInfoPage />} />)}
                    <Route path="contact" element={<SimplePage />} />
                    <Route path="support" element={<SimplePage />} />
                    <Route path="privacy" element={<LegalPage kind="privacy" />} />
                    <Route path="terms" element={<LegalPage kind="terms" />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense></AppErrorBoundary>
    );
}

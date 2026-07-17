import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AppLayout } from './layouts/AppLayout';
import { PdfEngineProvider } from './modules/pdf/context/PdfEngineContext';
import { PdfEditorProvider } from './modules/pdf/editor/context/PdfEditorProvider';
import { PdfPageOperationsProvider } from './modules/pdf/organization/context/PdfPageOperationsProvider';

const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const workspacePaths = ['/', '/edit', '/merge', '/split', '/compress', '/organize', '/rotate', '/watermark', '/sign', '/ocr', '/convert', '/ai'];

export default function App() {
    return (
        <Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}>
            <Routes>
                <Route element={<PdfEngineProvider><PdfPageOperationsProvider><PdfEditorProvider><AppLayout /></PdfEditorProvider></PdfPageOperationsProvider></PdfEngineProvider>}>
                    {workspacePaths.map((path) => <Route key={path} path={path} element={<WorkspacePage />} />)}
                    <Route path="pricing" element={<LegalPage title="Pricing" description="Plans and subscription options will be introduced with production PDF workflows." />} />
                    <Route path="blog" element={<LegalPage title="Blog" description="Product updates and document-workflow guides will appear here." />} />
                    <Route path="support" element={<LegalPage title="Support" description="Help resources and support channels will appear here." />} />
                    <Route path="privacy" element={<LegalPage title="Privacy" description="This application shell does not upload, store, or process PDF files." />} />
                    <Route path="terms" element={<LegalPage title="Terms" description="Tool-specific terms will be published before any PDF processing feature is released." />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { UploadArea } from '../components/workspace/UploadArea';
import { workspaceRoutes } from '../config/navigation';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { PdfViewer } from '../modules/pdf/viewer/PdfViewer';
import { OrganizationWorkspace } from '../modules/pdf/organization/components/OrganizationWorkspace';
import { SplitWorkspace } from '../modules/pdf/organization/components/SplitWorkspace';
import { MergeWorkspace } from '../modules/pdf/organization/components/MergeWorkspace';
import { RightPanel } from '../layouts/RightPanel';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkspacePage() {
    const { pathname } = useLocation();
    const { phase, error, progress, retry } = usePdfEngine();
    const route = workspaceRoutes[pathname] ?? workspaceRoutes['/'];

    return (
        <section className="tool-workspace-shell" aria-label={`${route.title} workspace`}>
            <div className="workspace-main"><div className="workspace-heading"><div><p>Browser-based PDF tool</p><h1>{route.title}</h1></div><div><Link to="/"><ArrowLeft size={16} />Back</Link><Link to="/"><Home size={16} />Home</Link></div></div>
            <div className="editor-workspace">
                {pathname === '/merge' ? <MergeWorkspace /> : <>
                    {phase === 'loading' && <div className="pdf-loading" role="status"><LoadingSpinner label="Loading PDF" /><strong>Loading PDF</strong><span>{progress}%</span></div>}
                    {phase === 'ready' && (['/organize', '/remove-pages', '/extract-pages'].includes(pathname) ? <OrganizationWorkspace /> : pathname === '/split' ? <SplitWorkspace /> : <PdfViewer />)}
                    {phase !== 'loading' && phase !== 'ready' && <>{phase === 'error' && error ? <div className="pdf-error"><ErrorState description={error} /><Button type="button" variant="secondary" onClick={retry}>Retry</Button></div> : <UploadArea />}</>}
                </>}
            </div></div><RightPanel />
        </section>
    );
}

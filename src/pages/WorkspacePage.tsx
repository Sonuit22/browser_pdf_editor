import { useEffect, useState } from 'react';
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
import { useShell } from '../contexts/ShellContext';
import { ToolGuideLink } from '../blog/components/ToolGuideLink';
import { shouldShowLandingFileReselect } from '../utils/pendingPdfLifecycle';
import { CompressionWorkspace } from '../modules/pdf/compression/CompressionWorkspace';

export default function WorkspacePage() {
    const location = useLocation();
    const { pathname } = location;
    const { phase, error, progress, retry, pendingPdfFile, consumePendingPdf } = usePdfEngine();
    const route = workspaceRoutes[pathname] ?? workspaceRoutes['/'];
    const { requestNavigation } = useShell();
    const [landingFileWasLoaded, setLandingFileWasLoaded] = useState(false);
    const fromLanding = Boolean((location.state as { fromLandingFile?: boolean } | null)?.fromLandingFile);
    const awaitingLandingLoad = fromLanding && phase === 'idle' && Boolean(pendingPdfFile);
    const needsLandingReselect = shouldShowLandingFileReselect(fromLanding, phase, pendingPdfFile, landingFileWasLoaded);
    const isResponsiveEditor = pathname === '/edit-pdf' || pathname === '/sign-pdf' || pathname === '/fill-pdf-form';

    useEffect(() => {
        if (fromLanding && pendingPdfFile) void consumePendingPdf();
    }, [consumePendingPdf, fromLanding, pendingPdfFile]);
    useEffect(() => {
        if (fromLanding && phase === 'ready') setLandingFileWasLoaded(true);
    }, [fromLanding, phase]);

    return (
        <section className={`tool-workspace-shell${isResponsiveEditor ? ' tool-workspace-shell--editor' : ''}`} aria-label={`${route.title} workspace`}>
            <div className="workspace-main"><div className="workspace-heading"><div><p>Browser-based PDF tool</p><h1>{route.title}</h1></div><div><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('/'); }}><Home size={16} />Home</Link></div></div>
            <div className="editor-workspace">
                {pathname === '/merge-pdf' ? <MergeWorkspace /> : <>
                    {(phase === 'loading' || awaitingLandingLoad) && <div className="pdf-loading" role="status"><LoadingSpinner label="Loading PDF" /><strong>Loading PDF</strong><span>{progress}%</span></div>}
                    {phase === 'ready' && (pathname === '/compress-pdf'
                        ? <CompressionWorkspace />
                        : ['/organize-pdf', '/remove-pages', '/extract-pages'].includes(pathname) ? <OrganizationWorkspace /> : pathname === '/split-pdf' ? <SplitWorkspace /> : <PdfViewer />)}
                    {!awaitingLandingLoad && phase !== 'loading' && phase !== 'ready' && <>
                        {phase === 'error' && error && <div className="pdf-error"><ErrorState description={error} /><Button type="button" variant="secondary" onClick={() => { if (pendingPdfFile) void consumePendingPdf(); else retry(); }}>Retry</Button></div>}
                        {needsLandingReselect && <p className="landing-reselect-message" role="status">The previously selected PDF is no longer available. Please choose it again.</p>}
                        <UploadArea />
                    </>}
                </>}
            </div><ToolGuideLink toolPath={pathname} /></div><RightPanel />
        </section>
    );
}

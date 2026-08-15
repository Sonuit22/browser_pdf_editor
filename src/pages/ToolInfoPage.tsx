import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { findToolByRoute } from '../config/toolRegistry';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { ToolGuideLink } from '../blog/components/ToolGuideLink';

export default function ToolInfoPage() {
    const location = useLocation();
    const { pathname } = location;
    const { pendingPdfFile } = usePdfEngine();
    const tool = findToolByRoute(pathname);
    const fromLanding = Boolean((location.state as { fromLandingFile?: boolean } | null)?.fromLandingFile);
    if (!tool) return null;
    return <section className="tool-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />All tools</Link>
        <div className="tool-page__heading"><tool.icon size={28} aria-hidden="true" /><div><p>{tool.id === 'translate' ? 'Planned translation tool' : 'Local browser tool'}</p><h1>{tool.title}</h1></div></div>
        {fromLanding && pendingPdfFile && <div className="landing-selected-file" role="status"><strong title={pendingPdfFile.file.name}>{pendingPdfFile.file.name}</strong><span>PDF • {formatFileSize(pendingPdfFile.file.size)}</span><small>Selected on the landing page and retained in this browser session.</small></div>}
        {fromLanding && !pendingPdfFile && <p className="landing-reselect-message" role="status">Please select the PDF again. Files are kept only in memory and are cleared when the page is refreshed.</p>}
        <div className="coming-soon-panel" role="status"><span className="tool-status-badge">Coming Soon</span><h2>This tool is coming soon.</h2>{tool.limitations.map((limitation) => <p key={limitation}>{limitation}</p>)}{tool.id === 'translate' && <p>PDF text extraction and translation are separate steps. No PDF or extracted text leaves your browser because translation processing is not enabled.</p>}<p>No upload or processing action is enabled until the complete workflow can produce a reliable output.</p></div>
        <ToolGuideLink toolPath={pathname} />
    </section>;
}

function formatFileSize(size: number) {
    return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

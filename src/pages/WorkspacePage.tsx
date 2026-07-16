import { useLocation } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';
import { UploadArea } from '../components/workspace/UploadArea';
import { workspaceRoutes } from '../config/navigation';
import { useShell } from '../contexts/ShellContext';

export default function WorkspacePage() {
    const { pathname } = useLocation();
    const { requestUpload } = useShell();
    const route = workspaceRoutes[pathname] ?? workspaceRoutes['/'];

    return (
        <PageContainer {...route}>
            <section className="editor-workspace" aria-label={`${route.title} workspace`}>
                <UploadArea onRequestUpload={requestUpload} />
                <EmptyState title="Your document canvas is ready" description="Upload controls are shown for layout testing only. No PDF files are selected, read, stored, or processed by this application shell." />
            </section>
        </PageContainer>
    );
}

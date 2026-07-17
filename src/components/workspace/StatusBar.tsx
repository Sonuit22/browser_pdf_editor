import { usePdfEngine } from '../../modules/pdf/hooks/usePdfEngine';
import { usePdfPageOperations } from '../../modules/pdf/organization/hooks/usePdfPageOperations';
import { usePdfEditor } from '../../modules/pdf/editor/hooks/usePdfEditor';

export function StatusBar() {
    const { info, currentPage, phase, zoom } = usePdfEngine();
    const { pages, activePageId } = usePdfPageOperations();
    const { dirty } = usePdfEditor();
    const workingPage = pages.findIndex((page) => page.id === activePageId) + 1;
    const statusItems = [
        ['Zoom', typeof zoom === 'number' ? `${zoom}%` : zoom === 'fit-width' ? 'Fit width' : 'Fit page'],
        ['Current page', info ? String(workingPage || currentPage) : '-'],
        ['Total pages', info ? String(pages.length || info.pageCount) : '-'],
        ['File size', info?.fileSize ?? '-'],
        ['Rendering', phase === 'loading' ? 'Loading' : phase === 'ready' ? 'Ready' : phase === 'error' ? 'Error' : 'Waiting'],
        ['Changes', dirty ? 'Unsaved' : 'Saved'],
    ];
    return (
        <section className="status-bar" aria-label="Document status">
            {statusItems.map(([label, value]) => (
                <div key={label} className="status-bar__item">
                    <span>{label}</span>
                    <strong aria-live={label === 'Rendering' || label === 'Changes' ? 'polite' : undefined}>{value}</strong>
                </div>
            ))}
        </section>
    );
}

import { useMemo, useState } from 'react';
import { Scissors } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { usePdfEditor } from '../../editor/hooks/usePdfEditor';
import { createWorkingPdf } from '../../editor/services/pdfExportService';
import { usePdfEngine } from '../../hooks/usePdfEngine';
import { usePdfPageOperations } from '../hooks/usePdfPageOperations';
import { downloadSequentialPdfs } from '../services/documentOperationsService';
import { safePdfFilename } from '../utils/pageUtils';
import { parsePageRangeGroups } from '../utils/pageRangeParser';
import { usePdfUtilities } from '../../utilities/hooks/usePdfUtilities';

type SplitMode = 'every-page' | 'count' | 'ranges';

export function SplitWorkspace() {
    const { info } = usePdfEngine();
    const { pages, getSourceFile } = usePdfPageOperations();
    const { annotationsByPageId } = usePdfEditor();
    const utilities = usePdfUtilities();
    const [mode, setMode] = useState<SplitMode>('every-page');
    const [count, setCount] = useState('2');
    const [ranges, setRanges] = useState('1-3, 4-6');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const parsedRanges = useMemo(() => parsePageRangeGroups(ranges, { pageCount: pages.length }), [pages.length, ranges]);

    const split = async () => {
        const groupIndexes = mode === 'every-page'
            ? pages.map((_, index) => [index])
            : mode === 'count'
                ? chunkIndexes(pages.length, Number(count))
                : parsedRanges.groups;
        if (mode === 'ranges' && parsedRanges.errors.length) {
            setMessage(parsedRanges.errors[0].message);
            return;
        }
        if (!groupIndexes.length) {
            setMessage('Choose a valid split pattern.');
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            const output = [];
            for (let index = 0; index < groupIndexes.length; index += 1) {
                const group = groupIndexes[index].map((pageIndex) => pages[pageIndex]).filter(Boolean);
                output.push({ bytes: await createWorkingPdf({ pages: group, annotationsByPageId, getSourceFile, utilities, sourceFilename: info?.filename ?? 'document.pdf' }), filename: safePdfFilename(info?.filename ?? 'document', `part-${index + 1}`) });
            }
            downloadSequentialPdfs(output);
            setMessage(`${output.length} PDF file${output.length === 1 ? '' : 's'} downloaded.`);
        } catch {
            setMessage('The PDF could not be split. Check the source document and try again.');
        } finally {
            setBusy(false);
        }
    };

    return <section className="document-operation" aria-label="Split PDF">
        <div className="document-operation__controls">
            <label>Split mode<select value={mode} onChange={(event) => setMode(event.target.value as SplitMode)}><option value="every-page">Every page</option><option value="count">After every number of pages</option><option value="ranges">Separate page ranges</option></select></label>
            {mode === 'count' && <label>Pages per PDF<input type="number" min="1" max={pages.length || 1} value={count} onChange={(event) => setCount(event.target.value)} /></label>}
            {mode === 'ranges' && <label>Ranges<input value={ranges} onChange={(event) => setRanges(event.target.value)} aria-describedby="range-help" /><span id="range-help">Examples: 1-3, 5, 8-10. Each comma-separated range becomes one PDF.</span></label>}
        </div>
        <div className="document-operation__summary"><strong>{pages.length} pages</strong><span>{mode === 'ranges' ? parsedRanges.errors.length ? parsedRanges.errors[0].message : `${parsedRanges.groups.length} output groups` : 'Each output PDF downloads separately.'}</span></div>
        <Button type="button" onClick={() => void split()} disabled={busy || !pages.length}><Scissors size={17} aria-hidden="true" />{busy ? 'Splitting' : 'Split and download'}</Button>
        {message && <p className="operation-message" role="status">{message}</p>}
    </section>;
}

function chunkIndexes(pageCount: number, count: number) {
    if (!Number.isInteger(count) || count < 1) return [];
    const groups: number[][] = [];
    for (let start = 0; start < pageCount; start += count) groups.push(Array.from({ length: Math.min(count, pageCount - start) }, (_, index) => start + index));
    return groups;
}

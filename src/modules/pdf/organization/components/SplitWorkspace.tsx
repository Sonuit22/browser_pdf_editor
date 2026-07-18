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
import { PageThumbnailPanel } from './PageThumbnailPanel';

type SplitMode = 'ranges' | 'selected' | 'count' | 'parts' | 'every-page';

export function SplitWorkspace() {
    const { info } = usePdfEngine();
    const operations = usePdfPageOperations();
    const { pages, getSourceFile } = operations;
    const { annotationsByPageId } = usePdfEditor();
    const utilities = usePdfUtilities();
    const [mode, setMode] = useState<SplitMode>('ranges');
    const [count, setCount] = useState('2');
    const [parts, setParts] = useState('2');
    const [ranges, setRanges] = useState('1-3, 5');
    const [selected, setSelected] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const parsedRanges = useMemo(() => parsePageRangeGroups(ranges, { pageCount: pages.length }), [pages.length, ranges]);
    const groups = useMemo(() => {
        if (mode === 'every-page') return pages.map((_, index) => [index]);
        if (mode === 'count') return chunkIndexes(pages.length, Number(count));
        if (mode === 'parts') return chunkIndexes(pages.length, Math.ceil(pages.length / Math.max(1, Number(parts))));
        if (mode === 'selected') return selected.length ? [pages.map((page, index) => selected.includes(page.id) ? index : -1).filter((index) => index >= 0)] : [];
        return parsedRanges.errors.length ? [] : parsedRanges.groups;
    }, [count, mode, pages, parsedRanges, parts, selected]);
    const valid = groups.length > 0 && groups.every((group) => group.length > 0);

    const split = async () => {
        if (!valid) { setMessage(mode === 'selected' ? 'Select at least one page.' : 'Enter a valid split configuration.'); return; }
        setBusy(true); setMessage(null);
        try {
            const output = [];
            for (let index = 0; index < groups.length; index += 1) {
                const group = groups[index].map((pageIndex) => pages[pageIndex]).filter(Boolean);
                output.push({ bytes: await createWorkingPdf({ pages: group, annotationsByPageId, getSourceFile, utilities, sourceFilename: info?.filename ?? 'document.pdf' }), filename: safePdfFilename(info?.filename ?? 'document', `part-${index + 1}`) });
            }
            downloadSequentialPdfs(output); setMessage(`${output.length} PDF file${output.length === 1 ? '' : 's'} downloaded.`);
        } catch { setMessage('The PDF could not be split. Check the source document and try again.'); }
        finally { setBusy(false); }
    };
    const toggle = (id: string, selectionMode: 'replace' | 'toggle' | 'range') => setSelected((current) => selectionMode === 'replace' ? [id] : current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

    return <section className="split-workspace" aria-label="Split PDF">
        <div className="split-controls">
            <label>Split mode<select value={mode} onChange={(event) => setMode(event.target.value as SplitMode)}><option value="ranges">Split by page range</option><option value="selected">Extract selected pages</option><option value="count">Split every N pages</option><option value="parts">Split into equal parts</option><option value="every-page">Split all pages</option></select></label>
            {mode === 'ranges' && <label>Page ranges<input value={ranges} onChange={(event) => setRanges(event.target.value)} aria-describedby="range-help" placeholder="1-3, 5, 7-10" /><span id="range-help">Each comma-separated range becomes one output PDF.</span></label>}
            {mode === 'count' && <label>Split every<input type="number" min="1" max={pages.length || 1} value={count} onChange={(event) => setCount(event.target.value)} /><span>pages</span></label>}
            {mode === 'parts' && <label>Number of parts<input type="number" min="2" max={pages.length || 2} value={parts} onChange={(event) => setParts(event.target.value)} /></label>}
            {mode === 'selected' && <div className="split-selection-actions"><button type="button" onClick={() => setSelected(pages.map((page) => page.id))}>Select all</button><button type="button" onClick={() => setSelected([])}>Clear selection</button><span>{selected.length} selected</span></div>}
        </div>
        {mode === 'ranges' && parsedRanges.errors.length > 0 && <p className="pdf-export-error" role="alert">{parsedRanges.errors[0].message}</p>}
        <p className="split-reorder-note">Reorder before splitting. Drag pages or use the accessible arrow controls.</p>
        <PageThumbnailPanel pages={pages} activePageId={operations.activePageId} selectedPageIds={selected} selectionEnabled={mode === 'selected'} reorderEnabled layout="grid" getPage={operations.getPage} onSelect={(id, selectionMode) => mode === 'selected' ? toggle(id, selectionMode) : operations.setActivePage(id)} onReorder={operations.reorderPages} label="PDF pages for splitting" />
        <section className="split-output-preview" aria-label="Split output preview"><h3>Output preview</h3><div>{groups.map((group, index) => <article key={`${index}-${group.join('-')}`}><strong>Output {index + 1}</strong><span>Pages {group.map((page) => page + 1).join(', ')}</span></article>)}</div><p>{groups.length} output file{groups.length === 1 ? '' : 's'}</p></section>
        <Button type="button" onClick={() => void split()} disabled={busy || !valid}><Scissors size={17} />{busy ? 'Splitting' : 'Split PDF'}</Button>
        {message && <p className="operation-message" role="status">{message}</p>}
    </section>;
}

function chunkIndexes(pageCount: number, count: number) {
    if (!Number.isInteger(count) || count < 1) return [];
    const groups: number[][] = [];
    for (let start = 0; start < pageCount; start += count) groups.push(Array.from({ length: Math.min(count, pageCount - start) }, (_, index) => start + index));
    return groups;
}

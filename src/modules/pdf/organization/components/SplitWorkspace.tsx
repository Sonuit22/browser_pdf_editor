import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Scissors } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { usePdfEditor } from '../../editor/hooks/usePdfEditor';
import { createWorkingPdf } from '../../editor/services/pdfExportService';
import { usePdfEngine } from '../../hooks/usePdfEngine';
import { usePdfPageOperations } from '../hooks/usePdfPageOperations';
import { downloadPdf } from '../utils/pdfDownload';
import { safePdfFilename } from '../utils/pageUtils';
import { parsePageRangeGroups } from '../utils/pageRangeParser';
import { usePdfUtilities } from '../../utilities/hooks/usePdfUtilities';
import { PageThumbnailPanel } from './PageThumbnailPanel';
import { notify } from '../../../../components/feedback/notifications';
import { getProcessingErrorMessage } from '../../../../utils/processingErrors';

type SplitMode = 'ranges' | 'selected' | 'count' | 'parts' | 'every-page';
type OperationMessage = { text: string; error: boolean };
type SplitOutput = { bytes: Uint8Array; filename: string };

export function SplitWorkspace() {
    const { closeDocument, info } = usePdfEngine();
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
    const [message, setMessage] = useState<OperationMessage | null>(null);
    const [outputs, setOutputs] = useState<SplitOutput[]>([]);
    const [downloaded, setDownloaded] = useState<number[]>([]);
    const busyRef = useRef(false);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const parsedRanges = useMemo(() => parsePageRangeGroups(ranges, { pageCount: pages.length }), [pages.length, ranges]);
    const groups = useMemo(() => {
        if (mode === 'every-page') return pages.map((_, index) => [index]);
        if (mode === 'count') return chunkIndexes(pages.length, Number(count));
        if (mode === 'parts') return chunkIndexes(pages.length, Math.ceil(pages.length / Math.max(1, Number(parts))));
        if (mode === 'selected') return selected.length ? [pages.map((page, index) => selected.includes(page.id) ? index : -1).filter((index) => index >= 0)] : [];
        return parsedRanges.errors.length ? [] : parsedRanges.groups;
    }, [count, mode, pages, parsedRanges, parts, selected]);
    const tooManyOutputs = groups.length > 10;
    const valid = groups.length > 0 && !tooManyOutputs && groups.every((group) => group.length > 0);

    const split = async () => {
        if (busyRef.current) return;
        if (!valid) {
            setMessage({ text: tooManyOutputs ? 'Refine the split to ten output files or fewer.' : mode === 'selected' ? 'Select at least one page.' : 'Enter a valid split configuration.', error: true });
            return;
        }
        busyRef.current = true;
        setBusy(true); setMessage(null); setOutputs([]); setDownloaded([]);
        try {
            const output = [];
            for (let index = 0; index < groups.length; index += 1) {
                if (!mountedRef.current) return;
                const group = groups[index].map((pageIndex) => pages[pageIndex]).filter(Boolean);
                output.push({ bytes: await createWorkingPdf({ pages: group, annotationsByPageId, getSourceFile, utilities, sourceFilename: info?.filename ?? 'document.pdf' }), filename: safePdfFilename(info?.filename ?? 'document', `part-${index + 1}`) });
            }
            if (!mountedRef.current) return;
            setOutputs(output);
            setMessage({ text: `${output.length} PDF file${output.length === 1 ? ' is' : 's are'} ready. Download each result below.`, error: false });
        } catch (error) {
            if (mountedRef.current) setMessage({ text: getProcessingErrorMessage(error, 'The PDF could not be split. Keep the source document open and try again.'), error: true });
        } finally {
            busyRef.current = false;
            if (mountedRef.current) setBusy(false);
        }
    };
    const downloadResult = (output: SplitOutput, index: number) => {
        try {
            downloadPdf(output.bytes, output.filename);
            const next = downloaded.includes(index) ? downloaded : [...downloaded, index];
            setDownloaded(next);
            if (next.length === outputs.length) {
                notify(`${outputs.length} split PDF file${outputs.length === 1 ? '' : 's'} downloaded.`);
                closeDocument();
            }
        } catch (error) {
            setMessage({ text: getProcessingErrorMessage(error, 'This result could not be downloaded. Keep the source open and try again.'), error: true });
        }
    };
    const toggle = (id: string, selectionMode: 'replace' | 'toggle' | 'range') => {
        if (!busyRef.current) {
            setMessage(null); setOutputs([]); setDownloaded([]);
            setSelected((current) => selectionMode === 'replace' ? [id] : current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
        }
    };

    return <section className="split-workspace" aria-label="Split PDF">
        <div className="split-controls">
            <label>Split mode<select value={mode} disabled={busy} onChange={(event) => { setMessage(null); setOutputs([]); setDownloaded([]); setMode(event.target.value as SplitMode); }}><option value="ranges">Split by page range</option><option value="selected">Extract selected pages</option><option value="count">Split every N pages</option><option value="parts">Split into equal parts</option><option value="every-page">Split all pages</option></select></label>
            {mode === 'ranges' && <label>Page ranges<input value={ranges} disabled={busy} onChange={(event) => { setMessage(null); setOutputs([]); setDownloaded([]); setRanges(event.target.value); }} aria-describedby="range-help" placeholder="1-3, 5, 7-10" /><span id="range-help">Each comma-separated range becomes one output PDF.</span></label>}
            {mode === 'count' && <label>Split every<input type="number" min="1" max={pages.length || 1} value={count} disabled={busy} onChange={(event) => { setMessage(null); setOutputs([]); setDownloaded([]); setCount(event.target.value); }} /><span>pages</span></label>}
            {mode === 'parts' && <label>Number of parts<input type="number" min="2" max={pages.length || 2} value={parts} disabled={busy} onChange={(event) => { setMessage(null); setOutputs([]); setDownloaded([]); setParts(event.target.value); }} /></label>}
            {mode === 'selected' && <div className="split-selection-actions"><button type="button" disabled={busy} onClick={() => { setMessage(null); setOutputs([]); setDownloaded([]); setSelected(pages.map((page) => page.id)); }}>Select all</button><button type="button" disabled={busy} onClick={() => { setMessage(null); setOutputs([]); setDownloaded([]); setSelected([]); }}>Clear selection</button><span>{selected.length} selected</span></div>}
        </div>
        {mode === 'ranges' && parsedRanges.errors.length > 0 && <p className="pdf-export-error" role="alert">{parsedRanges.errors[0].message}</p>}
        {tooManyOutputs && <p className="pdf-export-error" role="alert">Refine the split to ten output files or fewer.</p>}
        <p className="split-reorder-note">Reorder before splitting. Drag pages or use the accessible arrow controls.</p>
        <PageThumbnailPanel pages={pages} activePageId={operations.activePageId} selectedPageIds={selected} selectionEnabled={mode === 'selected'} reorderEnabled={!busy} layout="grid" getPage={operations.getPage} onSelect={(id, selectionMode) => { if (busyRef.current) return; if (mode === 'selected') toggle(id, selectionMode); else operations.setActivePage(id); }} onReorder={(movingIds, targetId, placement) => { setMessage(null); setOutputs([]); setDownloaded([]); operations.reorderPages(movingIds, targetId, placement); }} label="PDF pages for splitting" />
        <section className="split-output-preview" aria-label="Split output preview"><h3>Output preview</h3><div>{groups.map((group, index) => <article key={`${index}-${group.join('-')}`}><strong>Output {index + 1}</strong><span>Pages {group.map((page) => page + 1).join(', ')}</span></article>)}</div><p>{groups.length} output file{groups.length === 1 ? '' : 's'}</p></section>
        <Button type="button" onClick={() => void split()} disabled={busy || !valid}><Scissors size={17} />{busy ? 'Preparing files' : 'Prepare split files'}</Button>
        {message && <p className="operation-message" role={message.error ? 'alert' : 'status'}>{message.text}</p>}
        {outputs.length > 0 && <section className="split-results" aria-label="Split PDF download results"><h3>Download results</h3><ol>{outputs.map((output, index) => <li key={output.filename}><span>{output.filename}</span><Button type="button" variant="secondary" size="compact" onClick={() => downloadResult(output, index)} disabled={downloaded.includes(index)}><Download size={16} aria-hidden="true" />{downloaded.includes(index) ? 'Downloaded' : 'Download'}</Button></li>)}</ol></section>}
    </section>;
}

function chunkIndexes(pageCount: number, count: number) {
    if (!Number.isInteger(count) || count < 1) return [];
    const groups: number[][] = [];
    for (let start = 0; start < pageCount; start += count) groups.push(Array.from({ length: Math.min(count, pageCount - start) }, (_, index) => start + index));
    return groups;
}

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Download, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { downloadPdf } from '../utils/pdfDownload';
import { mergePdfFiles } from '../services/documentOperationsService';
import { validatePdfFileSelection } from '../../services/pdfValidationService';

type MergeFile = { file: File; pageCount: number | null };
type OperationMessage = { text: string; error: boolean };

export function MergeWorkspace() {
    const [files, setFiles] = useState<MergeFile[]>([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<OperationMessage | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const draggingIndex = useRef<number | null>(null);
    const busyRef = useRef(false);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const addFiles = (incoming: File[]) => {
        if (busyRef.current) return;
        const accepted: File[] = [];
        let selectionError: string | null = null;
        for (const file of incoming) {
            try {
                validatePdfFileSelection(file);
                accepted.push(file);
            } catch (error) {
                selectionError ??= error instanceof Error ? error.message : 'The selected file could not be accepted.';
            }
        }
        setFiles((current) => {
            const known = new Set(current.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`));
            const additions = accepted.filter((file) => !known.has(`${file.name}-${file.size}-${file.lastModified}`)).map((file) => ({ file, pageCount: null }));
            return additions.length ? [...current, ...additions] : current;
        });
        setMessage(selectionError ? { text: selectionError, error: true } : null);
    };
    const onInput = (event: ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(event.target.files ?? []));
        event.target.value = '';
    };
    const move = (index: number, direction: -1 | 1) => {
        if (busyRef.current) return;
        setMessage(null);
        setFiles((current) => {
            const target = index + direction;
            if (target < 0 || target >= current.length) return current;
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };
    const merge = async () => {
        if (busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setMessage(null);
        try {
            const bytes = await mergePdfFiles(files.map(({ file }) => file));
            if (!mountedRef.current) return;
            downloadPdf(bytes, 'merged-document.pdf');
            setMessage({ text: 'Merged PDF downloaded.', error: false });
        } catch (error) {
            if (mountedRef.current) setMessage({ text: error instanceof Error ? error.message : 'The PDFs could not be merged.', error: true });
        } finally {
            busyRef.current = false;
            if (mountedRef.current) setBusy(false);
        }
    };
    return <section className="document-operation merge-workspace" aria-label="Merge PDFs">
        <input ref={inputRef} className="sr-only" type="file" accept="application/pdf,.pdf" multiple disabled={busy} onChange={onInput} />
        <div className="merge-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!busyRef.current) addFiles(Array.from(event.dataTransfer.files)); }}>
            <p>Choose PDF files or drop them here.</p>
            <Button type="button" variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}><Plus size={17} aria-hidden="true" />Add PDFs</Button>
        </div>
        <ol className="merge-file-list" aria-label="PDF merge order">
            {files.map(({ file, pageCount }, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`} draggable={!busy} onDragStart={() => { if (!busyRef.current) draggingIndex.current = index; }} onDragOver={(event: DragEvent) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (busyRef.current) return; const source = draggingIndex.current; if (source === null || source === index) return; setFiles((current) => { const next = [...current]; const [moving] = next.splice(source, 1); next.splice(index, 0, moving); return next; }); setMessage(null); draggingIndex.current = null; }}><GripVertical size={18} aria-hidden="true" /><div><strong>{file.name}</strong><span>{formatFileSize(file.size)}{pageCount ? ` - ${pageCount} pages` : ''}</span></div><button className="icon-button" type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Move ${file.name} earlier`} title="Move earlier"><ArrowUp size={16} aria-hidden="true" /></button><button className="icon-button" type="button" onClick={() => move(index, 1)} disabled={busy || index === files.length - 1} aria-label={`Move ${file.name} later`} title="Move later"><ArrowDown size={16} aria-hidden="true" /></button><button className="icon-button" type="button" onClick={() => { setMessage(null); setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index)); }} disabled={busy} aria-label={`Remove ${file.name}`} title="Remove"><Trash2 size={16} aria-hidden="true" /></button></li>)}
        </ol>
        <Button type="button" onClick={() => void merge()} disabled={files.length < 2 || busy}><Download size={17} aria-hidden="true" />{busy ? 'Merging' : 'Merge and download'}</Button>
        {message && <p className="operation-message" role={message.error ? 'alert' : 'status'}>{message.text}</p>}
    </section>;
}

function formatFileSize(size: number) {
    return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

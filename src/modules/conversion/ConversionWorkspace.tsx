import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, FileUp, GripVertical, Home, ShieldCheck, Trash2, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useShell } from '../../contexts/ShellContext';
import { activeConversionLimits, conversionAccept } from './conversionConfig';
import { docxToHtml, htmlToPdf, imagesToPdf, loadPdf, pdfToJpg, pdfToPpt, pdfToWord, releaseLoadedPdf, renderPageToBlob, type CancelSignal } from './conversionServices';

type ToolKey = 'jpg-to-pdf' | 'pdf-to-jpg' | 'pdf-to-ppt' | 'pdf-to-word' | 'word-to-pdf' | 'ppt-to-pdf';
const titles: Record<ToolKey, string> = {
    'jpg-to-pdf': 'JPG to PDF', 'pdf-to-jpg': 'PDF to JPG', 'pdf-to-ppt': 'PDF to PowerPoint',
    'pdf-to-word': 'PDF to Word', 'word-to-pdf': 'Word to PDF', 'ppt-to-pdf': 'PPT to PDF · Beta',
};
const notices: Partial<Record<ToolKey, string>> = {
    'pdf-to-ppt': 'Each PDF page will be inserted as an image on a PowerPoint slide. Text and page elements will not be individually editable.',
    'pdf-to-word': 'Basic conversion extracts editable text. Complex formatting, tables, columns, and images may not be preserved accurately.',
    'word-to-pdf': 'Basic browser conversion. Complex layouts, custom fonts, headers, footers, floating elements, and exact pagination may change.',
    'ppt-to-pdf': 'Beta conversion supports basic PPTX text, images, and simple layouts. Complex formatting may not be preserved.',
};

function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = name; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ConversionWorkspace() {
    const location = useLocation();
    const tool = location.pathname.slice(1) as ToolKey;
    const { requestNavigation } = useShell();
    const input = useRef<HTMLInputElement>(null);
    const preview = useRef<HTMLDivElement>(null);
    const signal = useRef<CancelSignal>({ cancelled: false });
    const [files, setFiles] = useState<File[]>([]);
    const [thumbs, setThumbs] = useState<string[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [selected, setSelected] = useState<number[]>([]);
    const [html, setHtml] = useState('');
    const [warnings, setWarnings] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
    const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
    const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [margin, setMargin] = useState(24);
    const [imageQuality, setImageQuality] = useState(.85);
    const [renderQuality, setRenderQuality] = useState<'standard' | 'high' | 'maximum'>('high');
    const limits = useMemo(activeConversionLimits, []);
    const multiple = tool === 'jpg-to-pdf';

    const clear = () => {
        signal.current.cancelled = true;
        thumbs.forEach(URL.revokeObjectURL);
        setFiles([]); setThumbs([]); setPageCount(0); setSelected([]); setHtml(''); setWarnings([]);
        setError(''); setBusy(false); setProgress({ current: 0, total: 0, label: '' }); setOutput(null);
    };
    useEffect(() => clear, [tool]); // eslint-disable-line react-hooks/exhaustive-deps

    const inspectFiles = async (next: File[]) => {
        clear();
        signal.current = { cancelled: false };
        try {
            if (!next.length) return;
            if (tool === 'jpg-to-pdf') {
                if (next.length > limits.images) throw new Error(`This device supports up to ${limits.images} images per job.`);
                const valid = next.filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name));
                if (valid.length !== next.length || valid.some((file) => !file.size)) throw new Error('Choose non-empty JPG, JPEG, PNG, or WebP images.');
                setFiles(valid); setThumbs(valid.map(URL.createObjectURL));
                return;
            }
            const file = next[0];
            if (!file.size) throw new Error('The selected file is empty.');
            if (tool === 'word-to-pdf') {
                if (/\.doc$/i.test(file.name)) throw new Error('Old .doc files are not supported. Save it as .docx first.');
                if (!/\.docx$/i.test(file.name)) throw new Error('Choose a .docx file.');
                if (file.size > limits.docxBytes) throw new Error(`DOCX files are limited to ${Math.round(limits.docxBytes / 1024 / 1024)} MB on this device.`);
                setFiles([file]); setBusy(true);
                const converted = await docxToHtml(file);
                setHtml(converted.html); setWarnings(converted.warnings); setBusy(false);
                return;
            }
            if (tool === 'ppt-to-pdf') { setFiles([file]); return; }
            if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') throw new Error('Choose a PDF file.');
            setFiles([file]); setBusy(true);
            const pdf = await loadPdf(file);
            if (pdf.numPages > limits.pdfPages) throw new Error(`This device supports PDFs up to ${limits.pdfPages} pages for conversion.`);
            setPageCount(pdf.numPages); setSelected(Array.from({ length: pdf.numPages }, (_, index) => index + 1));
            const urls: string[] = [];
            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                if (signal.current.cancelled) break;
                setProgress({ current: pageNumber, total: pdf.numPages, label: `Preparing page ${pageNumber}` });
                const page = await pdf.getPage(pageNumber);
                const { blob } = await renderPageToBlob(page, .22, .65);
                urls.push(URL.createObjectURL(blob)); setThumbs([...urls]);
            }
            await releaseLoadedPdf(pdf); setBusy(false);
        } catch (cause) {
            setBusy(false); setError(cause instanceof Error ? cause.message : 'The file could not be opened.');
        }
    };

    const reorder = (from: number, to: number) => {
        const nextFiles = [...files]; const [movedFile] = nextFiles.splice(from, 1); nextFiles.splice(to, 0, movedFile);
        const nextThumbs = [...thumbs]; const [movedThumb] = nextThumbs.splice(from, 1); nextThumbs.splice(to, 0, movedThumb);
        setFiles(nextFiles); setThumbs(nextThumbs); setOutput(null);
    };

    const convert = async () => {
        setError(''); setOutput(null); setBusy(true); signal.current = { cancelled: false };
        const update = (current: number, total: number, label: string) => setProgress({ current, total, label });
        try {
            let blob: Blob; let name: string;
            if (tool === 'jpg-to-pdf') {
                blob = await imagesToPdf(files, { pageSize, orientation, margin, quality: imageQuality }, update, signal.current);
                name = 'images.pdf';
            } else if (tool === 'pdf-to-jpg') {
                if (!selected.length) throw new Error('Select at least one page.');
                const scales = { standard: 1.25, high: 2, maximum: 3 };
                blob = await pdfToJpg(files[0], selected, scales[renderQuality], imageQuality, update, signal.current);
                name = selected.length === 1 ? `page-${selected[0]}.jpg` : 'pdf-pages.zip';
            } else if (tool === 'pdf-to-ppt') {
                if (!selected.length) throw new Error('Select at least one page.');
                blob = await pdfToPpt(files[0], selected, update, signal.current); name = 'converted.pptx';
            } else if (tool === 'pdf-to-word') {
                blob = await pdfToWord(files[0], update, signal.current); name = 'converted.docx';
            } else if (tool === 'word-to-pdf') {
                if (!preview.current) throw new Error('The document preview is not ready.');
                blob = await htmlToPdf(preview.current, update, signal.current); name = 'converted.pdf';
            } else throw new Error('Basic PPT to PDF conversion is under development.');
            if (!blob.size) throw new Error('Conversion produced an empty output and was stopped.');
            setOutput({ blob, name });
        } catch (cause) {
            if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause instanceof Error ? cause.message : 'Conversion failed.');
        } finally { setBusy(false); }
    };

    const allSelected = pageCount > 0 && selected.length === pageCount;
    const canConvert = files.length > 0 && !busy && tool !== 'ppt-to-pdf' && (tool !== 'word-to-pdf' || Boolean(html));
    return <section className="conversion-page" aria-label={`${titles[tool]} conversion workspace`}>
        <div className="conversion-heading">
            <div><p>100% local browser conversion</p><h1>{titles[tool]}</h1></div>
            <div><Link to="/" onClick={(event) => { event.preventDefault(); clear(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); clear(); requestNavigation('/'); }}><Home size={16} />Home</Link></div>
        </div>
        {notices[tool] && <div className="conversion-notice" role="note">{notices[tool]}</div>}
        {tool === 'ppt-to-pdf' && <div className="conversion-disabled"><h2>Basic PPT to PDF conversion is under development.</h2><p>Reliable reconstruction of PPTX slides is not available in this browser-only build, so conversion is intentionally disabled.</p></div>}
        <div className="conversion-grid">
            <section className="conversion-card conversion-upload">
                <div className="conversion-card__title"><div><span>1</span><h2>Files</h2></div>{files.length > 0 && <Button variant="ghost" onClick={clear}>Remove {multiple ? 'all' : 'file'}</Button>}</div>
                <input ref={input} className="sr-only" type="file" multiple={multiple} accept={conversionAccept[tool]} onChange={(event) => void inspectFiles(Array.from(event.target.files ?? []))} />
                {!files.length ? <button className="conversion-drop" type="button" disabled={tool === 'ppt-to-pdf'} onClick={() => input.current?.click()}><FileUp /><strong>Choose {multiple ? 'images' : 'a file'}</strong><span>{multiple ? 'JPG, JPEG, PNG or WebP' : conversionAccept[tool].split(',')[0]}</span><small><ShieldCheck size={14} /> Nothing leaves this device</small></button> :
                    <div className="file-summary"><strong>{multiple ? `${files.length} images` : files[0].name}</strong><span>{(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB</span><Button variant="secondary" onClick={() => input.current?.click()}>Replace File</Button></div>}
                {multiple && files.length > 0 && <div className="image-order">{files.map((file, index) => <article key={`${file.name}-${file.lastModified}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => reorder(Number(event.dataTransfer.getData('text/plain')), index)}><GripVertical aria-hidden="true" /><img src={thumbs[index]} alt="" /><span>{index + 1}. {file.name}</span><button aria-label={`Remove ${file.name}`} onClick={() => void inspectFiles(files.filter((_, item) => item !== index))}><Trash2 size={15} /></button></article>)}</div>}
            </section>
            <section className="conversion-card">
                <div className="conversion-card__title"><div><span>2</span><h2>Options</h2></div></div>
                {tool === 'jpg-to-pdf' && <div className="conversion-options"><label>Page size<select value={pageSize} onChange={(event) => setPageSize(event.target.value as typeof pageSize)}><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit image</option></select></label><label>Orientation<select value={orientation} onChange={(event) => setOrientation(event.target.value as typeof orientation)}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label><label>Margins <output>{margin} pt</output><input type="range" min="0" max="72" value={margin} onChange={(event) => setMargin(Number(event.target.value))} /></label><Quality value={imageQuality} setValue={setImageQuality} /></div>}
                {tool === 'pdf-to-jpg' && <div className="conversion-options"><label>Render quality<select value={renderQuality} onChange={(event) => setRenderQuality(event.target.value as typeof renderQuality)}><option value="standard">Standard</option><option value="high">High</option><option value="maximum">Maximum</option></select></label><Quality value={imageQuality} setValue={setImageQuality} /></div>}
                {(tool === 'pdf-to-ppt' || tool === 'pdf-to-word' || tool === 'word-to-pdf') && <p className="conversion-basic">{tool === 'pdf-to-ppt' ? 'Visual page-to-slide conversion' : tool === 'pdf-to-word' ? 'Editable text extraction' : 'Preview-based PDF conversion'}</p>}
                {pageCount > 0 && tool !== 'pdf-to-word' && <div className="page-selection"><div><strong>Pages</strong><button onClick={() => setSelected(allSelected ? [] : Array.from({ length: pageCount }, (_, index) => index + 1))}>{allSelected ? 'Clear all' : 'Select all'}</button></div><div>{thumbs.map((url, index) => { const page = index + 1; return <label key={url} className={selected.includes(page) ? 'is-selected' : ''}><img src={url} alt={`Page ${page}`} /><input type="checkbox" checked={selected.includes(page)} onChange={() => setSelected((current) => current.includes(page) ? current.filter((item) => item !== page) : [...current, page].sort((a, b) => a - b))} /><span>Page {page}</span></label>; })}</div></div>}
            </section>
            <section className="conversion-card conversion-preview-card">
                <div className="conversion-card__title"><div><span>3</span><h2>Preview & convert</h2></div></div>
                {html ? <div ref={preview} className="docx-preview" dangerouslySetInnerHTML={{ __html: html }} /> : thumbs.length && !multiple ? <div className="conversion-preview-pages">{thumbs.slice(0, 4).map((url, index) => <img key={url} src={url} alt={`Preview page ${index + 1}`} />)}</div> : <div className="conversion-empty">Your preview will appear here.</div>}
                {warnings.length > 0 && <details><summary>{warnings.length} document warning(s)</summary><ul>{warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)}</ul></details>}
                {busy && <div className="conversion-progress" role="status"><div><span>{progress.label || 'Preparing file'}</span><strong>{progress.total ? `${progress.current} / ${progress.total}` : 'Working…'}</strong></div><progress max={Math.max(1, progress.total)} value={progress.current} /><Button variant="secondary" onClick={() => { signal.current.cancelled = true; }}>Cancel</Button></div>}
                {error && <div className="conversion-error" role="alert"><X size={17} />{error}</div>}
                <div className="conversion-actions"><Button disabled={!canConvert} onClick={() => void convert()}>Convert</Button>{output && <Button variant="secondary" onClick={() => downloadBlob(output.blob, output.name)}><Download size={17} />Download {output.name}</Button>}</div>
            </section>
        </div>
    </section>;
}

function Quality({ value, setValue }: { value: number; setValue: (value: number) => void }) {
    return <label>JPG quality <output>{Math.round(value * 100)}%</output><input type="range" min="40" max="100" value={Math.round(value * 100)} onChange={(event) => setValue(Number(event.target.value) / 100)} /></label>;
}

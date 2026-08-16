import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Download, FileUp, GripVertical, Home, ShieldCheck, Trash2, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useShell } from '../../contexts/ShellContext';
import { findToolByRoute } from '../../config/toolRegistry';
import { activeConversionLimits, conversionAccept, conversionOutputFilename, type ConversionToolKey } from './conversionConfig';
import { docxToHtml, htmlToPdf, imagesToPdf, loadPdf, pdfToJpg, pdfToPpt, pdfToWord, releaseLoadedPdf, renderPageToBlob, type CancelSignal } from './conversionServices';
import { inspectPptx, pptxToPdf } from './pptxToPdfService';
import { validateImageFile } from '../../utils/imageFiles';
import { resetCompletedToolSource } from '../../utils/toolReset';
import { downloadBlob } from '../../utils/browserDownload';
import { getProcessingErrorMessage } from '../../utils/processingErrors';
import { ToolGuideLink } from '../../blog/components/ToolGuideLink';
import { DOWNLOAD_SUCCESS_MESSAGE, notify } from '../../components/feedback/notifications';

export default function ConversionWorkspace() {
    const location = useLocation();
    const tool = location.pathname.slice(1) as ConversionToolKey;
    const definition = findToolByRoute(location.pathname);
    const { requestNavigation } = useShell();
    const input = useRef<HTMLInputElement>(null);
    const preview = useRef<HTMLDivElement>(null);
    const signal = useRef<CancelSignal>({ cancelled: false });
    const operationRef = useRef(0);
    const busyRef = useRef(false);
    const thumbsRef = useRef<string[]>([]);
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

    const revokeThumbnails = useCallback(() => {
        thumbsRef.current.forEach((url) => URL.revokeObjectURL(url));
        thumbsRef.current = [];
    }, []);
    const updateThumbnails = useCallback((urls: string[]) => {
        thumbsRef.current = urls;
        setThumbs(urls);
    }, []);
    const resetSourceState = useCallback((preserveOutput: boolean) => {
        const objectUrls = thumbsRef.current;
        thumbsRef.current = [];
        resetCompletedToolSource({
            clearSource: () => {
                setFiles([]); setThumbs([]); setPageCount(0); setSelected([]); setHtml(''); setWarnings([]);
                setError(''); setBusy(false); setProgress({ current: 0, total: 0, label: '' });
                setPageSize('a4'); setOrientation('portrait'); setMargin(24); setImageQuality(.85); setRenderQuality('high');
                if (!preserveOutput) setOutput(null);
            },
            fileInputs: [input.current],
            objectUrls,
        });
    }, []);
    const clear = useCallback(() => {
        operationRef.current += 1;
        signal.current.cancelled = true;
        busyRef.current = false;
        resetSourceState(false);
    }, [resetSourceState]);
    useEffect(() => {
        clear();
        return () => {
            operationRef.current += 1;
            signal.current.cancelled = true;
            busyRef.current = false;
            revokeThumbnails();
        };
    }, [clear, revokeThumbnails, tool]);

    const inspectFiles = async (next: File[]) => {
        if (busyRef.current) return;
        clear();
        const operation = ++operationRef.current;
        const operationSignal: CancelSignal = { cancelled: false };
        signal.current = operationSignal;
        const isCurrent = () => operationRef.current === operation && !operationSignal.cancelled;
        let pdf: Awaited<ReturnType<typeof loadPdf>> | null = null;
        try {
            if (!next.length) return;
            if (tool === 'jpg-to-pdf') {
                if (next.length > limits.images) throw new Error(`This device supports up to ${limits.images} images per job.`);
                next.forEach(validateImageFile);
                const urls: string[] = [];
                try {
                    for (const file of next) urls.push(URL.createObjectURL(file));
                } catch (error) {
                    urls.forEach((url) => URL.revokeObjectURL(url));
                    throw error;
                }
                if (!isCurrent()) {
                    urls.forEach((url) => URL.revokeObjectURL(url));
                    return;
                }
                setFiles(next);
                updateThumbnails(urls);
                return;
            }
            const file = next[0];
            if (!file.size) throw new Error('The selected file is empty.');
            if (tool === 'word-to-pdf') {
                if (/\.doc$/i.test(file.name)) throw new Error('Old .doc files are not supported. Save it as .docx first.');
                if (!/\.docx$/i.test(file.name)) throw new Error('Choose a .docx file.');
                if (file.size > limits.docxBytes) throw new Error(`DOCX files are limited to ${Math.round(limits.docxBytes / 1024 / 1024)} MB on this device.`);
                setFiles([file]); busyRef.current = true; setBusy(true);
                const converted = await docxToHtml(file);
                if (isCurrent()) {
                    setHtml(converted.html);
                    setWarnings(converted.warnings);
                }
                return;
            }
            if (tool === 'ppt-to-pdf') {
                if (/\.ppt$/i.test(file.name)) throw new Error('Old .ppt files are not supported. Save the presentation as .pptx first.');
                if (!/\.pptx$/i.test(file.name)) throw new Error('Choose a .pptx PowerPoint file.');
                if (file.size > limits.pptxBytes) throw new Error(`PPTX files are limited to ${Math.round(limits.pptxBytes / 1024 / 1024)} MB on this device.`);
                setFiles([file]); busyRef.current = true; setBusy(true);
                const inspected = await inspectPptx(file, (current, total, label) => {
                    if (isCurrent()) setProgress({ current, total, label });
                }, operationSignal);
                if (!isCurrent()) return;
                if (inspected.thumbnails.length > limits.pdfPages) throw new Error(`This device supports presentations up to ${limits.pdfPages} slides.`);
                const urls = inspected.thumbnails.map((blob) => URL.createObjectURL(blob));
                setPageCount(urls.length);
                setSelected(Array.from({ length: urls.length }, (_, index) => index + 1));
                setWarnings(inspected.warnings);
                updateThumbnails(urls);
                return;
            }
            setFiles([file]); busyRef.current = true; setBusy(true);
            pdf = await loadPdf(file);
            if (!isCurrent()) return;
            if (pdf.numPages > limits.pdfPages) throw new Error(`This device supports PDFs up to ${limits.pdfPages} pages for conversion.`);
            setPageCount(pdf.numPages); setSelected(Array.from({ length: pdf.numPages }, (_, index) => index + 1));
            const urls: string[] = [];
            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                if (!isCurrent()) break;
                setProgress({ current: pageNumber, total: pdf.numPages, label: `Preparing page ${pageNumber}` });
                const page = await pdf.getPage(pageNumber);
                const { blob } = await renderPageToBlob(page, .22, .65);
                if (!isCurrent()) break;
                urls.push(URL.createObjectURL(blob));
                updateThumbnails([...urls]);
            }
        } catch (cause) {
            if (isCurrent()) {
                if (tool.startsWith('pdf-') || tool === 'ppt-to-pdf') {
                    revokeThumbnails();
                    setThumbs([]);
                    setFiles([]);
                    setPageCount(0);
                    setSelected([]);
                }
                setError(cause instanceof Error ? cause.message : 'The file could not be opened.');
            }
        } finally {
            if (pdf) await releaseLoadedPdf(pdf);
            if (operationRef.current === operation) {
                if (operationSignal.cancelled) {
                    revokeThumbnails();
                    setThumbs([]);
                    setFiles([]);
                    setPageCount(0);
                    setSelected([]);
                    setError('File preparation was cancelled.');
                }
                busyRef.current = false;
                setBusy(false);
            }
        }
    };

    const reorder = (from: number, to: number) => {
        if (busyRef.current || !Number.isInteger(from) || from < 0 || from >= files.length || to < 0 || to >= files.length) return;
        const nextFiles = [...files]; const [movedFile] = nextFiles.splice(from, 1); nextFiles.splice(to, 0, movedFile);
        const nextThumbs = [...thumbs]; const [movedThumb] = nextThumbs.splice(from, 1); nextThumbs.splice(to, 0, movedThumb);
        setFiles(nextFiles); updateThumbnails(nextThumbs); setOutput(null); setError('');
    };
    const invalidateOutput = () => {
        if (!busyRef.current) {
            setOutput(null);
            setError('');
        }
    };
    const downloadOutput = () => {
        if (!output) return;
        try {
            downloadBlob(output.blob, output.name);
            notify(DOWNLOAD_SUCCESS_MESSAGE);
        } catch (cause) {
            setError(getProcessingErrorMessage(cause, 'The converted file could not be downloaded. Check browser download permissions and try again.'));
        }
    };

    const convert = async () => {
        if (busyRef.current) return;
        busyRef.current = true;
        const operation = ++operationRef.current;
        const operationSignal: CancelSignal = { cancelled: false };
        signal.current = operationSignal;
        const isCurrent = () => operationRef.current === operation && !operationSignal.cancelled;
        setError(''); setOutput(null); setBusy(true);
        const update = (current: number, total: number, label: string) => {
            if (isCurrent()) setProgress({ current, total, label });
        };
        try {
            let blob: Blob;
            if (tool === 'jpg-to-pdf') {
                blob = await imagesToPdf(files, { pageSize, orientation, margin, quality: imageQuality }, update, operationSignal);
            } else if (tool === 'pdf-to-jpg') {
                if (!selected.length) throw new Error('Select at least one page.');
                const scales = { standard: 1.25, high: 2, maximum: 3 };
                blob = await pdfToJpg(files[0], selected, scales[renderQuality], imageQuality, update, operationSignal);
            } else if (tool === 'pdf-to-ppt') {
                if (!selected.length) throw new Error('Select at least one page.');
                blob = await pdfToPpt(files[0], selected, update, operationSignal);
            } else if (tool === 'ppt-to-pdf') {
                if (!selected.length) throw new Error('Select at least one slide.');
                blob = await pptxToPdf(files[0], selected, update, operationSignal);
            } else if (tool === 'pdf-to-word') {
                blob = await pdfToWord(files[0], update, operationSignal);
            } else if (tool === 'word-to-pdf') {
                if (!preview.current) throw new Error('The document preview is not ready.');
                blob = await htmlToPdf(preview.current, update, operationSignal);
            } else throw new Error('This conversion route is not available.');
            if (!blob.size) throw new Error('Conversion produced an empty output and was stopped.');
            if (isCurrent()) {
                setOutput({ blob, name: conversionOutputFilename(tool, files, selected) });
                resetSourceState(true);
            }
        } catch (cause) {
            if (isCurrent() && !(cause instanceof DOMException && cause.name === 'AbortError')) setError(getProcessingErrorMessage(cause, 'Conversion failed. Keep the source file selected and try again.'));
        } finally {
            if (operationRef.current === operation) {
                busyRef.current = false;
                setBusy(false);
            }
        }
    };

    const allSelected = pageCount > 0 && selected.length === pageCount;
    const canConvert = files.length > 0 && !busy
        && (tool !== 'word-to-pdf' || Boolean(html))
        && (tool !== 'ppt-to-pdf' || selected.length > 0);
    const title = definition?.title ?? 'PDF conversion';
    return <section className="conversion-page" aria-label={`${title} conversion workspace`}>
        <div className="conversion-heading">
            <div><p>100% local browser conversion</p><h1>{title}</h1></div>
            <div><Link to="/" onClick={(event) => { event.preventDefault(); clear(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); clear(); requestNavigation('/'); }}><Home size={16} />Home</Link></div>
        </div>
        {definition?.limitations.length ? <div className="conversion-notice" role="note"><strong>{definition.badge ?? 'Limitation'}:</strong> {definition.limitations.join(' ')}</div> : null}
        <ToolGuideLink toolPath={location.pathname} />
        <div className="conversion-grid">
            <section className="conversion-card conversion-upload">
                <div className="conversion-card__title"><div><span>1</span><h2>Files</h2></div>{files.length > 0 && <Button variant="ghost" onClick={clear}>Remove {multiple ? 'all' : 'file'}</Button>}</div>
                <input ref={input} className="sr-only" type="file" multiple={multiple} accept={conversionAccept[tool]} disabled={busy} onChange={(event) => { const next = Array.from(event.target.files ?? []); event.target.value = ''; void inspectFiles(next); }} />
                {!files.length ? <button className="conversion-drop" type="button" disabled={busy} onClick={() => input.current?.click()}><FileUp /><strong>Choose {multiple ? 'images' : 'a file'}</strong><span>{multiple ? 'JPG, JPEG, PNG or WebP' : conversionAccept[tool].split(',')[0]}</span><small><ShieldCheck size={14} /> Nothing leaves this device</small></button> :
                    <div className="file-summary"><strong>{multiple ? `${files.length} images` : files[0].name}</strong><span>{(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB</span><Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>Replace File</Button></div>}
                {multiple && files.length > 0 && <div className="image-order">{files.map((file, index) => <article key={`${file.name}-${file.lastModified}`} draggable={!busy} onDragStart={(event) => { if (!busyRef.current) event.dataTransfer.setData('text/plain', String(index)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => reorder(Number(event.dataTransfer.getData('text/plain')), index)}><GripVertical aria-hidden="true" /><img src={thumbs[index]} alt="" /><span>{index + 1}. {file.name}</span><div className="image-order__actions"><button type="button" disabled={busy || index === 0} aria-label={`Move ${file.name} earlier`} onClick={() => reorder(index, index - 1)}><ArrowUp size={15} /></button><button type="button" disabled={busy || index === files.length - 1} aria-label={`Move ${file.name} later`} onClick={() => reorder(index, index + 1)}><ArrowDown size={15} /></button><button type="button" disabled={busy} aria-label={`Remove ${file.name}`} onClick={() => void inspectFiles(files.filter((_, item) => item !== index))}><Trash2 size={15} /></button></div></article>)}</div>}
            </section>
            <section className="conversion-card">
                <div className="conversion-card__title"><div><span>2</span><h2>Options</h2></div></div>
                {tool === 'jpg-to-pdf' && <div className="conversion-options"><label>Page size<select value={pageSize} disabled={busy} onChange={(event) => { setPageSize(event.target.value as typeof pageSize); invalidateOutput(); }}><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit image</option></select></label><label>Orientation<select value={orientation} disabled={busy} onChange={(event) => { setOrientation(event.target.value as typeof orientation); invalidateOutput(); }}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label><label>Margins <output>{margin} pt</output><input type="range" min="0" max="72" value={margin} disabled={busy} onChange={(event) => { setMargin(Number(event.target.value)); invalidateOutput(); }} /></label><Quality value={imageQuality} setValue={(value) => { setImageQuality(value); invalidateOutput(); }} disabled={busy} /></div>}
                {tool === 'pdf-to-jpg' && <div className="conversion-options"><label>Render quality<select value={renderQuality} disabled={busy} onChange={(event) => { setRenderQuality(event.target.value as typeof renderQuality); invalidateOutput(); }}><option value="standard">Standard</option><option value="high">High</option><option value="maximum">Maximum</option></select></label><Quality value={imageQuality} setValue={(value) => { setImageQuality(value); invalidateOutput(); }} disabled={busy} /></div>}
                {(tool === 'ppt-to-pdf' || tool === 'pdf-to-ppt' || tool === 'pdf-to-word' || tool === 'word-to-pdf') && <p className="conversion-basic">{tool === 'ppt-to-pdf' ? 'Visual slide-to-page conversion' : tool === 'pdf-to-ppt' ? 'Visual page-to-slide conversion' : tool === 'pdf-to-word' ? 'Editable text extraction' : 'Preview-based PDF conversion'}</p>}
                {pageCount > 0 && tool !== 'pdf-to-word' && <div className="page-selection"><div><strong>{tool === 'ppt-to-pdf' ? 'Slides' : 'Pages'}</strong><button type="button" disabled={busy} onClick={() => { setSelected(allSelected ? [] : Array.from({ length: pageCount }, (_, index) => index + 1)); invalidateOutput(); }}>{allSelected ? 'Clear all' : 'Select all'}</button></div><div>{thumbs.map((url, index) => { const page = index + 1; const itemLabel = tool === 'ppt-to-pdf' ? 'Slide' : 'Page'; return <label key={url} className={selected.includes(page) ? 'is-selected' : ''}><img src={url} alt={`${itemLabel} ${page}`} /><input type="checkbox" disabled={busy} checked={selected.includes(page)} onChange={() => { setSelected((current) => current.includes(page) ? current.filter((item) => item !== page) : [...current, page].sort((a, b) => a - b)); invalidateOutput(); }} /><span>{itemLabel} {page}</span></label>; })}</div></div>}
            </section>
            <section className="conversion-card conversion-preview-card">
                <div className="conversion-card__title"><div><span>3</span><h2>Preview & convert</h2></div></div>
                {html ? <div ref={preview} className="docx-preview" dangerouslySetInnerHTML={{ __html: html }} /> : thumbs.length && !multiple ? <div className="conversion-preview-pages">{thumbs.slice(0, 4).map((url, index) => <img key={url} src={url} alt={`Preview ${tool === 'ppt-to-pdf' ? 'slide' : 'page'} ${index + 1}`} />)}</div> : <div className="conversion-empty">Your preview will appear here.</div>}
                {warnings.length > 0 && <details><summary>{warnings.length} document warning(s)</summary><ul>{warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)}</ul></details>}
                {busy && <div className="conversion-progress" role="status"><div><span>{progress.label || 'Preparing file'}</span><strong>{progress.total ? `${progress.current} / ${progress.total}` : 'Working…'}</strong></div><progress max={Math.max(1, progress.total)} value={progress.current} /><Button variant="secondary" onClick={() => { signal.current.cancelled = true; }}>Cancel</Button></div>}
                {error && <div className="conversion-error" role="alert"><X size={17} />{error}</div>}
                {output && <p className="operation-message" role="status">Conversion complete. The output is ready to download.</p>}
                <div className="conversion-actions"><Button disabled={!canConvert} onClick={() => void convert()}>Convert</Button>{output && <Button variant="secondary" onClick={downloadOutput}><Download size={17} />Download {output.name}</Button>}</div>
            </section>
        </div>
    </section>;
}

function Quality({ value, setValue, disabled = false }: { value: number; setValue: (value: number) => void; disabled?: boolean }) {
    return <label>JPG quality <output>{Math.round(value * 100)}%</output><input type="range" min="40" max="100" value={Math.round(value * 100)} disabled={disabled} onChange={(event) => setValue(Number(event.target.value) / 100)} /></label>;
}

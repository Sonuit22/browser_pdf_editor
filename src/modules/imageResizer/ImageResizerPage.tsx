import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { ArrowLeft, Download, FileImage, FileUp, Home, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DOWNLOAD_SUCCESS_MESSAGE, notify } from '../../components/feedback/notifications';
import { useShell } from '../../contexts/ShellContext';
import { downloadBlob } from '../../utils/browserDownload';
import { trackEvent } from '../../utils/analytics';
import { MAX_IMAGE_FILE_SIZE, validateImageFile } from '../../utils/imageFiles';
import { createImagePreview, createOutputPreview, decodeImage, resizeImage, type ImageOutputFormat, type ImageResizeOutput } from './imageResizeService';

type ResizeMode = 'dimensions' | 'percentage' | 'target';
type ImageInfo = { bitmap: ImageBitmap; width: number; height: number; mime: string; previewUrl: string };
type Result = ImageResizeOutput & { url: string; key: string };

const percentages = [25, 50, 75, 100] as const;
const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const formatLabel = (mime: string) => mime === 'image/jpeg' ? 'JPEG' : mime === 'image/png' ? 'PNG' : 'WebP';
const extension = (mime: string) => mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp';

export default function ImageResizerPage() {
    const { requestNavigation } = useShell();
    const input = useRef<HTMLInputElement>(null);
    const controller = useRef<AbortController | null>(null);
    const infoRef = useRef<ImageInfo | null>(null);
    const resultRef = useRef<Result | null>(null);
    const controlsRef = useRef<HTMLElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [info, setInfo] = useState<ImageInfo | null>(null);
    const [mode, setMode] = useState<ResizeMode>('dimensions');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [lockRatio, setLockRatio] = useState(true);
    const [percentage, setPercentage] = useState(75);
    const [target, setTarget] = useState('500');
    const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
    const [format, setFormat] = useState<ImageOutputFormat>('original');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => { trackEvent('image_resizer_opened', { tool: 'image-resizer' }); }, []);
    useEffect(() => { infoRef.current = info; }, [info]);
    useEffect(() => { resultRef.current = result; }, [result]);

    const revokeResult = () => { if (result) URL.revokeObjectURL(result.url); setResult(null); };
    const clear = () => {
        controller.current?.abort();
        if (info) { info.bitmap.close(); URL.revokeObjectURL(info.previewUrl); }
        revokeResult();
        setFile(null); setInfo(null); setError(''); setBusy(false); setMode('dimensions'); setFormat('original');
        if (input.current) input.current.value = '';
    };
    useEffect(() => () => {
        controller.current?.abort();
        infoRef.current?.bitmap.close();
        if (infoRef.current) URL.revokeObjectURL(infoRef.current.previewUrl);
        if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    }, []);

    const load = async (selected: File) => {
        clear(); setBusy(true);
        try {
            validateImageFile(selected);
            const bitmap = await decodeImage(selected);
            let previewUrl: string;
            try { previewUrl = URL.createObjectURL(await createImagePreview(bitmap)); }
            catch (reason) { bitmap.close(); throw reason; }
            const mime = selected.type || (/\.png$/i.test(selected.name) ? 'image/png' : /\.webp$/i.test(selected.name) ? 'image/webp' : 'image/jpeg');
            setFile(selected); setInfo({ bitmap, width: bitmap.width, height: bitmap.height, mime, previewUrl });
            setWidth(bitmap.width); setHeight(bitmap.height); setPercentage(75); setTarget('500');
        } catch (reason) { setError(reason instanceof Error ? reason.message : 'The image could not be opened.'); }
        finally { setBusy(false); }
    };

    const outputWidth = mode === 'percentage' ? Math.max(1, Math.round((info?.width ?? 1) * percentage / 100)) : mode === 'target' ? info?.width ?? 1 : width;
    const outputHeight = mode === 'percentage' ? Math.max(1, Math.round((info?.height ?? 1) * percentage / 100)) : mode === 'target' ? info?.height ?? 1 : height;
    const targetBytes = mode === 'target' && Number(target) > 0 ? Math.round(Number(target) * (targetUnit === 'MB' ? 1024 * 1024 : 1024)) : null;
    const effectiveFormat: ImageOutputFormat = mode === 'target' && format === 'original' && info?.mime === 'image/png' ? 'image/webp' : format;
    const settingsKey = useMemo(() => JSON.stringify([mode, outputWidth, outputHeight, effectiveFormat, targetBytes]), [mode, outputWidth, outputHeight, effectiveFormat, targetBytes]);
    const stale = Boolean(result && result.key !== settingsKey);
    const targetMissed = Boolean(result && targetBytes && result.blob.size > targetBytes * 1.08);

    const setDimension = (kind: 'width' | 'height', next: number) => {
        if (!info || next < 1) return;
        if (!lockRatio) { if (kind === 'width') setWidth(next); else setHeight(next); return; }
        const ratio = info.width / info.height;
        if (kind === 'width') { setWidth(next); setHeight(Math.max(1, Math.round(next / ratio))); }
        else { setHeight(next); setWidth(Math.max(1, Math.round(next * ratio))); }
    };

    const run = async () => {
        if (!file || !info || busy) return;
        if (outputWidth < 1 || outputHeight < 1) { setError('Enter valid output dimensions.'); return; }
        if (mode === 'target' && !targetBytes) { setError('Enter a target file size greater than zero.'); return; }
        const job = new AbortController(); controller.current = job; setBusy(true); setError('');
        trackEvent('image_resizer_started', { tool: 'image-resizer' });
        try {
            const output = await resizeImage(info.bitmap, info.mime, { quality: 92, width: outputWidth, height: outputHeight, format: effectiveFormat, targetBytes }, job.signal);
            if (job.signal.aborted) return;
            revokeResult();
            const preview = await createOutputPreview(output.blob);
            if (job.signal.aborted) return;
            setResult({ ...output, url: URL.createObjectURL(preview), key: settingsKey });
            trackEvent('image_resizer_succeeded', { tool: 'image-resizer' });
        } catch (reason) {
            if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
                setError(reason instanceof Error ? reason.message : 'Image resizing failed.');
                trackEvent('image_resizer_failed', { tool: 'image-resizer', reason: 'processing-error' });
            }
        } finally { if (controller.current === job) controller.current = null; setBusy(false); }
    };

    const download = () => {
        if (!result || !file || stale) return;
        try {
            const base = file.name.replace(/\.[^.]+$/, '');
            downloadBlob(result.blob, `${base}-resized.${extension(result.mimeType)}`);
            notify(DOWNLOAD_SUCCESS_MESSAGE);
            trackEvent('resized_image_downloaded', { tool: 'image-resizer' });
        } catch { setError('The resized image could not be downloaded. Check browser download permissions.'); }
    };
    const onDrop = (event: DragEvent) => { event.preventDefault(); const selected = event.dataTransfer.files[0]; if (selected) void load(selected); };

    return <section className="standalone-tool image-resizer-tool" aria-label="Image Resizer workspace">
        <header className="standalone-tool__heading"><div><p>Local image resizing</p><h1>Image Resizer</h1></div><nav><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('/'); }}><Home size={16} />Home</Link></nav></header>
        <p className="local-privacy"><ShieldCheck size={17} /> Processed locally in your browser.</p>
        <input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ''; if (selected) void load(selected); }} />
        {!file || !info ? <button className="standalone-drop" type="button" disabled={busy} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => input.current?.click()}>{busy ? <LoadingSpinner label="Opening image" /> : <FileUp size={32} />}<strong>Choose an image</strong><span>JPG, PNG or WebP · up to {Math.round(MAX_IMAGE_FILE_SIZE / 1024 / 1024)} MB</span></button> : <>
            <section className="standalone-file-card"><FileImage aria-hidden="true" /><div><h2 title={file.name}>{file.name}</h2><p>{info.width} × {info.height} px · {formatBytes(file.size)} · {formatLabel(info.mime)}</p></div><div><Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>Replace</Button><Button variant="ghost" disabled={busy} onClick={clear}><Trash2 size={16} />Remove</Button></div></section>
            <section className="image-preview-grid image-resizer-previews"><figure><figcaption>Original</figcaption><img src={info.previewUrl} alt="Original image preview" /><p>{info.width} × {info.height}<br />{formatBytes(file.size)}</p></figure><figure><figcaption>Resized</figcaption>{result ? <img src={result.url} alt="Resized image preview" /> : <div>Result preview appears here</div>}<p>{result ? <>{result.width} × {result.height}<br />{formatBytes(result.blob.size)}</> : <>{outputWidth} × {outputHeight}<br />Size shown after resizing</>}</p></figure></section>
            <section ref={controlsRef} className="standalone-panel image-resizer-controls"><h2>Resize Image</h2><p>Resize by</p>
                <div className="image-resize-tabs" role="tablist" aria-label="Resize image by"><button type="button" role="tab" aria-selected={mode === 'dimensions'} onClick={() => setMode('dimensions')}>Dimensions</button><button type="button" role="tab" aria-selected={mode === 'percentage'} onClick={() => setMode('percentage')}>Percentage</button><button type="button" role="tab" aria-selected={mode === 'target'} onClick={() => setMode('target')}>Target Size</button></div>
                {mode === 'dimensions' && <div className="image-resize-fields"><label>Width<div><input type="number" min="1" value={width} onChange={(event) => setDimension('width', Number(event.target.value))} /><span>px</span></div></label><label>Height<div><input type="number" min="1" value={height} onChange={(event) => setDimension('height', Number(event.target.value))} /><span>px</span></div></label><label className="image-ratio-lock"><input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} />Keep aspect ratio</label></div>}
                {mode === 'percentage' && <div className="image-percentage-control"><label>Resize to<select value={percentage} onChange={(event) => setPercentage(Number(event.target.value))}>{percentages.map((value) => <option key={value} value={value}>{value}%</option>)}</select></label><p>Result: <strong>{outputWidth} × {outputHeight} px</strong></p></div>}
                {mode === 'target' && <div className="image-target-control"><label>Target file size<div><input type="number" min="0.1" step="0.1" value={target} onChange={(event) => setTarget(event.target.value)} /><select aria-label="Target image size unit" value={targetUnit} onChange={(event) => setTargetUnit(event.target.value as 'KB' | 'MB')}><option>KB</option><option>MB</option></select></div></label><p>Best effort. Exact size depends on image content.</p>{format === 'original' && info.mime === 'image/png' && <p>WebP will be used to preserve transparency while targeting a smaller file size.</p>}</div>}
                <details className="image-more-options"><summary>More options</summary><label>Format<select value={format} onChange={(event) => setFormat(event.target.value as ImageOutputFormat)}><option value="original">Keep original</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label></details>
                {(effectiveFormat === 'image/jpeg') && (info.mime === 'image/png' || info.mime === 'image/webp') && <p className="standalone-warning">JPEG does not support transparency. Transparent pixels will use a white background.</p>}
                {busy ? <div className="standalone-progress" role="status"><LoadingSpinner label="Resizing image" /><strong>Resizing image…</strong><Button variant="secondary" onClick={() => controller.current?.abort()}>Cancel</Button></div> : <Button className="standalone-primary" onClick={() => void run()}>{result ? <><RefreshCw size={17} />Resize Again</> : 'Resize Image'}</Button>}
            </section>
            {result && <section className="standalone-result"><h2>Result</h2>{targetMissed ? <p className="standalone-warning">Closest safe result: {formatBytes(result.blob.size)}. The exact target could not be reached while maintaining usable quality.</p> : <p>Image resized successfully. File size may vary depending on image format and content.</p>}<dl><div><dt>Original</dt><dd>{formatBytes(file.size)}</dd></div><div><dt>Resized</dt><dd>{formatBytes(result.blob.size)}</dd></div><div><dt>Dimensions</dt><dd>{result.width} × {result.height} px</dd></div></dl>{stale && <p className="compression-stale">Size settings changed. Resize again before downloading.</p>}<div><Button variant="secondary" onClick={() => controlsRef.current?.scrollIntoView({ block: 'start' })}>Adjust size</Button><Button variant="secondary" onClick={clear}>Resize another image</Button><Button disabled={stale} onClick={download}><Download size={17} />Download Image</Button></div></section>}
        </>}
        {error && <p className="standalone-error" role="alert">{error}</p>}
    </section>;
}

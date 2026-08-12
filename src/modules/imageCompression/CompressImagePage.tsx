import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { ArrowLeft, Download, FileImage, FileUp, Home, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { notify } from '../../components/feedback/notifications';
import { useShell } from '../../contexts/ShellContext';
import { downloadBlob } from '../../utils/browserDownload';
import { trackEvent } from '../../utils/analytics';
import { MAX_IMAGE_FILE_SIZE, validateImageFile } from '../../utils/imageFiles';
import { compressImage, decodeImage, type ImageCompressionOutput, type ImageOutputFormat } from './imageCompressionService';

type Mode = 'quick' | 'customize';
type Preset = 'light' | 'balanced' | 'strong' | 'maximum';
type ImageInfo = { bitmap: ImageBitmap; width: number; height: number; mime: string; previewUrl: string };
type Result = ImageCompressionOutput & { url: string; key: string };
const presets: Record<Preset, { label: string; help: string; quality: number; scale: number }> = {
    light: { label: 'Light', help: 'Best quality', quality: 90, scale: 100 }, balanced: { label: 'Balanced', help: 'Recommended', quality: 75, scale: 100 }, strong: { label: 'Strong', help: 'Smaller image', quality: 60, scale: 75 }, maximum: { label: 'Maximum', help: 'Maximum practical reduction', quality: 40, scale: 50 },
};
const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const formatLabel = (mime: string) => mime === 'image/jpeg' ? 'JPEG' : mime === 'image/png' ? 'PNG' : 'WebP';
const extension = (mime: string) => mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp';

export default function CompressImagePage() {
    const { requestNavigation } = useShell();
    const input = useRef<HTMLInputElement>(null); const controller = useRef<AbortController | null>(null);
    const infoRef = useRef<ImageInfo | null>(null); const resultRef = useRef<Result | null>(null);
    const [file, setFile] = useState<File | null>(null); const [info, setInfo] = useState<ImageInfo | null>(null);
    const [mode, setMode] = useState<Mode>('quick'); const [preset, setPreset] = useState<Preset>('balanced');
    const [quality, setQuality] = useState(75); const [scale, setScale] = useState(100); const [width, setWidth] = useState(0); const [height, setHeight] = useState(0); const [lockRatio, setLockRatio] = useState(true);
    const [format, setFormat] = useState<ImageOutputFormat>('original'); const [target, setTarget] = useState(''); const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');
    const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState<Result | null>(null);
    useEffect(() => { trackEvent('compress_image_opened', { tool: 'compress-image' }); }, []);
    useEffect(() => { infoRef.current = info; }, [info]);
    useEffect(() => { resultRef.current = result; }, [result]);
    const revokeResult = () => { if (result) URL.revokeObjectURL(result.url); setResult(null); };
    const clear = () => { controller.current?.abort(); if (info) { info.bitmap.close(); URL.revokeObjectURL(info.previewUrl); } revokeResult(); setFile(null); setInfo(null); setError(''); setBusy(false); if (input.current) input.current.value = ''; };
    useEffect(() => () => {
        controller.current?.abort();
        infoRef.current?.bitmap.close();
        if (infoRef.current) URL.revokeObjectURL(infoRef.current.previewUrl);
        if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    }, []);
    const load = async (selected: File) => {
        clear(); setBusy(true);
        try { validateImageFile(selected); const bitmap = await decodeImage(selected); const previewUrl = URL.createObjectURL(selected); setFile(selected); setInfo({ bitmap, width: bitmap.width, height: bitmap.height, mime: selected.type || (/\.png$/i.test(selected.name) ? 'image/png' : /\.webp$/i.test(selected.name) ? 'image/webp' : 'image/jpeg'), previewUrl }); setWidth(bitmap.width); setHeight(bitmap.height); }
        catch (reason) { setError(reason instanceof Error ? reason.message : 'The image could not be opened.'); }
        finally { setBusy(false); }
    };
    const presetSettings = presets[preset]; const activeQuality = mode === 'quick' ? presetSettings.quality : quality; const activeScale = mode === 'quick' ? presetSettings.scale : scale;
    const outputWidth = mode === 'quick' ? Math.max(1, Math.round((info?.width ?? 1) * activeScale / 100)) : width;
    const outputHeight = mode === 'quick' ? Math.max(1, Math.round((info?.height ?? 1) * activeScale / 100)) : height;
    const targetBytes = mode === 'customize' && Number(target) > 0 ? Math.round(Number(target) * (targetUnit === 'MB' ? 1024 * 1024 : 1024)) : null;
    const settingsKey = useMemo(() => JSON.stringify([activeQuality, outputWidth, outputHeight, format, targetBytes]), [activeQuality, outputWidth, outputHeight, format, targetBytes]);
    const outputMime = format === 'original' ? info?.mime : format;
    const stale = Boolean(result && result.key !== settingsKey);
    const setDimension = (kind: 'width' | 'height', next: number) => {
        if (!info || next < 1) return;
        if (!lockRatio) { if (kind === 'width') setWidth(next); else setHeight(next); return; }
        const ratio = info.width / info.height;
        if (kind === 'width') { setWidth(next); setHeight(Math.max(1, Math.round(next / ratio))); }
        else { setHeight(next); setWidth(Math.max(1, Math.round(next * ratio))); }
    };
    const run = async () => {
        if (!file || !info || busy) return; const job = new AbortController(); controller.current = job; setBusy(true); setError(''); trackEvent('compress_image_started', { tool: 'compress-image' });
        try { const output = await compressImage(info.bitmap, info.mime, { quality: activeQuality, width: outputWidth, height: outputHeight, format, targetBytes }, job.signal); if (job.signal.aborted) return; revokeResult(); setResult({ ...output, url: URL.createObjectURL(output.blob), key: settingsKey }); trackEvent('compress_image_succeeded', { tool: 'compress-image' }); }
        catch (reason) { if (!(reason instanceof DOMException && reason.name === 'AbortError')) { setError(reason instanceof Error ? reason.message : 'Image compression failed.'); trackEvent('compress_image_failed', { tool: 'compress-image', reason: 'processing-error' }); } }
        finally { if (controller.current === job) controller.current = null; setBusy(false); }
    };
    const download = () => { if (!result || !file || stale) return; try { const base = file.name.replace(/\.[^.]+$/, ''); downloadBlob(result.blob, `${base}-compressed.${extension(result.mimeType)}`); notify('Image downloaded'); trackEvent('compressed_image_downloaded', { tool: 'compress-image' }); } catch { setError('The compressed image could not be downloaded. Check browser download permissions.'); } };
    const onDrop = (event: DragEvent) => { event.preventDefault(); const selected = event.dataTransfer.files[0]; if (selected) void load(selected); };
    const reduction = result && file ? Math.max(0, (1 - result.blob.size / file.size) * 100) : 0; const meaningful = Boolean(result && file && result.blob.size < file.size);
    return <section className="standalone-tool image-compress-tool" aria-label="Compress Image workspace"><header className="standalone-tool__heading"><div><p>Local image compression</p><h1>Compress Image</h1></div><nav><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('/'); }}><Home size={16} />Home</Link></nav></header><p className="local-privacy"><ShieldCheck size={17} /> Processed locally in your browser.</p><input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ''; if (selected) void load(selected); }} />
        {!file || !info ? <button className="standalone-drop" type="button" disabled={busy} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => input.current?.click()}>{busy ? <LoadingSpinner label="Opening image" /> : <FileUp size={32} />}<strong>Choose an image</strong><span>JPG, PNG or WebP · up to {Math.round(MAX_IMAGE_FILE_SIZE / 1024 / 1024)} MB</span></button> : <><section className="standalone-file-card"><FileImage aria-hidden="true" /><div><h2 title={file.name}>{file.name}</h2><p>{info.width} × {info.height} px · {formatBytes(file.size)} · {formatLabel(info.mime)}</p></div><div><Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>Replace</Button><Button variant="ghost" disabled={busy} onClick={clear}><Trash2 size={16} />Remove</Button></div></section><section className="standalone-panel"><div className="compression-mode-tabs" role="tablist" aria-label="Image compression mode"><button type="button" role="tab" aria-selected={mode === 'quick'} onClick={() => setMode('quick')}>Quick</button><button type="button" role="tab" aria-selected={mode === 'customize'} onClick={() => setMode('customize')}>Customize</button></div>{mode === 'quick' ? <div className="compression-presets">{(Object.keys(presets) as Preset[]).map((key) => <label key={key} className={preset === key ? 'is-selected' : ''}><input type="radio" name="image-preset" checked={preset === key} onChange={() => setPreset(key)} /><span><strong>{presets[key].label}{key === 'balanced' && <em>Recommended</em>}</strong><small>{presets[key].help}</small></span></label>)}</div> : <div className="image-custom-grid"><label>Image Quality: <output>{quality}%</output><input type="range" min="40" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label><label>Image Scale<select value={scale} onChange={(event) => { const next = Number(event.target.value); setScale(next); if (info) { setWidth(Math.round(info.width * next / 100)); setHeight(Math.round(info.height * next / 100)); } }}><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option></select></label><label>Width<input type="number" min="1" value={width} onChange={(event) => setDimension('width', Number(event.target.value))} /></label><label>Height<input type="number" min="1" value={height} onChange={(event) => setDimension('height', Number(event.target.value))} /></label><label className="image-ratio-lock"><input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} />Keep aspect ratio</label><label>Output Format<select value={format} onChange={(event) => setFormat(event.target.value as ImageOutputFormat)}><option value="original">Keep original</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label><label>Target Size <small>Optional</small><div className="compression-target-inputs"><input aria-label="Target image size" type="number" min="0.1" step="0.1" placeholder="500" value={target} onChange={(event) => setTarget(event.target.value)} /><select aria-label="Target image size unit" value={targetUnit} onChange={(event) => setTargetUnit(event.target.value as 'KB' | 'MB')}><option>KB</option><option>MB</option></select></div><small>Best effort. Exact size depends on image content.</small></label></div>}{outputMime === 'image/jpeg' && (info.mime === 'image/png' || info.mime === 'image/webp') && <p className="standalone-warning">JPEG does not support transparency. Transparent pixels will use a white background.</p>}{busy ? <div className="standalone-progress" role="status"><LoadingSpinner label="Compressing image" /><strong>Compressing image…</strong><Button variant="secondary" onClick={() => controller.current?.abort()}>Cancel</Button></div> : <Button className="standalone-primary" onClick={() => void run()}>{result ? <><RefreshCw size={17} />Recompress</> : 'Compress & Check Size'}</Button>}</section><section className="image-preview-grid"><figure><figcaption>Original</figcaption><img src={info.previewUrl} alt="Original image preview" /></figure><figure><figcaption>Compressed</figcaption>{result ? <img src={result.url} alt="Compressed image preview" /> : <div>Result preview appears here</div>}</figure></section>{result && <section className={`standalone-result${meaningful ? '' : ' standalone-result--limited'}`}><h2>{meaningful ? 'Compression Result' : 'No meaningful size reduction achieved'}</h2>{!meaningful && <p>The output is not smaller than the original. Try stronger compression.</p>}<dl><div><dt>Original</dt><dd>{formatBytes(file.size)}</dd></div><div><dt>Compressed</dt><dd>{formatBytes(result.blob.size)}</dd></div><div><dt>Reduction</dt><dd>{reduction.toFixed(1)}%</dd></div><div><dt>Original dimensions</dt><dd>{info.width} × {info.height}</dd></div><div><dt>Output dimensions</dt><dd>{result.width} × {result.height}</dd></div><div><dt>Quality</dt><dd>{result.mimeType === 'image/png' ? 'Lossless' : `${result.quality}%`}</dd></div><div><dt>Format</dt><dd>{formatLabel(result.mimeType)}</dd></div></dl>{stale && <p className="compression-stale">Settings changed. Recompress before downloading.</p>}<div><Button variant="secondary" onClick={() => { setMode('customize'); document.querySelector('.standalone-panel')?.scrollIntoView({ block: 'start' }); }}>{meaningful ? 'Adjust settings' : 'Try stronger compression'}</Button><Button variant="secondary" onClick={clear}>Compress another image</Button><Button disabled={stale} onClick={download}><Download size={17} />Download Compressed Image</Button></div></section>}</>}{error && <p className="standalone-error" role="alert">{error}</p>}</section>;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, FileText, RefreshCw, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { notify } from '../../../components/feedback/notifications';
import { downloadBlob } from '../../../utils/browserDownload';
import { usePdfEngine } from '../hooks/usePdfEngine';
import { analyzePdfForCompression, compressPdf, type CompressionAnalysis, type CompressionProgress, type CompressionSettings } from './compressionService';

type Mode = 'quick' | 'customize';
type Preset = 'light' | 'balanced' | 'strong' | 'maximum';
type Result = Awaited<ReturnType<typeof compressPdf>> & { sourceSize: number; createdFor: string };

const presets: Record<Preset, { title: string; description: string; settings: Omit<CompressionSettings, 'targetBytes'> }> = {
    light: { title: 'Light', description: 'Best visual quality', settings: { dpi: 200, imageScale: 100, imageQuality: 90 } },
    balanced: { title: 'Balanced', description: 'Recommended', settings: { dpi: 150, imageScale: 75, imageQuality: 75 } },
    strong: { title: 'Strong', description: 'Smaller file', settings: { dpi: 120, imageScale: 50, imageQuality: 60 } },
    maximum: { title: 'Maximum', description: 'Maximum practical reduction', settings: { dpi: 96, imageScale: 25, imageQuality: 40 } },
};

const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 1 : 2)} MB` : `${Math.max(0, Math.round(bytes / 1024))} KB`;
const outputName = (name: string) => `${name.replace(/\.pdf$/i, '')}-compressed.pdf`;
const settingsKey = (settings: CompressionSettings) => JSON.stringify(settings);

export function CompressionWorkspace() {
    const { sourceFile, document: pdfDocument, info, openFilePicker, closeDocument } = usePdfEngine();
    const [mode, setMode] = useState<Mode>('quick');
    const [preset, setPreset] = useState<Preset>('balanced');
    const [custom, setCustom] = useState<Omit<CompressionSettings, 'targetBytes'>>(presets.balanced.settings);
    const [targetEnabled, setTargetEnabled] = useState(false);
    const [targetValue, setTargetValue] = useState('');
    const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('MB');
    const [analysis, setAnalysis] = useState<CompressionAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState<CompressionProgress | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [error, setError] = useState<string | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const targetBytes = targetEnabled && Number(targetValue) > 0 ? Math.round(Number(targetValue) * (targetUnit === 'MB' ? 1024 * 1024 : 1024)) : null;
    const activeBase = mode === 'quick' ? presets[preset].settings : custom;
    const settings = useMemo<CompressionSettings>(() => ({ ...activeBase, targetBytes }), [activeBase, targetBytes]);
    const currentKey = settingsKey(settings);
    const resultIsCurrent = result?.createdFor === currentKey;
    const imageControlsSupported = analysis?.kind === 'image-heavy';
    const qualityPosition = Math.round(((settings.imageQuality - 30) / 70 * .5 + (settings.imageScale - 25) / 75 * .3 + (settings.dpi - 72) / 228 * .2) * 100);

    useEffect(() => {
        if (!pdfDocument) return;
        const controller = new AbortController();
        setAnalyzing(true);
        setAnalysis(null);
        setResult(null);
        void analyzePdfForCompression(pdfDocument, controller.signal).then(setAnalysis).catch((reason) => {
            if (reason instanceof DOMException && reason.name === 'AbortError') return;
            setError('The PDF content could not be analyzed. Compression will preserve the original file.');
            setAnalysis({ kind: 'text-vector', sampledPages: 0, imagePageRatio: 0, averageTextCharacters: 0 });
        }).finally(() => { if (!controller.signal.aborted) setAnalyzing(false); });
        return () => controller.abort();
    }, [pdfDocument]);

    useEffect(() => () => controllerRef.current?.abort(), []);

    if (!sourceFile || !pdfDocument || !info) return null;

    const runCompression = async () => {
        if (!analysis || processing) return;
        if (targetEnabled && !targetBytes) { setError('Enter a target size greater than zero, or turn off Target Size.'); return; }
        const controller = new AbortController();
        controllerRef.current = controller;
        setProcessing(true);
        setProgress(null);
        setError(null);
        try {
            const output = await compressPdf({ file: sourceFile, document: pdfDocument, analysis, settings, signal: controller.signal, onProgress: setProgress });
            setResult({ ...output, sourceSize: sourceFile.size, createdFor: currentKey });
        } catch (reason) {
            if (reason instanceof DOMException && reason.name === 'AbortError') notify('Compression cancelled. Your original PDF is still available.');
            else setError(reason instanceof Error ? reason.message : 'The PDF could not be compressed.');
        } finally {
            if (controllerRef.current === controller) controllerRef.current = null;
            setProcessing(false);
            setProgress(null);
        }
    };

    const remove = () => { controllerRef.current?.abort(); setResult(null); closeDocument(); };
    const reduction = result ? Math.max(0, (1 - result.blob.size / result.sourceSize) * 100) : 0;
    const saved = result ? Math.max(0, result.sourceSize - result.blob.size) : 0;
    const meaningful = Boolean(result && result.blob.size < result.sourceSize);

    return <section className="compression-workspace" aria-label="Customize PDF compression">
        <header className="compression-file-card">
            <span className="compression-file-icon" aria-hidden="true"><FileText size={24} /></span>
            <div><h2 title={sourceFile.name}>{sourceFile.name}</h2><p>Original size: <strong>{formatBytes(sourceFile.size)}</strong></p><p>Pages: <strong>{info.pageCount}</strong></p></div>
            <div className="compression-file-actions"><Button type="button" variant="secondary" size="compact" disabled={processing} onClick={openFilePicker}><Upload size={16} />Replace</Button><Button type="button" variant="ghost" size="compact" disabled={processing} onClick={remove}><Trash2 size={16} />Remove</Button></div>
        </header>

        <section className="compression-panel" aria-labelledby="compression-choice-title">
            <div className="compression-section-heading"><div><p className="eyebrow">Local browser processing</p><h2 id="compression-choice-title">Choose Compression</h2></div><ShieldCheck size={22} aria-hidden="true" /></div>
            <div className="compression-mode-tabs" role="tablist" aria-label="Compression mode"><button type="button" role="tab" aria-selected={mode === 'quick'} onClick={() => setMode('quick')}>Quick</button><button type="button" role="tab" aria-selected={mode === 'customize'} onClick={() => setMode('customize')}>Customize</button></div>

            {analyzing ? <div className="compression-analysis" role="status"><LoadingSpinner label="Analyzing PDF content" />Analyzing raster content…</div> : analysis && <div className={`compression-analysis compression-analysis--${analysis.kind}`}><strong>{analysis.kind === 'image-heavy' ? 'Image-heavy PDF detected' : 'Text/vector PDF detected'}</strong><p>{analysis.kind === 'image-heavy' ? 'Resolution, image scale, and JPEG quality can reduce scanned-page size. This mode rebuilds scanned pages as images.' : 'This PDF contains relatively little dominant raster-image data. Image controls are disabled to avoid rasterizing searchable text, vectors, links, forms, and annotations.'}</p></div>}

            {mode === 'quick' ? <div className="compression-presets">{(Object.keys(presets) as Preset[]).map((key) => <label key={key} className={preset === key ? 'is-selected' : ''}><input type="radio" name="compression-preset" value={key} checked={preset === key} disabled={processing} onChange={() => setPreset(key)} /><span><strong>{presets[key].title}</strong><small>{presets[key].description}</small></span></label>)}</div> : <fieldset className="compression-custom-controls" disabled={processing || !imageControlsSupported}><legend className="sr-only">Customize compression</legend>
                <label><span>Resolution</span><select value={custom.dpi} onChange={(event) => setCustom((value) => ({ ...value, dpi: Number(event.target.value) }))}>{[72, 96, 100, 120, 150, 200, 300].map((dpi) => <option key={dpi} value={dpi}>{dpi} DPI</option>)}<option disabled>Original (not detectable)</option></select><small>Lower DPI means a smaller scanned PDF, but less image detail.</small></label>
                <label><span>Image scale: <output>{custom.imageScale}%</output></span><select aria-label="Image scale percentage" value={custom.imageScale} onChange={(event) => setCustom((value) => ({ ...value, imageScale: Number(event.target.value) }))}>{[25, 50, 75, 100].map((scale) => <option key={scale} value={scale}>{scale}%</option>)}</select><small>Scales rasterized scanned-page pixels; PDF page dimensions stay unchanged.</small></label>
                <label><span>Image Quality: <output>{custom.imageQuality}%</output></span><input type="range" min="30" max="100" step="1" value={custom.imageQuality} onChange={(event) => setCustom((value) => ({ ...value, imageQuality: Number(event.target.value) }))} /><input className="compression-quality-number" aria-label="Image quality percentage" type="number" min="30" max="100" value={custom.imageQuality} onChange={(event) => setCustom((value) => ({ ...value, imageQuality: Math.min(100, Math.max(30, Number(event.target.value) || 30)) }))} /><small>{custom.imageQuality >= 90 ? 'High quality' : custom.imageQuality >= 70 ? 'Balanced' : custom.imageQuality >= 50 ? 'Smaller file' : 'Maximum compression'}</small></label>
            </fieldset>}

            <div className="compression-target"><label className="compression-check"><input type="checkbox" checked={targetEnabled} disabled={processing || !imageControlsSupported} onChange={(event) => setTargetEnabled(event.target.checked)} /><span>Try to reach a target size</span></label>{targetEnabled && <div className="compression-target-inputs"><label><span className="sr-only">Target size</span><input type="number" min="0.1" step="0.1" inputMode="decimal" value={targetValue} disabled={processing} placeholder="2.5" onChange={(event) => setTargetValue(event.target.value)} /></label><label><span className="sr-only">Target size unit</span><select value={targetUnit} disabled={processing} onChange={(event) => setTargetUnit(event.target.value as 'KB' | 'MB')}><option>KB</option><option>MB</option></select></label></div>}<p>Target size is approximate and depends on document content. Up to four fresh attempts are generated from the original PDF.</p></div>

            <div className="compression-quality-guide"><span>Smaller file</span><div aria-hidden="true"><i style={{ left: `${qualityPosition}%` }} /></div><span>Better quality</span></div>
            {error && <p className="compression-error" role="alert">{error}</p>}
            {processing ? <div className="compression-progress" role="status"><LoadingSpinner label="Compressing PDF" /><div><strong>Compressing…</strong>{progress && <span>Processing page {progress.page} of {progress.pageCount}{progress.maxAttempts > 1 ? ` · attempt ${progress.attempt} of ${progress.maxAttempts}` : ''}</span>}</div><Button type="button" variant="secondary" onClick={() => controllerRef.current?.abort()}>Cancel</Button></div> : <Button className="compression-process-button" type="button" disabled={analyzing || !analysis} onClick={() => void runCompression()}>{result ? <><RefreshCw size={18} />Recompress</> : <><Archive size={18} />Compress &amp; Preview Size</>}</Button>}
        </section>

        {result && <section className={`compression-result${meaningful ? '' : ' compression-result--limited'}`} aria-labelledby="compression-result-title"><div className="compression-section-heading"><div><p className="eyebrow">Actual output</p><h2 id="compression-result-title">{meaningful ? 'Compression Result' : 'No meaningful size reduction'}</h2></div></div>{!meaningful && <p>This PDF may already be optimized or contain mostly text/vector content. The original was preserved instead of destructively rasterizing it.</p>}<dl><div><dt>Original</dt><dd>{formatBytes(result.sourceSize)}</dd></div><div><dt>Compressed</dt><dd>{formatBytes(result.blob.size)}</dd></div><div><dt>Saved</dt><dd>{formatBytes(saved)}</dd></div><div><dt>Reduction</dt><dd>{reduction.toFixed(1)}%</dd></div></dl><div className="compression-result-settings"><span>Quality <strong>{result.strategy === 'scanned-raster' ? `${result.settings.imageQuality}%` : 'Original'}</strong></span><span>Resolution <strong>{result.strategy === 'scanned-raster' ? `${result.settings.dpi} DPI` : 'Original'}</strong></span><span>Image scale <strong>{result.strategy === 'scanned-raster' ? `${result.settings.imageScale}%` : 'Original'}</strong></span>{result.attempts > 1 && <span>Attempts <strong>{result.attempts}</strong></span>}</div>{!resultIsCurrent && <p className="compression-stale" role="status">Settings changed. Recompress to update this result before downloading.</p>}<div className="compression-result-actions"><Button type="button" variant="secondary" onClick={() => document.getElementById('compression-choice-title')?.scrollIntoView({ block: 'start' })}>Adjust settings</Button><Button type="button" disabled={!resultIsCurrent} onClick={() => { downloadBlob(result.blob, outputName(sourceFile.name)); notify('Document downloaded'); }}>Download Compressed PDF</Button></div></section>}
    </section>;
}

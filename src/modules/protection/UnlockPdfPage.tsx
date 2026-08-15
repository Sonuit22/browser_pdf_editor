import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Eye, EyeOff, FileKey2, FileUp, Home, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DOWNLOAD_SUCCESS_MESSAGE, notify } from '../../components/feedback/notifications';
import { useShell } from '../../contexts/ShellContext';
import { downloadBlob } from '../../utils/browserDownload';
import { trackEvent } from '../../utils/analytics';
import { MAX_PDF_FILE_SIZE } from '../pdf/types/pdf';
import { inspectUnlockPdf, unlockErrorMessage, unlockPdf, type UnlockInspection, type UnlockResult } from './unlockPdfService';

const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const unlockedFilename = (name: string) => `${name.replace(/\.pdf$/i, '')}-unlocked.pdf`;

export default function UnlockPdfPage() {
    const { requestNavigation } = useShell();
    const input = useRef<HTMLInputElement>(null);
    const requestRef = useRef(0);
    const [file, setFile] = useState<File | null>(null);
    const [inspection, setInspection] = useState<UnlockInspection | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<UnlockResult | null>(null);

    useEffect(() => { trackEvent('unlock_pdf_opened', { tool: 'unlock' }); }, []);
    useEffect(() => () => { requestRef.current += 1; }, []);

    const reset = () => { requestRef.current += 1; setFile(null); setInspection(null); setPassword(''); setResult(null); setError(''); setBusy(false); if (input.current) input.current.value = ''; };
    const choose = async (selected: File) => {
        const request = ++requestRef.current;
        setError(''); setResult(null); setPassword(''); setInspection(null);
        if (!selected.size || !/\.pdf$/i.test(selected.name) || selected.type && selected.type !== 'application/pdf') { setError('Choose a valid PDF file.'); return; }
        if (selected.size > MAX_PDF_FILE_SIZE) { setError('This PDF exceeds the 100 MB browser-processing limit.'); return; }
        setFile(selected); setBusy(true);
        try {
            const next = await inspectUnlockPdf(selected);
            if (request !== requestRef.current) return;
            setInspection(next);
            if (!next.encrypted) setError('This PDF is not password protected.');
        } catch (reason) {
            if (request === requestRef.current) setError(reason instanceof Error ? reason.message : 'This PDF could not be inspected.');
        } finally { if (request === requestRef.current) setBusy(false); }
    };
    const run = async () => {
        if (!file || !inspection?.encrypted || !password || busy) { if (!password) setError('Enter the current PDF password.'); return; }
        const request = ++requestRef.current;
        setBusy(true); setError(''); setResult(null); trackEvent('unlock_pdf_started', { tool: 'unlock' });
        try {
            const output = await unlockPdf(file, password);
            if (request !== requestRef.current) return;
            setResult(output); setPassword('');
            trackEvent('unlock_pdf_succeeded', { tool: 'unlock' });
        } catch (reason) {
            if (request === requestRef.current) {
                setError(unlockErrorMessage(reason));
                trackEvent('unlock_pdf_failed', { tool: 'unlock', reason: 'processing-error' });
            }
        } finally { if (request === requestRef.current) setBusy(false); }
    };
    const download = () => {
        if (!result || !file) return;
        try { downloadBlob(result.blob, unlockedFilename(file.name)); notify(DOWNLOAD_SUCCESS_MESSAGE); trackEvent('unlocked_pdf_downloaded', { tool: 'unlock' }); }
        catch { setError('The unlocked PDF could not be downloaded. Check browser download permissions.'); }
    };

    return <section className="standalone-tool unlock-tool" aria-label="Unlock PDF workspace">
        <header className="standalone-tool__heading"><div><p>Local password removal</p><h1>Unlock PDF</h1></div><nav><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('/'); }}><Home size={16} />Home</Link></nav></header>
        <p className="local-privacy"><ShieldCheck size={17} /> Processed locally in your browser. Your file and password are never uploaded.</p>
        <p className="standalone-notice">This tool removes protection only when you provide the correct current password. It does not guess, recover, or crack passwords.</p>
        <input ref={input} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ''; if (selected) void choose(selected); }} />
        {!file ? <button className="standalone-drop" type="button" disabled={busy} onClick={() => input.current?.click()}><FileUp size={32} /><strong>Choose protected PDF</strong><span>PDF only, up to 100 MB</span></button> : <>
            <section className="standalone-file-card"><FileKey2 aria-hidden="true" /><div><h2 title={file.name}>{file.name}</h2><p>{formatBytes(file.size)}{inspection?.pageCount ? ` · ${inspection.pageCount} pages` : ''}</p></div><div><Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>Replace</Button><Button variant="ghost" disabled={busy} onClick={reset}><Trash2 size={16} />Remove</Button></div></section>
            {inspection?.encrypted && !result && <section className="standalone-panel"><h2>Enter PDF password</h2><label>Current password<div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} disabled={busy} onChange={(event) => { setPassword(event.target.value); setError(''); }} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{busy ? <div className="standalone-progress" role="status"><LoadingSpinner label="Unlocking PDF" /><strong>Unlocking PDF…</strong></div> : <Button className="standalone-primary" disabled={!password} onClick={() => void run()}>Unlock PDF</Button>}</section>}
            {result && <section className="standalone-result"><h2>✓ PDF unlocked successfully</h2><dl><div><dt>File</dt><dd>{unlockedFilename(file.name)}</dd></div><div><dt>Pages</dt><dd>{result.pageCount}</dd></div><div><dt>Status</dt><dd>Password protection removed and output verified</dd></div></dl><div><Button variant="secondary" onClick={reset}>Unlock another PDF</Button><Button onClick={download}><Download size={17} />Download Unlocked PDF</Button></div></section>}
        </>}
        {error && <p className="standalone-error" role="alert">{error}</p>}
    </section>;
}

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Eye, EyeOff, FileLock2, FileUp, Home, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { notify } from '../../components/feedback/notifications';
import { useShell } from '../../contexts/ShellContext';
import { downloadBlob } from '../../utils/browserDownload';
import { trackEvent } from '../../utils/analytics';
import { MAX_PDF_FILE_SIZE } from '../pdf/types/pdf';
import { inspectProtectPdf, protectPdf, type ProtectInspection } from './protectPdfService';

const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const protectedName = (name: string) => `${name.replace(/\.pdf$/i, '')}-protected.pdf`;
const strength = (value: string) => value.length >= 12 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^\w]/.test(value) ? 'Strong' : value.length >= 8 ? 'Fair' : 'Weak';

export default function ProtectPdfPage() {
    const { requestNavigation } = useShell();
    const input = useRef<HTMLInputElement>(null);
    const requestRef = useRef(0);
    const [file, setFile] = useState<File | null>(null);
    const [inspection, setInspection] = useState<ProtectInspection | null>(null);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<Blob | null>(null);

    useEffect(() => { trackEvent('protect_pdf_opened', { tool: 'protect' }); }, []);
    useEffect(() => () => { requestRef.current += 1; }, []);

    const reset = () => { requestRef.current += 1; setFile(null); setInspection(null); setPassword(''); setConfirm(''); setResult(null); setError(''); setBusy(false); if (input.current) input.current.value = ''; };
    const choose = async (selected: File) => {
        const request = ++requestRef.current;
        setError(''); setResult(null); setPassword(''); setConfirm(''); setInspection(null);
        if (!selected.size || !/\.pdf$/i.test(selected.name) || selected.type && selected.type !== 'application/pdf') { setError('Choose a valid PDF file.'); return; }
        if (selected.size > MAX_PDF_FILE_SIZE) { setError('This PDF exceeds the 100 MB browser-processing limit.'); return; }
        setFile(selected); setBusy(true);
        try {
            const next = await inspectProtectPdf(selected);
            if (request !== requestRef.current) return;
            setInspection(next);
            if (next.encrypted) setError('This PDF is already password protected. Unlocking is not available in this version.');
        } catch (reason) {
            if (request === requestRef.current) setError(reason instanceof Error ? reason.message : 'This PDF could not be inspected.');
        } finally { if (request === requestRef.current) setBusy(false); }
    };
    const validation = !password ? 'Enter a password.' : password.length < 8 ? 'Use at least 8 characters.' : password !== confirm ? 'Passwords do not match.' : '';
    const run = async () => {
        if (!file || !inspection || inspection.encrypted || validation || busy) { if (validation) setError(validation); return; }
        const request = ++requestRef.current;
        setBusy(true); setError(''); setResult(null); trackEvent('protect_pdf_started', { tool: 'protect' });
        try {
            const output = await protectPdf(file, password);
            if (request !== requestRef.current) return;
            setResult(output); setPassword(''); setConfirm('');
            trackEvent('protect_pdf_succeeded', { tool: 'protect' });
        } catch {
            if (request === requestRef.current) {
                setError('Protection failed. Your original PDF is unchanged.');
                trackEvent('protect_pdf_failed', { tool: 'protect', reason: 'processing-error' });
            }
        } finally { if (request === requestRef.current) setBusy(false); }
    };
    const download = () => {
        if (!result || !file) return;
        try { downloadBlob(result, protectedName(file.name)); notify('Document downloaded'); trackEvent('protected_pdf_downloaded', { tool: 'protect' }); }
        catch { setError('The protected PDF could not be downloaded. Check browser download permissions.'); }
    };

    return <section className="standalone-tool protect-tool" aria-label="Protect PDF workspace">
        <header className="standalone-tool__heading"><div><p>Local browser protection</p><h1>Protect PDF</h1></div><nav><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('back'); }}><ArrowLeft size={16} />Back</Link><Link to="/" onClick={(event) => { event.preventDefault(); requestNavigation('/'); }}><Home size={16} />Home</Link></nav></header>
        <p className="local-privacy"><ShieldCheck size={17} /> Processed locally in your browser. Your password is never stored or sent.</p>
        <input ref={input} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ''; if (selected) void choose(selected); }} />
        {!file ? <button className="standalone-drop" type="button" disabled={busy} onClick={() => input.current?.click()}><FileUp size={32} /><strong>Choose PDF</strong><span>PDF only, up to 100 MB</span></button> : <>
            <section className="standalone-file-card"><FileLock2 aria-hidden="true" /><div><h2 title={file.name}>{file.name}</h2><p>{formatBytes(file.size)}{inspection?.pageCount ? ` · ${inspection.pageCount} pages` : ''}</p></div><div><Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>Replace</Button><Button variant="ghost" disabled={busy} onClick={reset}><Trash2 size={16} />Remove</Button></div></section>
            {!inspection?.encrypted && <section className="standalone-panel"><h2>Create password</h2><p>Standard password protection</p><div className="password-grid"><label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} disabled={busy || Boolean(result)} onChange={(event) => { setPassword(event.target.value); setResult(null); setError(''); }} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label><label>Confirm password<div className="password-input"><input type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={confirm} disabled={busy || Boolean(result)} onChange={(event) => { setConfirm(event.target.value); setResult(null); setError(''); }} /><button type="button" aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirm((value) => !value)}>{showConfirm ? <EyeOff /> : <Eye />}</button></div></label></div>{password && <p className={`password-strength password-strength--${strength(password).toLowerCase()}`}>Password strength: <strong>{strength(password)}</strong></p>}{busy ? <div className="standalone-progress" role="status"><LoadingSpinner label="Protecting PDF" /><strong>Protecting PDF…</strong></div> : !result && <Button className="standalone-primary" disabled={Boolean(validation)} onClick={() => void run()}>Protect PDF</Button>}</section>}
            {result && <section className="standalone-result"><h2>PDF Protected</h2><dl><div><dt>Original</dt><dd>{file.name}</dd></div><div><dt>Size</dt><dd>{formatBytes(result.size)}</dd></div><div><dt>Status</dt><dd>Password protection applied</dd></div></dl><div><Button variant="secondary" onClick={reset}>Protect another PDF</Button><Button onClick={download}><Download size={17} />Download Protected PDF</Button></div></section>}
        </>}
        {error && <p className="standalone-error" role="alert">{error}</p>}
    </section>;
}

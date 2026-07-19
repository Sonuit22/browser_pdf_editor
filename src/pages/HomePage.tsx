import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
    BadgeDollarSign,
    Bolt,
    CheckCircle2,
    CloudOff,
    MonitorSmartphone,
    ShieldCheck,
    UploadCloud,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { validatePdfFileSelection } from '../modules/pdf/services/pdfValidationService';
import { MAX_PDF_FILE_SIZE } from '../modules/pdf/types/pdf';

const features = [
    { title: 'Privacy First', description: 'Everything stays inside your browser.', icon: ShieldCheck },
    { title: 'Fast', description: 'No waiting for server uploads.', icon: Bolt },
    { title: 'Works Everywhere', description: 'Desktop, tablet and mobile.', icon: MonitorSmartphone },
    { title: 'Free', description: 'Most tools available without account.', icon: BadgeDollarSign },
];

const testimonials = [
    'The clean layout makes quick PDF tasks feel straightforward from the first click.',
    'Local browser processing gives me confidence when working with private documents.',
    'The same focused experience is easy to use from a laptop, tablet, or phone.',
];

export default function HomePage() {
    const navigate = useNavigate();
    const { error, openFile, phase } = usePdfEngine();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const pendingLandingUpload = useRef(false);
    const uploadInput = useRef<HTMLInputElement>(null);

    const beginLocalUpload = useCallback((file: File) => {
        if (phase === 'loading') return;
        try {
            validatePdfFileSelection(file);
        } catch (selectionError) {
            pendingLandingUpload.current = false;
            setUploadError(selectionError instanceof Error ? selectionError.message : 'Choose one non-empty PDF file to continue.');
            return;
        }
        pendingLandingUpload.current = true;
        setUploadError(null);
        void openFile(file);
    }, [openFile, phase]);

    const choosePdf = useCallback(() => {
        if (phase !== 'loading') uploadInput.current?.click();
    }, [phase]);
    const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const [file] = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (file) beginLocalUpload(file);
    }, [beginLocalUpload]);
    const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (phase !== 'loading' && Array.from(event.dataTransfer.types).includes('Files')) {
            event.dataTransfer.dropEffect = 'copy';
            setIsDragActive(true);
        }
    }, [phase]);
    const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragActive(false);
    }, []);
    const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        if (phase === 'loading') return;
        const files = Array.from(event.dataTransfer.files);
        if (files.length !== 1) {
            pendingLandingUpload.current = false;
            setUploadError('Choose one non-empty PDF file to continue.');
            return;
        }
        beginLocalUpload(files[0]);
    }, [beginLocalUpload, phase]);

    useEffect(() => {
        if (!pendingLandingUpload.current) return;
        if (phase === 'ready') {
            pendingLandingUpload.current = false;
            navigate('/edit', { state: { preserveLandingUpload: true } });
        } else if (phase === 'error') {
            pendingLandingUpload.current = false;
            setUploadError(error ?? 'The PDF could not be opened. Please try another file.');
        }
    }, [error, navigate, phase]);

    const isLoading = phase === 'loading' && pendingLandingUpload.current;

    return <div className="tool-dashboard">
        <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-hero__content">
                <span className="landing-privacy-pill"><ShieldCheck size={16} aria-hidden="true" />Private by design</span>
                <h1 id="landing-title">PDF Editor by ib</h1>
                <p className="landing-hero__tagline">Edit PDFs securely in your browser. No uploads. No servers. Your files stay on your device.</p>
                <div className="landing-hero__actions">
                    <button className="button button--primary landing-cta" type="button" onClick={choosePdf} disabled={isLoading}>
                        <UploadCloud size={18} aria-hidden="true" />
                        {isLoading ? 'Opening PDF…' : 'Upload PDF'}
                    </button>
                    <a className="button button--secondary landing-cta" href="#tools">View All Tools</a>
                </div>
                <p className="landing-local-note"><CloudOff size={16} aria-hidden="true" />Processing stays on this device.</p>
            </div>

            <section
                className={`landing-upload${isDragActive ? ' is-dragging' : ''}${isLoading ? ' is-loading' : ''}`}
                aria-labelledby="landing-upload-title"
                aria-describedby="landing-upload-formats landing-upload-privacy"
                aria-busy={isLoading}
                onDragEnter={onDragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input ref={uploadInput} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={onFileChange} disabled={isLoading} tabIndex={-1} />
                <span className="landing-upload__icon" aria-hidden="true"><UploadCloud size={34} strokeWidth={1.8} /></span>
                <h2 id="landing-upload-title">{isLoading ? 'Opening your PDF…' : 'Drop your PDF here'}</h2>
                <p>{isLoading ? 'Checking the file locally in your browser.' : 'Drag and drop a file, or choose one from your device.'}</p>
                <button className="button button--secondary" type="button" onClick={choosePdf} disabled={isLoading}>
                    Choose PDF
                </button>
                <p id="landing-upload-formats" className="landing-upload__formats">Supported format: PDF · Maximum size: {Math.round(MAX_PDF_FILE_SIZE / 1024 / 1024)} MB</p>
                <p id="landing-upload-privacy" className="landing-upload__privacy"><ShieldCheck size={14} aria-hidden="true" />Never uploaded to a server</p>
                {uploadError && <p className="landing-upload__error" role="alert">{uploadError}</p>}
            </section>
        </section>

        <section className="landing-section landing-features" aria-labelledby="features-heading">
            <header className="landing-section__heading">
                <p>Built for everyday documents</p>
                <h2 id="features-heading">Simple tools. Private workflow.</h2>
            </header>
            <div className="landing-feature-grid">
                {features.map(({ title, description, icon: Icon }) => <article className="landing-feature-card" key={title}>
                    <span aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                </article>)}
            </div>
        </section>

        <section id="tools" className="landing-section tool-catalogue" aria-labelledby="all-tools-heading">
            <header className="landing-section__heading landing-section__heading--row">
                <div><p>Browser-based toolkit</p><h2 id="all-tools-heading">All Tools</h2></div>
                <span>{toolRegistry.length} focused PDF tools</span>
            </header>
            <div className="tool-card-grid">{toolRegistry.map((tool) => {
                const Icon = tool.icon;
                const statusLabel = tool.badge ?? 'Available';
                const content = <>
                    <span className="tool-card-icon"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
                    <strong>{tool.title}</strong>
                    <p>{tool.description}</p>
                    <span className={`tool-status-badge tool-status-badge--${tool.status}`}>
                        {tool.status === 'available' && <CheckCircle2 size={12} aria-hidden="true" />}
                        {statusLabel}
                    </span>
                </>;
                return tool.enabled
                    ? <Link className={`tool-dashboard-card tool-dashboard-card--${tool.status}`} key={tool.id} to={tool.route} aria-label={`${tool.title}. ${tool.description}. ${statusLabel}`}>{content}</Link>
                    : <article className="tool-dashboard-card tool-dashboard-card--disabled" key={tool.id} aria-disabled="true" aria-label={`${tool.title}, coming soon. ${tool.description}`}>{content}</article>;
            })}</div>
        </section>

        <section className="landing-section landing-testimonials" aria-labelledby="testimonials-heading">
            <header className="landing-section__heading">
                <p>Experience preview</p>
                <h2 id="testimonials-heading">A focused workflow people can trust</h2>
            </header>
            <div className="testimonial-grid">
                {testimonials.map((quote, index) => <figure className="testimonial-card" key={quote}>
                    <blockquote>“{quote}”</blockquote>
                    <figcaption><span aria-hidden="true">IB</span><div><strong>Sample user</strong><small>Placeholder testimonial {index + 1}</small></div></figcaption>
                </figure>)}
            </div>
        </section>
    </div>;
}

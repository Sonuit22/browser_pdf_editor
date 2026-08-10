import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
    BadgeDollarSign,
    Bolt,
    CheckCircle2,
    CloudOff,
    MonitorSmartphone,
    RotateCcw,
    ShieldCheck,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';
import { landingUploadTools } from '../config/landingUploadTools';
import { usePdfEngine } from '../modules/pdf/hooks/usePdfEngine';
import { validatePdfFileSelection } from '../modules/pdf/services/pdfValidationService';
import { MAX_PDF_FILE_SIZE } from '../modules/pdf/types/pdf';

const features = [
    { title: 'Privacy First', description: 'Everything stays inside your browser.', icon: ShieldCheck },
    { title: 'Fast', description: 'No waiting for server uploads.', icon: Bolt },
    { title: 'Works Everywhere', description: 'Desktop, tablet and mobile.', icon: MonitorSmartphone },
    { title: 'Free', description: 'Most tools available without account.', icon: BadgeDollarSign },
];

const privacyPrinciples = [
    { title: 'Files stay local', description: 'Supported tools process your documents inside your browser.', icon: ShieldCheck },
    { title: 'No PDF upload to our processing server', description: 'Your document content is not sent away for supported PDF workflows.', icon: CloudOff },
    { title: 'No software installation', description: 'Open a tool in your browser and work from the device you already use.', icon: MonitorSmartphone },
];

function formatSelectedFileSize(size: number) {
    return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function HomePage() {
    const navigate = useNavigate();
    const { stagedFile, stageFile, clearStagedFile } = usePdfEngine();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [openingRoute, setOpeningRoute] = useState<string | null>(null);
    const uploadInput = useRef<HTMLInputElement>(null);

    const beginLocalUpload = useCallback((file: File) => {
        try {
            validatePdfFileSelection(file);
        } catch (selectionError) {
            setUploadError(selectionError instanceof Error ? selectionError.message : 'Choose one non-empty PDF file to continue.');
            return;
        }
        setUploadError(null);
        stageFile(file);
    }, [stageFile]);

    const choosePdf = useCallback(() => {
        uploadInput.current?.click();
    }, []);
    const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const [file] = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (file) beginLocalUpload(file);
    }, [beginLocalUpload]);
    const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (Array.from(event.dataTransfer.types).includes('Files')) {
            event.dataTransfer.dropEffect = 'copy';
            setIsDragActive(true);
        }
    }, []);
    const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragActive(false);
    }, []);
    const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length !== 1) {
            setUploadError('Choose one non-empty PDF file to continue.');
            return;
        }
        beginLocalUpload(files[0]);
    }, [beginLocalUpload]);

    const chooseTool = (route: string) => {
        if (!stagedFile) {
            setUploadError('Please select the PDF again.');
            return;
        }
        setOpeningRoute(route);
        navigate(route, { state: { fromLandingFile: true } });
    };

    return <div className="tool-dashboard">
        <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-hero__content">
                <span className="landing-privacy-pill"><ShieldCheck size={16} aria-hidden="true" />Private by design</span>
                <h1 id="landing-title">PDF tools that keep your files private.</h1>
                <p className="landing-hero__tagline">Edit, merge, split, compress, sign and convert PDFs directly in your browser.</p>
                <div className="landing-hero__actions">
                    <a className="button button--primary landing-cta" href="#tools">Explore PDF Tools</a>
                </div>
            </div>

            <section
                className={`landing-upload${isDragActive ? ' is-dragging' : ''}${stagedFile ? ' has-file' : ''}`}
                aria-labelledby="landing-upload-title"
                aria-describedby="landing-upload-formats landing-upload-privacy"
                onDragEnter={onDragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input ref={uploadInput} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={onFileChange} tabIndex={-1} />
                {!stagedFile ? <>
                    <span className="landing-upload__icon" aria-hidden="true"><UploadCloud size={34} strokeWidth={1.8} /></span>
                    <h2 id="landing-upload-title">Drop your PDF here</h2>
                    <p>Drag and drop a file, or choose one from your device.</p>
                    <button className="button button--secondary" type="button" onClick={choosePdf}>Choose PDF</button>
                    <p id="landing-upload-formats" className="landing-upload__formats">Supported format: PDF · Maximum size: {Math.round(MAX_PDF_FILE_SIZE / 1024 / 1024)} MB</p>
                    <p id="landing-upload-privacy" className="landing-upload__privacy"><ShieldCheck size={14} aria-hidden="true" />Processed locally by supported tools</p>
                </> : <>
                    <div className="landing-upload__file" aria-live="polite">
                        <div className="landing-upload__file-actions">
                            <button type="button" onClick={choosePdf}><RotateCcw size={15} />Replace file</button>
                            <button type="button" onClick={() => { clearStagedFile(); setUploadError(null); }}><Trash2 size={15} />Remove file</button>
                        </div>
                        <div className="landing-upload__file-details">
                            <span>File name:</span>
                            <strong title={stagedFile.name}>{stagedFile.name}</strong>
                            <small>PDF • {formatSelectedFileSize(stagedFile.size)}</small>
                        </div>
                    </div>
                    <section className="landing-tool-chooser" aria-labelledby="landing-tool-chooser-title">
                        <h2 id="landing-tool-chooser-title">Choose what you want to do</h2>
                        <div>{landingUploadTools.map((tool) => {
                            const Icon = tool.icon;
                            return <button type="button" key={tool.route} disabled={openingRoute !== null} onClick={() => chooseTool(tool.route)}><Icon size={20} aria-hidden="true" /><span><strong>{openingRoute === tool.route ? `Opening ${tool.title}…` : tool.title}</strong><small>{tool.description}</small></span></button>;
                        })}</div>
                    </section>
                    <span id="landing-upload-formats" className="sr-only">PDF file, {formatSelectedFileSize(stagedFile.size)}</span>
                    <p id="landing-upload-privacy" className="landing-upload__privacy"><ShieldCheck size={14} aria-hidden="true" />Stored only in this browser session</p>
                </>}
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

        <section className="landing-section landing-testimonials" aria-labelledby="privacy-heading">
            <header className="landing-section__heading">
                <p>Privacy-first processing</p>
                <h2 id="privacy-heading">Your documents. Your device.</h2>
            </header>
            <div className="testimonial-grid">
                {privacyPrinciples.map(({ title, description, icon: Icon }) => <article className="testimonial-card" key={title}>
                    <span className="testimonial-card__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                </article>)}
            </div>
        </section>
    </div>;
}

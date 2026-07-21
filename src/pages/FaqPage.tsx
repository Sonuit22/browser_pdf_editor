import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ChevronDown, CircleHelp } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
    ['Is PDF by ib free?', 'Yes. Most PDF tools are free and run entirely in your browser.'],
    ['Are my files uploaded?', 'No. Files remain on your device whenever browser-based processing is supported.'],
    ['Is my data secure?', 'Yes. We never store or upload your documents.'],
    ['Which file types are supported?', 'PDF, JPG, PNG, JPEG, DOCX and PPTX are supported, although tool availability may vary.'],
    ['Why does a tool say “Coming Soon”?', 'It is currently under development and will be available in a future update.'],
    ['Why is a tool labelled “Basic”?', 'The feature works but may not preserve complex formatting.'],
    ['Does it work on mobile?', 'Yes. PDF by ib is optimized for desktop, tablet, and mobile devices.'],
    ['Do I need to create an account?', 'No. No registration is required.'],
] as const;

export default function FaqPage() {
    const [open, setOpen] = useState<number | null>(0);
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);
    const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const keyIndex = event.key === 'ArrowDown' ? (index + 1) % faqs.length : event.key === 'ArrowUp' ? (index - 1 + faqs.length) % faqs.length : event.key === 'Home' ? 0 : event.key === 'End' ? faqs.length - 1 : null;
        if (keyIndex === null) return;
        event.preventDefault(); buttons.current[keyIndex]?.focus();
    };
    return <main className="info-page faq-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><CircleHelp size={28} aria-hidden="true" /><p>Help center</p><h1>Frequently Asked Questions</h1><span>Clear answers about privacy, supported files, and browser-based processing.</span></header>
        <div className="faq-list">{faqs.map(([question, answer], index) => {
            const expanded = open === index; const panelId = `faq-panel-${index}`; const buttonId = `faq-button-${index}`;
            return <section key={question} className={expanded ? 'is-open' : ''}><h2><button ref={(element) => { buttons.current[index] = element; }} id={buttonId} type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : index)} onKeyDown={(event) => navigate(event, index)}><span>{question}</span><ChevronDown size={18} aria-hidden="true" /></button></h2><div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded}><p>{answer}</p></div></section>;
        })}</div>
    </main>;
}

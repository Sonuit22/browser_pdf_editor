import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ChevronDown, CircleHelp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqEntries } from './faqContent';

export default function FaqPage() {
    const [open, setOpen] = useState<number | null>(0);
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);
    const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const keyIndex = event.key === 'ArrowDown' ? (index + 1) % faqEntries.length : event.key === 'ArrowUp' ? (index - 1 + faqEntries.length) % faqEntries.length : event.key === 'Home' ? 0 : event.key === 'End' ? faqEntries.length - 1 : null;
        if (keyIndex === null) return;
        event.preventDefault();
        buttons.current[keyIndex]?.focus();
    };
    return <section className="info-page faq-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><CircleHelp size={28} aria-hidden="true" /><p>Help center</p><h1>Frequently Asked Questions</h1><span>Clear answers about privacy, supported files, browser limitations, and tool status.</span></header>
        <div className="faq-list">{faqEntries.map(([question, answer], index) => {
            const expanded = open === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return <section key={question} className={expanded ? 'is-open' : ''}><h2><button ref={(element) => { buttons.current[index] = element; }} id={buttonId} type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : index)} onKeyDown={(event) => navigate(event, index)}><span>{question}</span><ChevronDown size={18} aria-hidden="true" /></button></h2><div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded}><p>{answer}</p></div></section>;
        })}</div>
    </section>;
}

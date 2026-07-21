import { ArrowLeft, ScrollText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const pages = {
    privacy: {
        title: 'Privacy Policy',
        description: 'How PDF by ib protects your documents and personal information.',
        icon: ShieldCheck,
        intro: 'PDF by ib is designed around local browser processing and data minimization.',
        items: [
            'Files are processed locally in your browser whenever the selected tool supports browser-based processing.',
            'We do not permanently store documents you open or create with the application.',
            'Browser-based tools do not transmit your files to external conversion servers.',
            'Email links are used only when you voluntarily contact support, report a bug, or request a feature.',
            'Future updates may introduce optional cloud features only with clear disclosure before they are used.',
        ],
    },
    terms: {
        title: 'Terms of Service',
        description: 'Practical terms for using the browser-based PDF tools.',
        icon: ScrollText,
        intro: 'By using PDF by ib, you agree to use the application responsibly and review generated files before relying on them.',
        items: [
            'You are responsible for the documents you open, edit, convert, and download.',
            'Browser processing speed and capacity may vary depending on your device, browser, and available memory.',
            'Tools labelled Basic or Beta may have formatting, fidelity, or file-compatibility limitations.',
            'The service is provided as available, without guaranteed uptime or uninterrupted availability.',
            'Commercial redistribution, resale, or repackaging of the application is prohibited without written permission.',
        ],
    },
} as const;

export default function LegalPage({ kind }: { kind: keyof typeof pages }) {
    const page = pages[kind]; const Icon = page.icon;
    return <main className="info-page legal-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><Icon size={29} aria-hidden="true" /><p>PDF by ib</p><h1>{page.title}</h1><span>{page.description}</span></header>
        <article><p>{page.intro}</p><ul>{page.items.map((item) => <li key={item}><ShieldCheck size={17} aria-hidden="true" /><span>{item}</span></li>)}</ul><p className="legal-contact">Questions about this policy can be sent to <a href="mailto:pdfeditorbyib@gmail.com">pdfeditorbyib@gmail.com</a>.</p></article>
    </main>;
}

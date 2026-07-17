import { PageContainer } from '../components/PageContainer';

const pages = {
    privacy: { title: 'Privacy', description: 'Your PDF files are processed locally in the browser.', heading: 'Local processing by design', body: 'PDF Editor by ib does not upload your selected PDFs to an application server. Opening, editing, and exporting happen in the browser session on your device. Browser storage is used only for interface preferences and in-progress local state.' },
    terms: { title: 'Terms', description: 'Public beta terms for browser-based PDF tools.', heading: 'Use the beta with care', body: 'This beta is provided as-is for everyday PDF work. Review exported files before relying on them, especially for legal, financial, or regulated documents. The application does not provide cloud storage, accounts, payments, or professional advice.' },
} as const;

export default function LegalPage({ kind }: { kind: keyof typeof pages }) {
    const page = pages[kind];
    return <PageContainer title={page.title} eyebrow="Information" description={page.description}><section className="legal-placeholder"><h2>{page.heading}</h2><p>{page.body}</p></section></PageContainer>;
}

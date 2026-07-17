import { Check, Clock3 } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';

const freeTools = ['View and edit PDFs', 'Text, highlights, drawing, shapes, and visual signatures', 'Merge, split, extract, reorder, rotate, duplicate, delete, and import pages', 'Watermarks, page numbers, headers, footers, crop, and metadata', 'No forced watermark on exported PDFs', 'Current PDF processing stays in your browser'];
const premiumTools = ['Batch processing and batch watermarking', 'Multiple document tabs and workspace restore', 'Saved templates and custom stamp library', 'Advanced alignment, layers, form creation, and secure redaction', 'Business branding, team administration, audit logs, and enterprise deployment options', 'Priority support'];

export default function PricingPage() {
    return <PageContainer title="Free for daily PDF work" eyebrow="Pricing" description="Core daily-use tools stay free. Premium is reserved for advanced productivity and business workflows.">
        <section className="pricing-grid" aria-label="Free and premium plans"><article className="pricing-column"><p className="eyebrow">Free</p><h2>Everyday PDF tools</h2><ul>{freeTools.map((tool) => <li key={tool}><Check size={17} aria-hidden="true" />{tool}</li>)}</ul></article><article className="pricing-column pricing-column--future"><p className="eyebrow">Premium</p><h2>Advanced productivity</h2><ul>{premiumTools.map((tool) => <li key={tool}><Clock3 size={17} aria-hidden="true" />{tool}<small>Coming later</small></li>)}</ul></article></section>
    </PageContainer>;
}

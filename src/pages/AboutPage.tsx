import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../config/site';

export default function AboutPage() {
    return <section className="info-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><p>About</p><h1>Practical PDF work in your browser</h1><span>PDF by ib provides simple browser-based tools for common PDF tasks.</span></header>
        <article>
            <p>The application is designed to process supported files directly on your device whenever possible, reducing unnecessary file uploads and making everyday PDF work faster and more private.</p>
            <h2>What it covers</h2>
            <p>Current categories include page management, conversion, editing, signing, and security-related tools. The catalogue clearly identifies the maturity of each workflow.</p>
            <h2>Tool labels</h2>
            <ul><li><strong>Available:</strong> the audited end-to-end workflow is enabled.</li><li><strong>Beta:</strong> the workflow works with documented compatibility or fidelity limitations.</li><li><strong>Coming Soon:</strong> the production workflow is disabled until it can create a reliable output.</li></ul>
            <p>Questions and feedback are welcome at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </article>
    </section>;
}

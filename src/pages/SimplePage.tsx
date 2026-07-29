import { ArrowLeft, Bug, Lightbulb, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { externalLinks, isExternalHttpLink, SUPPORT_EMAIL } from '../config/site';

export default function SimplePage() {
    const support = useLocation().pathname === '/support';
    return <section className="info-page contact-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><p>Help</p><h1>{support ? 'Support' : 'Contact PDF by ib'}</h1><span>{support ? 'Describe the tool, browser, device, and what happened. Never attach a confidential document.' : 'Questions, bug reports, and feature ideas are welcome.'}</span></header>
        <article>
            <h2>Email support</h2>
            <p>Use your default email application or write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
            <div className="contact-actions">
                <a className="button" href={externalLinks.contact}><Mail size={17} aria-hidden="true" />Contact</a>
                <a className="button button--secondary" href={externalLinks.bugReport} {...externalAttributes(externalLinks.bugReport)}><Bug size={17} aria-hidden="true" />Report a bug</a>
                <a className="button button--secondary" href={externalLinks.featureRequest} {...externalAttributes(externalLinks.featureRequest)}><Lightbulb size={17} aria-hidden="true" />Request a feature</a>
            </div>
            <p className="property-note">Do not include PDF contents, passwords, signatures, or other sensitive document information in a report.</p>
        </article>
    </section>;
}

function externalAttributes(value: string) {
    return isExternalHttpLink(value) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

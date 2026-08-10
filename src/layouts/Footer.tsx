import { Link } from 'react-router-dom';
import { Bug, Lightbulb, Mail } from 'lucide-react';
import { externalLinks, isExternalHttpLink, SUPPORT_EMAIL } from '../config/site';

export function Footer() {
    return <footer className="app-footer">
        <div className="app-footer__identity"><p>© 2026 PDF by ib</p></div>
        <nav aria-label="Legal and support links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/blog">Learning Center</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <a href={externalLinks.bugReport} {...externalAttributes(externalLinks.bugReport)}><Bug size={14} aria-hidden="true" />Report a bug</a>
            <a href={externalLinks.featureRequest} {...externalAttributes(externalLinks.featureRequest)}><Lightbulb size={14} aria-hidden="true" />Feature request</a>
            <a href={`mailto:${SUPPORT_EMAIL}`}><Mail size={14} aria-hidden="true" />{SUPPORT_EMAIL}</a>
        </nav>
    </footer>;
}

function externalAttributes(value: string) {
    return isExternalHttpLink(value) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

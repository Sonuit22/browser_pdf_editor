import { Link } from 'react-router-dom';
import {
    Bug,
    Check,
    CircleHelp,
    Github,
    Home,
    Lightbulb,
    LockKeyhole,
    Mail,
    MessageCircle,
    ScrollText,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import {
    appVersion,
    bugReportEmailLink,
    contactEmail,
    featureRequestEmailLink,
    githubRepositoryUrl,
    supportEmailLink,
} from '../config/footerLinks';

export function Footer() {
    return <footer className="app-footer">
        <div className="footer-main">
            <section className="footer-brand" aria-label="PDF by ib">
                <Link to="/" className="footer-logo"><img src="/logo-64.png" width="32" height="32" alt="" aria-hidden="true" /><span>PDF by ib</span></Link>
                <p>Fast <b>•</b> Secure <b>•</b> 100% browser-based PDF tools</p>
                <a className="footer-email" href={`mailto:${contactEmail}`} aria-label={`Email ${contactEmail}`}><Mail size={15} aria-hidden="true" />{contactEmail}</a>
            </section>
            <nav className="footer-links" aria-label="Quick links">
                <h2>Quick Links</h2>
                <Link to="/" aria-label="Home"><Home size={14} aria-hidden="true" />Home</Link>
                <Link to="/#tools" aria-label="All PDF tools"><img className="footer-link-logo" src="/logo-32.png" width="14" height="14" alt="" aria-hidden="true" />All Tools</Link>
                <Link to="/faq" aria-label="Frequently Asked Questions"><CircleHelp size={14} aria-hidden="true" />FAQ</Link>
                <Link to="/privacy" aria-label="Privacy Policy"><ShieldCheck size={14} aria-hidden="true" />Privacy</Link>
                <Link to="/terms" aria-label="Terms of Service"><ScrollText size={14} aria-hidden="true" />Terms</Link>
            </nav>
            <nav className="footer-links" aria-label="Support and project links">
                <h2>Connect</h2>
                <a href={supportEmailLink} aria-label="Email support"><MessageCircle size={14} aria-hidden="true" />Support</a>
                <a href={bugReportEmailLink} aria-label="Report a bug by email"><Bug size={14} aria-hidden="true" />Report a Bug</a>
                <a href={featureRequestEmailLink} aria-label="Send a feature request by email"><Lightbulb size={14} aria-hidden="true" />Feature Request</a>
                <a href={githubRepositoryUrl} target="_blank" rel="noreferrer" aria-label="View PDF by ib on GitHub"><Github size={14} aria-hidden="true" />GitHub</a>
            </nav>
            <section className="footer-trust" aria-labelledby="trust-title">
                <h2 id="trust-title">Private by design</h2>
                <div className="trust-badges">
                    <span><Check size={14} aria-hidden="true" />100% Browser Based</span>
                    <span><LockKeyhole size={14} aria-hidden="true" />Files Stay on Your Device</span>
                    <span><Zap size={14} aria-hidden="true" />No Registration Required</span>
                </div>
                <p>All PDF processing happens locally in your browser. Your files are never uploaded to any server.</p>
            </section>
        </div>
        <div className="footer-bottom"><small>© {new Date().getFullYear()} PDF by ib. All rights reserved. <span aria-label={`Version ${appVersion}`}>Version {appVersion}</span></small></div>
    </footer>;
}

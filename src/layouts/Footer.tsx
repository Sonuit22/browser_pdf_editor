import { Link } from 'react-router-dom';
import { Bug, Check, CircleHelp, FileText, Home, Lightbulb, LockKeyhole, Mail, MessageCircle, ScrollText, ShieldCheck, Zap } from 'lucide-react';
import { bugReportEmailLink, contactEmail, featureRequestEmailLink, supportEmailLink } from '../config/footerLinks';

export function Footer() {
    return <footer className="app-footer">
        <div className="footer-main">
            <section className="footer-brand" aria-label="PDF Editor by ib">
                <Link to="/" className="footer-logo"><FileText size={23} aria-hidden="true" /><span>PDF Editor <small>by ib</small></span></Link>
                <p>Fast <b>•</b> Secure <b>•</b> 100% Browser-Based PDF Tools</p>
                <a className="footer-email" href={`mailto:${contactEmail}`} aria-label={`Email ${contactEmail}`}><Mail size={15} aria-hidden="true" />{contactEmail}</a>
            </section>
            <nav className="footer-links" aria-label="Quick links"><h2>Quick Links</h2><Link to="/" aria-label="Home"><Home size={14} />Home</Link><Link to="/#tools" aria-label="All PDF tools"><FileText size={14} />All Tools</Link><Link to="/faq" aria-label="Frequently Asked Questions"><CircleHelp size={14} />FAQ</Link><Link to="/privacy" aria-label="Privacy Policy"><ShieldCheck size={14} />Privacy Policy</Link><Link to="/terms" aria-label="Terms of Service"><ScrollText size={14} />Terms of Service</Link></nav>
            <nav className="footer-links" aria-label="Support"><h2>Support</h2><a href={supportEmailLink} aria-label="Email support"><MessageCircle size={14} />Support</a><a href={bugReportEmailLink} aria-label="Report a bug by email"><Bug size={14} />Report a Bug</a><a href={featureRequestEmailLink} aria-label="Send a feature request by email"><Lightbulb size={14} />Feature Request</a></nav>
            <section className="footer-trust" aria-labelledby="trust-title"><h2 id="trust-title">Private by design</h2><div className="trust-badges"><span><Check size={14} />100% Browser Based</span><span><LockKeyhole size={14} />Files Stay on Your Device</span><span><Zap size={14} />No Registration Required</span></div><p>All PDF processing happens locally in your browser. Your files are never uploaded to any server.</p></section>
        </div>
        <div className="footer-bottom"><small>© 2026 PDF Editor by ib. All rights reserved.</small></div>
    </footer>;
}

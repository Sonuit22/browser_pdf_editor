import { Link } from 'react-router-dom';
import { Check, FileText, LockKeyhole, Mail, Zap } from 'lucide-react';

export function Footer() {
    return <footer className="app-footer">
        <div className="footer-main">
            <section className="footer-brand" aria-label="PDF Editor by ib">
                <Link to="/" className="footer-logo"><FileText size={23} aria-hidden="true" /><span>PDF Editor <small>by ib</small></span></Link>
                <p>Fast <b>•</b> Secure <b>•</b> 100% Browser-Based PDF Tools</p>
                <a className="footer-email" href="mailto:pdfeditorbyib@gmail.com"><Mail size={15} aria-hidden="true" />pdfeditorbyib@gmail.com</a>
            </section>
            <nav className="footer-links" aria-label="Quick links"><h2>Quick Links</h2><Link to="/">Home</Link><Link to="/">All Tools</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/contact">Contact</Link></nav>
            <nav className="footer-links" aria-label="Resources"><h2>Resources</h2><Link to="/support">FAQ</Link><a href="mailto:pdfeditorbyib@gmail.com?subject=PDF%20Editor%20Bug%20Report">Report a Bug</a><a href="mailto:pdfeditorbyib@gmail.com?subject=PDF%20Editor%20Feature%20Request">Feature Request</a></nav>
            <section className="footer-trust" aria-labelledby="trust-title"><h2 id="trust-title">Private by design</h2><div className="trust-badges"><span><Check size={14} />100% Browser Based</span><span><LockKeyhole size={14} />Files Stay on Your Device</span><span><Zap size={14} />No Registration Required</span></div><p>All PDF processing happens locally in your browser. Your files are never uploaded to any server.</p></section>
        </div>
        <div className="footer-bottom"><small>© 2026 PDF Editor by ib. All rights reserved.</small></div>
    </footer>;
}

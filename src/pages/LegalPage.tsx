import { ArrowLeft, ScrollText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GOVERNING_LAW, LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from '../config/site';

const privacySections = [
    ['Browser processing', 'Where supported, selected PDF, image, and document files are processed in your browser. PDF by ib does not intentionally upload those files to the application server. Temporary browser memory, object URLs, canvas surfaces, and browser-managed storage may be used while processing.'],
    ['When files are cleared', 'Application references to selected files are cleared when you reset or leave the workspace, refresh, or close the page, subject to normal browser behavior. Your browser or operating system may independently retain downloads, caches, crash data, or recent-file information.'],
    ['Hosting and analytics', 'The hosting provider may keep standard security and access logs such as IP address, browser information, requested URL, and time of access. If environment-controlled analytics is enabled, PDF by ib may collect anonymous or pseudonymous page views and generic tool events. Analytics never intentionally includes filenames, file paths, PDF text, document content, passwords, signatures, typed document text, or uploaded image names.'],
    ['Support communications', `When you email ${SUPPORT_EMAIL}, your email provider and ours process the information you choose to send. Do not attach confidential documents unless you have independently decided it is appropriate.`],
    ['Third parties and devices', 'Third-party links have their own privacy practices. Browser extensions, device services, shared computers, managed networks, and external environments may observe activity differently. Avoid processing highly sensitive documents on untrusted or shared devices.'],
    ['Security', 'The application uses data-minimizing browser workflows, but no website, browser, or device can guarantee absolute security. Keep your browser updated and review downloaded output before sharing it.'],
] as const;

const termsSections = [
    ['Acceptance', 'By using PDF by ib, you agree to these Terms of Use. If you do not agree, do not use the application. These terms are general website terms and are not professional legal advice.'],
    ['Permitted use', 'You may use the application for lawful personal, educational, or business PDF tasks. Do not misuse the service, interfere with its operation, attempt unauthorized access, distribute malware, or use it to violate another person’s rights.'],
    ['Your documents', 'You are responsible for having permission to use every document you select. You retain ownership of your files and outputs. PDF by ib does not claim ownership of user documents.'],
    ['Browser and output limitations', 'Processing capacity depends on your browser, device, memory, file complexity, and download settings. Review every output before relying on it. Conversions, edits, signatures, page geometry, and formatting may not reproduce perfectly.'],
    ['Beta and Coming Soon tools', 'Beta features have disclosed limitations and may change. Coming Soon tools do not provide a complete production workflow and may remain unavailable. Feature labels are informational, not guarantees of future release dates.'],
    ['Availability and changes', 'The website and tools may be changed, suspended, or discontinued. Access may be limited or terminated when necessary to respond to abuse, security risks, or unlawful use.'],
    ['No warranty', 'The application is provided “as is” and “as available,” without warranties of uninterrupted operation, fitness for a particular purpose, accuracy, or compatibility to the extent permitted by applicable law.'],
    ['Limitation of liability', 'To the extent permitted by applicable law, PDF by ib and its maintainers are not liable for indirect, incidental, special, consequential, or data-loss damages arising from use of the service.'],
    ['Website intellectual property', 'The website interface, branding, original text, and application code are protected by applicable intellectual-property rules. User documents remain the user’s property. Third-party libraries and links remain subject to their own licenses and terms.'],
    ['Governing law', `The governing-law provision is currently configured as ${GOVERNING_LAW}. It must be reviewed and finalized by the site owner before relying on it for a commercial launch.`],
] as const;

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
    const privacy = kind === 'privacy';
    const Icon = privacy ? ShieldCheck : ScrollText;
    const sections = privacy ? privacySections : termsSections;
    return <section className="info-page legal-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link>
        <header><Icon size={29} aria-hidden="true" /><p>PDF by ib</p><h1>{privacy ? 'Privacy Policy' : 'Terms of Use'}</h1><span>{privacy ? 'How browser-processed files, logs, optional analytics, and support communications are handled.' : 'Plain-language terms for responsible use of the browser-based PDF tools.'}</span><small>Last updated: {LEGAL_LAST_UPDATED}</small></header>
        <article>{sections.map(([heading, content]) => <section key={heading}><h2>{heading}</h2><p>{content}</p></section>)}<p className="legal-contact">Questions can be sent to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p></article>
    </section>;
}

import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
export default function SimplePage() {
    const support = useLocation().pathname === '/support';
    return <section className="simple-page"><Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Home</Link><h1>{support ? 'Support' : 'Contact'}</h1><p>{support ? 'For help, describe the tool, browser, and what happened. Never attach a confidential document.' : 'Questions or feedback about PDF Editor by ib are welcome.'}</p><a className="button" href="mailto:pdfeditorbyib@gmail.com">{support ? 'Email support' : 'Contact us'}</a></section>;
}

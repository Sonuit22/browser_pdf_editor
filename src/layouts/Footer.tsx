import { Link } from 'react-router-dom';

export function Footer() {
    return <footer className="app-footer"><p>Free daily PDF tools. Local browser processing.</p><nav aria-label="Footer navigation"><Link to="/pricing">Pricing</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></nav></footer>;
}

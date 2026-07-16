import { Link } from 'react-router-dom';

export function Footer() {
    return <footer className="app-footer"><p>PDF Editor by ib</p><nav aria-label="Footer navigation"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/support">Support</Link></nav></footer>;
}

import { Link } from 'react-router-dom';
export function Footer() {
    return <footer className="app-footer"><small>&copy; 2026 PDF Editor by ib.</small><nav aria-label="Footer navigation"><Link to="/contact">Contact</Link><Link to="/support">Support</Link></nav></footer>;
}

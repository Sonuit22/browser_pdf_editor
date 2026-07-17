import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="app-footer">
            <p>PDF Editor by ib</p>
            <p>Browser-based PDF tools designed with privacy in mind.</p>
            <nav aria-label="Footer navigation">
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <Link to="/">All tools</Link>
            </nav>
            <small>&copy; {new Date().getFullYear()} PDF Editor by ib.</small>
        </footer>
    );
}

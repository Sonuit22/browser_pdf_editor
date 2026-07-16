import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <section className="not-found" aria-labelledby="not-found-title">
            <p className="eyebrow">404</p>
            <h1 id="not-found-title">This workspace does not exist.</h1>
            <p>The route may have moved, or it has not been planned yet.</p>
            <Link className="button" to="/">Return to workspace</Link>
        </section>
    );
}

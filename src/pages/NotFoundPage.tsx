import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export default function NotFoundPage() {
    return <PageContainer title="Page not found" eyebrow="404" description="The page you requested does not exist. Return home or browse the current PDF tool catalogue.">
        <div className="not-found-actions"><Link className="button" to="/">Home</Link><Link className="button button--secondary" to="/all-tools">All Tools</Link></div>
    </PageContainer>;
}

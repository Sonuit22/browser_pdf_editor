import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export default function NotFoundPage() {
    return (
        <PageContainer title="Page not found" eyebrow="404" description="The workspace you requested does not exist or has not been planned yet.">
            <Link className="button" to="/">Return home</Link>
        </PageContainer>
    );
}

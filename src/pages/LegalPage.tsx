import { PageContainer } from '../components/PageContainer';

type LegalPageProps = { title: string; description: string };

export default function LegalPage({ title, description }: LegalPageProps) {
    return (
        <PageContainer title={title} eyebrow="Information" description={description}>
            <section className="legal-placeholder">
                <h2>Content placeholder</h2>
                <p>Production policy content will be added before any PDF processing feature is released.</p>
            </section>
        </PageContainer>
    );
}

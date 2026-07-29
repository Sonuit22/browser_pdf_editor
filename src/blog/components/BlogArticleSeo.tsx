import { useEffect } from 'react';
import type { BlogArticle } from '../types';

export function BlogArticleSeo({ article }: { article: BlogArticle }) {
    useEffect(() => {
        if (!article.faq.length) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.blogFaqSchema = 'true';
        script.text = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.faq.map(({ question, answer }) => ({
                '@type': 'Question',
                name: question,
                acceptedAnswer: { '@type': 'Answer', text: answer },
            })),
        });
        document.head.append(script);
        return () => script.remove();
    }, [article]);
    return null;
}

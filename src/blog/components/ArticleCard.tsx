import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BlogArticleMetadata } from '../types';
import { formatBlogDate } from '../content';
import { trackEvent } from '../../utils/analytics';

export function ArticleCard({ article }: { article: BlogArticleMetadata }) {
    return <article className="blog-card">
        <Link className="blog-card__image" to={`/blog/${article.slug}`} tabIndex={-1} aria-hidden="true">
            <img src={article.image} alt="" width="512" height="512" loading="lazy" />
        </Link>
        <div className="blog-card__body">
            <div className="blog-card__meta"><span>{article.category}</span><span><Clock size={14} aria-hidden="true" />{article.readingTime} min read</span></div>
            <h2><Link to={`/blog/${article.slug}`}>{article.title}</Link></h2>
            <p>{article.description}</p>
            <div className="blog-card__footer"><time dateTime={article.publishedDate}>{formatBlogDate(article.publishedDate)}</time><Link to={`/blog/${article.slug}`} onClick={() => trackEvent('blog_related_article_clicked', { article_slug: article.slug })}>Read guide <ArrowRight size={15} aria-hidden="true" /></Link></div>
        </div>
    </article>;
}

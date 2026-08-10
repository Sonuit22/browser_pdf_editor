import { ArrowLeft, ArrowRight, BookOpen, Clock, Wrench } from 'lucide-react';
import { useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArticleCard } from '../blog/components/ArticleCard';
import { ArticleRenderer } from '../blog/components/ArticleRenderer';
import { BlogArticleSeo } from '../blog/components/BlogArticleSeo';
import { formatBlogDate } from '../blog/content';
import { getArticleBySlug, publishedArticles } from '../blog/content/articles';
import { trackEvent } from '../utils/analytics';
import NotFoundPage from './NotFoundPage';

export default function BlogArticlePage() {
    const { slug } = useParams();
    const { hash } = useLocation();
    const article = getArticleBySlug(slug);

    useLayoutEffect(() => {
        if (article && !hash) window.scrollTo(0, 0);
    }, [article, hash]);

    useEffect(() => {
        if (article) trackEvent('blog_article_opened', { article_slug: article.slug, category: article.category.toLowerCase().replace(/\s+/g, '-') });
    }, [article]);

    if (!article) {
        return <NotFoundPage showBlogLink />;
    }

    const related = article.relatedSlugs.map((relatedSlug) => publishedArticles.find((item) => item.slug === relatedSlug)).filter((item): item is typeof article => Boolean(item));
    const currentIndex = publishedArticles.findIndex((item) => item.slug === article.slug);
    const previous = currentIndex > 0 ? publishedArticles[currentIndex - 1] : undefined;
    const next = currentIndex < publishedArticles.length - 1 ? publishedArticles[currentIndex + 1] : undefined;

    return <article className="blog-article">
        <BlogArticleSeo article={article} />
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb"><ol><li><Link to="/">Home</Link></li><li><Link to="/blog">Learning Center</Link></li><li aria-current="page">{article.title}</li></ol></nav>
        <header className="blog-article__header">
            <span>{article.category}</span>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <div><span>By {article.author}</span><time dateTime={article.publishedDate}>Published {formatBlogDate(article.publishedDate)}</time>{article.updatedDate !== article.publishedDate && <time dateTime={article.updatedDate}>Updated {formatBlogDate(article.updatedDate)}</time>}<span><Clock size={15} aria-hidden="true" />{article.readingTime} min read</span></div>
        </header>
        <figure className="blog-cover"><img src={article.image} alt={article.imageAlt} width="512" height="512" /><figcaption>{article.title}</figcaption></figure>
        <div className="blog-article__layout">
            <aside className="blog-toc" aria-labelledby="table-of-contents-heading"><h2 id="table-of-contents-heading">On this page</h2><ol>{article.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}{article.faq.length > 0 && <li><a href="#frequently-asked-questions">Frequently asked questions</a></li>}</ol></aside>
            <div className="blog-article__content">
                <ArticleRenderer article={article} />
                <aside className="blog-tool-cta"><Wrench size={23} aria-hidden="true" /><div><p>Related browser tool</p><h2>{article.relatedTool}</h2><span>Use the guide above to plan the task, then open the matching PDF by ib tool.</span></div><Link className="button" to={article.relatedToolPath} aria-label={`${article.ctaLabel} using PDF by ib`} onClick={() => trackEvent('blog_tool_cta_clicked', { article_slug: article.slug, tool_slug: article.relatedToolPath.slice(1) })}>{article.ctaLabel}<ArrowRight size={17} aria-hidden="true" /></Link></aside>
                {article.faq.length > 0 && <section className="blog-faq" id="frequently-asked-questions"><h2>Frequently asked questions</h2>{article.faq.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>}
                <nav className="blog-prev-next" aria-label="Previous and next guides">{previous ? <Link to={`/blog/${previous.slug}`}><ArrowLeft size={17} aria-hidden="true" /><span><small>Previous guide</small>{previous.title}</span></Link> : <span />}{next && <Link to={`/blog/${next.slug}`} onClick={() => trackEvent('blog_related_article_clicked', { article_slug: next.slug })}><span><small>Next guide</small>{next.title}</span><ArrowRight size={17} aria-hidden="true" /></Link>}</nav>
                <Link className="blog-back-link" to="/blog"><BookOpen size={17} aria-hidden="true" />Back to Learning Center</Link>
            </div>
        </div>
        {related.length > 0 && <section className="blog-related" aria-labelledby="related-guides-heading"><div className="blog-section-heading"><div><p>Continue learning</p><h2 id="related-guides-heading">Related guides</h2></div></div><div className="blog-card-grid">{related.map((item) => <ArticleCard article={item} key={item.slug} />)}</div></section>}
    </article>;
}

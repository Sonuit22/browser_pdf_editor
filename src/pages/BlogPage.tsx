import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ArticleCard } from '../blog/components/ArticleCard';
import { publishedArticleMetadata } from '../blog/content';
import { filterBlogArticles } from '../blog/search';
import { trackEvent } from '../utils/analytics';

export default function BlogPage() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const categories = useMemo(() => ['All', ...new Set(publishedArticleMetadata.map((article) => article.category))], []);
    const results = useMemo(() => filterBlogArticles(publishedArticleMetadata, query, category), [category, query]);
    const featured = useMemo(() => publishedArticleMetadata.filter((article) => article.featured), []);

    useEffect(() => {
        trackEvent('blog_viewed');
    }, []);

    return <section className="blog-index">
        <header className="blog-hero">
            <p>Learning Center</p>
            <h1>PDF Guides and Tutorials</h1>
            <span>Practical, privacy-aware guidance for everyday PDF tasks in a modern browser.</span>
        </header>

        <section aria-labelledby="featured-guides-heading">
            <div className="blog-section-heading"><div><p>Start here</p><h2 id="featured-guides-heading">Featured guides</h2></div><span>{featured.length} guides</span></div>
            <div className="blog-card-grid">{featured.map((article) => <ArticleCard article={article} key={article.slug} />)}</div>
        </section>

        <section aria-labelledby="latest-guides-heading">
            <div className="blog-section-heading"><div><p>Browse the library</p><h2 id="latest-guides-heading">Latest articles</h2></div><span aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'}</span></div>
            <div className="blog-controls">
                <label className="blog-search"><span className="sr-only">Search Learning Center articles</span><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => { if (query.trim()) trackEvent('blog_search_used', { result_count: results.length }); }} placeholder="Search guides" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear article search"><X size={17} aria-hidden="true" /></button>}</label>
                <div className="blog-filters" role="group" aria-label="Filter articles by category">{categories.map((item) => <button type="button" className={category === item ? 'is-active' : ''} aria-pressed={category === item} key={item} onClick={() => { setCategory(item); trackEvent('blog_category_filtered', { category: item === 'All' ? 'all' : item.toLowerCase().replace(/\s+/g, '-') }); }}>{item}</button>)}</div>
            </div>
            {results.length ? <div className="blog-card-grid">{results.map((article) => <ArticleCard article={article} key={article.slug} />)}</div> : <div className="blog-empty" role="status"><h3>No matching guides</h3><p>Try another category or clear the search.</p><button className="button button--secondary" type="button" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button></div>}
        </section>
    </section>;
}

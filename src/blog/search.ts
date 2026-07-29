import type { BlogArticleMetadata } from './types';

export function filterBlogArticles(articles: BlogArticleMetadata[], query: string, category: string) {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
        const categoryMatches = category === 'All' || article.category === category;
        const searchable = [article.title, article.description, article.category, ...article.tags].join(' ').toLowerCase();
        return categoryMatches && (!needle || searchable.includes(needle));
    });
}

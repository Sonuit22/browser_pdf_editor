import manifest from './articleManifest.json';
import type { BlogArticleMetadata } from '../types';

export const articleMetadata = manifest as BlogArticleMetadata[];
export function filterPublishedArticles(items: BlogArticleMetadata[]) {
    return items.filter((article) => !article.draft);
}

export const publishedArticleMetadata = filterPublishedArticles(articleMetadata)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate) || a.title.localeCompare(b.title));

export function getArticleMetadata(slug: string | undefined) {
    return slug ? publishedArticleMetadata.find((article) => article.slug === slug) : undefined;
}

export function formatBlogDate(value: string) {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

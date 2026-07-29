import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { articles, getArticleBySlug, publishedArticles } from '../src/blog/content/articles';
import {
    articleMetadata,
    filterPublishedArticles,
    getArticleMetadata,
    publishedArticleMetadata,
} from '../src/blog/content';
import { getSeoForPath } from '../src/config/seo';
import { filterBlogArticles } from '../src/blog/search';
import { findToolByRoute } from '../src/config/toolRegistry';
import type { BlogArticle, BlogArticleMetadata } from '../src/blog/types';

function articleWordCount(article: BlogArticle) {
    const content = [
        article.title,
        article.description,
        ...article.introduction,
        ...article.sections.flatMap((section) => [
            section.heading,
            ...(section.paragraphs ?? []),
            ...(section.bullets ?? []),
            ...(section.steps?.flatMap((step) => [step.title, step.description]) ?? []),
            ...(section.callout ? [section.callout.title, section.callout.text] : []),
            ...(section.table?.headers ?? []),
            ...(section.table?.rows.flat() ?? []),
        ]),
        ...article.faq.flatMap((item) => [item.question, item.answer]),
    ].join(' ');

    return content.match(/\b[\p{L}\p{N}][\p{L}\p{N}’'-]*\b/gu)?.length ?? 0;
}

describe('Learning Center content registry', () => {
    it('publishes the ten requested complete articles', () => {
        expect(publishedArticles).toHaveLength(10);
        expect(publishedArticleMetadata).toHaveLength(10);
        expect(new Set(publishedArticles.map((article) => article.slug)).size).toBe(10);

        for (const article of publishedArticles) {
            expect(article.sections.length).toBeGreaterThanOrEqual(5);
            expect(article.faq.length).toBeGreaterThanOrEqual(3);
            expect(article.relatedSlugs.length).toBeGreaterThanOrEqual(2);
            expect(article.canonicalUrl).toBe(`/blog/${article.slug}`);
            expect(getArticleBySlug(article.slug)?.title).toBe(article.title);
            expect(getArticleMetadata(article.slug)?.title).toBe(article.title);
        }
    });

    it.each(publishedArticles)('$slug contains 700–1,200 useful words', (article) => {
        expect(articleWordCount(article)).toBeGreaterThanOrEqual(700);
        expect(articleWordCount(article)).toBeLessThanOrEqual(1200);
    });

    it('excludes drafts without relying on the current manifest having a draft', () => {
        const draft = { ...articleMetadata[0], slug: 'private-draft', draft: true } satisfies BlogArticleMetadata;
        const published = filterPublishedArticles([articleMetadata[0], draft]);

        expect(published.map((article) => article.slug)).toEqual([articleMetadata[0].slug]);
    });

    it('keeps related article references resolvable', () => {
        const slugs = new Set(articles.map((article) => article.slug));
        for (const article of articles) {
            for (const relatedSlug of article.relatedSlugs) {
                expect(slugs.has(relatedSlug), `${article.slug} links to missing ${relatedSlug}`).toBe(true);
            }
        }
    });

    it('links every guide to a registered tool route', () => {
        for (const article of publishedArticles) {
            expect(findToolByRoute(article.relatedToolPath), `${article.slug} has an unknown tool route`).toBeDefined();
        }
    });

    it('searches case-insensitively and supports a real empty-result state', () => {
        expect(filterBlogArticles(publishedArticleMetadata, 'SIGNATURE', 'All').some((article) => article.slug === 'how-to-sign-a-pdf-online')).toBe(true);
        expect(filterBlogArticles(publishedArticleMetadata, 'query-that-cannot-match-any-guide', 'All')).toEqual([]);
        expect(filterBlogArticles(publishedArticleMetadata, '', 'Conversion').every((article) => article.category === 'Conversion')).toBe(true);
    });
});

describe('Learning Center SEO', () => {
    it('provides indexable article metadata and canonical URLs', () => {
        for (const article of publishedArticles) {
            const seo = getSeoForPath(`/blog/${article.slug}`);
            expect(seo.index).not.toBe(false);
            expect(seo.canonical).not.toBe(false);
            expect(seo.article?.slug).toBe(article.slug);
        }
    });

    it('marks an unknown article URL noindex and omits its canonical URL', () => {
        const seo = getSeoForPath('/blog/does-not-exist');
        expect(seo.index).toBe(false);
        expect(seo.canonical).toBe(false);
        expect(seo.article).toBeUndefined();
    });
});

describe('Learning Center discovery files', () => {
    it('lists every published article in both sitemap and RSS with no draft leakage', async () => {
        const [sitemap, rss] = await Promise.all([readFile('sitemap.xml', 'utf8'), readFile('rss.xml', 'utf8')]);

        for (const article of publishedArticles) {
            const absoluteUrl = `https://pdfbyib.com/blog/${article.slug}`;
            expect(sitemap).toContain(`<loc>${absoluteUrl}</loc>`);
            expect(rss).toContain(`<link>${absoluteUrl}</link>`);
        }
        expect((rss.match(/<item>/g) ?? [])).toHaveLength(publishedArticles.length);
        expect(sitemap).not.toContain('private-draft');
        expect(rss).not.toContain('private-draft');
    });
});

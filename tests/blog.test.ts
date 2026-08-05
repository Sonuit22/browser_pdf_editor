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

const newArticleSlugs = [
    'how-to-reduce-pdf-size-below-1-mb',
    'how-to-compress-a-pdf-for-email-attachments',
    'how-to-merge-scanned-documents-into-one-pdf',
    'how-to-rearrange-pdf-pages-before-printing',
    'how-to-add-a-signature-to-a-pdf-without-printing',
    'how-to-combine-multiple-images-into-one-pdf',
    'how-to-prepare-pdf-files-for-online-job-applications',
    'how-to-submit-college-assignments-as-a-single-pdf',
    'common-pdf-problems-and-simple-solutions',
    'browser-based-pdf-editing-vs-desktop-software',
] as const;

const seoIntentArticles = [
    ['complete-guide-to-pdf-tools-2026', 'pdf tools'],
    ['how-to-merge-pdf-files-online', 'merge pdf'],
    ['how-to-edit-a-pdf-without-adobe', 'edit pdf online'],
    ['how-to-compress-pdf-without-losing-quality', 'compress pdf'],
    ['how-to-split-pdf-pages-online', 'split pdf'],
    ['how-to-convert-jpg-to-pdf', 'jpg to pdf'],
    ['convert-pdf-to-word-without-formatting-problems', 'pdf to word'],
    ['how-to-protect-a-pdf-with-password', 'protect pdf'],
    ['how-to-sign-a-pdf-online', 'sign pdf'],
    ['how-to-organize-pdf-pages', 'organize pdf'],
] as const;

describe('Learning Center content registry', () => {
    it('publishes all twenty-two requested complete articles', () => {
        expect(publishedArticles).toHaveLength(22);
        expect(publishedArticleMetadata).toHaveLength(22);
        expect(new Set(publishedArticles.map((article) => article.slug)).size).toBe(22);

        for (const article of publishedArticles) {
            expect(article.sections.length).toBeGreaterThanOrEqual(5);
            expect(article.faq.length).toBeGreaterThanOrEqual(3);
            expect(article.relatedSlugs.length).toBeGreaterThanOrEqual(2);
            expect(article.canonicalUrl).toBe(`/blog/${article.slug}`);
            expect(getArticleBySlug(article.slug)?.title).toBe(article.title);
            expect(getArticleMetadata(article.slug)?.title).toBe(article.title);
        }
    });

    it.each(publishedArticles.filter((article) => !newArticleSlugs.includes(article.slug as typeof newArticleSlugs[number])))('$slug retains 700–1,200 useful words', (article) => {
        expect(articleWordCount(article)).toBeGreaterThanOrEqual(700);
        expect(articleWordCount(article)).toBeLessThanOrEqual(1200);
    });

    it.each(newArticleSlugs)('%s follows the new concise article brief', (slug) => {
        const article = getArticleBySlug(slug);
        expect(article).toBeDefined();
        if (!article) return;

        const stepCount = article.sections.filter((section) => section.heading.startsWith('Step ')).length;
        expect(articleWordCount(article)).toBeGreaterThanOrEqual(500);
        expect(articleWordCount(article)).toBeLessThanOrEqual(800);
        expect(stepCount).toBeGreaterThanOrEqual(4);
        expect(stepCount).toBeLessThanOrEqual(6);
        expect(article.sections.some((section) => section.heading === 'Quick Tips')).toBe(true);
        expect(article.sections.at(-1)?.heading).toBe('Conclusion');
        expect(article.sections.every((section) => !section.steps)).toBe(true);
        expect(article.faq.length).toBeGreaterThanOrEqual(3);
        expect(article.faq.length).toBeLessThanOrEqual(5);
        expect(article.relatedSlugs.length).toBeGreaterThanOrEqual(2);
        expect(article.relatedSlugs.length).toBeLessThanOrEqual(3);
        expect(article.description.length).toBeGreaterThanOrEqual(140);
        expect(article.description.length).toBeLessThanOrEqual(160);
    });

    it.each(seoIntentArticles)('%s follows the focused 2026 search-intent brief', (slug, keyword) => {
        const article = getArticleBySlug(slug);
        expect(article).toBeDefined();
        if (!article) return;

        const wordCount = articleWordCount(article);
        const introduction = article.introduction.join(' ');
        const conclusion = article.sections.find((section) => section.heading === 'Conclusion');
        expect(wordCount, `${slug} has ${wordCount} words`).toBeGreaterThanOrEqual(600);
        expect(wordCount, `${slug} has ${wordCount} words`).toBeLessThanOrEqual(800);
        expect(article.title.length).toBeLessThanOrEqual(60);
        expect(article.description.length).toBeLessThanOrEqual(155);
        expect(article.primaryKeyword).toBe(keyword);
        expect(article.secondaryKeywords?.length).toBeGreaterThanOrEqual(3);
        expect(introduction.split(/\s+/).length).toBeLessThanOrEqual(90);
        expect(introduction.toLowerCase()).toContain(keyword);
        expect(article.sections.some((section) => section.heading === 'Quick Answer')).toBe(true);
        expect(article.sections.some((section) => section.heading === 'People Also Ask')).toBe(true);
        expect(article.sections.some((section) => section.heading === 'Quick Summary')).toBe(true);
        expect(article.sections.some((section) => section.heading === 'Image suggestions')).toBe(true);
        expect(article.sections.some((section) => section.heading === 'Schema suggestions')).toBe(true);
        expect(article.sections.some((section) => section.heading.toLowerCase().includes(keyword))).toBe(true);
        expect(article.sections.some((section) => section.steps && section.steps.length >= 4)).toBe(true);
        expect(article.sections.some((section) => section.table)).toBe(true);
        expect(article.faq).toHaveLength(4);
        expect(article.relatedSlugs.length).toBeGreaterThanOrEqual(2);
        expect(conclusion?.paragraphs?.join(' ').toLowerCase()).toContain(keyword);
        expect(conclusion?.paragraphs).toContain('PDF by ib processes your files locally in your browser. Your documents are not uploaded to a server.');
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
            expect(article.relatedToolPath === '/all-tools' || findToolByRoute(article.relatedToolPath), `${article.slug} has an unknown tool route`).toBeTruthy();
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

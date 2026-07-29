# Learning Center authoring guide

The Learning Center is a repository-native, browser-only blog. Article metadata lives in
`src/blog/content/articleManifest.json`, and the safely rendered article body lives in
`src/blog/content/articles.ts`. No CMS, server, raw HTML, or `dangerouslySetInnerHTML` is
required.

## Add an article

1. Choose a lowercase, hyphenated slug, such as `how-to-rotate-pdf-pages`.
2. Add one metadata object to `articleManifest.json`.
3. Add a matching `define('how-to-rotate-pdf-pages', { ... })` entry in `articles.ts`.
4. Add at least two valid article slugs to `relatedSlugs`.
5. If the article describes an existing tool, use its exact route in `relatedToolPath`.
6. Run `npm test`, `npm run generate:public`, and `npm run build`.

Use `npm run dev` for local editing, or run `npm run build` followed by `npm run preview`
to inspect the production bundle. Open `/blog` and the new article route directly.

Copy this metadata template:

```json
{
  "title": "How to Rotate PDF Pages",
  "slug": "how-to-rotate-pdf-pages",
  "description": "Learn how to rotate PDF pages in your browser and verify the downloaded result.",
  "publishedDate": "2026-07-29",
  "updatedDate": "2026-07-29",
  "author": "PDF by ib",
  "category": "PDF editing",
  "tags": ["rotate PDF", "PDF pages"],
  "featured": false,
  "draft": true,
  "readingTime": 7,
  "relatedTool": "Rotate PDF",
  "relatedToolPath": "/rotate-pdf",
  "image": "/logo-512.png",
  "imageAlt": "PDF by ib Learning Center",
  "canonicalUrl": "/blog/how-to-rotate-pdf-pages"
}
```

Copy this article-body template inside the `articles` array:

```ts
define('how-to-rotate-pdf-pages', {
    introduction: [
        'Explain the user problem, the outcome, and how browser processing works.',
        'Set accurate expectations about file compatibility and practical limits.',
    ],
    sections: [
        {
            id: 'when-to-use',
            heading: 'When to rotate PDF pages',
            paragraphs: ['Write clear, original guidance in plain language.'],
            bullets: ['Give a concrete use case.', 'Add a second useful example.'],
        },
        {
            id: 'steps',
            heading: 'How to rotate PDF pages',
            steps: [
                { title: 'Choose the file', description: 'Explain the action and expected result.' },
                { title: 'Review the pages', description: 'Explain how to avoid a common mistake.' },
                { title: 'Download and verify', description: 'Tell the reader what to check.' },
            ],
        },
        {
            id: 'privacy',
            heading: 'Privacy and file handling',
            paragraphs: ['Explain the actual browser-only behavior without making unsupported claims.'],
            callout: { tone: 'note', title: 'Good to know', text: 'Add a concise practical note.' },
        },
        {
            id: 'limitations',
            heading: 'Limitations',
            paragraphs: ['Describe realistic browser, document, or format limitations.'],
        },
        {
            id: 'troubleshooting',
            heading: 'Troubleshooting',
            paragraphs: ['Give actionable troubleshooting steps.'],
        },
    ],
    faq: [
        { question: 'Ask a real user question?', answer: 'Give the same complete answer shown to readers.' },
        { question: 'Add a second question?', answer: 'Keep visible FAQ text and FAQ schema synchronized.' },
        { question: 'Add a third question?', answer: 'Use factual, non-promotional language.' },
    ],
    relatedSlugs: ['existing-article-slug', 'another-existing-article-slug'],
    ctaLabel: 'Open Rotate PDF',
}),
```

## Publishing and draft behavior

- Keep `draft: true` while writing. Drafts are omitted from the index, article lookup,
  sitemap, RSS feed, and SEO metadata.
- Before publishing, target 700–1,200 useful words, use one page title/H1, provide at least
  five meaningful sections and three FAQs, and confirm every claim against the live tool.
- Change `draft` to `false` only when the article and linked tool route are ready.
- Use ISO dates (`YYYY-MM-DD`). The public-file generator rejects future publication or
  update dates.
- `npm run generate:public` regenerates both root and `public/` copies of `sitemap.xml` and
  `rss.xml` from the same manifest, preventing duplicate metadata sources.
- FAQ JSON-LD is generated from the exact `faq` array rendered as visible accordions. Do not
  create a separate schema-only answer or hide an FAQ that remains in metadata.

## Publication checklist

- The slug is unique, lowercase, and hyphenated.
- The title, description, canonical path, dates, category, tags, image alt text, and related
  tool route are accurate.
- The guide has 700–1,200 useful words, logical headings, browser limitations, privacy
  guidance where relevant, three visible FAQs, and two working related-article links.
- The matching tool status is described honestly; Coming Soon features are not presented as
  available.
- The article works in light and dark mode at narrow and wide widths without horizontal
  overflow.
- `npm test`, `npm run generate:public`, and `npm run build` all pass before `draft` changes
  to `false`.

## Images and accessibility

The current articles intentionally use the existing optimized logo fallback. If a dedicated
cover image is added later, place it in `public/`, use a stable root-relative path, provide
descriptive alt text, include explicit dimensions in the component, and optimize its file
size. Do not place essential instructions only inside an image.

Headings should describe the section, link labels should identify their destination, and
tables must remain understandable when horizontally scrolled on narrow screens.

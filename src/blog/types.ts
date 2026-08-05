export type BlogFaq = { question: string; answer: string };
export type BlogStep = { title: string; description: string };
export type BlogSection = {
    id: string;
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
    steps?: BlogStep[];
    callout?: { tone: 'note' | 'tip' | 'warning'; title: string; text: string };
    table?: { headers: [string, string]; rows: Array<[string, string]> };
};

export type BlogArticleMetadata = {
    title: string;
    slug: string;
    description: string;
    publishedDate: string;
    updatedDate: string;
    author: string;
    category: string;
    tags: string[];
    featured: boolean;
    draft: boolean;
    readingTime: number;
    relatedTool: string;
    relatedToolPath: string;
    image: string;
    imageAlt: string;
    canonicalUrl: string;
    primaryKeyword?: string;
    secondaryKeywords?: string[];
};

export type BlogArticle = BlogArticleMetadata & {
    introduction: string[];
    sections: BlogSection[];
    faq: BlogFaq[];
    relatedSlugs: string[];
    ctaLabel: string;
};

import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { faqEntries } from '../src/pages/faqContent';

describe('normal route scrolling and FAQ answer quality', () => {
    it('centrally scrolls new routes to the top while preserving anchors and POP history', async () => {
        const [manager, app, article] = await Promise.all([
            readFile('src/components/RouteScrollManager.tsx', 'utf8'),
            readFile('src/App.tsx', 'utf8'),
            readFile('src/pages/BlogArticlePage.tsx', 'utf8'),
        ]);
        expect(app).toContain('<RouteScrollManager />');
        expect(manager).toContain('document.getElementById');
        expect(manager).toContain("navigationType !== 'POP'");
        expect(manager).toContain("window.scrollTo({ top: 0, left: 0, behavior: 'auto' })");
        expect(article).not.toContain('window.scrollTo');
    });

    it('starts every binary FAQ answer directly with Yes or No', () => {
        const binaryQuestions = faqEntries.filter(([question]) => /^(Are|Can|Do|Does|Is)\b/.test(question));
        expect(binaryQuestions.length).toBeGreaterThan(0);
        for (const [question, answer] of binaryQuestions) {
            expect(answer, question).toMatch(/^(Yes|No)[.,]/);
        }
    });

    it('avoids unsupported security superlatives in FAQ answers', () => {
        const answers = faqEntries.map(([, answer]) => answer).join(' ').toLowerCase();
        for (const claim of ['100% secure', 'completely secure', 'military-grade', 'safest pdf editor', 'impossible to access']) {
            expect(answers).not.toContain(claim);
        }
    });
});

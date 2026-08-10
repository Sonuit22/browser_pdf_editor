import { readFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PrivacyAnnouncement } from '../src/components/PrivacyAnnouncement';

describe('landing privacy announcement', () => {
    it('renders one accessible message plus one hidden copy for seamless motion', () => {
        const html = renderToStaticMarkup(<PrivacyAnnouncement />);
        expect(html.match(/Because your documents matter/g)).toHaveLength(2);
        expect(html).toContain('aria-label="Privacy announcement"');
        expect(html).toContain('class="privacy-announcement__message" aria-hidden="true"');
        expect(html).not.toContain('<marquee');
    });

    it('is landing-only, CSS animated, and reduced-motion safe', async () => {
        const [layout, css] = await Promise.all([
            readFile('src/layouts/AppLayout.tsx', 'utf8'),
            readFile('src/styles.css', 'utf8'),
        ]);
        expect(layout).toContain('{isToolDashboard && <PrivacyAnnouncement />}');
        expect(css).toContain('@keyframes privacy-announcement-scroll');
        expect(css).toContain('.privacy-announcement:hover .privacy-announcement__track');
        expect(css).toContain('@media (prefers-reduced-motion: reduce)');
        expect(css).toContain('animation: none !important');
    });
});

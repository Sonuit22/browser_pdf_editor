import { describe, expect, it } from 'vitest';
import { bugReportEmailLink, contactEmail, featureRequestEmailLink, githubRepositoryUrl, supportEmailLink } from '../src/config/footerLinks';

function decoded(link: string) { return decodeURIComponent(link); }

describe('footer destinations', () => {
    it('uses the configured support address and complete support template', () => {
        expect(supportEmailLink).toContain(`mailto:${contactEmail}`);
        expect(decoded(supportEmailLink)).toContain('Support Request - PDF Editor by ib');
        expect(decoded(supportEmailLink)).toContain('Browser:');
        expect(decoded(supportEmailLink)).toContain('Device:');
    });

    it('provides distinct bug and feature request templates', () => {
        expect(decoded(bugReportEmailLink)).toContain('Steps to reproduce:');
        expect(decoded(bugReportEmailLink)).toContain('Actual result:');
        expect(decoded(featureRequestEmailLink)).toContain('Why would this feature be useful?');
    });

    it('only exposes a secure configured GitHub repository URL', () => {
        expect(githubRepositoryUrl).toBe('https://github.com/Sonuit22/browser_pdf_editor');
    });
});

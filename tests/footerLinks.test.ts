import { describe, expect, it } from 'vitest';
import { bugReportEmailLink, contactEmail, featureRequestEmailLink, githubRepositoryUrl, supportEmailLink } from '../src/config/footerLinks';

function decoded(link: string) { return decodeURIComponent(link); }

describe('footer destinations', () => {
    it('uses the configured support address and complete support template', () => {
        expect(supportEmailLink).toContain(`mailto:${contactEmail}`);
        expect(decoded(supportEmailLink)).toContain('PDF by ib – Support Request');
        expect(decoded(supportEmailLink)).toContain('Browser:');
        expect(decoded(supportEmailLink)).toContain('Device:');
    });

    it('provides distinct bug and feature request templates', () => {
        expect(decoded(bugReportEmailLink)).toContain('Steps to reproduce:');
        expect(decoded(bugReportEmailLink)).toContain('Actual result:');
        expect(decoded(featureRequestEmailLink)).toContain('What problem would this solve?');
    });

    it('does not expose a GitHub URL unless one is configured', () => {
        expect(githubRepositoryUrl).toBe('');
    });
});

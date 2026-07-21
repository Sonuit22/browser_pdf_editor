export const contactEmail = 'pdfeditorbyib@gmail.com';
export const githubRepositoryUrl = 'https://github.com/Sonuit22/browser_pdf_editor';
export const appVersion = '0.1.0';

function emailLink(subject: string, body: string) {
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const supportEmailLink = emailLink('Support Request - PDF by ib', `Hello,

I need help with:

Tool:

Browser:

Device:

Description:

Thank you.`);

export const bugReportEmailLink = emailLink('Bug Report - PDF by ib', `Please describe the issue.

Tool:

Browser:

Device:

Steps to reproduce:

Expected result:

Actual result:

Attachment (optional):`);

export const featureRequestEmailLink = emailLink('Feature Request - PDF by ib', `Feature title:

Description:

Why would this feature be useful?`);

export const SITE_NAME = 'PDF by ib';
export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || 'https://pdfbyib.com');
export const SUPPORT_EMAIL = 'pdfeditorbyib@gmail.com';
export const SOCIAL_IMAGE_PATH = '/logo-512.png';
export const LEGAL_LAST_UPDATED = 'July 29, 2026';
export const GOVERNING_LAW = import.meta.env.VITE_GOVERNING_LAW?.trim() || 'a jurisdiction to be specified before commercial launch';

function normalizeSiteUrl(value: string) {
    const safeValue = value.trim().replace(/\/+$/, '');
    if (import.meta.env.PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(safeValue)) {
        return 'https://pdfbyib.com';
    }
    return safeValue || 'https://pdfbyib.com';
}

function emailLink(subject: string, body = '') {
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
}

export const externalLinks = {
    contact: emailLink('PDF by ib – Support Request', 'Please describe how we can help:\n\nTool:\nBrowser:\nDevice:\n'),
    bugReport: import.meta.env.VITE_BUG_REPORT_URL?.trim() || emailLink('PDF by ib – Bug Report', 'Tool:\nBrowser:\nDevice:\nSteps to reproduce:\nExpected result:\nActual result:\n'),
    featureRequest: import.meta.env.VITE_FEATURE_REQUEST_URL?.trim() || emailLink('PDF by ib – Feature Request', 'Feature title:\n\nWhat problem would this solve?\n'),
    github: import.meta.env.VITE_GITHUB_URL?.trim() || '',
} as const;

export function absoluteSiteUrl(path = '/') {
    const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
    return `${SITE_URL}${normalizedPath}`;
}

export function isExternalHttpLink(value: string) {
    return /^https?:\/\//i.test(value);
}

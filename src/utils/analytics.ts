export type AnalyticsEventName =
    | 'page_view'
    | 'tool_opened'
    | 'tool_processing_started'
    | 'tool_processing_succeeded'
    | 'tool_processing_failed'
    | 'download_started'
    | 'coming_soon_clicked'
    | 'blog_viewed'
    | 'blog_article_opened'
    | 'blog_search_used'
    | 'blog_category_filtered'
    | 'blog_tool_cta_clicked'
    | 'blog_related_article_clicked'
    | 'protect_pdf_opened'
    | 'protect_pdf_started'
    | 'protect_pdf_succeeded'
    | 'protect_pdf_failed'
    | 'protected_pdf_downloaded'
    | 'unlock_pdf_opened'
    | 'unlock_pdf_started'
    | 'unlock_pdf_succeeded'
    | 'unlock_pdf_failed'
    | 'unlocked_pdf_downloaded'
    | 'image_resizer_opened'
    | 'image_resizer_started'
    | 'image_resizer_succeeded'
    | 'image_resizer_failed'
    | 'resized_image_downloaded';

type AnalyticsProperties = {
    tool?: string;
    path?: string;
    status?: 'available' | 'beta' | 'coming-soon';
    reason?: 'cancelled' | 'invalid-file' | 'processing-error' | 'download-error';
    article_slug?: string;
    category?: string;
    tool_slug?: string;
    result_count?: number;
};

const enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const provider = import.meta.env.VITE_ANALYTICS_PROVIDER?.trim().toLowerCase();
const analyticsId = import.meta.env.VITE_ANALYTICS_ID?.trim();
const allowedPropertyKeys = new Set<keyof AnalyticsProperties>(['tool', 'path', 'status', 'reason', 'article_slug', 'category', 'tool_slug', 'result_count']);
const safeIdentifier = /^[a-z0-9][a-z0-9/-]{0,79}$/;
const safePath = /^\/[a-z0-9/-]{0,79}$/;

export function analyticsEnabled() {
    return enabled && provider === 'plausible' && Boolean(analyticsId);
}

export function sanitizeAnalyticsProperties(properties: Record<string, unknown>) {
    return Object.fromEntries(Object.entries(properties).filter(([key, value]) => {
        if (!allowedPropertyKeys.has(key as keyof AnalyticsProperties)) return false;
        if (key === 'result_count') return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10000;
        if (typeof value !== 'string') return false;
        return key === 'path' ? safePath.test(value) : safeIdentifier.test(value);
    }));
}

export function trackEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
    if (!analyticsEnabled()) return;
    const safeProperties = sanitizeAnalyticsProperties(properties);
    const payload = JSON.stringify({
        name: name === 'page_view' ? 'pageview' : name,
        url: window.location.origin + window.location.pathname,
        domain: analyticsId,
        props: safeProperties,
    });
    if (navigator.sendBeacon) {
        navigator.sendBeacon('https://plausible.io/api/event', new Blob([payload], { type: 'application/json' }));
        return;
    }
    void fetch('https://plausible.io/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
}

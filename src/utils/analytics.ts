export type AnalyticsEventName =
    | 'page_view'
    | 'tool_opened'
    | 'tool_processing_started'
    | 'tool_processing_succeeded'
    | 'tool_processing_failed'
    | 'download_started'
    | 'coming_soon_clicked';

type AnalyticsProperties = {
    tool?: string;
    path?: string;
    status?: 'available' | 'beta' | 'coming-soon';
    reason?: 'cancelled' | 'invalid-file' | 'processing-error' | 'download-error';
};

const enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const provider = import.meta.env.VITE_ANALYTICS_PROVIDER?.trim().toLowerCase();
const analyticsId = import.meta.env.VITE_ANALYTICS_ID?.trim();
const allowedPropertyKeys = new Set<keyof AnalyticsProperties>(['tool', 'path', 'status', 'reason']);
const safeIdentifier = /^[a-z0-9][a-z0-9/-]{0,79}$/;
const safePath = /^\/[a-z0-9/-]{0,79}$/;

export function analyticsEnabled() {
    return enabled && provider === 'plausible' && Boolean(analyticsId);
}

export function sanitizeAnalyticsProperties(properties: Record<string, unknown>) {
    return Object.fromEntries(Object.entries(properties).filter(([key, value]) => {
        if (!allowedPropertyKeys.has(key as keyof AnalyticsProperties) || typeof value !== 'string') return false;
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

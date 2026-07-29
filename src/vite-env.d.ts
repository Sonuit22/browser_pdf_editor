/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SITE_URL?: string;
    readonly VITE_GITHUB_URL?: string;
    readonly VITE_BUG_REPORT_URL?: string;
    readonly VITE_FEATURE_REQUEST_URL?: string;
    readonly VITE_ANALYTICS_ENABLED?: string;
    readonly VITE_ANALYTICS_PROVIDER?: string;
    readonly VITE_ANALYTICS_ID?: string;
    readonly VITE_GOVERNING_LAW?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

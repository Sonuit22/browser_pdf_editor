import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { faqEntries } from '../pages/faqContent';
import { absoluteSiteUrl, SITE_NAME, SOCIAL_IMAGE_PATH } from '../config/site';
import { getSeoForPath } from '../config/seo';
import { findToolByRoute } from '../config/toolRegistry';
import { trackEvent } from '../utils/analytics';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.append(element);
    }
    element.content = content;
}

export function SeoManager() {
    const { pathname } = useLocation();

    useEffect(() => {
        const seo = getSeoForPath(pathname);
        const canonical = absoluteSiteUrl(pathname);
        const image = absoluteSiteUrl(SOCIAL_IMAGE_PATH);
        document.title = seo.title;
        setMeta('meta[name="description"]', 'name', 'description', seo.description);
        setMeta('meta[name="robots"]', 'name', 'robots', seo.index === false ? 'noindex, nofollow' : 'index, follow');
        setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
        setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
        setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
        setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
        setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
        setMeta('meta[property="og:image"]', 'property', 'og:image', image);
        setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
        setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
        setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
        setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
        let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (seo.canonical === false) {
            canonicalLink?.remove();
        } else {
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.append(canonicalLink);
            }
            canonicalLink.href = canonical;
        }
        document.head.querySelectorAll('script[data-route-schema]').forEach((element) => element.remove());
        const structuredData = seo.structuredData === 'faq'
            ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntries.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }
            : seo.structuredData === 'website'
                ? [
                    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: absoluteSiteUrl('/') },
                    { '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE_NAME, url: absoluteSiteUrl('/'), applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any modern browser', description: seo.description, browserRequirements: 'Requires JavaScript and a modern browser.' },
                ]
                : null;
        if (structuredData) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.dataset.routeSchema = 'true';
            script.text = JSON.stringify(structuredData);
            document.head.append(script);
        }
        trackEvent('page_view', { path: pathname });
        const tool = findToolByRoute(pathname);
        if (tool) {
            trackEvent('tool_opened', { tool: tool.id, status: tool.status });
            if (tool.status === 'coming-soon') trackEvent('coming_soon_clicked', { tool: tool.id, status: tool.status });
        }
    }, [pathname]);

    return null;
}

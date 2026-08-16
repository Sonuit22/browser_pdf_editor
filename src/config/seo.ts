import { findToolByRoute } from './toolRegistry';
import { getArticleMetadata } from '../blog/content';
import type { BlogArticleMetadata } from '../blog/types';

export type SeoDefinition = {
    title: string;
    description: string;
    index?: boolean;
    canonical?: boolean;
    structuredData?: 'website' | 'faq' | 'blog';
    article?: BlogArticleMetadata;
};

export const defaultSeo: SeoDefinition = {
    title: 'PDF by ib | Free Online PDF Editor, Merge, Split, Sign & Compress PDFs',
    description: 'Explore PDF by ib for browser-based PDF editing, signing, merging, splitting, organizing, and conversion with supported files processed on your device.',
    structuredData: 'website',
};

const routeSeo: Record<string, SeoDefinition> = {
    '/': {
        title: 'PDF by ib | Free Online PDF Editor, Merge, Split, Sign & Compress PDFs',
        description: 'Use PDF by ib to edit, merge, split, sign, organize, and convert PDFs with browser-based processing that keeps supported files on your device.',
        structuredData: 'website',
    },
    '/all-tools': { title: 'All PDF Tools – PDF by ib', description: 'Browse all PDF by ib tools for editing, merging, splitting, signing, organizing, and conversion, with clear Available, Beta, and Coming Soon labels.' },
    '/merge-pdf': { title: 'Merge PDF Online Free – PDF by ib', description: 'Merge PDF files with PDF by ib, arrange documents in the correct order, and download one combined PDF using local browser-based processing today.' },
    '/split-pdf': { title: 'Split PDF Online Free – PDF by ib', description: 'Split PDF pages by ranges or selections with PDF by ib, then download separate files through private, browser-based processing on your device.' },
    '/remove-pages': { title: 'Remove PDF Pages – PDF by ib', description: 'Remove unwanted PDF pages with PDF by ib, review the pages you will keep, and create a new document through local browser-based processing safely.' },
    '/extract-pages': { title: 'Extract PDF Pages – PDF by ib', description: 'Extract selected PDF pages into a new document with PDF by ib using browser-based processing that keeps supported files on your device privately.' },
    '/organize-pdf': { title: 'Organize PDF Pages – PDF by ib', description: 'Organize PDF pages with PDF by ib by reordering, rotating, duplicating, or removing pages through local browser-based processing on your device.' },
    '/compress-pdf': { title: 'Compress PDF Online – PDF by ib', description: 'Compress image-heavy PDF files locally in your browser with adjustable DPI, image scale and quality, then preview the actual size before downloading.', index: true },
    '/jpg-to-pdf': { title: 'JPG to PDF Converter – PDF by ib', description: 'Convert JPG and supported images to PDF with PDF by ib, arrange image order, choose page settings, and process files locally in your browser.' },
    '/pdf-to-jpg': { title: 'PDF to JPG Converter – PDF by ib', description: 'Convert selected PDF pages to JPG images with PDF by ib using local browser-based rendering, quality options, and device-aware page limits safely.' },
    '/word-to-pdf': { title: 'Word to PDF Beta – PDF by ib', description: 'Convert DOCX files to PDF with PDF by ib through browser-based Beta processing, with clear limits for complex layouts, fonts, and pagination.' },
    '/pdf-to-word': { title: 'PDF to Word Beta – PDF by ib', description: 'Convert PDF text to an editable DOCX with PDF by ib using browser-based Beta processing, while reviewing limits for tables, columns, and images.' },
    '/pdf-to-ppt': { title: 'PDF to PowerPoint Beta – PDF by ib', description: 'Convert PDF pages to PowerPoint slides with PDF by ib using local browser-based Beta processing that places each page as a slide image locally.' },
    '/ppt-to-pdf': { title: 'PPT to PDF Converter – PDF by ib', description: 'Convert PPTX slides to PDF with PDF by ib using local browser-based Beta processing, slide previews, selection, and clear limits for advanced content.', index: true },
    '/protect-pdf': { title: 'Protect PDF with Password – PDF by ib', description: 'Protect PDF files with a password using PDF by ib and local browser-based AES encryption. Your document and password stay entirely on your device.', index: true },
    '/unlock-pdf': { title: 'Unlock PDF Online | PDF by ib', description: 'Unlock a password-protected PDF with the correct password using PDF by ib. Decryption and verified export happen locally inside your browser.', index: true },
    '/translate-pdf': { title: 'Translate PDF Online | PDF by ib', description: 'Review the PDF by ib Translate PDF status and privacy requirements. Translation is coming soon while a reliable browser-safe workflow is developed.', index: false },
    '/fill-pdf-form': { title: 'PDF Form Filler Online | PDF by ib', description: 'Fill PDF forms, add text, dates, and checkmarks with PDF by ib using local browser processing that keeps supported documents on your device.', index: true },
    '/watermark-pdf': { title: 'Add Watermark to PDF Online | PDF by ib', description: 'Add a text or image watermark to selected PDF pages with PDF by ib, customize its position and appearance, and process everything in your browser.', index: true },
    '/image-resizer': { title: 'Image Resizer Online – PDF by ib', description: 'Resize JPG, PNG, and WebP images by dimensions, percentage, or target file size with PDF by ib using private, browser-based processing on your device.', index: true },
    '/sign-pdf': { title: 'Sign PDF Online – PDF by ib', description: 'Sign PDF documents with PDF by ib by adding a drawn, typed, or uploaded signature through local browser-based Beta processing on your device.' },
    '/edit-pdf': { title: 'Edit PDF Online – PDF by ib', description: 'Edit PDF files with PDF by ib by adding text, images, shapes, drawings, and highlights through local browser-based Beta processing on your device.' },
    '/faq': { title: 'Frequently Asked Questions – PDF by ib', description: 'Read PDF by ib answers about browser-based PDF processing, local file privacy, supported browsers, practical limits, Beta tools, and troubleshooting.', structuredData: 'faq' },
    '/privacy': { title: 'Privacy Policy – PDF by ib', description: 'Read the PDF by ib Privacy Policy covering local browser-based file processing, hosting logs, optional analytics, support messages, and data choices.' },
    '/terms': { title: 'Terms of Use – PDF by ib', description: 'Review the PDF by ib Terms of Use for responsible tool usage, browser limitations, Beta features, generated files, availability, and warranty terms.' },
    '/about': { title: 'About PDF by ib', description: 'Learn about PDF by ib and its practical browser-based tools for editing, organizing, signing, merging, splitting, and converting supported PDF files.' },
    '/contact': { title: 'Contact and Support – PDF by ib', description: 'Contact PDF by ib for support, report a browser-based PDF tool issue, or request a feature using a structured email with safe diagnostic details.' },
    '/support': { title: 'Support – PDF by ib', description: 'Get PDF by ib support for browser-based PDF tools, review troubleshooting guidance, and learn which safe technical details help resolve an issue.' },
    '/blog': {
        title: 'PDF Guides and Tutorials – PDF by ib',
        description: 'Explore the PDF by ib Learning Center for practical browser-based guides to merge, split, sign, edit, organize, compress, and convert PDF files.',
        structuredData: 'blog',
    },
};

export function getSeoForPath(pathname: string): SeoDefinition {
    const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
    const definition = routeSeo[normalized];
    if (definition) return definition;
    if (normalized.startsWith('/blog/')) {
        const article = getArticleMetadata(normalized.slice('/blog/'.length));
        if (article) return {
            title: `${article.title} – PDF by ib`,
            description: article.description,
            article,
        };
    }
    const tool = findToolByRoute(normalized);
    if (tool) return {
        title: `${tool.title}${tool.status === 'beta' ? ' Beta' : ''} – PDF by ib`,
        description: `${tool.description}${tool.limitations[0] ? ` ${tool.limitations[0]}` : ''}`,
        index: tool.status !== 'coming-soon',
    };
    return {
        title: 'Page Not Found – PDF by ib',
        description: 'The requested PDF by ib page could not be found. Return to the browser-based PDF tools, browse the Learning Center, or choose another valid page.',
        index: false,
        canonical: false,
    };
}

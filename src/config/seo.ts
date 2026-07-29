import { findToolByRoute } from './toolRegistry';

export type SeoDefinition = {
    title: string;
    description: string;
    index?: boolean;
    canonical?: boolean;
    structuredData?: 'website' | 'faq';
};

export const defaultSeo: SeoDefinition = {
    title: 'PDF by ib – Free Browser PDF Tools',
    description: 'Free browser-based PDF tools to edit, sign, merge, split, compress, organize, protect, and convert PDF files. Your files stay on your device and are not uploaded to a server.',
    structuredData: 'website',
};

const routeSeo: Record<string, SeoDefinition> = {
    '/': {
        title: 'PDF by ib – Free Browser PDF Tools',
        description: 'Free browser-based PDF tools for editing, signing, merging, splitting, compressing, organizing, protecting, and converting PDFs privately on your device.',
        structuredData: 'website',
    },
    '/all-tools': { title: 'All PDF Tools – PDF by ib', description: 'Browse the available, Beta, and Coming Soon PDF tools in PDF by ib, with clear status and browser-processing information.' },
    '/merge-pdf': { title: 'Merge PDF Online Free – PDF by ib', description: 'Combine multiple PDF files in your browser. Reorder documents and download the merged PDF without uploading files to a server.' },
    '/split-pdf': { title: 'Split PDF Online Free – PDF by ib', description: 'Split PDF pages by range or selection directly in your browser with private client-side processing.' },
    '/remove-pages': { title: 'Remove PDF Pages – PDF by ib', description: 'Select and remove unwanted PDF pages in your browser, then download a new PDF containing the pages you kept.' },
    '/extract-pages': { title: 'Extract PDF Pages – PDF by ib', description: 'Select PDF pages and export them as a separate document using browser-based processing.' },
    '/organize-pdf': { title: 'Organize PDF Pages – PDF by ib', description: 'Reorder, rotate, duplicate, or remove PDF pages in your browser. Touch reordering behavior may vary by browser.' },
    '/compress-pdf': { title: 'Compress PDF Online – PDF by ib', description: 'PDF compression is planned for PDF by ib but is not yet available for production use.', index: false },
    '/jpg-to-pdf': { title: 'JPG to PDF Converter – PDF by ib', description: 'Convert JPG and other supported images into a PDF in your browser. Large batches depend on available device memory.' },
    '/pdf-to-jpg': { title: 'PDF to JPG Converter – PDF by ib', description: 'Export selected PDF pages as JPG images in your browser. Large documents may require smaller page selections.' },
    '/word-to-pdf': { title: 'Word to PDF Beta – PDF by ib', description: 'Convert DOCX content to PDF in your browser. This Beta may change complex formatting and pagination.' },
    '/pdf-to-word': { title: 'PDF to Word Beta – PDF by ib', description: 'Extract editable text from PDF into DOCX. This Beta may not preserve complex layouts, tables, or images.' },
    '/pdf-to-ppt': { title: 'PDF to PowerPoint Beta – PDF by ib', description: 'Place PDF pages as images on PowerPoint slides. Text and page elements are not individually editable.' },
    '/ppt-to-pdf': { title: 'PPT to PDF – PDF by ib', description: 'PPT to PDF conversion is planned but is not yet available for production use.', index: false },
    '/protect-pdf': { title: 'Protect PDF – PDF by ib', description: 'Password protection is planned but is not yet supported by the current browser engine.', index: false },
    '/sign-pdf': { title: 'Sign PDF Online – PDF by ib', description: 'Add a drawn, typed, or uploaded signature to a PDF in your browser. Complex touch placement may vary across browsers.' },
    '/edit-pdf': { title: 'Edit PDF Online – PDF by ib', description: 'Add text, images, shapes, drawings, and highlights to PDFs locally in your browser. Advanced edits are currently Beta.' },
    '/faq': { title: 'Frequently Asked Questions – PDF by ib', description: 'Answers about browser-based PDF processing, privacy, supported browsers, file limits, and Beta tools.', structuredData: 'faq' },
    '/privacy': { title: 'Privacy Policy – PDF by ib', description: 'Learn how PDF by ib handles browser-processed files, hosting logs, optional analytics, and support communications.' },
    '/terms': { title: 'Terms of Use – PDF by ib', description: 'Read the terms covering responsible use, browser limitations, Beta features, generated files, and warranties.' },
    '/about': { title: 'About PDF by ib', description: 'Learn why PDF by ib provides practical browser-based tools for common PDF editing, organization, and conversion tasks.' },
    '/contact': { title: 'Contact and Support – PDF by ib', description: 'Contact PDF by ib support, report a bug, or request a feature using your default email application.' },
    '/support': { title: 'Support – PDF by ib', description: 'Get help with PDF by ib and learn what information to include when reporting an issue.' },
};

export function getSeoForPath(pathname: string): SeoDefinition {
    const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
    const definition = routeSeo[normalized];
    if (definition) return definition;
    const tool = findToolByRoute(normalized);
    if (tool) return {
        title: `${tool.title}${tool.status === 'beta' ? ' Beta' : ''} – PDF by ib`,
        description: `${tool.description}${tool.limitations[0] ? ` ${tool.limitations[0]}` : ''}`,
        index: tool.status !== 'coming-soon',
    };
    return {
        title: 'Page Not Found – PDF by ib',
        description: 'The requested PDF by ib page could not be found. Return home or browse the available PDF tools.',
        index: false,
        canonical: false,
    };
}

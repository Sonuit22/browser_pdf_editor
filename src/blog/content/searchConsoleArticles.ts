import type { BlogArticle, BlogSection } from '../types';

const shared = {
    publishedDate: '2026-08-10',
    updatedDate: '2026-08-10',
    author: 'PDF by ib',
    featured: false,
    draft: false,
    readingTime: 4,
    image: '/logo-512.png',
} as const;

function privacySection(): BlogSection {
    return {
        id: 'privacy',
        heading: 'Privacy',
        paragraphs: [
            'For supported workflows, PDF by ib reads and processes the selected file locally in your browser. The PDF is not uploaded to a PDF by ib processing server, so your file stays on your device. Your browser, operating system, extensions, downloads folder, and network environment remain outside the application and may keep their own history.',
        ],
    };
}

export const searchConsoleArticles: BlogArticle[] = [
    {
        ...shared,
        title: 'How to Add a Signature to a PDF on Mobile',
        slug: 'sign-pdf-on-mobile',
        description: 'Learn how to sign a PDF on your phone, place and resize the signature accurately, add supporting marks, and verify the downloaded document carefully.',
        category: 'Signing',
        tags: ['Sign PDF', 'Mobile PDF', 'Electronic Signature'],
        relatedTool: 'Sign PDF',
        relatedToolPath: '/sign-pdf',
        imageAlt: 'PDF by ib guide to signing a PDF on a mobile phone',
        canonicalUrl: '/blog/sign-pdf-on-mobile',
        primaryKeyword: 'sign PDF on mobile',
        secondaryKeywords: ['sign PDF online', 'online signature PDF', 'sign PDF on phone', 'mobile PDF signature'],
        introduction: [
            'You can sign a PDF on a phone by opening the document in Sign PDF, adding a drawn, typed, or uploaded signature, and exporting a new copy. Zoom before placing the mark so it does not cover labels or nearby text.',
        ],
        sections: [
            {
                id: 'how-to-sign-pdf-on-mobile',
                heading: 'How to sign a PDF on mobile',
                steps: [
                    { title: 'Open the signing tool', description: 'Open Sign PDF in a current mobile browser, choose the intended PDF, and wait until the page and thumbnails finish loading. Confirm the filename before making any changes.' },
                    { title: 'Create your signature', description: 'Choose Add Signature, then draw with a finger or stylus, type your name, or select an authorized signature image. Clear and repeat the mark if it is difficult to read.' },
                    { title: 'Place and resize it', description: 'Navigate to the correct page, insert the signature, and drag it into the requested box. Use the visible resize handles and keep the entire mark inside the page boundary.' },
                    { title: 'Export and inspect', description: 'Add a date, initials, or checkmark only when requested. Export the PDF, open the downloaded copy, and confirm every mark appears on the correct page.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'The mobile workspace keeps page controls, signing actions, undo, redo, and Export reachable without forcing the desktop layout onto a narrow screen. The Pages drawer lets you move through a longer document without permanently reducing the page width.',
                    'Sign PDF creates visible electronic marks. It does not create a certificate-based digital signature or prove identity. Confirm that the recipient accepts this kind of signature before submitting a contract, regulated form, or official filing.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Can I draw a signature with my finger?', answer: 'Yes. A stylus may produce a cleaner mark, but a finger works. Clear the drawing and try again if the result is not readable.' },
            { question: 'Can I move the signature after adding it?', answer: 'Yes. Select the signature, move it to the correct location, and use the resize handles before exporting.' },
            { question: 'Is an online signature the same as a digital signature?', answer: 'Not necessarily. A visible electronic signature does not automatically include a certificate, identity verification, or cryptographic validation.' },
            { question: 'What should I check after downloading?', answer: 'Reopen the PDF and check the document version, signature page, placement, size, date, and any required initials or checkmarks.' },
        ],
        relatedSlugs: ['how-to-sign-a-pdf-online', 'how-to-add-a-signature-to-a-pdf-without-printing'],
        ctaLabel: 'Sign a PDF on mobile',
    },
    {
        ...shared,
        title: 'How to Add a Signature and Date to a PDF',
        slug: 'add-signature-and-date-to-pdf',
        description: 'Add a signature and date to a PDF in the correct places, adjust both marks carefully, and verify the finished browser-processed document clearly.',
        category: 'Signing',
        tags: ['Sign PDF', 'PDF Date', 'Electronic Signature'],
        relatedTool: 'Sign PDF',
        relatedToolPath: '/sign-pdf',
        imageAlt: 'PDF by ib guide to adding a signature and date to a PDF',
        canonicalUrl: '/blog/add-signature-and-date-to-pdf',
        primaryKeyword: 'add signature and date to PDF',
        secondaryKeywords: ['online signature PDF', 'date a PDF', 'sign PDF online', 'electronic signature'],
        introduction: [
            'Add the signature first, place it on the requested line, and then insert the date in its separate field. Treat the two items as independent objects so each can be moved and resized without disturbing the other.',
        ],
        sections: [
            {
                id: 'how-to-add-signature-and-date',
                heading: 'How to add a signature and date to a PDF',
                steps: [
                    { title: 'Review the form', description: 'Open the complete PDF and identify every signature, date, and initials field. Check whether the form requests the signing date, submission date, or another date format.' },
                    { title: 'Add the signature', description: 'Open Add Signature and draw, type, or select an authorized image. Insert it once, then move and resize it until it sits clearly on the signature line.' },
                    { title: 'Insert the date', description: 'Choose Add Date and place the generated date in the matching field. Make sure it does not overlap the signature, field label, or other document text.' },
                    { title: 'Export a checked copy', description: 'Review all signed pages, export the document, and reopen the download. Confirm that the date is correct and both objects remain readable at normal zoom.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'Sign PDF provides separate controls for signatures, initials, dates, and checkmarks. Undo and redo are useful when an object is inserted on the wrong page, while selection handles let you correct placement before creating the final file.',
                    'A visible signature and date may be suitable for everyday acknowledgements and forms, but acceptance depends on the recipient and applicable requirements. Some workflows require a certified digital signature, identity verification, or a dedicated signing platform.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Should the date go beside or below the signature?', answer: 'Follow the form label. Do not place the date near a signature line unless the document clearly associates that field with the signature.' },
            { question: 'Can I change the date after inserting it?', answer: 'You can remove or undo an incorrect date and add it again before export. Always inspect the downloaded document.' },
            { question: 'Can I add more than one signature and date?', answer: 'You can add multiple visible objects, but make sure each belongs to the correct person, page, and field.' },
            { question: 'Does adding a date create a digital certificate?', answer: 'No. It adds a visible date mark and does not create certificate-backed proof of signing time or identity.' },
        ],
        relatedSlugs: ['sign-pdf-on-mobile', 'how-to-sign-a-pdf-online', 'how-to-add-a-signature-to-a-pdf-without-printing'],
        ctaLabel: 'Add a signature and date',
    },
    {
        ...shared,
        title: 'How to Add Initials to a PDF Online',
        slug: 'add-initials-to-pdf-online',
        description: 'Learn how to add initials to PDF pages, position repeated marks accurately, distinguish initials from signatures, and verify the final file.',
        category: 'Signing',
        tags: ['Sign PDF', 'PDF Initials', 'Online Signature'],
        relatedTool: 'Sign PDF',
        relatedToolPath: '/sign-pdf',
        imageAlt: 'PDF by ib guide to adding initials to PDF pages',
        canonicalUrl: '/blog/add-initials-to-pdf-online',
        primaryKeyword: 'add initials to PDF online',
        secondaryKeywords: ['initial PDF pages', 'online signature PDF', 'sign PDF online', 'PDF initials'],
        introduction: [
            'Initials are short visible marks commonly requested beside changes, clauses, or page acknowledgements. Add them only where the document asks, keep them consistent, and inspect every page before exporting.',
        ],
        sections: [
            {
                id: 'how-to-add-initials',
                heading: 'How to add initials to a PDF online',
                steps: [
                    { title: 'Find every initials field', description: 'Review the whole document and note the relevant page numbers. Similar boxes may have different purposes, so read the nearby label before adding a mark.' },
                    { title: 'Create the initials', description: 'Choose Add Initials, then draw, type, or select an authorized image. Use a compact, readable mark that fits the smallest requested field.' },
                    { title: 'Place each mark carefully', description: 'Insert the initials on the correct page and move them into the field. Repeat only where required, checking page numbers as you work through the document.' },
                    { title: 'Review and export', description: 'Zoom out to confirm the overall page, then zoom in to inspect placement. Export the PDF and compare the download with your field checklist.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'The Sign PDF workspace treats initials as movable, resizable objects and provides page thumbnails for navigating multi-page agreements. This is more reliable than drawing directly over a tiny field without a chance to correct the mark on every affected page.',
                    'Initials are not interchangeable with a full signature unless the document or recipient says they are. They are also visible electronic marks rather than certificate-backed digital signatures, so confirm the recipient’s instructions before final export.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Do I need initials on every page?', answer: 'Only if the document or recipient requires them. Do not add initials to unlabeled areas simply because there is empty space.' },
            { question: 'Can I reuse the same initials?', answer: 'You may insert the same authorized mark more than once, but verify every page and placement before exporting.' },
            { question: 'Are typed initials acceptable?', answer: 'Acceptance depends on the document and recipient. Ask when the instructions require handwritten or certificate-backed signing.' },
            { question: 'Can initials replace my signature?', answer: 'Not automatically. A signature field may require a full signature even when other pages ask for initials.' },
        ],
        relatedSlugs: ['add-signature-and-date-to-pdf', 'how-to-sign-a-pdf-online', 'sign-pdf-on-mobile'],
        ctaLabel: 'Add initials to a PDF',
    },
    {
        ...shared,
        title: 'How to Remove PDF Pages on Mobile',
        slug: 'remove-pdf-pages-on-mobile',
        description: 'Remove unwanted PDF pages on your phone or tablet, confirm the remaining order, avoid numbering mistakes, and download a checked copy to your device.',
        category: 'Page Management',
        tags: ['Remove Pages', 'Mobile PDF', 'PDF Pages'],
        relatedTool: 'Remove Pages',
        relatedToolPath: '/remove-pages',
        imageAlt: 'PDF by ib guide to removing PDF pages on a mobile device',
        canonicalUrl: '/blog/remove-pdf-pages-on-mobile',
        primaryKeyword: 'remove PDF pages on mobile',
        secondaryKeywords: ['how to remove pages from a PDF', 'delete PDF pages on phone', 'remove unwanted PDF pages', 'mobile PDF editor'],
        introduction: [
            'To remove pages from a PDF on mobile, load the file, select the exact page thumbnails to exclude, and export a new PDF containing the remaining pages. Keep the original until you have checked the download.',
        ],
        sections: [
            {
                id: 'how-to-remove-pages-on-mobile',
                heading: 'How to remove PDF pages on mobile',
                steps: [
                    { title: 'Open the complete PDF', description: 'Choose the file in Remove Pages and wait for every thumbnail to load. Stop if the displayed page count does not match the source document.' },
                    { title: 'Match page numbers carefully', description: 'Compare thumbnail positions with any numbers printed inside the document. Covers and unnumbered pages often make those two numbering systems different.' },
                    { title: 'Select unwanted pages', description: 'Mark only the pages that should be excluded. Review the selection twice and make sure at least one required page remains in the output.' },
                    { title: 'Export and verify', description: 'Create the new PDF, open the download, and inspect the pages before and after every removed location. Confirm the final page and total count.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'The responsive page workspace presents thumbnails in a mobile-friendly grid without requiring a permanent desktop sidebar. Page selection, output count, and the primary action remain available at narrow widths.',
                    'Removing a page creates a separate PDF and does not delete anything from the original file on your device. It is also not redaction: if only part of a page is sensitive, use an approved redaction workflow instead of covering text with a shape.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Can I restore a page after exporting?', answer: 'The exported copy does not contain removed pages, but the original remains unchanged so you can repeat the task with a different selection.' },
            { question: 'Why do the tool page numbers differ from printed numbers?', answer: 'The browser counts every PDF page, including covers and blank sheets. Printed numbering may begin later.' },
            { question: 'Can I remove every page?', answer: 'No. A valid PDF output must retain at least one page.' },
            { question: 'Does deleting a page remove hidden information elsewhere?', answer: 'Not necessarily. Metadata, attachments, form values, and content on retained pages require separate review.' },
        ],
        relatedSlugs: ['how-to-remove-pages-from-a-pdf', 'how-to-organize-pdf-pages', 'how-to-split-pdf-pages-online'],
        ctaLabel: 'Remove PDF pages on mobile',
    },
    {
        ...shared,
        title: 'How to Save One PDF Page as a JPG on Mobile',
        slug: 'save-pdf-page-as-jpg-on-mobile',
        description: 'Save one PDF page as a JPG on your phone, choose the correct page and image quality, then inspect the locally rendered result before sharing.',
        category: 'Conversion',
        tags: ['PDF to JPG', 'Mobile PDF', 'PDF Image'],
        relatedTool: 'PDF to JPG',
        relatedToolPath: '/pdf-to-jpg',
        imageAlt: 'PDF by ib guide to saving one PDF page as JPG on mobile',
        canonicalUrl: '/blog/save-pdf-page-as-jpg-on-mobile',
        primaryKeyword: 'save PDF page as JPG on mobile',
        secondaryKeywords: ['convert PDF to image', 'extract PDF as image', 'export PDF as JPEG', 'PDF page to JPG'],
        introduction: [
            'If you need one page rather than the entire document, select only that PDF page and export it as a JPG. The result is a normal image, so links, selectable text, form controls, and PDF accessibility structure are not preserved.',
        ],
        sections: [
            {
                id: 'how-to-save-one-page-as-jpg',
                heading: 'How to save one PDF page as a JPG on mobile',
                steps: [
                    { title: 'Open PDF to JPG', description: 'Choose the source PDF and wait for the page previews to appear. Confirm that the file and page count match the document you intended to use.' },
                    { title: 'Select one page', description: 'Use the thumbnail and displayed page position to choose the exact page. Remember that a printed page number may differ when the PDF includes a cover.' },
                    { title: 'Choose image quality', description: 'Use a higher rendering and JPG quality for small text, diagrams, or forms. A moderate setting is usually enough for a screen preview or message attachment.' },
                    { title: 'Convert and inspect', description: 'Create the JPG, open the downloaded image, and check its dimensions, orientation, color, text clarity, and cropped edges before sharing it.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'PDF to JPG lets you select the pages you need instead of rendering the entire document. That saves time, memory, storage, and unnecessary downloads on a phone or tablet.',
                    'The converter is useful for noninteractive previews and image-based systems. Keep the PDF when recipients need searchable text, selectable content, links, forms, high-quality printing, or multiple pages in one file.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Is JPG the same as JPEG?', answer: 'Yes. JPG and JPEG refer to the same common image format; the shorter extension came from older filename limits.' },
            { question: 'Will the JPG keep selectable text?', answer: 'No. The page is rendered as pixels, so text is no longer selectable or searchable without separate OCR.' },
            { question: 'Why does small text look blurry?', answer: 'The rendering scale or JPG quality may be too low. Convert again with a higher setting and avoid repeatedly resaving the JPG.' },
            { question: 'Can I share only one page from a confidential PDF?', answer: 'You can select one page, but inspect it for visible sensitive information. Conversion does not automatically redact content.' },
        ],
        relatedSlugs: ['how-to-convert-pdf-to-jpg', 'jpg-vs-png-for-pdf-pages', 'pdf-to-jpg-image-quality'],
        ctaLabel: 'Save a PDF page as JPG',
    },
    {
        ...shared,
        title: 'JPG vs PNG for PDF Pages: Which Is Better?',
        slug: 'jpg-vs-png-for-pdf-pages',
        description: 'Compare JPG and PNG for exported PDF pages, including text clarity, photographs, transparency, file size, sharing, and repeated editing quality.',
        category: 'Conversion',
        tags: ['PDF to JPG', 'JPG', 'PNG'],
        relatedTool: 'PDF to JPG',
        relatedToolPath: '/pdf-to-jpg',
        imageAlt: 'PDF by ib comparison of JPG and PNG for PDF pages',
        canonicalUrl: '/blog/jpg-vs-png-for-pdf-pages',
        primaryKeyword: 'JPG vs PNG for PDF pages',
        secondaryKeywords: ['export PDF as JPEG', 'convert PDF to image', 'PDF page image format', 'JPG image quality'],
        introduction: [
            'JPG is usually better for photographs and smaller shareable files, while PNG is often better for screenshots, flat graphics, and crisp text edges. The right choice depends on the page content and where the image will be used.',
        ],
        sections: [
            {
                id: 'how-to-choose-jpg-or-png',
                heading: 'How to choose JPG or PNG for a PDF page',
                steps: [
                    { title: 'Inspect the page content', description: 'Choose JPG for photographic pages or scans with many colors. Consider PNG when the page contains sharp interface graphics, line art, or large flat-color areas.' },
                    { title: 'Check the destination', description: 'Web forms and messaging apps commonly accept JPG and may impose strict size limits. Design or archival workflows may prefer PNG when lossless pixels matter more than storage.' },
                    { title: 'Estimate the practical size', description: 'JPG compression can make photo-heavy pages much smaller. PNG may be compact for simple graphics but very large for full-page photographs or detailed scans.' },
                    { title: 'Test one representative page', description: 'Export a page, view it at its expected size, and inspect fine text, lines, gradients, photographs, and color. Keep the original PDF for comparison.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'PDF by ib currently exports PDF pages through its PDF to JPG tool. It offers rendering and JPG quality choices so you can balance readability and file size without claiming a PNG export option that the site does not provide.',
                    'Use the PDF itself when page structure, searchable text, links, forms, vector scaling, or accessibility information matters. Both JPG and PNG flatten the page into an image and remove those interactive PDF features.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Is PNG always sharper than JPG?', answer: 'PNG avoids lossy compression, but sharpness also depends on rendering resolution. A high-resolution JPG can look better than a low-resolution PNG.' },
            { question: 'Which format is smaller?', answer: 'JPG is usually smaller for photographs and scans. PNG can be efficient for simple graphics but may be much larger for complex pages.' },
            { question: 'Does PDF by ib export PNG?', answer: 'The current PDF by ib converter exports JPG. This comparison helps you decide whether JPG suits your destination.' },
            { question: 'Which format is better for text?', answer: 'PNG can preserve crisp pixel edges, but a PDF remains better when the text must stay searchable, selectable, scalable, or accessible.' },
        ],
        relatedSlugs: ['how-to-convert-pdf-to-jpg', 'save-pdf-page-as-jpg-on-mobile', 'pdf-to-jpg-image-quality'],
        ctaLabel: 'Export PDF pages as JPG',
    },
    {
        ...shared,
        title: 'How to Improve PDF-to-JPG Image Quality',
        slug: 'pdf-to-jpg-image-quality',
        description: 'Improve PDF-to-JPG quality by choosing a suitable rendering scale, protecting small text, limiting repeated saves, and checking image dimensions.',
        category: 'Conversion',
        tags: ['PDF to JPG', 'Image Quality', 'PDF Image'],
        relatedTool: 'PDF to JPG',
        relatedToolPath: '/pdf-to-jpg',
        imageAlt: 'PDF by ib guide to improving PDF to JPG image quality',
        canonicalUrl: '/blog/pdf-to-jpg-image-quality',
        primaryKeyword: 'PDF to JPG image quality',
        secondaryKeywords: ['convert PDF to image', 'export PDF as JPEG', 'clear PDF image', 'JPG resolution'],
        introduction: [
            'A clear PDF-to-JPG result depends first on rendering resolution and then on JPG compression. Increase quality for small text and diagrams, but remember that a larger image uses more storage and mobile memory.',
        ],
        sections: [
            {
                id: 'how-to-improve-pdf-to-jpg-quality',
                heading: 'How to improve PDF-to-JPG image quality',
                steps: [
                    { title: 'Start with the best PDF', description: 'Use the original document rather than a repeatedly compressed or photographed copy. Conversion cannot recreate detail that is already missing from the source.' },
                    { title: 'Choose a suitable rendering level', description: 'Use High or Maximum when the page contains fine print, forms, maps, or diagrams. Standard may be enough for large text and quick screen previews.' },
                    { title: 'Set JPG quality thoughtfully', description: 'Begin with a moderate-to-high value. Very low quality introduces blocks and halos, while the highest setting may create a much larger file with little visible benefit.' },
                    { title: 'Inspect actual pixels', description: 'Open the downloaded JPG at its intended display size. Check the smallest text, thin lines, signatures, gradients, image edges, and overall dimensions.' },
                ],
            },
            {
                id: 'why-pdf-by-ib',
                heading: 'Why use PDF by ib',
                paragraphs: [
                    'PDF to JPG separates page selection, rendering quality, and JPG quality so you can make a deliberate tradeoff. Exporting only necessary pages also reduces processing time and memory use on mobile devices.',
                    'Do not repeatedly open and resave the JPG, because each lossy save can add artifacts. Return to the original PDF and export again when you need a different size or quality level.',
                ],
            },
            privacySection(),
        ],
        faq: [
            { question: 'Why is my PDF-to-JPG text blurry?', answer: 'The rendering scale may be too low, the source may be a low-resolution scan, or the JPG quality may be too aggressive.' },
            { question: 'Should I always choose Maximum quality?', answer: 'No. Use the lowest setting that keeps required details clear for the destination. Maximum uses more memory and creates larger files.' },
            { question: 'Does JPG preserve vector graphics?', answer: 'No. Vector content is rasterized into pixels at the selected scale and will not remain infinitely scalable.' },
            { question: 'Can conversion improve a blurry scan?', answer: 'No. A higher export scale can preserve available pixels but cannot restore detail missing from the source scan.' },
        ],
        relatedSlugs: ['how-to-convert-pdf-to-jpg', 'jpg-vs-png-for-pdf-pages', 'save-pdf-page-as-jpg-on-mobile'],
        ctaLabel: 'Create a clear JPG',
    },
];

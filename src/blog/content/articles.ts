import manifest from './articleManifest.json';
import type { BlogArticle, BlogArticleMetadata } from '../types';
import { searchConsoleArticles } from './searchConsoleArticles';

const metadata = manifest as BlogArticleMetadata[];
const bySlug = new Map(metadata.map((item) => [item.slug, item]));

function define(slug: string, content: Omit<BlogArticle, keyof BlogArticleMetadata>): BlogArticle {
    const item = bySlug.get(slug);
    if (!item) throw new Error(`Missing blog metadata for ${slug}`);
    return { ...item, ...content };
}

const baseArticles: BlogArticle[] = [
    define('how-to-merge-pdf-files-online', {
        introduction: [
            'Merging PDFs creates one ordered document from several separate files. It is useful when an application, client, teacher, or colleague expects a single attachment instead of a collection of scans, forms, and supporting pages. A careful merge preserves the source pages while letting you decide which document appears first.',
            'PDF by ib performs its supported merge workflow in the browser. The selected files are read from your device, combined locally, and offered as a new download. Browser processing reduces unnecessary file transfers, but the practical limit still depends on available memory, document complexity, and the number of pages being combined.',
        ],
        sections: [
            {
                id: 'when-merging-helps',
                heading: 'When combining PDFs is useful',
                paragraphs: ['A single PDF is easier to name, archive, upload, and review. Common examples include joining a cover letter with a résumé, combining monthly statements, collecting signed forms, or placing appendices after a main report. Merging can also restore a sensible reading order when a scanner creates one file per batch.'],
                bullets: ['Combine related attachments before submitting a form.', 'Place a cover sheet before supporting documents.', 'Join scanned sections in their original order.', 'Create one archive copy without changing the source files.'],
            },
            {
                id: 'prepare-files',
                heading: 'Prepare the source files',
                paragraphs: ['Open each PDF briefly before merging. Confirm that it is the intended version, that pages are upright, and that the file is not damaged or unexpectedly password-protected. Rename sources clearly if several files look similar. The merge tool does not decide the logical order for you, so a quick review prevents a technically correct but confusing result.'],
                callout: { tone: 'tip', title: 'Keep the originals', text: 'A merge creates a new PDF. Retain the source files until you have opened and checked the downloaded result.' },
            },
            {
                id: 'merge-steps',
                heading: 'How to merge PDF files',
                steps: [
                    { title: 'Open Merge PDF', description: 'Go to the Merge PDF tool and choose Add PDFs. You can select multiple files in the file picker or add them in several rounds.' },
                    { title: 'Review accepted files', description: 'Confirm that every expected document appears in the list. A rejected or empty file should be corrected before continuing.' },
                    { title: 'Set the document order', description: 'Drag files or use the move-earlier and move-later buttons. The first listed PDF supplies the first pages of the final document.' },
                    { title: 'Remove mistakes', description: 'Delete accidental duplicates or an outdated version from the list. Removing it from the merge list does not delete the original file from your device.' },
                    { title: 'Merge and download', description: 'Start the merge once at least two valid PDFs are present. Keep the tab open while the browser creates the output.' },
                    { title: 'Verify the result', description: 'Open the downloaded PDF, check the first and last page of each source section, and confirm the total page count and order.' },
                ],
            },
            {
                id: 'limits-and-privacy',
                heading: 'Browser limits and privacy considerations',
                paragraphs: ['Large scans can consume much more memory than their file size suggests because pages, embedded images, fonts, and object tables must be parsed. If a large merge stalls, close unrelated tabs, combine fewer files at a time, or use a desktop browser with more available memory. Complex, damaged, or encrypted PDFs may not load correctly in every browser.', 'Supported processing occurs locally in the application. The website may still be served through a hosting provider that keeps normal access logs, and your browser, operating system, extensions, or download manager may retain their own history. Use a trusted device for sensitive work and clear downloads when appropriate.'],
                callout: { tone: 'warning', title: 'Check page-level work first', text: 'If pages need rotation, removal, or rearrangement inside a source PDF, organize that document before performing the final merge.' },
            },
            {
                id: 'quality-check',
                heading: 'A practical quality checklist',
                table: { headers: ['Check', 'Why it matters'], rows: [['File order', 'Controls the reading sequence of the merged document.'], ['Page count', 'Reveals a missing source or accidental duplicate.'], ['Orientation', 'Prevents sideways pages from reaching the recipient.'], ['Links and forms', 'Interactive behavior can vary in complex PDFs and should be tested.'], ['Final filename', 'Makes the combined document easy to identify later.']] },
                paragraphs: ['Merging normally copies existing pages rather than recreating their visual content, but the safest practice is still to review the new file in a PDF viewer. Do not delete the originals until the merged copy has opened successfully and reached its intended destination.'],
            },
        ],
        faq: [
            { question: 'Does merging reduce PDF quality?', answer: 'A straightforward merge generally preserves source pages rather than intentionally recompressing them. Complex interactive features should still be checked in the output.' },
            { question: 'Can I change the file order before merging?', answer: 'Yes. Reorder the files in the merge list before starting. The list order determines the final page sequence.' },
            { question: 'Why can a large merge be slow?', answer: 'The browser must parse and copy every source document using device memory. Large scans and complex PDFs require more resources.' },
        ],
        relatedSlugs: ['how-to-organize-pdf-pages', 'how-to-remove-pages-from-a-pdf'],
        ctaLabel: 'Merge PDF files',
    }),
    define('how-to-split-pdf-pages-online', {
        introduction: [
            'Splitting a PDF creates smaller documents from selected pages or page ranges. It is useful when a long report contains several chapters, when only one form must be shared, or when an upload portal rejects a document that includes unrelated pages.',
            'A good split begins with a clear output plan. Decide whether you need consecutive ranges, individual selected pages, or several logical groups. PDF by ib processes supported PDFs in the browser and creates downloadable parts without asking you to upload the document to a conversion server.',
        ],
        sections: [
            { id: 'choose-method', heading: 'Choose the right splitting method', paragraphs: ['Page ranges work well for consecutive sections such as pages 1–3, 4–8, and 9–12. Page selection is better when the pages you need are scattered through the file. Before splitting, use the visible page numbers in the PDF rather than relying only on numbers printed inside the document; cover pages and introductions often make those two numbering systems different.'], table: { headers: ['Method', 'Best use'], rows: [['Ranges', 'Chapters and consecutive sections.'], ['Selected pages', 'Nonconsecutive forms, receipts, or exhibits.'], ['Single pages', 'Creating one document per page when supported.']] } },
            { id: 'split-steps', heading: 'How to split a PDF', steps: [
                { title: 'Open Split PDF', description: 'Select the source PDF and wait for its pages and thumbnails to load completely.' },
                { title: 'Inspect the page count', description: 'Confirm that the browser loaded the entire document and that the visible order matches the original.' },
                { title: 'Choose ranges or selection', description: 'Enter valid ranges or select the exact pages required for each output. Avoid overlapping groups unless duplication is intentional.' },
                { title: 'Review the output preview', description: 'Check which page numbers will be included in every part before processing.' },
                { title: 'Split and download', description: 'Start the operation and allow each generated file to download. Browser settings may ask for permission when several downloads are created.' },
                { title: 'Open every part', description: 'Verify the first and last page, filename, page count, and orientation of each result.' },
            ] },
            { id: 'avoid-mistakes', heading: 'Avoid common page-selection mistakes', paragraphs: ['The most common problem is an off-by-one selection caused by a cover page that has no printed number. Another is assuming that deleting a page from one output also removes it from other ranges. Write down the intended groups first for important documents, then compare those groups with the preview.', 'If the document contains blank separators, decide whether they belong with the preceding or following section. A blank page may be intentional for duplex printing, so do not discard it automatically.'], callout: { tone: 'note', title: 'Source files remain unchanged', text: 'Splitting produces new files. It does not rewrite or delete pages from the PDF stored on your device.' } },
            { id: 'performance', heading: 'Performance, downloads, and privacy', paragraphs: ['A large PDF can take time to render before it can be split. Scanned pages usually require more memory than text-focused pages. On a phone, divide very large jobs into smaller operations and keep enough free storage for multiple outputs.', 'Supported processing is local to the browser session. Normal hosting logs do not contain the selected PDF, but browser extensions and device-level services operate outside the application. Use a trusted browser profile and avoid shared devices for confidential documents.'] },
            { id: 'after-splitting', heading: 'Organize the results', bullets: ['Rename parts according to their contents, not only “part 1” and “part 2.”', 'Keep the original until all new files have been checked.', 'Confirm that confidential pages were not included in the wrong part.', 'Merge a corrected group again if a recipient needs one consolidated file.'], paragraphs: ['Consistent filenames and a short review are especially valuable when a split produces many downloads. If the browser blocks multiple downloads, allow them only for the trusted site and repeat the operation after confirming the setting.', 'For a repeatable office workflow, use a naming pattern that includes the source name, section, and version date. Record which ranges created each part when traceability matters. Send only the intended outputs, then reopen the exact attachments from the sent message or shared folder. That last check catches stale copies and accidental substitutions that a review of the local download alone cannot reveal.'] },
        ],
        faq: [
            { question: 'Can I split nonconsecutive pages into one PDF?', answer: 'Use page selection when you need scattered pages. Review the selected page order before exporting.' },
            { question: 'Why do printed page numbers not match the tool?', answer: 'PDF viewers count every page, including covers and unnumbered introductions. Printed numbering may begin later.' },
            { question: 'Does splitting alter the original PDF?', answer: 'No. The browser creates new output files and leaves the source file on your device unchanged.' },
        ],
        relatedSlugs: ['how-to-remove-pages-from-a-pdf', 'how-to-merge-pdf-files-online'],
        ctaLabel: 'Split PDF pages',
    }),
    define('how-to-compress-pdf-without-losing-quality', {
        introduction: [
            'PDF compression is a balance between file size, visual quality, text clarity, and compatibility. There is no setting that makes every PDF dramatically smaller without tradeoffs because documents store different combinations of photographs, scanned pages, vector graphics, fonts, and existing compression.',
            'The Compress PDF tool in PDF by ib is currently marked Coming Soon, so it does not yet provide a production compression workflow. This guide explains how compression works, how to choose sensible settings in any trustworthy tool, and what to verify when browser-based compression becomes available.',
        ],
        sections: [
            { id: 'what-controls-size', heading: 'What makes a PDF large?', paragraphs: ['High-resolution photographs and full-page scans are usually the largest contributors. Embedded font families, duplicated images, complex vector drawings, attachments, and incremental edit history can also add size. A document that is mostly text may already be compact, while a ten-page scan can be hundreds of megabytes.', 'Compression tools may downsample images, change image encoding, remove unused objects, subset fonts, or rewrite internal structures. Each technique affects different documents differently, which is why a percentage promise is rarely meaningful.'], bullets: ['Photographs respond well to moderate JPEG compression.', 'Black-and-white scans may benefit from specialized monochrome encoding.', 'Vector diagrams and text should remain sharp when possible.', 'Already-compressed PDFs may show little improvement.'] },
            { id: 'choose-quality', heading: 'Choose settings for the destination', table: { headers: ['Destination', 'Practical priority'], rows: [['Email or portal upload', 'Meet the size limit while keeping text readable.'], ['Screen review', 'Moderate image resolution is often sufficient.'], ['Professional printing', 'Preserve resolution and color; accept a larger file.'], ['Long-term archive', 'Favor fidelity and standards over maximum reduction.']] }, paragraphs: ['Start with a moderate preset rather than the strongest option. If the result is still too large, reduce quality in a second copy. This preserves a higher-quality candidate and makes it easier to compare changes.'] },
            { id: 'compression-steps', heading: 'A safe compression workflow', steps: [
                { title: 'Keep an original copy', description: 'Compression can be irreversible. Work from a duplicate and retain the source until the output has been approved.' },
                { title: 'Identify the limit', description: 'Check the actual upload or email limit so you do not reduce quality more than necessary.' },
                { title: 'Choose moderate compression', description: 'Use balanced image quality and resolution first. Avoid maximum compression for documents containing small text or diagrams.' },
                { title: 'Process the document', description: 'Keep the browser tab open and avoid memory-heavy activity while a large file is being analyzed.' },
                { title: 'Compare size and appearance', description: 'Open both files and inspect photographs, fine text, gradients, signatures, and barcodes at useful zoom levels.' },
                { title: 'Test the destination', description: 'Confirm that the result opens in the target portal or viewer and remains below the required limit.' },
            ] },
            { id: 'quality-risks', heading: 'Where quality loss becomes noticeable', paragraphs: ['Small text embedded in scanned images can become soft or blocky after aggressive downsampling. Thin lines may break, gradients can band, and photographs can show compression artifacts. Searchable text can also be affected if a workflow rasterizes pages instead of preserving text objects.', 'If only a few pages contain oversized photographs, optimizing those source images before creating the PDF may produce a better result than applying strong compression to the entire document.'], callout: { tone: 'warning', title: 'Compression is not security', text: 'Reducing file size does not remove hidden information, redact content, or protect a PDF with a password.' } },
            { id: 'browser-limits', heading: 'Browser and privacy considerations', paragraphs: ['Compression can be memory intensive because images may need to be decoded before they are resized or recompressed. Mobile browsers can terminate a tab when memory is low. Close unrelated tabs, process smaller documents, or use a desktop device for demanding jobs.', 'When PDF by ib eventually enables compression, its status and limitations will be shown clearly. Until then, the Coming Soon page intentionally has no active processing control. Avoid services that make unclear claims about privacy or guarantee a fixed reduction for every document.', 'Always compare the downloaded size with the destination limit before replacing an archived copy.'] },
        ],
        faq: [
            { question: 'Why is my compressed PDF not much smaller?', answer: 'It may already be optimized, contain mostly text or vectors, or use images that do not compress further without visible quality loss.' },
            { question: 'Can compression make text blurry?', answer: 'Real text objects should remain sharp, but scanned text is part of an image and can become blurry after aggressive downsampling.' },
            { question: 'Is Compress PDF currently available in PDF by ib?', answer: 'No. It is marked Coming Soon and its production processing controls remain disabled.' },
        ],
        relatedSlugs: ['how-to-convert-jpg-to-pdf', 'how-to-protect-a-pdf-with-password'],
        ctaLabel: 'Check Compress PDF status',
    }),
    define('how-to-sign-a-pdf-online', {
        introduction: [
            'Signing a PDF in a browser usually means placing a visual signature, initials, date, or checkmark onto a document and exporting a new PDF. It can be convenient for acknowledgements, internal approvals, permission forms, and other workflows where the recipient accepts an electronic mark.',
            'A visible signature is not automatically the same as a certificate-based digital signature. Legal effect and acceptance depend on the document, the parties, local law, and the process used to establish intent. Confirm the recipient’s requirements before choosing a browser-based signing method.',
        ],
        sections: [
            { id: 'signature-options', heading: 'Choose a signature method', table: { headers: ['Method', 'Consideration'], rows: [['Draw', 'Natural appearance, but easiest with a pointer or touchscreen.'], ['Type', 'Fast and legible; appearance is generated from text.'], ['Upload', 'Uses an existing signature image; protect the source image carefully.']] }, paragraphs: ['Use the simplest method the recipient accepts. Initials may be appropriate for individual clauses, while a full signature and date may be expected on the final page. Never upload or reuse another person’s signature without authorization.'] },
            { id: 'signing-steps', heading: 'How to sign a PDF', steps: [
                { title: 'Open Sign PDF', description: 'Select the intended document and wait until the page thumbnails and main page are fully rendered.' },
                { title: 'Navigate to the signature area', description: 'Use the page list and zoom controls to identify the correct line or box.' },
                { title: 'Create the signature', description: 'Draw, type, or choose an authorized image. Preview it and clear accidental marks before inserting it.' },
                { title: 'Place and size it', description: 'Position the signature inside the intended area. Keep it readable without covering labels or nearby text.' },
                { title: 'Add supporting marks', description: 'Insert a date, initials, or checkmark only where the form requests them.' },
                { title: 'Export and verify', description: 'Download the signed copy, reopen it, and confirm every mark appears on the correct page and remains visible.' },
            ] },
            { id: 'placement', heading: 'Improve placement on touch devices', paragraphs: ['Touch screens make quick signing possible, but a finger is less precise than a mouse or stylus. Zoom the page before placing an object, then inspect its edges after resizing. Browser gestures can compete with object movement, so use deliberate short movements and confirm the final position.', 'Complex documents, rotated pages, and unusual page boxes can cause placement differences between the editor preview and another viewer. PDF by ib marks Sign PDF as Beta for this reason. Always inspect the exported document rather than relying only on the on-screen workspace.'], callout: { tone: 'tip', title: 'Protect signature images', text: 'Store reusable signature images securely and remove temporary copies from shared devices after use.' } },
            { id: 'legal-and-security', heading: 'Understand legal and security limits', paragraphs: ['A visual signature shows a mark but may not provide cryptographic evidence about identity or later document changes. Some regulated transactions require a certificate-backed signature, an audit trail, identity verification, or a specific signing platform. Ask the receiving organization when the requirement is unclear.', 'Do not sign a document you have not read. Check all pages, attachments, blank fields, amounts, dates, and referenced terms. Keep a copy of the exact signed output and any relevant communication showing why and when it was submitted.'] },
            { id: 'privacy', heading: 'Browser privacy and final checks', bullets: ['Use a trusted device and updated browser.', 'Avoid shared computers for confidential agreements.', 'Do not include signatures in bug reports or support messages.', 'Verify the downloaded copy before sending it.'], paragraphs: ['Supported signing and export work occurs in browser memory. Hosting logs and optional analytics do not intentionally include signature data or document content. Device services, extensions, and download history remain outside the application’s control.', 'Before submission, compare the signed output with the unsigned source page by page. Confirm that required fields are complete, dates use the requested format, initials appear everywhere requested, and no signature covers surrounding language. If another person must countersign, avoid flattening or altering fields they still need. Use a meaningful filename and preserve the exact submitted copy with the related confirmation message or receipt.', 'A recipient may reject a valid-looking document because its process requires a particular platform, identity check, or certificate. Verify that requirement before a deadline. Browser signing is a practical placement workflow, but it does not replace an organization’s acceptance rules or create evidence that the receiving system specifically demands.'] },
        ],
        faq: [
            { question: 'Is a drawn signature a digital signature?', answer: 'It is a visible electronic mark, not necessarily a certificate-based cryptographic digital signature.' },
            { question: 'Can I sign on a phone?', answer: 'Yes, but touch placement can be less precise. Zoom, use a stylus when available, and verify the exported PDF.' },
            { question: 'Does PDF by ib track my signature?', answer: 'The analytics allowlist does not include signature data, document text, or filenames.' },
        ],
        relatedSlugs: ['how-to-edit-a-pdf-without-adobe', 'how-to-protect-a-pdf-with-password'],
        ctaLabel: 'Open Sign PDF',
    }),
    define('how-to-remove-pages-from-a-pdf', {
        introduction: [
            'Removing pages creates a new PDF that excludes material you no longer need. Typical examples include blank scanner pages, outdated instructions, duplicate receipts, or confidential appendices that should not be sent to a particular recipient.',
            'Page removal deserves more care than it first appears to require. A missing cover, signature page, legal notice, or intentionally blank duplex page can make a document incomplete. PDF by ib therefore requires an explicit selection before it exports the remaining pages.',
        ],
        sections: [
            { id: 'before-removing', heading: 'Review the whole document first', paragraphs: ['Scroll through every thumbnail and compare the tool’s page number with any number printed on the page. Covers and unnumbered sheets can shift the count. Look for references such as “see page 8” or a table of contents that may become inaccurate after removal.', 'If the goal is to share only a few pages, extraction may be clearer than removing many pages. Extraction explicitly creates a document from selected pages, while removal is most convenient when only a small number should be excluded.'], table: { headers: ['Goal', 'Better action'], rows: [['Exclude two blank pages', 'Remove Pages'], ['Share three pages from a long report', 'Extract Pages'], ['Change sequence and rotate pages', 'Organize PDF']] } },
            { id: 'remove-steps', heading: 'How to remove PDF pages', steps: [
                { title: 'Open Remove Pages', description: 'Choose the PDF and allow all thumbnails to render.' },
                { title: 'Select pages explicitly', description: 'Mark each page that should be excluded. Do not assume the active preview page is selected.' },
                { title: 'Check the remaining count', description: 'Confirm that at least one page remains and that the selected numbers match your plan.' },
                { title: 'Export the result', description: 'Start the removal operation. The browser creates a new PDF from every unselected page.' },
                { title: 'Open the download', description: 'Review page transitions around every removed location and confirm that the final page is present.' },
                { title: 'Rename and store carefully', description: 'Use a filename that distinguishes the edited copy from the complete original.' },
            ] },
            { id: 'confidential-pages', heading: 'Removing pages for confidentiality', paragraphs: ['Removing an entire page can keep that page out of the exported copy, but it is not the same as redacting part of a page. Covering text with a shape or highlight may leave underlying content recoverable. Use a purpose-built redaction workflow when only specific lines, names, or account numbers must be permanently removed.', 'PDF metadata, attachments, bookmarks, form data, and links can also carry information beyond visible pages. For high-risk disclosures, use an approved sanitization process and inspect the output with appropriate tools.'], callout: { tone: 'warning', title: 'Page removal is not redaction', text: 'Do not rely on visual overlays or page deletion alone to sanitize a complex confidential document.' } },
            { id: 'browser-limits', heading: 'Browser and file limitations', paragraphs: ['Large scanned documents may take time to render and export. A damaged PDF, unusual page structure, or password requirement can prevent complete loading. Stop if the page count looks wrong; exporting from an incomplete load could produce an incomplete result.', 'The source PDF remains on your device and is not rewritten. The application uses temporary browser memory for supported processing. Keep the original until the new file has been reviewed and backed up where appropriate.'] },
            { id: 'final-checklist', heading: 'Final review checklist', bullets: ['All intended pages were removed.', 'No required signature or notice page is missing.', 'The remaining order still makes sense.', 'Printed references and the table of contents remain acceptable.', 'The downloaded file opens in another viewer.'], paragraphs: ['For formal documents, ask a second person to review the page list. A brief independent check is often more reliable than repeating the same selection yourself.', 'Compare the original and result at every deletion boundary. The page before a removed block should lead naturally into the page after it, and headers, footers, or section labels should not suggest that content is missing accidentally. Check bookmarks and internal links if recipients rely on navigation. Finally, attach or upload the reviewed output itself rather than a similarly named intermediate copy.'] },
        ],
        faq: [
            { question: 'Can I undo page removal after downloading?', answer: 'The source remains unchanged, so you can repeat the operation. The downloaded copy itself does not contain the removed pages.' },
            { question: 'Can I remove every page?', answer: 'No. A valid output must retain at least one page.' },
            { question: 'Is deleting a page the same as redacting it?', answer: 'No. Page deletion excludes whole pages; redaction securely removes selected content and may require specialized software.' },
        ],
        relatedSlugs: ['how-to-split-pdf-pages-online', 'how-to-organize-pdf-pages'],
        ctaLabel: 'Remove PDF pages',
    }),
    define('how-to-organize-pdf-pages', {
        introduction: [
            'Organizing a PDF means changing its page-level structure: reordering pages, rotating sideways scans, duplicating a reusable sheet, removing mistakes, or inserting material from another file. These operations are common after scanning, collecting forms, or assembling reports from several contributors.',
            'The Organize PDF workflow in PDF by ib is Beta because direct drag behavior varies across touch browsers. Accessible move controls are available so page order does not depend entirely on dragging. A deliberate page plan and final review remain essential.',
        ],
        sections: [
            { id: 'plan-the-order', heading: 'Plan the final reading order', paragraphs: ['Write a short outline before moving pages in a long document. Identify covers, contents, sections, appendices, signature pages, and intentionally blank pages. Thumbnail views are helpful, but similar pages can be difficult to distinguish at small sizes.', 'If multiple source PDFs must be combined, decide whether to organize each source first or merge and then review the complete result. Organizing first is easier when each file has internal problems; merging first provides a single view of the final sequence.'], bullets: ['Match page numbers against section headings.', 'Keep paired front-and-back scans together.', 'Place supporting exhibits after the text that references them.', 'Retain an original copy before structural edits.'] },
            { id: 'organize-steps', heading: 'How to organize PDF pages', steps: [
                { title: 'Open Organize PDF', description: 'Load the source and wait until every page thumbnail is visible.' },
                { title: 'Select the page to change', description: 'Use its thumbnail and page number to confirm the correct target.' },
                { title: 'Move pages', description: 'Drag on a suitable desktop browser or use move controls on touch and keyboard workflows.' },
                { title: 'Rotate or duplicate', description: 'Correct orientation or copy a page only when the resulting document requires it.' },
                { title: 'Remove mistakes', description: 'Delete unwanted pages while ensuring at least one page remains.' },
                { title: 'Export and inspect', description: 'Download the organized PDF and review every section boundary in a separate viewer.' },
            ] },
            { id: 'rotation-and-duplication', heading: 'Use rotation and duplication carefully', paragraphs: ['Rotation should make the page comfortable to read without changing its intended dimensions. A landscape drawing may be correct even when its thumbnail looks different from portrait text pages. Check labels and binding direction before rotating.', 'Duplication is useful for repeated worksheets or separators, but duplicated forms may carry existing field values or annotations depending on the document. Inspect the copy closely and clear information in an appropriate editor when necessary.'], callout: { tone: 'note', title: 'Touch-friendly alternative', text: 'Use the visible move-earlier and move-later controls when dragging is unreliable on a phone or tablet.' } },
            { id: 'complex-documents', heading: 'Consider links, forms, and bookmarks', paragraphs: ['Reordering visual pages can make a table of contents, printed cross-references, bookmarks, internal links, page labels, or form logic inaccurate. The page-level output may look correct while navigation still refers to the old structure. Test these features if the document depends on them.', 'For contracts, regulated forms, portfolios, or accessible tagged PDFs, structural edits may require professional validation. Browser tools are practical for ordinary documents but cannot guarantee preservation of every advanced PDF feature.'] },
            { id: 'performance-and-privacy', heading: 'Performance and privacy', paragraphs: ['Thumbnails and previews require memory, particularly for high-resolution scans. On memory-constrained devices, work with smaller documents or close other tabs. Keep the page open until export completes and verify that the download is not empty.', 'Supported processing uses browser memory, and the original file is not changed. Hosting logs and optional analytics do not intentionally receive filenames or document content. Device-level history and extensions follow their own behavior.', 'After export, view the complete result outside the organizer. Confirm the first and last pages, scan every transition where pages moved, and check that rotations persist. Compare the total page count with your plan, including intentional duplicates and deletions. For documents with a contents page or numbered cross-references, update those references at the source or warn the recipient when the visible numbering no longer matches the new order.', 'Use descriptive versioned filenames such as “report-organized-2026-07” instead of overwriting an ambiguous download. Keeping the original and a short change note makes it easier to correct an overlooked page without rebuilding the entire sequence.'] },
        ],
        faq: [
            { question: 'Can I organize a PDF on a phone?', answer: 'Yes, but direct dragging varies. Use the provided move controls and verify the exported order.' },
            { question: 'Will bookmarks update after pages move?', answer: 'Advanced navigation features may not update automatically. Test bookmarks and internal links in the result.' },
            { question: 'Does organizing overwrite my original?', answer: 'No. The workflow exports a new PDF and leaves the source file unchanged.' },
        ],
        relatedSlugs: ['how-to-merge-pdf-files-online', 'how-to-remove-pages-from-a-pdf'],
        ctaLabel: 'Organize PDF pages',
    }),
    define('how-to-convert-jpg-to-pdf', {
        introduction: [
            'Converting images to PDF places one or more JPG, JPEG, PNG, or WebP images onto PDF pages. It is useful for scanned receipts, photographed notes, application evidence, portfolios, and image sets that need one predictable document container.',
            'The quality of the PDF depends heavily on the source images and page settings. Conversion cannot restore detail that is missing from a blurred or heavily compressed photo. Prepare clean, correctly oriented images and choose a sensible order before creating the document.',
        ],
        sections: [
            { id: 'prepare-images', heading: 'Prepare images before conversion', paragraphs: ['Crop unnecessary surroundings, correct rotation, and confirm that small text is readable at normal zoom. Avoid repeatedly saving a JPG because each lossy save can introduce more artifacts. If images come from a phone, check that automatic orientation is displayed correctly outside the photo app.', 'Arrange filenames or make a written sequence when handling many similar scans. The conversion tool offers move controls, but good source organization reduces mistakes.'], bullets: ['Use the clearest available original image.', 'Remove accidental duplicates.', 'Check orientation and crop.', 'Keep related pages at similar dimensions when practical.'] },
            { id: 'conversion-settings', heading: 'Understand page settings', table: { headers: ['Setting', 'Effect'], rows: [['Page size', 'Controls the PDF sheet dimensions.'], ['Orientation', 'Determines portrait or landscape layout.'], ['Margins', 'Adds space around the image and can prevent edge clipping.'], ['JPG quality', 'Balances image detail against output size.']] }, paragraphs: ['A4 is common internationally, while Letter is common in the United States and Canada. “Fit image” behavior can be helpful for photos with mixed proportions, but standardized page sizes are better for printing and formal submissions.'] },
            { id: 'convert-steps', heading: 'How to convert JPG images to PDF', steps: [
                { title: 'Open JPG to PDF', description: 'Choose one or more supported images from your device.' },
                { title: 'Inspect the image list', description: 'Confirm thumbnails, filenames, and total size. Remove any accidental selection.' },
                { title: 'Set the order', description: 'Drag images or use the move buttons. The first image becomes the first PDF page.' },
                { title: 'Choose page options', description: 'Select page size, orientation, margins, and image quality based on screen or print use.' },
                { title: 'Create the PDF', description: 'Start conversion and keep the tab open while each image is decoded and placed.' },
                { title: 'Download and review', description: 'Open the result and inspect image sharpness, rotation, margins, order, and page count.' },
            ] },
            { id: 'quality-and-size', heading: 'Balance quality and file size', paragraphs: ['Higher image quality usually produces a larger PDF. For receipts and text scans, readability matters more than photographic detail. For portfolios, product photos, or artwork, preserve more detail and accept a larger output.', 'Large image batches can exceed mobile-browser memory because each image must be decoded. Convert fewer images at once, resize extremely large camera photos beforehand, or use a desktop browser when the tab becomes unstable.'], callout: { tone: 'tip', title: 'Test one sample first', text: 'When many images share the same format, convert two representative pages first to confirm margins and quality.' } },
            { id: 'privacy-and-accessibility', heading: 'Privacy and accessible output', paragraphs: ['Supported conversion occurs in browser memory. Normal hosting logs and optional analytics do not intentionally include image filenames or image contents. Extensions, cloud-synced photo pickers, and device services operate separately, so choose source images from a trusted environment.', 'An image-only PDF usually does not contain selectable text and may not be accessible to screen-reader users. If accessibility or searchability matters, use an OCR and document-remediation workflow after conversion and verify the reading order.', 'Open the final PDF and inspect it at both page-fit and readable zoom. Look for clipped edges, unexpected white borders, sideways photographs, inconsistent page sizes, and images that became soft. Print one representative page when print output matters. Check the total page count and confirm that the chosen order matches the source sequence before deleting or archiving any original photographs.', 'For receipts or records, readable dates and amounts are more important than a perfectly small file. If the result must be uploaded to a portal, test that portal before processing a large batch so its page-size, orientation, and file-size rules do not force a second conversion.'] },
        ],
        faq: [
            { question: 'Can I combine several JPG images into one PDF?', answer: 'Yes. Add multiple supported images and arrange them before conversion.' },
            { question: 'Why is the output PDF large?', answer: 'High-resolution images and high quality settings increase size. Resize oversized sources or choose moderate quality.' },
            { question: 'Will text in a photo become selectable?', answer: 'No. Basic image-to-PDF conversion places the image on a page; OCR is a separate process.' },
        ],
        relatedSlugs: ['how-to-convert-pdf-to-jpg', 'how-to-compress-pdf-without-losing-quality'],
        ctaLabel: 'Convert JPG to PDF',
    }),
    define('how-to-convert-pdf-to-jpg', {
        introduction: [
            'Converting PDF pages to JPG creates raster images that are easy to insert into presentations, websites, messages, and image-editing workflows. You can export one selected page as a JPG or several pages as a downloadable collection.',
            'Raster conversion turns text, vectors, photographs, and annotations into pixels. The image can faithfully represent the page visually, but text will no longer be selectable and interactive PDF features will not survive. Choose the resolution and quality for the intended destination.',
        ],
        sections: [
            { id: 'when-to-export', heading: 'When JPG is the right output', paragraphs: ['JPG works well for page previews, slides, social images, and documents that must be accepted by an image-only system. It is less suitable for tiny text, line art, transparent graphics, or content that needs editing and accessibility.', 'If the goal is to extract an original photograph embedded in a PDF, rendering the entire page may not provide the original image file. The exported JPG represents the complete page at the selected scale.'], bullets: ['Create a thumbnail or preview.', 'Insert a page into a presentation.', 'Share one visual page where PDF is unsupported.', 'Use a page as a reference in an image workflow.'] },
            { id: 'quality-settings', heading: 'Choose resolution and quality', table: { headers: ['Choice', 'Tradeoff'], rows: [['Standard', 'Smaller files and faster processing for ordinary screen use.'], ['High', 'Sharper text and graphics with larger images.'], ['Maximum', 'More pixels and memory use; not always visibly better.'], ['JPG quality', 'Higher values reduce artifacts but increase file size.']] }, paragraphs: ['Start with High for pages containing readable text, then inspect the result at actual size. Maximum settings can exhaust memory on large documents and may create files larger than the destination needs.'] },
            { id: 'export-steps', heading: 'How to convert PDF pages to JPG', steps: [
                { title: 'Open PDF to JPG', description: 'Choose the source PDF and wait for page previews to finish.' },
                { title: 'Select pages', description: 'Mark only the pages you need. Exporting fewer pages saves time and memory.' },
                { title: 'Choose rendering quality', description: 'Select Standard, High, or Maximum according to the smallest text and target display size.' },
                { title: 'Set JPG quality', description: 'Use a moderate-to-high value for text-heavy pages and compare artifacts if file size matters.' },
                { title: 'Convert', description: 'Keep the tab active while the browser renders each selected page.' },
                { title: 'Download and inspect', description: 'Check dimensions, text clarity, color, page selection, and the contents of any ZIP download.' },
            ] },
            { id: 'limits', heading: 'Understand conversion limitations', paragraphs: ['Links, form controls, layers, selectable text, vector scalability, embedded files, and accessibility tags do not remain interactive in a JPG. Transparent regions may be rendered against a background, and color can differ slightly between PDF viewers and browsers.', 'Password-protected, damaged, or unusually complex PDFs may not render. A page that looks incomplete in the preview should not be exported until the source is checked in another viewer.'], callout: { tone: 'warning', title: 'Images can expose visible information', text: 'Crop or redact with an appropriate workflow before sharing. Converting to JPG does not automatically remove sensitive content.' } },
            { id: 'performance-and-privacy', heading: 'Performance and privacy', paragraphs: ['Rendering at a larger scale uses more memory for every page. On a phone, select a small range and avoid Maximum unless necessary. The tool applies device-aware limits, but available memory can still vary widely.', 'Supported conversion happens locally in the browser. The application analytics allowlist excludes filenames and document contents. Downloaded images may appear in device galleries or cloud-synced folders depending on operating-system settings, so review the destination for sensitive work.', 'Inspect exported images before sharing them. Check small text at actual size, compare colors with the PDF, and make sure page edges are not missing. A higher setting adds pixels but cannot restore detail absent from the source. When several pages are exported, verify that filenames contain the expected page numbers and that the receiving application sorts them in numerical order.', 'Keep the original PDF whenever links, selectable text, forms, or accessibility matter. The JPG files are derivative snapshots for visual use; they should not silently replace a richer source document in an archive.'] },
        ],
        faq: [
            { question: 'Can I export only one PDF page?', answer: 'Yes. Select one page and the tool produces a JPG for that page.' },
            { question: 'Why is text no longer selectable?', answer: 'JPG is a raster image format. The page is represented as pixels rather than PDF text objects.' },
            { question: 'Why does Maximum quality use so much memory?', answer: 'Higher rendering scales create many more pixels for each page, increasing memory and processing time.' },
        ],
        relatedSlugs: ['how-to-convert-jpg-to-pdf', 'how-to-edit-a-pdf-without-adobe'],
        ctaLabel: 'Convert PDF pages to JPG',
    }),
    define('how-to-edit-a-pdf-without-adobe', {
        introduction: [
            'You do not always need desktop PDF software to make a practical change. Browser editors can add text, images, highlights, drawings, shapes, dates, checkmarks, and signatures, then export a new PDF. This works well for annotations and form-like additions.',
            'PDF editing is different from editing the original Word, spreadsheet, or design file. Most browser tools place new objects over existing pages rather than rebuilding paragraphs and reflowing content. If you need to rewrite substantial text or change the original layout, edit the source document and create a new PDF when possible.',
        ],
        sections: [
            { id: 'what-browser-editors-do', heading: 'What browser-based editing can do', paragraphs: ['PDF by ib provides annotation-style editing: text boxes, images, shapes, freehand drawing, highlighting, dates, checkmarks, and related objects. You can position and resize these elements on a rendered page before exporting.', 'This approach is appropriate for completing a simple form, adding explanatory notes, marking a review copy, or inserting an approved image. It is not a guarantee that existing PDF text can be edited like a word-processing paragraph.'], table: { headers: ['Need', 'Recommended approach'], rows: [['Add a note or label', 'Browser PDF editor'], ['Highlight or draw', 'Browser PDF editor'], ['Rewrite several paragraphs', 'Edit the source document'], ['Permanently hide sensitive text', 'Dedicated redaction workflow']] } },
            { id: 'editing-steps', heading: 'How to edit a PDF in the browser', steps: [
                { title: 'Open Edit PDF', description: 'Select the document and allow pages, thumbnails, and editor controls to load.' },
                { title: 'Choose the correct page', description: 'Navigate with thumbnails and zoom until the target area is clearly visible.' },
                { title: 'Select an editing tool', description: 'Add text, an image, a shape, drawing, highlight, date, or checkmark according to the task.' },
                { title: 'Place and format the object', description: 'Set its position, size, color, opacity, or other available properties without covering required content.' },
                { title: 'Review all edited pages', description: 'Check alignment at useful zoom levels and make sure objects belong to the intended page.' },
                { title: 'Export and reopen', description: 'Download the edited PDF and inspect it in another viewer before distributing it.' },
            ] },
            { id: 'stable-placement', heading: 'Keep annotations stable and readable', paragraphs: ['Use adequate contrast and avoid very small text. Place additions within page boundaries and leave room around form labels. On touch devices, zoom before moving or resizing objects; gestures and page scrolling can reduce precision.', 'Advanced PDFs can use rotated pages, crop boxes, layers, forms, or unusual coordinate systems. PDF by ib marks Edit PDF as Beta because complex documents and touch interactions may vary across browsers. The exported file, not only the editor preview, is the final authority.'], callout: { tone: 'tip', title: 'Save in stages', text: 'For an important long document, export and inspect a small set of edits before adding many more.' } },
            { id: 'redaction-and-forms', heading: 'Know when an overlay is not enough', paragraphs: ['A black rectangle placed over text may hide it visually while leaving the underlying content extractable. Highlighting, drawing, or covering content is not secure redaction. Use a validated redaction process that removes underlying text and metadata.', 'Interactive form fields can also behave differently from ordinary annotations. Adding visible text over a field may not set the actual form value. Test the output with the recipient’s expected viewer or use the form’s native controls when available.'] },
            { id: 'privacy-and-recovery', heading: 'Privacy, memory, and recovery', paragraphs: ['Supported editing occurs in browser memory, and analytics excludes typed document text, images, signatures, filenames, and PDF content. The application warns before leaving an edited workspace with unsaved changes, but browser crashes and device memory pressure can still interrupt a session.', 'Keep a source copy and export periodically during important work. Avoid untrusted shared devices, review the download location, and remove sensitive temporary files when the workflow is finished.', 'Use a final review that is independent of the editing session. Reopen the download in another viewer, inspect every edited page, and zoom in on text, images, and thin lines. Confirm that objects did not move, crop, or cover required content. Search or copy a sample of untouched text when preservation matters, and test printing if the recipient expects paper output.', 'Give the edited copy a distinct name and keep the unmodified PDF until delivery is confirmed. For repeated revisions, include a version number or date so a recipient does not receive an older export by mistake.'] },
        ],
        faq: [
            { question: 'Can I change existing PDF paragraphs?', answer: 'The browser editor focuses on adding annotation objects. For substantial rewriting, editing the original source document is usually more reliable.' },
            { question: 'Is covering text with a shape secure redaction?', answer: 'No. A visual overlay may leave underlying text recoverable. Use a dedicated redaction workflow.' },
            { question: 'Why is Edit PDF marked Beta?', answer: 'Complex PDF geometry, advanced document features, and touch interactions can vary across browsers and require output verification.' },
        ],
        relatedSlugs: ['how-to-sign-a-pdf-online', 'how-to-organize-pdf-pages'],
        ctaLabel: 'Open Edit PDF',
    }),
    define('how-to-protect-a-pdf-with-password', {
        introduction: [
            'PDF password protection can require a password to open a document or can set permissions intended to limit printing, copying, or editing. These controls can reduce casual access, but they are not a substitute for careful sharing, secure storage, access control, or an appropriate encrypted communication channel.',
            'Protect PDF in PDF by ib is currently marked Coming Soon because the present browser engine does not provide the required reliable password-encryption workflow. This guide explains protection concepts and a safe process to follow with a trusted tool that explicitly supports standards-based PDF encryption.',
        ],
        sections: [
            { id: 'password-types', heading: 'Understand open and permission passwords', paragraphs: ['An open password encrypts the document so a viewer asks for the password before displaying content. A permissions or owner password attempts to restrict actions such as editing, printing, or copying after the document opens.', 'Permission restrictions are enforced by compliant software and may not prevent every determined user or tool. Treat an open password as the primary confidentiality control, and do not assume a “no printing” setting makes visible information impossible to capture.'], table: { headers: ['Protection', 'Purpose'], rows: [['Open password', 'Controls whether the document can be opened.'], ['Permissions password', 'Requests restrictions after opening.'], ['Secure delivery', 'Controls who receives the file and password.'], ['Redaction', 'Removes information that should never be disclosed.']] } },
            { id: 'safe-workflow', heading: 'A safe password-protection workflow', steps: [
                { title: 'Confirm protection is appropriate', description: 'Check the recipient’s viewer, organizational policy, and required encryption level.' },
                { title: 'Keep an unprotected source securely', description: 'Store the original in an approved location in case the password is lost or compatibility problems appear.' },
                { title: 'Choose a strong unique password', description: 'Use a long password or passphrase that is not reused for email, banking, or other documents.' },
                { title: 'Apply protection with a trusted tool', description: 'Select a supported encryption option and avoid services that do not explain how files are processed.' },
                { title: 'Test in another viewer', description: 'Close the original session, reopen the protected copy, and confirm that the password is required and accepted.' },
                { title: 'Send the password separately', description: 'Do not place the password in the same email or chat message as the protected document.' },
            ] },
            { id: 'password-handling', heading: 'Handle passwords carefully', paragraphs: ['A strong password does not help if it is included in the filename, message body, or same shared folder. Use a separate channel or an approved secret-sharing method. Confirm the recipient’s identity before sending it.', 'Password recovery may be impossible. Use an approved password manager or organizational record when retention is necessary. Never send a real document password to PDF by ib support or include it in analytics, screenshots, or bug reports.'], callout: { tone: 'warning', title: 'Do not lose the password', text: 'PDF by ib cannot recover passwords for protected documents, and a properly encrypted file may be inaccessible without it.' } },
            { id: 'limits', heading: 'Know the limits of PDF protection', paragraphs: ['Once an authorized person opens a document, they may be able to photograph the screen, retype information, or use software that ignores permission restrictions. Password protection manages access; it cannot control every action after disclosure.', 'Sensitive documents may also contain metadata, attachments, comments, hidden layers, or information that should be removed before sharing. Protection and redaction solve different problems. Apply data minimization first, then encrypt the final reviewed file.'] },
            { id: 'current-status', heading: 'Current PDF by ib support', paragraphs: ['The Protect PDF route remains visible so users can see its status, but its upload and processing controls are intentionally disabled until reliable browser-only encryption is implemented and tested. The page is not included in the sitemap and is marked noindex.', 'Do not interpret the Coming Soon label as a release date or a guarantee of compatibility with every PDF viewer. When the workflow becomes available, its supported encryption options and limitations will be documented on the tool page.', 'After using another trusted protection tool, test the result in at least one viewer different from the one that created it. Confirm that an incorrect password fails, the correct password opens the document, and every page is present. Recheck permissions only if the recipient depends on them, remembering that those controls are weaker than open-password encryption.', 'Keep the protected and unprotected copies in clearly separated approved locations. Use a filename that does not reveal sensitive content, and send only the intended version. If access must later be revoked or audited, ordinary PDF passwords may be insufficient; use an organizational document-sharing system with identity and access controls instead.'] },
        ],
        faq: [
            { question: 'Can PDF by ib protect a PDF today?', answer: 'No. Protect PDF is marked Coming Soon and does not expose a production encryption workflow.' },
            { question: 'Should I send the password with the PDF?', answer: 'No. Send it through a separate, appropriate channel after confirming the recipient.' },
            { question: 'Does password protection remove sensitive metadata?', answer: 'No. Protection controls access; review and sanitization are separate tasks.' },
        ],
        relatedSlugs: ['how-to-compress-pdf-without-losing-quality', 'how-to-sign-a-pdf-online'],
        ctaLabel: 'Check Protect PDF status',
    }),
    define('how-to-reduce-pdf-size-below-1-mb', {
        introduction: [
            'A one-megabyte limit is common on application portals, school systems, and government forms. Reaching it can be difficult when a PDF contains phone photos, full-page scans, or several pages with detailed graphics.',
            'The safest goal is not the smallest possible file. It is a file below the stated limit that still opens correctly and keeps names, dates, signatures, and small text readable. PDF by ib currently marks Compress PDF as Coming Soon, so the steps below explain a careful workflow you can use with a trusted compressor.',
        ],
        sections: [
            { id: 'step-check-current-size', heading: 'Step 1: Check the current size and limit', paragraphs: ['Confirm whether the portal means exactly 1,000,000 bytes or treats 1 MB as 1,048,576 bytes. Aim slightly lower, such as 900 KB, because a system may add processing overhead or enforce a stricter interpretation. Check the file properties before changing anything and keep the original in a separate folder. Knowing the starting size helps you judge whether moderate compression is enough or whether the document needs a more careful rebuild.'] },
            { id: 'step-find-large-content', heading: 'Step 2: Find what makes the PDF large', paragraphs: ['Photographs and scanned pages usually use more space than selectable text. Look for unnecessary color scans, blank pages, duplicate pages, oversized screenshots, or images saved directly from a modern phone camera. A short text document that is already optimized may not shrink much. If only one or two pages contain large images, improving those source images can protect quality better than applying strong compression to every page.'] },
            { id: 'step-prepare-source', heading: 'Step 3: Prepare the source carefully', paragraphs: ['Remove pages that are genuinely unnecessary, but do not delete instructions, signatures, or required evidence just to meet the limit. Crop excessive borders from scanned images before rebuilding the PDF. When you still have the source document, resize large photos there and export a fresh PDF. This often gives a cleaner result than repeatedly compressing an already compressed file. Keep text as text whenever possible instead of turning every page into an image.'] },
            { id: 'step-use-moderate-settings', heading: 'Step 4: Use moderate compression first', paragraphs: ['Choose a balanced or medium setting in a trusted tool that clearly explains its file handling. Avoid maximum compression on the first attempt. It can make scanned text fuzzy, introduce blocks around letters, or damage fine diagrams. Save the result as a new file, check its size, and only make a second lower-quality copy if it is still above the limit. PDF by ib does not yet provide an active production compression control.'] },
            { id: 'step-verify-upload-copy', heading: 'Step 5: Verify the final upload copy', paragraphs: ['Open the reduced PDF in another viewer. Read the smallest text, inspect signatures and identification numbers, and confirm the page count. Search or select text if the original supported it. Then test the actual upload portal before the deadline. Use a clear filename without unusual symbols, and upload the reviewed result rather than an older file with a similar name. Do not delete the higher-quality original after submission.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Target slightly below 1 MB instead of exactly at the limit.', 'Work from an original copy and create a new compressed filename.', 'Use grayscale only when color is not required.', 'Check every page after compression, especially scans and signatures.', 'Split the document only when the receiving instructions allow multiple files.'], callout: { tone: 'tip', title: 'Quality before size', text: 'If required information becomes unreadable, the PDF no longer meets its purpose even if it passes the size check.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['Reducing a PDF below 1 MB is a controlled quality decision. Identify the largest content, make one moderate attempt, and verify the exact file you will upload. If acceptable quality cannot fit below the limit, ask the recipient whether another submission method is available.'] },
        ],
        faq: [
            { question: 'Why will my PDF not shrink below 1 MB?', answer: 'It may already be optimized or contain scans and images that need visible quality loss to become smaller.' },
            { question: 'Can I use maximum compression safely?', answer: 'It is better to start with moderate compression and inspect the result. Maximum settings can make small scanned text unreadable.' },
            { question: 'Is Compress PDF available in PDF by ib now?', answer: 'No. The tool is marked Coming Soon and does not currently expose production compression controls.' },
            { question: 'Should I remove pages to meet the limit?', answer: 'Only remove pages that are not required. Never omit requested information simply to reduce file size.' },
        ],
        relatedSlugs: ['how-to-compress-pdf-without-losing-quality', 'how-to-compress-a-pdf-for-email-attachments', 'common-pdf-problems-and-simple-solutions'],
        ctaLabel: 'Check Compress PDF status',
    }),
    define('how-to-compress-a-pdf-for-email-attachments', {
        introduction: [
            'Large PDF attachments can be rejected by an email provider, take too long to upload, or fill a recipient’s mailbox. The useful target is a message that sends reliably while keeping the document clear enough for its purpose.',
            'Before compressing, check both the sender’s and recipient’s limits. Remember that email encoding can make an attachment larger during transmission. PDF by ib currently lists Compress PDF as Coming Soon, so use the following process with a trusted compression tool and keep the original file.',
        ],
        sections: [
            { id: 'step-check-email-limit', heading: 'Step 1: Check the attachment limit', paragraphs: ['Look up the maximum message or attachment size for the email service and any rules given by the recipient. A 20 MB PDF may exceed a 25 MB message limit after email encoding and the addition of other attachments. Leave a comfortable margin instead of targeting the exact maximum. If the organization provides a secure upload link, that may be more suitable than email for a large or confidential document.'] },
            { id: 'step-review-document', heading: 'Step 2: Review what the PDF contains', paragraphs: ['Open the PDF and confirm that every page belongs in the message. Remove accidental blank or duplicate pages with an appropriate page tool, but retain all required information. Full-page color scans and photographs are common causes of large files. Selectable text and vector graphics are often smaller and should be preserved rather than rasterized. Check whether attachments, comments, or unnecessary embedded material are also present.'] },
            { id: 'step-choose-quality', heading: 'Step 3: Choose quality for the recipient', paragraphs: ['For ordinary on-screen reading, a moderate image resolution is often sufficient. A document intended for professional printing, detailed drawings, medical images, or photographic review may need more quality. Start with a balanced setting and create a new output file. Do not assume a promised percentage reduction applies to every PDF; results depend on how the source was created and whether its images are already compressed.'] },
            { id: 'step-compress-once', heading: 'Step 4: Compress once and compare', paragraphs: ['Use a trusted tool with clear privacy information. PDF by ib’s Compress PDF page is currently informational and has no active production workflow. Compare the original and reduced copies side by side. Check small text, signatures, barcodes, charts, and photographs. Repeated compression can add artifacts, so return to the best available source instead of compressing the same reduced copy several times.'] },
            { id: 'step-send-and-confirm', heading: 'Step 5: Send the verified attachment', paragraphs: ['Give the file a clear, professional name and attach the reviewed copy. Recheck the filename and size in the draft message before sending. For an important submission, download or open the attachment from the sent message to confirm that the correct version arrived intact. Keep sensitive documents out of ordinary email when policy requires encrypted delivery, a secure portal, or controlled access.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Allow extra room below the provider’s stated message limit.', 'Use a secure sharing method when confidentiality matters.', 'Keep one high-quality original outside the email workflow.', 'Avoid maximum compression when the document contains small scans.', 'Mention the attachment clearly in the message so it is not overlooked.'], callout: { tone: 'note', title: 'Email adds overhead', text: 'The transmitted message can be larger than the PDF shown in your file manager.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['A good email attachment is small enough to send and clear enough to use. Check the real limit, apply only the reduction you need, inspect the output, and confirm that the correct file was attached. Use a secure portal when email is not appropriate.'] },
        ],
        faq: [
            { question: 'Why is the email message larger than my PDF?', answer: 'Email systems encode attachments for transport, which adds overhead to the original file size.' },
            { question: 'Can I email a link instead of attaching the PDF?', answer: 'Yes, if the recipient accepts it and the sharing permissions are configured safely.' },
            { question: 'Does compression remove confidential information?', answer: 'No. Compression reduces size; it does not redact content, remove all metadata, or control access.' },
            { question: 'Can PDF by ib compress my attachment today?', answer: 'Not currently. Compress PDF is marked Coming Soon.' },
        ],
        relatedSlugs: ['how-to-reduce-pdf-size-below-1-mb', 'how-to-compress-pdf-without-losing-quality', 'how-to-protect-a-pdf-with-password'],
        ctaLabel: 'Check Compress PDF status',
    }),
    define('how-to-merge-scanned-documents-into-one-pdf', {
        introduction: [
            'Scanners and phone apps often create a separate PDF for each batch, receipt, certificate, or signed page. Merging those files produces one attachment that is easier to name, review, upload, and archive.',
            'The important work happens before the merge: identify every page, correct obvious scan problems, and decide the final order. PDF by ib can combine supported PDFs in the browser, leaving the source files unchanged while it creates a new download.',
        ],
        sections: [
            { id: 'step-check-scans', heading: 'Step 1: Check every scanned file', paragraphs: ['Open each PDF before adding it to the merge. Confirm that the scan is complete, upright, readable, and not unexpectedly password-protected. Look for cut-off edges, shadows, fingers, blank pages, duplicate scans, or pages captured in the wrong orientation. If a page must be rescanned, replace it now. A merge can join the files, but it cannot restore information that was missing from the original scan.'] },
            { id: 'step-name-files', heading: 'Step 2: Give the source files clear names', paragraphs: ['Rename files according to their content or position, such as 01-cover, 02-form, and 03-receipts. Numbered names reduce confusion when several thumbnails look alike. Keep the originals in one folder and remove unrelated documents from the working selection. Avoid placing confidential and public records together unless the final recipient is authorized to receive every page.'] },
            { id: 'step-plan-order', heading: 'Step 3: Plan the final page order', paragraphs: ['Write a short sequence before opening the merge tool. Place a cover page first when required, keep multi-page forms together, and put supporting documents after the section that refers to them. Printed page numbers may not match PDF page counts because covers and blank sheets are still counted. If pages inside one source PDF are disordered, organize that file before performing the final merge.'] },
            { id: 'step-merge-files', heading: 'Step 4: Merge the scanned PDFs', paragraphs: ['Open Merge PDF, add at least two valid PDF files, and wait until every selected file appears. Reorder the file cards so they match your plan, then remove accidental duplicates. Start the merge and keep the browser tab open until the download is ready. Large color scans use more memory than text documents, so a desktop browser may be more reliable for a long batch.'] },
            { id: 'step-verify-result', heading: 'Step 5: Verify the combined document', paragraphs: ['Open the new PDF outside the merge screen. Confirm the total page count and inspect the first and last page of every source section. Zoom into small writing and check that no page is upside down or missing. Give the result a descriptive filename and keep the individual scans until the recipient accepts the combined document. Supported processing occurs in browser memory, but device services and extensions follow their own rules.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Rescan unclear pages instead of trying to repair missing detail.', 'Organize pages inside each file before the final merge.', 'Use numbered filenames to make the intended order obvious.', 'Keep source scans until the merged copy has been reviewed.', 'Process very large scan collections in smaller groups if memory is limited.'], callout: { tone: 'tip', title: 'Check boundaries', text: 'Review every point where one scanned file ends and the next begins.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['A reliable merged scan starts with complete, readable source files and a written order. Prepare the scans, merge them once, and inspect every section boundary. The result should be easier to submit without hiding errors introduced during scanning.'] },
        ],
        faq: [
            { question: 'Does merging improve scan quality?', answer: 'No. It combines existing pages. Rescan any page that is blurred, cropped, or incomplete.' },
            { question: 'Can I change page order after merging?', answer: 'Yes, with an organization tool, but planning and correcting order before the final merge is simpler.' },
            { question: 'Why is the merged scan so large?', answer: 'Full-page color images can consume substantial space. File size depends on scan resolution, color, and page count.' },
            { question: 'Are the original scanned files changed?', answer: 'No. PDF by ib creates a new merged output and leaves the selected sources on your device.' },
        ],
        relatedSlugs: ['how-to-merge-pdf-files-online', 'how-to-organize-pdf-pages', 'how-to-reduce-pdf-size-below-1-mb'],
        ctaLabel: 'Merge scanned PDFs',
    }),
    define('how-to-rearrange-pdf-pages-before-printing', {
        introduction: [
            'A PDF can look correct page by page but still print in a confusing order. Covers may appear in the middle, landscape sheets may face the wrong direction, or duplex printing may place content on an unexpected side.',
            'Rearranging the PDF before opening the print dialog creates a clear source that can be reviewed and reused. PDF by ib’s Organize PDF tool can reorder, rotate, duplicate, or remove pages in supported files directly in the browser.',
        ],
        sections: [
            { id: 'step-understand-output', heading: 'Step 1: Decide how the printed document should read', paragraphs: ['Identify the front cover, contents, main sections, appendices, and back page. Decide whether printing will be single-sided or double-sided. Duplex jobs may need intentional blank pages so a chapter begins on a right-hand sheet. Do not remove a blank page until you know why it exists. If the printer will add covers or dividers separately, note those items outside the PDF plan.'] },
            { id: 'step-review-thumbnails', heading: 'Step 2: Review every page thumbnail', paragraphs: ['Open the PDF and wait for all pages to load. Compare tool page numbers with numbers printed inside the document; they may differ because an unnumbered cover still counts as page one. Look for sideways pages, duplicates, scanner blanks, and sections that begin in the wrong place. For a long document, write a simple target order before moving anything.'] },
            { id: 'step-rearrange-pages', heading: 'Step 3: Move pages into the planned order', paragraphs: ['Use Organize PDF to select a page and move it earlier or later. Dragging may be convenient on a desktop, while the visible move controls are more reliable for keyboard and touch use. Move one section at a time and recheck neighboring thumbnails after each change. Keep paired pages or multi-page forms together so a visual similarity does not cause an accidental swap.'] },
            { id: 'step-correct-orientation', heading: 'Step 4: Correct rotation and intentional blanks', paragraphs: ['Rotate only pages that are genuinely sideways. A landscape chart may be correct even when it looks different from portrait text pages. Add or duplicate a blank separator only when the print plan requires it, and inspect duplicated pages for existing form values or annotations. Remove accidental blank scans carefully while ensuring that at least one page remains in the document.'] },
            { id: 'step-export-print-test', heading: 'Step 5: Export and test before the full print run', paragraphs: ['Download the organized PDF and reopen it in another viewer. Check the first and last page, section boundaries, rotations, and total count. Print a small representative range when paper size, duplex alignment, or orientation matters. Use the print dialog’s preview, and avoid combining “reverse order” printer settings with a PDF you already reversed. Keep the original file until the final print is approved.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Plan duplex blank pages before deleting them.', 'Use page thumbnails and printed numbers together.', 'Move sections in small groups and review nearby pages.', 'Test landscape pages before rotating them.', 'Print a short sample before using a large amount of paper.'], callout: { tone: 'note', title: 'Printer settings matter', text: 'Page order in the PDF and options such as reverse order, booklet, or duplex can interact.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['A print-ready PDF needs both correct document order and sensible printer settings. Organize the source first, verify the exported file, and run a small test. This prevents wasted paper and makes the final document easier to read.'] },
        ],
        faq: [
            { question: 'Should I remove blank pages before printing?', answer: 'Only if they are accidental. Duplex layouts may use blanks to keep sections on the intended side.' },
            { question: 'Why do printed page numbers differ from the tool?', answer: 'The tool counts every PDF page, including covers and unnumbered pages.' },
            { question: 'Can Organize PDF rotate pages?', answer: 'Yes. Rotate only pages with incorrect orientation and verify the exported result.' },
            { question: 'Does rearranging update a table of contents?', answer: 'Not automatically. Printed references, bookmarks, and links may still refer to the old order.' },
        ],
        relatedSlugs: ['how-to-organize-pdf-pages', 'how-to-remove-pages-from-a-pdf', 'how-to-split-pdf-pages-online'],
        ctaLabel: 'Organize pages before printing',
    }),
    define('how-to-add-a-signature-to-a-pdf-without-printing', {
        introduction: [
            'Printing, signing, and scanning a document adds time and can reduce page quality. For forms that accept a visible electronic signature, you can place a drawn, typed, or authorized signature image directly onto the PDF.',
            'A visual signature is not automatically a certificate-based digital signature. Confirm what the recipient accepts before you begin. PDF by ib’s Sign PDF tool is labeled Beta because complex documents and touch placement can vary across browsers.',
        ],
        sections: [
            { id: 'step-confirm-requirement', heading: 'Step 1: Confirm the required type of signature', paragraphs: ['Ask whether the document accepts a simple electronic mark or requires a certificate, identity verification, witness, or dedicated signing platform. Some contracts and regulated forms have specific rules. Read the complete document, check all amounts and dates, and make sure you are authorized to sign it. Do not use another person’s signature image or place a mark on a document you have not reviewed.'] },
            { id: 'step-open-correct-file', heading: 'Step 2: Open the correct PDF', paragraphs: ['Choose the final version of the document and wait until all pages and thumbnails are visible. Confirm the filename, page count, and signature location. If the PDF is password-protected, damaged, or unusually complex, it may not load correctly. Stop if pages are missing. Keep an unsigned source copy so you can restart without removing marks from an already exported version.'] },
            { id: 'step-create-signature', heading: 'Step 3: Create the visible signature', paragraphs: ['Open Sign PDF and choose the available draw, type, or image option that the recipient permits. A mouse or stylus can make drawing easier; typing is often clearer for an acknowledgement. If you use a signature image, keep that source file secure and use it only with authorization. Preview the mark and clear accidental strokes before inserting it on the page.'] },
            { id: 'step-place-supporting-marks', heading: 'Step 4: Place the signature and requested details', paragraphs: ['Navigate to the exact signature field, add the mark, and resize it without covering labels or surrounding terms. Zoom in for better accuracy, especially on a phone. Add a date, initials, or checkmark only where requested. Touch gestures can compete with object movement, so use short deliberate actions and inspect the edges of every placed item before moving to another page.'] },
            { id: 'step-export-verify', heading: 'Step 5: Export and verify the signed copy', paragraphs: ['Download the result and open it in another PDF viewer. Confirm that each mark appears on the correct page, remains readable, and did not shift or disappear. Check every page, not only the signature page. Save the exact submitted copy with a clear filename and any receipt or confirmation. Never include a real signature image, document text, or personal file in a support report.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Confirm that a visual electronic signature is accepted.', 'Keep an untouched copy of the original document.', 'Zoom before placing or resizing a mark.', 'Protect reusable signature images on shared devices.', 'Verify the exported PDF instead of relying only on the editor preview.'], callout: { tone: 'warning', title: 'Know the difference', text: 'A visible signature mark does not provide the same cryptographic evidence as a certificate-based digital signature.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['Paperless signing works well when the recipient accepts a visible electronic mark. Confirm the requirement, place the signature carefully, and verify the exported copy. Use the required specialist signing service when identity or certificate controls are necessary.'] },
        ],
        faq: [
            { question: 'Is a drawn signature the same as a digital signature?', answer: 'No. It is a visible electronic mark and may not include certificate-based identity or tamper evidence.' },
            { question: 'Can I sign a PDF on my phone?', answer: 'Yes, but placement may be less precise. Zoom in and verify the exported copy carefully.' },
            { question: 'Can I add a date with the signature?', answer: 'Add a date only where the form requests it, using the available editor controls.' },
            { question: 'Why is Sign PDF marked Beta?', answer: 'Complex page geometry and touch interactions can vary between browsers, so exported results require review.' },
        ],
        relatedSlugs: ['how-to-sign-a-pdf-online', 'how-to-edit-a-pdf-without-adobe', 'how-to-protect-a-pdf-with-password'],
        ctaLabel: 'Add a signature',
    }),
    define('how-to-combine-multiple-images-into-one-pdf', {
        introduction: [
            'Photos of receipts, notes, identity documents, or handwritten pages are easier to submit when they are combined into one ordered PDF. A single file also gives you one filename and one page sequence to verify.',
            'PDF by ib’s JPG to PDF tool accepts JPG and other supported image formats and processes them in the browser. Image-only PDFs do not automatically gain searchable text, so use an OCR and accessibility workflow later if the destination requires it.',
        ],
        sections: [
            { id: 'step-prepare-images', heading: 'Step 1: Prepare the image files', paragraphs: ['Open every image and check that it is sharp, complete, and facing the correct direction. Crop unnecessary backgrounds, but do not cut off stamps, signatures, page numbers, or handwritten notes. Remove duplicates and accidental photos. Use the clearest original rather than an image repeatedly copied through messaging apps, because repeated JPG saves can reduce text clarity. Keep sensitive images in a trusted folder while you work.'] },
            { id: 'step-plan-sequence', heading: 'Step 2: Plan the page sequence', paragraphs: ['Decide which image should become page one and write down the order for a large batch. Rename files with simple numbers when many scans look similar. Group the cover, main pages, and supporting evidence logically. A correct filename order can reduce mistakes, but still review the order inside the conversion tool. Make sure all selected images belong in the same document and may be shared with the same recipient.'] },
            { id: 'step-add-images', heading: 'Step 3: Add and arrange the images', paragraphs: ['Open JPG to PDF and choose the supported images from your device. Wait for the list and thumbnails to appear. Confirm the total number, remove accidental selections, and move each image into the planned order. The first image becomes the first PDF page. Large camera photos require significant browser memory, so convert fewer images at a time or use a desktop device if a phone tab becomes unstable.'] },
            { id: 'step-choose-page-settings', heading: 'Step 4: Choose useful page settings', paragraphs: ['Select a page size, orientation, margins, and image quality that match the destination. A4 or Letter is practical for printing and formal uploads, while fitting each image may suit mixed photographs. Margins protect content near paper edges. Higher JPG quality preserves detail but creates a larger PDF. Test two representative images first when a long batch uses the same settings.'] },
            { id: 'step-create-check', heading: 'Step 5: Create and check the PDF', paragraphs: ['Start the conversion and leave the tab open until the download finishes. Open the PDF and check page order, orientation, margins, sharpness, and total count. Zoom into the smallest writing and print one sample page if paper output matters. Rename the result clearly and keep the source images until the recipient accepts the file. Remember that device galleries or download folders may synchronize independently of the website.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Use original images instead of repeatedly shared copies.', 'Number similar files before selecting them.', 'Test page size and margins with a small sample.', 'Use fewer high-resolution images per batch on mobile devices.', 'Keep originals until the combined PDF has been reviewed.'], callout: { tone: 'note', title: 'Image-only output', text: 'Text inside a photograph normally remains pixels, not selectable or screen-reader-accessible text.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['Combining images into one PDF is straightforward when the sources are clear and correctly ordered. Prepare the images, choose consistent page settings, and inspect the downloaded document. Add OCR or accessibility remediation separately when searchable text is required.'] },
        ],
        faq: [
            { question: 'Can I combine PNG and JPG files together?', answer: 'Use the image formats listed as supported by the JPG to PDF tool and verify every thumbnail before conversion.' },
            { question: 'Why is the PDF very large?', answer: 'High-resolution photos and high quality settings create larger output. Reduce image dimensions or batch size when appropriate.' },
            { question: 'Will text in the images become searchable?', answer: 'No. Ordinary image conversion does not add OCR or selectable text.' },
            { question: 'Can I change the image order?', answer: 'Yes. Arrange the image list before creating the PDF, then confirm the downloaded page sequence.' },
        ],
        relatedSlugs: ['how-to-convert-jpg-to-pdf', 'how-to-merge-scanned-documents-into-one-pdf', 'how-to-reduce-pdf-size-below-1-mb'],
        ctaLabel: 'Combine images into PDF',
    }),
    define('how-to-prepare-pdf-files-for-online-job-applications', {
        introduction: [
            'An online job application may request a résumé, cover letter, certificates, portfolio samples, or identification in PDF format. Clear files help a recruiter open the documents quickly and reduce the chance of a portal rejection.',
            'Follow the employer’s instructions before changing anything. Some portals want separate uploads, while others require one combined PDF. Use only the documents requested and remove personal information that is not needed for the application.',
        ],
        sections: [
            { id: 'step-read-requirements', heading: 'Step 1: Read the application requirements', paragraphs: ['Check accepted formats, maximum size, required filenames, page limits, and whether documents must be separate or combined. Note any deadline and allow time for a test upload. Do not assume every portal accepts the same structure. If a résumé and cover letter have separate upload fields, merging them may make the application harder to review or cause an automated check to reject the file.'] },
            { id: 'step-create-clean-pdfs', heading: 'Step 2: Create clean source PDFs', paragraphs: ['Export the résumé and cover letter from their original applications when possible instead of photographing or scanning them. This usually keeps text sharp and selectable. Open each PDF and inspect page breaks, fonts, links, dates, and contact details. Remove comments, tracked changes, blank pages, or outdated versions. For certificates and handwritten pages, make sure scans are upright, complete, and readable.'] },
            { id: 'step-name-files', heading: 'Step 3: Use clear professional filenames', paragraphs: ['Use simple names such as Firstname-Lastname-Resume.pdf or Firstname-Lastname-Application.pdf, following any employer rule. Avoid names such as final-final2.pdf, unusual symbols, and unnecessary personal identifiers. Keep the working sources in a separate folder so you do not attach an older draft. A consistent filename is especially useful when several roles or employers have different versions of a cover letter.'] },
            { id: 'step-combine-if-requested', heading: 'Step 4: Combine documents only when requested', paragraphs: ['When one file is required, place the cover letter first, followed by the résumé and requested supporting documents unless the employer specifies another order. Open Merge PDF, add the valid source PDFs, arrange them, and create a new combined file. Do not include private records, unrelated certificates, or identification unless the application explicitly requires them. The source files remain unchanged.'] },
            { id: 'step-verify-submit', heading: 'Step 5: Verify size, content, and upload', paragraphs: ['Open the exact application copy, check every page, and confirm that the filename and size meet the portal rules. Search for your name to confirm text remains readable where expected. Upload before the deadline and inspect any portal preview. Save the confirmation number or email. If the file is too large, preserve readability and follow the portal’s approved alternative rather than removing required pages.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Follow the employer’s requested file structure exactly.', 'Export text documents directly to PDF when possible.', 'Use a clean name that includes your name and document type.', 'Share only information required for the application.', 'Open the uploaded preview and keep the submission confirmation.'], callout: { tone: 'warning', title: 'Protect personal information', text: 'Do not add identity documents, addresses, or sensitive records unless the employer and application process genuinely require them.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['A strong application PDF is accurate, readable, correctly named, and submitted in the requested structure. Review the instructions first, combine files only when needed, and verify the final upload. Content quality matters more than decorative formatting.'] },
        ],
        faq: [
            { question: 'Should my résumé and cover letter be one PDF?', answer: 'Only when the employer requests one combined file. Use separate upload fields when they are provided.' },
            { question: 'What should I name a job application PDF?', answer: 'Use your name and the document type, while following any filename rule shown by the employer.' },
            { question: 'Can I merge certificates with my résumé?', answer: 'Yes when one file is requested and the certificates are relevant, but keep the order clear and concise.' },
            { question: 'What if the portal rejects my file?', answer: 'Recheck format, size, filename characters, page limits, and whether the PDF opens correctly.' },
        ],
        relatedSlugs: ['how-to-merge-pdf-files-online', 'how-to-reduce-pdf-size-below-1-mb', 'common-pdf-problems-and-simple-solutions'],
        ctaLabel: 'Merge application PDFs',
    }),
    define('how-to-submit-college-assignments-as-a-single-pdf', {
        introduction: [
            'Many learning portals require one PDF containing a cover page, written answers, calculations, diagrams, or scanned handwritten work. A correctly ordered file is easier for instructors to download, annotate, and grade.',
            'Start with the assignment instructions and marking rubric. The required order, filename, page limit, and submission deadline take priority over general advice. Keep an untouched copy of every source until the portal confirms the upload.',
        ],
        sections: [
            { id: 'step-check-rules', heading: 'Step 1: Check the submission rules', paragraphs: ['Confirm whether the assignment must be one PDF, which pages are required, and how the file should be named. Note the maximum size and whether a declaration, cover sheet, student number, or specific page order is required. Check the time zone and avoid a last-minute conversion. If the portal asks for separate files, do not merge them simply because one file feels more convenient.'] },
            { id: 'step-prepare-pages', heading: 'Step 2: Prepare each part', paragraphs: ['Export typed work directly to PDF when possible. Scan handwritten pages in good light on a flat surface, keeping all edges and page numbers visible. Rotate sideways pages and replace blurred or cropped scans. Remove accidental duplicates and unrelated personal material. Make sure formulas, diagrams, citations, and instructor comments are readable at normal zoom. Do not lower quality before you know the actual size limit.'] },
            { id: 'step-plan-order', heading: 'Step 3: Put the assignment in the required order', paragraphs: ['A common sequence is cover page, declaration, questions or report, references, and appendices, but follow the course instructions. Number source files or write down the sequence before merging. Keep multi-page answers together. Printed numbers may differ from PDF page numbers when a cover sheet is unnumbered, so compare both systems while reviewing the final document.'] },
            { id: 'step-merge-assignment', heading: 'Step 4: Merge the source PDFs', paragraphs: ['Open Merge PDF and add each prepared PDF. Arrange the files in the planned order, remove any accidental selection, and start the merge. Keep the tab open until the combined file downloads. If handwritten pages are image files rather than PDFs, first convert those supported images with JPG to PDF, then merge that output with the typed sections.'] },
            { id: 'step-verify-submit', heading: 'Step 5: Verify and submit the exact file', paragraphs: ['Open the combined PDF and review every page, especially the boundaries between typed and scanned sections. Confirm page count, orientation, name, student details, and file size. Upload it, inspect the portal preview, and download the submitted copy when the system allows. Keep the receipt, timestamp, or confirmation screen. Never assume that selecting a file means the final submit button was completed.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Use the exact filename format required by the course.', 'Scan handwritten work before the deadline.', 'Keep page numbers visible and pages in answer order.', 'Check the uploaded portal preview, not only the local PDF.', 'Retain source files and the submission receipt.'], callout: { tone: 'tip', title: 'Submit early', text: 'A test upload leaves time to fix page order, size, or portal errors before the deadline.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['A single assignment PDF should be complete, ordered, readable, and easy to identify. Prepare each source carefully, merge only after the sequence is clear, and verify the uploaded copy. Good file handling prevents avoidable submission problems.'] },
        ],
        faq: [
            { question: 'Can I include handwritten and typed pages together?', answer: 'Yes, if the course allows it. Convert clear scans to PDF and place them in the required order.' },
            { question: 'Why does the portal show the wrong first page?', answer: 'The combined PDF order may be incorrect, or the portal preview may need time to refresh. Reopen the local file and verify page one.' },
            { question: 'What if my assignment is over the size limit?', answer: 'Check for oversized scans and follow the course guidance. Do not remove required work or make text unreadable.' },
            { question: 'Should I keep the individual files?', answer: 'Yes. Keep every source and the submitted PDF until grading and any appeal period are complete.' },
        ],
        relatedSlugs: ['how-to-merge-pdf-files-online', 'how-to-combine-multiple-images-into-one-pdf', 'how-to-rearrange-pdf-pages-before-printing'],
        ctaLabel: 'Merge assignment PDFs',
    }),
    define('common-pdf-problems-and-simple-solutions', {
        introduction: [
            'PDF problems often appear at the worst moment: a file will not upload, pages are out of order, a scan is unreadable, or the browser runs out of memory. A few checks can usually identify whether the problem is the file, the destination, or the device.',
            'Always preserve the original before troubleshooting. Work on a copy, change one thing at a time, and verify each new output. Some damaged, encrypted, or highly complex PDFs need specialist software rather than a browser tool.',
        ],
        sections: [
            { id: 'step-identify-problem', heading: 'Step 1: Identify the exact failure', paragraphs: ['Write down what happened and where: the PDF would not open, the website rejected it, a page rendered incorrectly, or processing stopped. Check the filename, extension, size, and page count. Open the file in another trusted viewer. If it fails everywhere, the source may be damaged or incomplete. If it fails only on one website, read that site’s format, size, and filename rules.'] },
            { id: 'step-fix-upload', heading: 'Step 2: Fix upload and filename problems', paragraphs: ['Use the .pdf extension and a short filename containing ordinary letters, numbers, hyphens, or underscores. Remove unsupported symbols and confirm the file is below the destination limit. Do not simply rename another file type to .pdf; that does not convert its contents. Try a current browser and stable connection. If a portal provides a preview, wait for it to finish before assuming the upload failed.'] },
            { id: 'step-fix-pages', heading: 'Step 3: Fix page order and orientation', paragraphs: ['Use Organize PDF when pages are shuffled, sideways, duplicated, or accidentally blank. Compare visible thumbnails with printed page numbers because covers can shift the count. Move or rotate a few pages at a time, then export and reopen the result. Removing a whole page is different from redacting text on that page, and visual overlays should not be treated as secure redaction.'] },
            { id: 'step-handle-size-quality', heading: 'Step 4: Balance file size and quality', paragraphs: ['Large PDFs usually contain photos or high-resolution scans. Remove only genuinely unnecessary pages and rebuild from smaller source images when possible. PDF by ib’s compression tool is currently Coming Soon, so do not expect an active compressor on the site. With any trusted compressor, start moderately and inspect small text. If a scan is already blurry or cropped, compression cannot restore missing detail; rescan it.'] },
            { id: 'step-handle-browser-limits', heading: 'Step 5: Handle passwords, damage, and memory limits', paragraphs: ['A password-protected file may require the correct password or may not be supported by a particular workflow. Never send a real password to support. Large scans can exceed phone memory; close other tabs, use a smaller page range, or move to a desktop device. Stop if the loaded page count is wrong. For a damaged file or one with advanced forms, signatures, layers, or accessibility tags, use an appropriate specialist tool.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Keep the untouched source before every repair attempt.', 'Test the PDF in a second viewer.', 'Follow the destination’s exact size and filename rules.', 'Change one factor at a time so you know what worked.', 'Verify every downloaded result before replacing the original.'], callout: { tone: 'note', title: 'Start with evidence', text: 'The exact error message, file size, and failing step are more useful than repeating the same action.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['Most PDF issues become manageable when you separate file problems from portal and device problems. Preserve the source, perform the smallest suitable fix, and inspect the result. Use specialist software when browser limitations or document complexity make a safe repair uncertain.'] },
        ],
        faq: [
            { question: 'Why does my PDF open but not upload?', answer: 'The destination may reject its size, filename, encryption, page count, or internal structure even though a viewer can display it.' },
            { question: 'Can renaming a file to PDF convert it?', answer: 'No. Changing the extension does not convert the file contents.' },
            { question: 'Why does a large PDF crash on my phone?', answer: 'High-resolution pages can exceed available browser memory. Try fewer pages, close other tabs, or use a desktop device.' },
            { question: 'Can PDF by ib repair every damaged PDF?', answer: 'No. Some damaged or complex documents require specialist recovery or the original source file.' },
        ],
        relatedSlugs: ['how-to-organize-pdf-pages', 'how-to-reduce-pdf-size-below-1-mb', 'how-to-edit-a-pdf-without-adobe'],
        ctaLabel: 'Browse PDF tools',
    }),
    define('browser-based-pdf-editing-vs-desktop-software', {
        introduction: [
            'Browser PDF tools are convenient for quick tasks, while desktop software can provide deeper control for complex or repeated work. The better choice depends on the document, the required feature, device capability, privacy policy, and how often you perform the task.',
            'PDF by ib focuses on practical browser workflows such as merging, organizing, converting, signing, and annotation-style editing. It does not claim to replace every desktop editor, and some tools are Beta or Coming Soon.',
        ],
        sections: [
            { id: 'step-define-task', heading: 'Step 1: Define the editing task', paragraphs: ['List the exact outcome before choosing software. Adding a note, image, shape, highlight, or visible signature can suit a browser editor. Rewriting existing paragraphs, editing complex forms, performing secure redaction, validating accessibility, managing certificates, or preparing professional print files may require desktop software. “Edit PDF” covers many different operations, so choose based on the needed result rather than the product label.'] },
            { id: 'step-compare-convenience', heading: 'Step 2: Compare setup and convenience', paragraphs: ['A browser tool opens without a large installation and is useful on a shared workflow across desktop, tablet, or phone. It can handle an occasional task quickly. Desktop software takes installation, storage, updates, and sometimes a license, but it may offer saved preferences, batch processing, integrations, and stronger handling of large jobs. Organization policies may decide which option is allowed on managed devices.'] },
            { id: 'step-compare-privacy', heading: 'Step 3: Compare privacy and file handling', paragraphs: ['Do not assume every online editor processes files the same way. Read the service’s privacy explanation. Supported PDF by ib processing occurs in browser memory rather than uploading document contents to a conversion server, while hosting logs and optional analytics exclude filenames and PDF text. Browser extensions, synced folders, device history, and downloads remain outside the application. Desktop software can also connect to cloud services, so review its settings.'] },
            { id: 'step-compare-power', heading: 'Step 4: Compare performance and advanced features', paragraphs: ['Browser memory is limited, especially on phones, and a very large scanned PDF can make a tab slow or unstable. Desktop applications may use more system resources and provide advanced OCR, redaction, preflight, certificate signing, forms, accessibility tools, automation, and recovery options. Browser tools are suitable for supported everyday tasks, but complex PDF geometry and touch placement can vary, which is why Edit PDF is marked Beta.'] },
            { id: 'step-test-output', heading: 'Step 5: Test the chosen workflow', paragraphs: ['Use a copy of a representative document before committing to either approach. Complete a small task, export the result, and open it in another viewer. Check text, images, links, forms, page order, and printing requirements that matter to the recipient. Consider total time, not only tool price: a free workflow is not efficient if manual corrections are frequent or advanced features are missing.'] },
            { id: 'quick-tips', heading: 'Quick Tips', bullets: ['Use browser tools for supported, occasional, straightforward tasks.', 'Choose specialist desktop software for advanced or regulated workflows.', 'Read actual privacy and file-handling information.', 'Test complex documents before doing a long batch.', 'Keep source files regardless of the editing method.'], callout: { tone: 'tip', title: 'Use both when appropriate', text: 'A browser tool can handle a quick page task while desktop software remains available for specialist validation.' } },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['Browser and desktop PDF tools serve different needs. Choose a browser workflow for convenient supported tasks and desktop software when advanced control, automation, or specialist validation is essential. In either case, protect the original and verify the exported file.'] },
        ],
        faq: [
            { question: 'Can a browser editor replace desktop PDF software?', answer: 'It can replace it for some everyday tasks, but not every advanced editing, security, accessibility, or print workflow.' },
            { question: 'Are browser tools always less private?', answer: 'No. File handling varies by service. Check whether processing is local or server-based and review the privacy information.' },
            { question: 'Why can large PDFs be harder in a browser?', answer: 'Browsers have practical memory limits, particularly on mobile devices and with high-resolution scans.' },
            { question: 'Is PDF by ib Edit PDF a full text editor?', answer: 'It focuses on annotation-style additions and is marked Beta; substantial paragraph rewriting is better done in the source document.' },
        ],
        relatedSlugs: ['how-to-edit-a-pdf-without-adobe', 'how-to-sign-a-pdf-online', 'common-pdf-problems-and-simple-solutions'],
        ctaLabel: 'Open browser PDF editor',
    }),
];

const additionalSeoIntentArticles: BlogArticle[] = [
    define('complete-guide-to-pdf-tools-2026', {
        introduction: [
            'PDF tools help you combine, divide, edit, convert, secure, and prepare documents without rebuilding them. The best choice depends on the result you need, not the longest feature list.',
            'This 2026 guide explains the main workflows in simple terms. Supported PDF by ib tools process document contents inside your browser instead of sending files to a processing server.',
        ],
        sections: [
            { id: 'quick-answer', heading: 'Quick Answer', paragraphs: ['Choose one focused tool for one job: Merge PDF combines documents, Split PDF separates ranges, Extract Pages keeps selected pages, and Organize PDF changes page order. Conversion tools change formats. Keep the original, make one controlled change, and inspect the download.'] },
            { id: 'steps', heading: 'How to choose PDF tools in 2026', steps: [
                { title: 'Step 1: Define the result', description: 'Write down the exact outcome: one attachment, selected pages, another format, a visible signature, or a smaller file. This avoids unnecessary conversions.' },
                { title: 'Step 2: Check the source', description: 'Confirm the extension matches the real file type and open the document once. Renaming a file does not convert its contents.' },
                { title: 'Step 3: Pick a focused tool', description: 'Use Merge for whole documents, Split or Extract for page selection, Organize for sequence and rotation, and converters only when the recipient requires another format.' },
                { title: 'Step 4: Work from a copy', description: 'Keep the source unchanged. A copy provides a safe return point when order, clarity, or formatting is not right.' },
                { title: 'Step 5: Verify the output', description: 'Open the download in another viewer. Check page count, order, text, links, signatures, orientation, and any portal limit.' },
            ] },
            { id: 'comparison', heading: 'Choose the right approach', table: { headers: ['Need', 'Best starting tool'], rows: [['Combine files', 'Merge PDF'], ['Keep selected pages', 'Split PDF or Extract Pages'], ['Reorder pages', 'Organize PDF'], ['Change format', 'JPG, Word, PPT, or PDF converter']] } },
            { id: 'tips', heading: 'Practical tips', bullets: ['Name files before merging them.', 'Use Extract Pages when the source must stay intact.', 'Convert the editable source directly when possible.', 'Test large scanned files on a desktop browser.', 'Check whether a tool is Available, Beta, or Coming Soon.'] },
            { id: 'mistakes', heading: 'Common mistakes', bullets: ['Using Edit PDF when the task is page organization.', 'Compressing repeatedly and reducing clarity.', 'Assuming password protection is secure redaction.', 'Sending a result without reopening it.', 'Deleting the only source copy.'] },
            { id: 'paa', heading: 'People Also Ask', bullets: ['Are browser PDF tools safe? File handling varies; supported PDF by ib processing stays in browser memory.', 'Which tool combines files? Merge PDF creates one ordered file from several PDFs.', 'Can a PDF be edited like Word? Simple additions are possible, but deep rewriting usually belongs in the source document.', 'Do tools work on phones? Many do, although large scans can exceed mobile memory.'] },
            { id: 'summary', heading: 'Quick Summary', bullets: ['Match one PDF tool to one outcome.', 'Preserve the original.', 'Prefer direct conversion over repeated exports.', 'Verify every download.'] },
            { id: 'example', heading: 'Practical example', paragraphs: ['A student has a cover letter, assignment, and reference sheet. Merge PDF creates one submission; Organize PDF corrects page order; Compress PDF would only be relevant if the portal rejects the size. Defining the required result first prevents three unnecessary conversions and keeps the source documents available for corrections.'] },
            { id: 'images', heading: 'Image suggestions', bullets: ['Featured image: branded PDF by ib placeholder with a simple tools grid.', 'Inline image: decision chart mapping common document jobs to tools.'] },
            { id: 'schema', heading: 'Schema suggestions', bullets: ['Use BlogPosting schema with headline, description, author, dates, image, and canonical URL.', 'Use FAQPage schema for the four visible questions, with answers matching the article.'] },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['Good PDF tools make document work predictable. Start with the specific task, use the smallest suitable workflow, and verify the result. PDF by ib offers focused browser tools for common PDF jobs.', 'PDF by ib processes your files locally in your browser. Your documents are not uploaded to a server.'] },
        ],
        faq: [
            { question: 'What are the most useful PDF tools?', answer: 'Merge, split, organize, extract, convert, sign, and edit tools cover most everyday document tasks.' },
            { question: 'Can I use PDF tools without installing software?', answer: 'Yes. Browser tools run in a modern browser, although supported features and practical file limits vary.' },
            { question: 'Will conversion preserve every detail?', answer: 'Not always. Complex fonts, forms, columns, and scanned pages can change, so inspect the result.' },
            { question: 'Should I keep the original PDF?', answer: 'Yes. Keep an unchanged source until the final document has been checked and accepted.' },
        ],
        relatedSlugs: ['common-pdf-problems-and-simple-solutions', 'browser-based-pdf-editing-vs-desktop-software', 'how-to-prepare-pdf-files-for-online-job-applications'],
        ctaLabel: 'Browse all PDF tools',
    }),
    define('convert-pdf-to-word-without-formatting-problems', {
        introduction: [
            'A PDF to Word conversion is useful when you need to revise text, reuse a table, or update an old document. Formatting problems happen because PDF pages store fixed positions while Word rebuilds flowing paragraphs.',
            'PDF by ib PDF to Word is a Beta tool. Supported conversion runs locally in your browser, but complex layouts and scans still need careful review.',
        ],
        sections: [
            { id: 'quick-answer', heading: 'Quick Answer', paragraphs: ['Start with the cleanest original PDF, convert it once, and compare the Word file beside the source. Correct styles, tables, page breaks, and headers in Word. For an image-only scan, use OCR software first because ordinary conversion cannot reliably invent editable text.'] },
            { id: 'steps', heading: 'How to convert PDF to Word accurately', steps: [
                { title: 'Step 1: Identify the PDF type', description: 'Try selecting a sentence. Selectable text is easier to convert; a page that behaves like one photograph usually needs OCR.' },
                { title: 'Step 2: Prepare a clean copy', description: 'Use the original export when available. Remove no pages unless necessary, and keep the master PDF unchanged.' },
                { title: 'Step 3: Run PDF to Word', description: 'Select the file in the converter and create the Word output once. Repeated format changes can introduce extra spacing and image artifacts.' },
                { title: 'Step 4: Compare structure', description: 'Check headings, columns, lists, tables, footnotes, headers, page numbers, and images against the PDF.' },
                { title: 'Step 5: Repair with Word styles', description: 'Apply heading and paragraph styles instead of adding many spaces or blank lines. Save a separate corrected DOCX.' },
            ] },
            { id: 'comparison', heading: 'Choose the right source', table: { headers: ['PDF content', 'Expected Word result'], rows: [['Simple selectable text', 'Usually needs light cleanup'], ['Tables and columns', 'May need width and flow corrections'], ['Image-only scan', 'Needs OCR before useful editing'], ['Forms or complex graphics', 'Often better rebuilt from the source']] } },
            { id: 'tips', heading: 'Practical tips', bullets: ['Install or embed required fonts when licensed.', 'Use paragraph styles for consistent spacing.', 'Check section breaks before changing headers.', 'Keep images at their original aspect ratio.', 'Proofread numbers and names after OCR.'] },
            { id: 'mistakes', heading: 'Common mistakes', bullets: ['Expecting a fixed PDF page to become a perfect flowing document.', 'Using spaces to align columns.', 'Ignoring missing fonts.', 'Converting a scan without OCR.', 'Overwriting the first converted copy before comparison.'] },
            { id: 'paa', heading: 'People Also Ask', bullets: ['Why does formatting move? Word must infer reading order and paragraph structure from fixed PDF coordinates.', 'Can every PDF become editable? No. Scans need OCR, and secured or complex files may not convert well.', 'Will tables survive? Simple tables may; merged cells and unusual borders often need repair.', 'Does conversion change the PDF? No. It creates a separate Word file.'] },
            { id: 'summary', heading: 'Quick Summary', bullets: ['Use the best original PDF.', 'Identify scans before converting.', 'Compare structure side by side.', 'Repair the DOCX with styles, not spaces.'] },
            { id: 'example', heading: 'Practical example', paragraphs: ['An office report contains two columns, a table, and a logo. After conversion, the paragraphs are editable but one table wraps onto a second page. Compare it with the PDF, adjust the table width, apply heading styles, and check the header before treating the DOCX as the new working copy.'] },
            { id: 'images', heading: 'Image suggestions', bullets: ['Featured image: branded PDF and Word documents side by side.', 'Inline image: comparison of selectable text and an image-only scan.'] },
            { id: 'schema', heading: 'Schema suggestions', bullets: ['Use BlogPosting schema with author, dates, image, canonical URL, and headline.', 'Use FAQPage schema for the four visible questions, matching the displayed wording.'] },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: ['A clean PDF to Word conversion starts with the right source and ends with a side-by-side review. Expect minor cleanup, use OCR for scans, and rebuild highly complex layouts when accuracy matters more than speed.', 'PDF by ib processes your files locally in your browser. Your documents are not uploaded to a server.'] },
        ],
        faq: [
            { question: 'Why is my converted Word file not editable?', answer: 'The PDF may be an image-only scan. OCR is required to recognize text before normal editing.' },
            { question: 'Can PDF to Word keep the same font?', answer: 'Only when the font is available and the converter can map it. Otherwise Word may substitute another font.' },
            { question: 'Why are page breaks different?', answer: 'PDF uses fixed pages while Word reflows content according to margins, styles, fonts, and printer settings.' },
            { question: 'Is PDF by ib PDF to Word finished?', answer: 'It is currently marked Beta, so verify complex documents carefully after conversion.' },
        ],
        relatedSlugs: ['browser-based-pdf-editing-vs-desktop-software', 'common-pdf-problems-and-simple-solutions', 'how-to-prepare-pdf-files-for-online-job-applications'],
        ctaLabel: 'Convert PDF to Word',
    }),
];

const seoIntentDetails: Record<string, { keyword: string; quickAnswer: string; mistakes: string[] }> = {
    'how-to-merge-pdf-files-online': { keyword: 'merge pdf', quickAnswer: 'Add the source PDFs, arrange whole files in the required order, merge once, and inspect every transition in the downloaded document. A direct merge preserves page content better than printing or converting pages to images.', mistakes: ['Selecting an outdated source file.', 'Setting the file order without checking section transitions.', 'Using Print to PDF when a direct merge is available.', 'Deleting originals before the result is accepted.'] },
    'how-to-edit-a-pdf-without-adobe': { keyword: 'edit pdf online', quickAnswer: 'Use an online editor for additions such as text, images, highlights, or shapes. For substantial paragraph changes, edit the original source document and export a fresh PDF. Always reopen the edited copy before sharing it.', mistakes: ['Treating a white box as secure redaction.', 'Expecting scanned text to behave like editable text.', 'Replacing the only original file.', 'Skipping a review at normal zoom.'] },
    'how-to-compress-pdf-without-losing-quality': { keyword: 'compress pdf', quickAnswer: 'Start from the original, use moderate settings once, and compare small text, signatures, diagrams, and photos at 100% zoom. PDF by ib Compress PDF is currently Coming Soon, so this guide explains the safe workflow without claiming a live compressor.', mistakes: ['Compressing an already compressed copy.', 'Chasing the smallest size instead of the required limit.', 'Ignoring fine print and QR codes.', 'Deleting the high-quality source.'] },
    'how-to-split-pdf-pages-online': { keyword: 'split pdf', quickAnswer: 'Map the required page ranges, select them in Split PDF, create the outputs, and verify the first and last page of every file. Use displayed PDF page positions rather than printed page labels.', mistakes: ['Confusing printed page labels with viewer positions.', 'Missing an inclusive range endpoint.', 'Creating overlapping ranges accidentally.', 'Sharing outputs before checking each one.'] },
    'how-to-convert-jpg-to-pdf': { keyword: 'jpg to pdf', quickAnswer: 'Choose clear JPG images, arrange them in reading order, select suitable page settings, and create one PDF. Check orientation, margins, image clarity, and page sequence before sending the result.', mistakes: ['Using low-resolution screenshots.', 'Leaving phone photos sideways.', 'Putting images in filename order without checking it.', 'Converting the same images repeatedly.'] },
    'how-to-protect-a-pdf-with-password': { keyword: 'protect pdf', quickAnswer: 'Choose a strong unique password, protect a copy, test it in another viewer, and share the password through a different channel. PDF by ib Protect PDF is currently Coming Soon, so no live password-setting feature is implied.', mistakes: ['Sending the password in the same message as the file.', 'Using a short or reused password.', 'Assuming password protection permanently prevents copying.', 'Losing the only unprotected original.'] },
    'how-to-sign-a-pdf-online': { keyword: 'sign pdf', quickAnswer: 'Open Sign PDF, create or upload a visible signature, place it carefully, and export a signed copy. Then reopen the file and confirm the signature appears on the correct page and does not cover important text.', mistakes: ['Signing the wrong document version.', 'Placing a signature over required text.', 'Assuming every visible signature is a certificate-based digital signature.', 'Deleting the unsigned source.'] },
    'how-to-organize-pdf-pages': { keyword: 'organize pdf', quickAnswer: 'Review page thumbnails, drag pages into the correct order, rotate only the pages that need it, and remove or duplicate pages deliberately. Export a copy and verify the final sequence from beginning to end.', mistakes: ['Dragging pages while zoomed too far out to identify them.', 'Deleting blank pages that are intentional separators.', 'Rotating every page instead of selected pages.', 'Overwriting the source before review.'] },
};

function adaptForSeoIntent(item: BlogArticle): BlogArticle {
    const details = seoIntentDetails[item.slug];
    if (!details) return item;
    const sourceSections = item.sections.filter((section) => section.id !== 'conclusion').slice(0, 5);
    const shorten = (text: string, limit: number) => {
        const words = text.trim().split(/\s+/);
        return words.length <= limit ? text : `${words.slice(0, limit).join(' ')}…`;
    };
    const processSteps = sourceSections.map((section, index) => ({
        title: `Step ${index + 1}: ${section.heading.replace(/^Step \d+:?\s*/, '')}`,
        description: shorten(section.paragraphs?.join(' ') ?? section.steps?.map((step) => `${step.title}: ${step.description}`).join(' ') ?? section.bullets?.join(' ') ?? '', 30),
    }));
    const tips = item.sections.find((section) => section.heading === 'Quick Tips')?.bullets ?? [
        'Keep an unchanged source file.',
        'Use a descriptive output filename.',
        'Check the result in another PDF viewer.',
        'Use a desktop browser for unusually large scans.',
    ];
    const comparison = item.sections.find((section) => section.table)?.table ?? {
        headers: ['Approach', 'Best use'] as [string, string],
        rows: [['Focused browser tool', 'A supported everyday task on a trusted device'], ['Source application', 'Deep text or layout changes'], ['Specialist desktop software', 'Regulated, advanced, or very large workflows']] as Array<[string, string]>,
    };
    const oldConclusion = item.sections.find((section) => section.id === 'conclusion')?.paragraphs?.[0] ?? '';
    return {
        ...item,
        primaryKeyword: details.keyword,
        secondaryKeywords: [...item.tags.filter((tag) => tag.toLowerCase() !== details.keyword), 'online PDF guide'].slice(0, 5),
        introduction: [`The ${details.keyword} workflow solves a specific document problem without unnecessary format changes. ${shorten(item.introduction.join(' '), 68)}`],
        sections: [
            { id: 'quick-answer', heading: 'Quick Answer', paragraphs: [details.quickAnswer] },
            { id: 'numbered-steps', heading: `How to ${details.keyword} safely`, steps: processSteps },
            { id: 'comparison', heading: 'Choose the right approach', table: comparison },
            { id: 'practical-tips', heading: 'Practical tips', bullets: tips },
            { id: 'common-mistakes', heading: 'Common mistakes', bullets: details.mistakes },
            { id: 'people-also-ask', heading: 'People Also Ask', bullets: item.faq.map((entry) => `${entry.question} ${entry.answer}`) },
            { id: 'quick-summary', heading: 'Quick Summary', bullets: [`Use ${details.keyword} for the specific job described above.`, 'Preserve the original, make one controlled change, and verify the download before sharing it.'] },
            { id: 'practical-example', heading: 'Practical example', paragraphs: ['Before sending a document, compare the source and download side by side. Check the first and last affected pages, filename, page count, and important visual details. This short review catches ordering and quality problems before the recipient sees them.'] },
            { id: 'image-suggestions', heading: 'Image suggestions', bullets: [`Featured image: branded PDF by ib illustration for ${details.keyword}.`, 'Inline image: a before-and-after view of the main workflow.'] },
            { id: 'schema-suggestions', heading: 'Schema suggestions', bullets: ['Use BlogPosting schema with the canonical URL, dates, author, image, and headline.', 'Use FAQPage schema for the four visible questions below, keeping the structured answers consistent with the page.'] },
            { id: 'conclusion', heading: 'Conclusion', paragraphs: [`${oldConclusion} This ${details.keyword} workflow works best when you preserve the source and check the exported result.`, 'PDF by ib processes your files locally in your browser. Your documents are not uploaded to a server.'] },
        ],
        faq: item.faq.length >= 4 ? item.faq.slice(0, 4) : [...item.faq, { question: `What should I check after I ${details.keyword}?`, answer: 'Reopen the download and check page count, order, readability, filename, and the details that matter to the recipient.' }],
    };
}

export const articles: BlogArticle[] = [...baseArticles, ...additionalSeoIntentArticles, ...searchConsoleArticles].map(adaptForSeoIntent);

export const publishedArticles = articles.filter((article) => !article.draft);
export function getArticleBySlug(slug: string | undefined) {
    return slug ? publishedArticles.find((article) => article.slug === slug) : undefined;
}

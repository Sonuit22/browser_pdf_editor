import manifest from './articleManifest.json';
import type { BlogArticle, BlogArticleMetadata } from '../types';

const metadata = manifest as BlogArticleMetadata[];
const bySlug = new Map(metadata.map((item) => [item.slug, item]));

function define(slug: string, content: Omit<BlogArticle, keyof BlogArticleMetadata>): BlogArticle {
    const item = bySlug.get(slug);
    if (!item) throw new Error(`Missing blog metadata for ${slug}`);
    return { ...item, ...content };
}

export const articles: BlogArticle[] = [
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
];

export const publishedArticles = articles.filter((article) => !article.draft);
export function getArticleBySlug(slug: string | undefined) {
    return slug ? publishedArticles.find((article) => article.slug === slug) : undefined;
}

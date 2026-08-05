# Cross-device compatibility test matrix

Audit date: 2026-08-05

This matrix reflects the centralized statuses in `src/config/toolRegistry.ts`. `Pass` means the stated workflow was completed in the Codex in-app Chromium browser at that viewport. `Partial` means only structural browser coverage and/or automated service coverage was completed. It does not mean a physical device or named browser was tested.

## Test environment and scope

- Required responsive viewports scanned: 1920x1080, 1366x768, 1280x720, 768x1024, 1024x768, 320x568, 360x800, 375x812, 390x844, and 412x915.
- Each required viewport was checked against the homepage and all 15 registered tool routes (160 route/viewport checks). Extra checks were also run at 1440x900, 820x1180, and 430x932.
- Structural checks verified an H1/rendered route, no horizontal document overflow, and no visible actionable control clipped beyond the viewport.
- Completed Available-tool workflows: Merge, Split, Remove Pages, and Extract Pages at desktop, tablet portrait, tablet landscape, and phone viewport classes.
- Completed Beta workflows: Organize at tablet landscape; JPG to PDF, Word to PDF, PDF to JPG, PDF to Word, and PDF to PPT at desktop; Sign PDF at tablet portrait; Edit PDF at phone size.
- Landing handoff was completed on a phone viewport from homepage upload to Split PDF with the same filename, size, and three-page document.
- Automated download clicks and post-success reset were observed. The in-app browser did not expose programmatic anchor downloads as downloadable artifacts, so downloaded files were not reopened in each named browser.
- Physical iPhone, iPad, Android, Samsung, Windows, macOS, touch, pen, and real keyboard testing was not available. Browser viewport emulation does not substitute for those tests.

## Available and Beta tools

| Tool | Registry status | Desktop | Tablet portrait | Tablet landscape | Phone | Mouse | Touch / pen | Download | Remaining limitation | Manual test required |
|---|---|---|---|---|---|---|---|---|---|---|
| Merge PDF | Available | Pass | Pass | Pass | Pass | Pass | Partial | Partial | Native drag auto-scroll is not implemented; Move Earlier/Later buttons are the reliable fallback. Download was invoked and reset observed, but the artifact was not reopened by automation. | iOS/iPadOS Safari, Android Chrome, Samsung Internet multi-picker, reorder, downloaded-file open |
| Split PDF | Available | Pass | Pass | Pass | Pass | Pass | Partial | Partial | Results now require an explicit user click per file, avoiding blocked repeated automatic downloads. Artifact reopening was not available. | Confirm two or more result downloads and filenames in Safari, Firefox, Android Chrome, Samsung Internet |
| Remove Pages from PDF | Available | Pass | Pass | Pass | Pass | Pass | Partial | Partial | Button/checkbox flow completed; physical tap latency and downloaded-file opening remain unverified. | One-tap select/deselect and output open on iOS/Android browsers |
| Extract Pages | Available | Pass | Pass | Pass | Pass | Pass | Partial | Partial | Correct-order service tests and all viewport workflows passed; physical tap and downloaded-file opening remain unverified. | Selection order and output open on iOS/Android browsers |
| Organize PDF | Beta | Partial | Partial | Pass | Partial | Partial | Partial | Partial | Rotate, move fallback, and export completed at tablet landscape. Native touch drag, repeated reordering, and physical rotation remain unverified. | Repeated touch reorder, scroll restoration, rotation, delete/undo, output open on iPad and Android tablet |
| JPG to PDF | Beta | Pass | Partial | Partial | Partial | Pass | Partial | Partial | Desktop conversion completed. Camera/gallery picker, EXIF orientation, large-photo memory, and physical touch reorder remain unverified. | iOS camera/library, Android gallery, EXIF rotations, 20+ large images, output open |
| Word to PDF | Beta | Pass | Partial | Partial | Partial | Pass | Not tested | Partial | Basic DOCX conversion completed on desktop; complex layout fidelity and mobile keyboard/memory remain Beta limitations. | Representative DOCX files on iOS/Android and desktop Firefox/Edge |
| PDF to JPG | Beta | Pass | Partial | Partial | Partial | Pass | Partial | Partial | Three-page ZIP workflow completed on desktop. ZIP opening, large-document memory, and physical mobile downloads remain unverified. | Selected single-page JPG and multi-page ZIP on Safari/Android/Firefox |
| PDF to Word | Beta | Pass | Partial | Partial | Partial | Pass | Not tested | Partial | Desktop editable-text conversion completed; layout fidelity remains a documented Beta limitation. | Open generated DOCX in Word/LibreOffice across OSes; mobile memory test |
| PDF to PPT | Beta | Pass | Partial | Partial | Partial | Pass | Not tested | Partial | Desktop page-to-slide conversion completed; generated PPTX was not reopened by browser automation. | Open PPTX in PowerPoint/Keynote/LibreOffice; mobile memory test |
| Sign PDF | Beta | Partial | Pass | Partial | Partial | Partial | Partial | Partial | Typed signature, touch-sized 44x44 resize handles, and export completed at tablet portrait. Physical free-draw, stylus, repeated move/resize, and rotation remain unverified. | Draw/upload/type/date/checkmark with finger and pen; rotate during edit; reopen exported PDF |
| Edit PDF | Beta | Partial | Partial | Partial | Pass | Partial | Partial | Partial | Phone workflow completed for Add Text, Escape dismissal, annotation creation, and export. Full physical touch/stylus matrix and keyboard viewport behavior remain unverified. | Every editor tool, repeated select/move/resize/delete, undo/redo, thumbnails, keyboard open/close, rotation, exported visual comparison |

## Coming Soon enforcement

| Tool | Registry status | Browser result | Processing status |
|---|---|---|---|
| Compress PDF | Coming Soon | Route rendered without overflow at all required viewports. Landing handoff shows the selected PDF and an explicit message that compression controls are unavailable. | No compression or download claimed |
| PPT to PDF | Coming Soon | Informational route rendered without overflow at all required viewports. | No workspace or output claimed |
| Protect PDF | Coming Soon | Informational route rendered without overflow at all required viewports. | No password workflow or protected output claimed |

## Automated evidence

- Unit/service coverage includes file validation, encrypted/corrupt errors, merge order, page-range parsing, split output creation, remove/extract/organize output order, annotation rendering/export, touch geometry, crop coordinates, highlighter settings, pending-file lifecycle, object URL cleanup, post-success reset, and conversion naming.
- Browser workflow evidence includes disabled/valid states, file picker acceptance, the landing pending-File transfer, processing completion, expected output labels, explicit download clicks, and clean source reset.
- A fresh 16-route phone-width console pass reported zero errors and zero warnings after enabling the supported React Router future flags.

## Exact manual tests still required

1. On current iPhone Safari and iPad Safari, run homepage upload -> every offered destination, Replace, Remove, browser Back, refresh recovery, keyboard open/close, safe-area insets, and orientation changes.
2. On Android Chrome and Samsung Internet, repeat landing handoff, multi-file Merge, per-result Split downloads, ZIP download/open, and back-navigation recovery.
3. On Edge, Firefox, Chrome desktop, and Safari desktop, open every generated PDF/JPG/ZIP/DOCX/PPTX and verify filename, MIME handling, page count/order, and visual output.
4. With real finger input, repeatedly reorder Merge and Organize items, use fallback controls, drag near scroll edges, cancel mid-drag, rotate the device, and verify scrolling is immediately restored.
5. With Apple Pencil or an Android stylus, draw/highlight continuously and move/resize/reselect/delete signatures and annotations after zoom and rotation.
6. On a mid-range phone, process a moderately large PDF and 20-30 high-resolution photos while observing responsiveness, cancellation, memory pressure, and recovery.
7. Exercise corrupt, encrypted, oversized, empty, wrong-type, invalid-range, download-blocked, and low-memory cases in each physical browser; verify the source remains available and the next action is clear.

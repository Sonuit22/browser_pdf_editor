export const faqEntries = [
    ['Are my PDF files uploaded to a server?', 'Supported PDF tools process selected files in your browser. The application does not intentionally upload those files to its server. Hosting logs and optional analytics do not include PDF content or filenames.'],
    ['Is PDF by ib free?', 'The currently enabled tools can be used without creating an account or paying a fee. Future services may have different terms, which would be disclosed before use.'],
    ['Which browsers are supported?', 'Use a current version of Chrome, Edge, Firefox, or Safari with JavaScript, Web Workers, canvas, and modern file APIs enabled. Browser capabilities and memory limits differ.'],
    ['Why can large PDF files be slow?', 'PDF work uses your device processor and memory. Documents with many pages, large images, or complex graphics require more resources and may work better in smaller batches.'],
    ['Why does compression not always produce a much smaller file?', 'Compression is currently marked Coming Soon and is not enabled. When it becomes available, results will still depend on how the original PDF stores images, fonts, and other content.'],
    ['Can I use PDF by ib on a phone or tablet?', 'The interface supports phone and tablet layouts, but available memory, touch behavior, and browser download handling can differ from desktop browsers.'],
    ['Why are some conversion tools marked Beta or Coming Soon?', 'Beta tools work with documented limitations and need broader compatibility testing. Coming Soon tools do not yet provide a complete production workflow and keep processing controls disabled.'],
    ['Are password-protected PDFs supported?', 'A PDF that requires a password may not open in the current browser engine. Creating password-protected PDFs is currently marked Coming Soon.'],
    ['What happens to my file after processing?', 'Files may remain temporarily in browser memory while a workspace is open. They are cleared when you reset or leave the workspace, refresh, or close the page, subject to normal browser behavior.'],
    ['How can I report a bug?', 'Use the Report a bug link in the footer. Include the tool, browser, device, and reproduction steps, but do not attach a confidential document.'],
    ['How can I request a feature?', 'Use the Feature request link in the footer and describe the problem the requested feature would solve.'],
    ['Why may formatting change during PDF conversion?', 'PDF, Word, and PowerPoint represent layout differently. Beta conversions may not preserve complex fonts, tables, columns, floating objects, or exact pagination.'],
] as const;

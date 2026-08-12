export const faqEntries = [
    ['Are my PDF files uploaded to a server?', 'No. Supported PDF tools process selected files locally in your browser. Hosting logs and optional analytics do not include PDF content or filenames.'],
    ['Is PDF by ib free?', 'Yes. The currently available browser-based tools can be used without an account or payment, subject to any limits shown by the tool.'],
    ['Which browsers are supported?', 'Current versions of Chrome, Edge, Firefox, and Safari are supported when JavaScript and modern browser file APIs are available. Device memory and browser capabilities may affect some workflows.'],
    ['Why can large PDF files be slow?', 'Large PDFs require more of your device processor and memory. Files with many pages, large images, or complex graphics may work better in smaller batches.'],
    ['Why does compression not always produce a much smaller file?', 'PDFs containing mostly text, vectors, or already optimized images may not shrink meaningfully. PDF by ib avoids rasterizing those documents only to report a smaller number.'],
    ['Can I use PDF by ib on a phone or tablet?', 'Yes. PDF by ib supports desktop, tablet, and mobile browsers, although some advanced workflows depend on browser and device capabilities.'],
    ['Why are some conversion tools marked Beta or Coming Soon?', 'Beta tools are available with documented limitations. Coming Soon tools do not yet provide a complete production workflow and keep their processing controls disabled.'],
    ['Are password-protected PDFs supported?', 'Yes. Protect PDF can add AES-256 password encryption to supported unencrypted PDFs in your browser. Already protected PDFs cannot currently be unlocked.'],
    ['What happens to my file after processing?', 'Your file may remain temporarily in browser memory while its workspace is open. It is cleared when you reset or leave the workspace, refresh, or close the page, subject to normal browser behavior.'],
    ['How can I report a bug?', 'Use the Report a bug link in the footer. Include the tool, browser, device, and reproduction steps, but do not attach a confidential document.'],
    ['How can I request a feature?', 'Use the Feature request link in the footer and describe the problem you want the feature to solve.'],
    ['Why may formatting change during PDF conversion?', 'PDF, Word, and PowerPoint store layouts differently. Beta conversions may not preserve complex fonts, tables, columns, floating objects, or exact pagination.'],
] as const;

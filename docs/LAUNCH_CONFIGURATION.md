# Public launch configuration

PDF by ib uses browser-visible Vite variables only. Never place private API keys or server secrets in a `VITE_*` value.

## Required deployment value

- `VITE_SITE_URL`: canonical HTTPS origin without a trailing slash, set to `https://pdfbyib.com` for production.

The build runs `tools/generate-public-files.mjs`, which uses this value for `robots.txt` and `sitemap.xml`. The SPA uses the same value for route canonicals, Open Graph URLs, and structured data.

## Optional support destinations

- `VITE_GITHUB_URL`: repository URL. It is not rendered in the footer.
- `VITE_BUG_REPORT_URL`: full issue-form URL. When absent, the footer uses a prefilled `mailto:` link.
- `VITE_FEATURE_REQUEST_URL`: full feature-request URL. When absent, the footer uses a prefilled `mailto:` link.
- `VITE_GOVERNING_LAW`: owner-reviewed jurisdiction text for the Terms of Use. The default remains an explicit placeholder.

## Optional analytics

Analytics is off unless all of these are configured:

- `VITE_ANALYTICS_ENABLED=true`
- `VITE_ANALYTICS_PROVIDER=plausible`
- `VITE_ANALYTICS_ID=<public site domain>`

The integration uses Plausible's cookie-free event endpoint and does not initialize a cookie or persistent browser identifier, so no analytics consent banner is added. Applicable legal requirements still depend on deployment jurisdiction and should be reviewed by the owner.

Only generic route, tool ID, status, and failure-category fields are allowlisted. Filenames, file paths, PDF content, document text, output names, passwords, signatures, and uploaded-image names are rejected by the analytics utility.

## Hosting and security

`vercel.json` rewrites non-file routes to `index.html`, so nested SPA routes refresh correctly. Static assets remain directly addressable.

Configured headers include:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying unused sensitive capabilities
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`

A Content Security Policy is intentionally not enabled yet. It must first be tested against PDF.js workers, Blob URLs, canvas/image previews, local downloads, DOCX/PPT conversion libraries, and the optional analytics endpoint.

## Manual launch steps

1. Confirm the final canonical domain and set `VITE_SITE_URL` in Vercel.
2. Replace the governing-law placeholder only after appropriate legal review.
3. Decide whether to configure GitHub issue forms or retain email fallbacks.
4. Decide whether analytics is needed; leave it disabled if not.
5. Deploy, then inspect the rendered metadata for several nested routes.
6. Submit the production sitemap to the relevant search consoles.
7. Test downloads and PDF workers on the deployed origin.

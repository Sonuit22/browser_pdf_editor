# Architecture Guide - PDF by ib

Complete architecture and design patterns for the project.

## Design Principles

### 1. Foundation First
- Build clean foundation before features
- No technical debt from day one
- Structure supports all future additions
- No need to restructure existing code

### 2. Progressive Enhancement
- Works without JavaScript
- Enhances with JavaScript
- Enhanced with Service Worker
- Full PWA features when ready

### 3. Performance First
- HTML/CSS/JS only initially (no frameworks)
- Lazy loading patterns ready
- Code splitting structure in place
- Caching strategy prepared in SW

### 4. Scalability
- Modular folder structure
- Component-based architecture
- Tool-based organization
- Worker threads ready for heavy processing

### 5. Accessibility
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support
- WCAG 2.1 AA compliant

---

## Layer Architecture

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION LAYER                      │
│  (HTML templates, CSS styling, UI components)  │
│                                                 │
│  index.html, privacy.html, terms.html          │
│  components/*, pages/*                         │
│  assets/css/, assets/images/                   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│         APPLICATION LAYER                       │
│  (Business logic, feature implementations)      │
│                                                 │
│  tools/* (PDF operations)                      │
│  utils/* (Helper functions)                    │
│  assets/js/main.js (Orchestration)             │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│         SERVICE LAYER                           │
│  (Background processing, offline support)       │
│                                                 │
│  sw.js (Service Worker)                        │
│  workers/* (Web Workers)                       │
│  manifest.json (PWA)                           │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│         BROWSER APIs                            │
│  (File API, IndexedDB, LocalStorage,           │
│   Service Worker, Web Workers, Canvas, etc.)   │
└─────────────────────────────────────────────────┘
```

---

## Folder Organization

### Root Level Files
```
index.html          - Main entry point, homepage
privacy.html        - Privacy policy (template)
terms.html          - Terms of service (template)
manifest.json       - PWA configuration
sw.js              - Service worker script
robots.txt         - SEO: Search engine crawling rules
sitemap.xml        - SEO: Site structure
README.md          - Project documentation
```

### `/assets/` - Static Resources
**Purpose**: Images, stylesheets, scripts that don't change often

```
assets/
├── css/
│   └── style.css           - Main stylesheet with theming
│
├── js/
│   ├── main.js            - Entry point, initialization
│   └── (future) app.js    - When framework added
│
├── images/
│   ├── logo.svg           - Brand logo
│   ├── screenshots/       - Marketing screenshots
│   └── ...                - Other images
│
├── icons/
│   ├── favicon.ico        - Browser tab icon
│   ├── apple-touch-icon.png
│   ├── icon-192.png       - PWA icons
│   ├── icon-512.png
│   └── ...                - Various size icons
│
└── fonts/
    ├── system fonts loaded via CSS
    └── custom fonts (WOFF2)
```

### `/components/` - Reusable UI Elements
**Purpose**: Building blocks for pages

**Future structure**:
```
components/
├── header/
│   ├── header.html
│   ├── header.css
│   └── header.js
│
├── sidebar/
├── toolbar/
├── modal/
├── button/
├── form/
└── footer/
```

**When to use**: Elements that appear on multiple pages

### `/pages/` - Complete Page Templates
**Purpose**: Full page layouts combining components

**Future structure**:
```
pages/
├── editor.html           - Main PDF editor interface
├── viewer.html           - PDF viewer page
├── merge.html            - Merge PDFs page
├── split.html            - Split PDFs page
├── compress.html         - Compress PDFs page
├── utilities.html         - PDF utility tools page
└── tools.html            - Tools directory page
```

**When to use**: Complete feature pages

### `/tools/` - Feature Implementations
**Purpose**: PDF manipulation and processing logic

**Future structure**:
```
tools/
├── pdf-merger.js         - Merge multiple PDFs
├── pdf-splitter.js       - Extract/remove pages
├── pdf-compressor.js     - Reduce file size
├── watermark.js          - Watermark helpers
├── metadata.js           - Metadata helpers
├── page-editor.js        - Page editing functions
└── export.js             - Export to various formats
```

**Pattern**:
```javascript
// tools/pdf-merger.js
export class PDFMerger {
  async mergePDFs(files) {
    // Implementation
  }
}
```

### `/utils/` - Helper Functions
**Purpose**: Cross-cutting concerns, utility functions

**Future structure**:
```
utils/
├── file-handler.js       - File upload/download
├── validator.js          - Input validation
├── logger.js             - Logging utility
├── storage.js            - LocalStorage wrapper
├── constants.js          - App-wide constants
├── cache-manager.js      - Cache handling
└── performance.js        - Performance monitoring
```

**Pattern**:
```javascript
// utils/file-handler.js
export const FileHandler = {
  async uploadFile(file) { },
  async downloadFile(data) { }
}
```

### `/workers/` - Web Workers
**Purpose**: Background processing (CPU-intensive tasks)

**Future structure**:
```
workers/
├── pdf-processor.worker.js    - Heavy PDF operations
├── image-compressor.worker.js - Image optimization
├── utility.worker.js           - Browser utility processing
└── canvas-renderer.worker.js  - Rendering worker
```

**Pattern**:
```javascript
// workers/pdf-processor.worker.js
self.onmessage = (event) => {
  const result = processPDF(event.data);
  self.postMessage(result);
}
```

### `/docs/` - Developer Documentation
**Purpose**: Guides, references, decisions

**Files**:
```
docs/
├── ARCHITECTURE.md       - This file
├── GETTING_STARTED.md    - Quick start guide
├── SETUP_COMPLETE.md     - Setup verification
├── API.md                - API reference (future)
├── COMPONENTS.md         - Component library (future)
├── TOOLS.md              - Tool implementations (future)
├── DEVELOPMENT.md        - Development guidelines
└── DEPLOYMENT.md         - Deployment guide
```

### `/tests/` - Automated Tests
**Purpose**: Unit, integration, e2e tests

**Future structure**:
```
tests/
├── unit/
│   ├── utils.test.js
│   ├── validator.test.js
│   └── file-handler.test.js
│
├── integration/
│   ├── pdf-merge.test.js
│   ├── pdf-split.test.js
│   └── storage.test.js
│
└── e2e/
    ├── editor.spec.js
    ├── merge-flow.spec.js
    └── download.spec.js
```

---

## Data Flow Architecture

### User Interaction Flow
```
User Action
    ↓
DOM Event (HTML)
    ↓
Event Handler (JavaScript)
    ↓
Utility Function (utils/)
    ↓
Tool Function (tools/)
    ↓
Service Layer (Worker or SW)
    ↓
Browser API (File, Storage, Canvas)
    ↓
Result → UI Update
```

### Example: User Uploads PDF
```
1. Click upload button (HTML)
2. Event handler fires (main.js)
3. FileHandler.uploadFile() called (utils/)
4. PDFProcessor.loadPDF() called (tools/)
5. PDF processing (workers/)
6. Result stored (IndexedDB via utils/)
7. Display preview (components/)
```

---

## State Management

### Levels of State

#### 1. Local Component State
```javascript
// In HTML attributes and data-* attributes
<button data-pdf-id="123">Process</button>
```

#### 2. Session State
```javascript
// In memory during session
const app = {
  currentPDF: null,
  selectedPages: [],
  settings: {}
}
```

#### 3. Persistent State
```javascript
// LocalStorage (small data)
localStorage.setItem('theme', 'dark')

// IndexedDB (large data like PDFs)
const db = indexedDB.open('pdf-editor')
```

#### 4. Service Worker State
```javascript
// Shared between tabs via SW
// Cache API for offline resources
```

---

## Communication Patterns

### 1. Main Thread ↔ Web Worker
```javascript
// Main thread
const worker = new Worker('workers/processor.js')
worker.postMessage({ pdf: data })
worker.onmessage = (event) => {
  console.log(event.data) // Result from worker
}

// Worker thread
self.onmessage = (event) => {
  const result = process(event.data)
  self.postMessage(result)
}
```

### 2. App ↔ Service Worker
```javascript
// App
navigator.serviceWorker.controller.postMessage({
  type: 'CLEAR_CACHE'
})

// Service Worker
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    // Clear cache
  }
})
```

### 3. Component ↔ App
```javascript
// Emit custom events
document.dispatchEvent(new CustomEvent('pdf-loaded', {
  detail: { pdf }
}))

// Listen for events
document.addEventListener('pdf-loaded', (e) => {
  console.log(e.detail.pdf)
})
```

---

## Performance Architecture

### Load Time Optimization
1. **Initial HTML** - Fast (< 100ms)
2. **CSS** - Inline critical styles, defer non-critical
3. **JavaScript** - Async/defer, lazy load features
4. **Assets** - Optimize images, use WebP

### Runtime Optimization
1. **Caching** - Cache network responses
2. **Workers** - Offload heavy processing
3. **Debouncing** - Reduce event handler calls
4. **Virtual Scrolling** - For large lists (future)

### Code Splitting (Future)
```
main.js (core, ~20KB)
├── editor-bundle.js (loaded on demand)
├── merge-bundle.js (loaded on demand)
└── utilities-bundle.js (loaded on demand)
```

---

## Security Architecture

### Input Validation
```
User Input → Validate → Sanitize → Use
```

### Data Storage
```
LocalStorage → Non-sensitive preferences only
IndexedDB   → Large data, encrypted if needed
SessionStorage → Temporary data, cleared on close
```

### Network
```
HTTPS Only → All communications encrypted
CORS → Control cross-origin requests
CSP → Content Security Policy headers
```

### PDF Handling
```
PDF File → Parse locally → Process → Delete
```

---

## Future Framework Integration

### When Adding React/Vue/etc:
1. Keep `/tools/`, `/utils/`, `/workers/` unchanged
2. Move HTML to components (JSX/templates)
3. Import CSS and JS modules
4. Update build process (add Webpack/Vite)
5. Components still use same utility functions

### Minimal Restructuring Needed
- ✅ Keep all business logic in tools/
- ✅ Keep helpers in utils/
- ✅ Keep workers in workers/
- ✅ Only change: presentation layer

---

## Scaling Strategy

### Current Phase: Pure HTML/CSS/JS
- Simple, fast, no build step
- Good for learning and foundation

### Phase 2: When Adding Features
- Add pdf.js library
- Add testing framework
- Keep architecture same

### Phase 3: When Scaling
- Add build tool (Vite)
- Add framework (React/Vue optional)
- Implement lazy loading
- Add caching strategies

### Phase 4: Enterprise
- Add backend API (if needed)
- Add authentication
- Add team collaboration
- Add advanced analytics

---

## Design Decisions & Trade-offs

### Why No Framework Initially?
| Aspect | Vanilla JS | Framework |
|--------|-----------|-----------|
| Bundle Size | ~5KB | ~50KB |
| Load Time | Instant | ~2s |
| Learning Curve | Low | High |
| Feature Complexity | Simple | Complex |
| Can add later? | Yes ✅ | Yes ✅ |

### Why Service Worker First?
- Offline support foundation
- Caching strategy preparation
- PWA readiness
- Progressive enhancement

### Why CSS Variables?
- Dynamic theming
- Dark mode support
- Consistent design
- Easy to maintain

---

## Testing Strategy

### Unit Tests (tools/, utils/)
```javascript
// Test individual functions
test('mergePDFs combines documents', () => {
  const result = PDFMerger.mergePDFs([...])
  expect(result).toBeDefined()
})
```

### Integration Tests (tools/ + utils/)
```javascript
// Test feature workflows
test('Upload → Edit → Save flow', async () => {
  const file = await uploadPDF()
  const edited = await editPDF(file)
  expect(edited).toBeDefined()
})
```

### E2E Tests (Full user flow)
```javascript
// Test in real browser
test('User can upload and download PDF', async () => {
  await page.goto('/')
  await page.click('[data-upload]')
  // ... full user workflow
})
```

---

## Monitoring & Analytics

### Usage Analytics
- Page views
- Feature usage
- Error rates
- Performance metrics

### Performance Monitoring
- Page load time
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- First Contentful Paint (FCP)

### Error Tracking
- Console errors
- Unhandled rejections
- API failures
- User-reported issues

---

## Versioning

```
v0.1.0 - Foundation (HTML/CSS/JS only)
v0.2.0 - PDF Viewer (pdf.js integration)
v0.3.0 - Basic Editor (annotations, text)
v1.0.0 - Core Features (merge, split, compress)
v1.1.0 - Advanced Productivity Tools
v2.0.0 - PWA Features (offline, install)
```

---

## Maintenance Schedule

| Frequency | Task |
|-----------|------|
| Daily | Monitor errors, user feedback |
| Weekly | Check security advisories |
| Monthly | Update dependencies, patch bugs |
| Quarterly | Plan features, review analytics |
| Annually | Audit codebase, refactor |

---

## References

- [README.md](../README.md) - Full project documentation
- [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards
- [PWA Guide](https://web.dev/progressive-web-apps/) - PWA patterns
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) - Future component approach

---

**Architecture designed for scalability, maintainability, and future-proofing**

*Last updated: July 16, 2026*

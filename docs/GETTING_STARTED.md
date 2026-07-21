# Getting Started with PDF by ib

Quick start guide for developers setting up the project locally.

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git installed
- Text editor or VS Code

**No Node.js required** - This is a pure HTML/CSS/JS project (for now).

---

## Step 1: Clone or Open Project

If you already have the project folder:
```bash
cd browser_pdf_editor
```

If cloning from GitHub:
```bash
git clone https://github.com/yourusername/browser-pdf-editor.git
cd browser-pdf-editor
```

---

## Step 2: Start Local Server

### Option A: Python 3 (Built-in on Mac/Linux)
```bash
python -m http.server 8000
# Visit: http://localhost:8000
```

### Option B: Node.js (if installed)
```bash
npx http-server
# Visit: http://localhost:8080
```

### Option C: VS Code Live Server Extension
1. Install "Live Server" extension
2. Right-click index.html → "Open with Live Server"
3. Browser opens automatically

### Option D: PHP (if installed)
```bash
php -S localhost:8000
# Visit: http://localhost:8000
```

---

## Step 3: Verify Foundation

### In Browser

1. **Visit http://localhost:8000**
   - Should see "PDF by ib" title
   - Should see "Coming Soon" message
   - Links to Privacy and Terms should work

2. **Check Service Worker**
   - Open DevTools (F12 or right-click → Inspect)
   - Go to "Application" tab
   - Click "Service Workers"
   - Should show "sw.js" with status "activated and running"

3. **Check Manifest**
   - Still in Application tab
   - Click "Manifest"
   - Should show app name, icons, colors, etc.

4. **Check Console**
   - Go to "Console" tab
   - Should see messages:
     ```
     [App] Initializing PDF by ib
     [ServiceWorker] Registration successful
     [App] Initialization complete
     ```
   - Should see NO errors ❌

### In VS Code

1. **Validate HTML**
   - Install extension: "HTML Validator"
   - Should show no errors

2. **Check File Structure**
   - Open terminal in project folder
   - Run: `dir` (Windows) or `ls -la` (Mac/Linux)
   - Should see all folders and files from README.md

---

## Step 4: Make First Edit

### Edit index.html

1. Open `index.html` in your editor
2. Find the line: `<p>Coming Soon</p>`
3. Change to: `<p>Welcome to PDF by ib 👋</p>`
4. Save file (Ctrl+S)
5. Refresh browser
6. Should see your change immediately

---

## Step 5: Commit to Git

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Welcome message update"

# View log
git log --oneline
```

---

## Project Structure Quick Reference

```
browser-pdf-editor/
├── index.html          ← Homepage (start here)
├── privacy.html        ← Legal page
├── terms.html          ← Legal page
├── manifest.json       ← PWA config
├── sw.js              ← Service Worker
├── robots.txt         ← SEO
├── sitemap.xml        ← SEO
│
├── assets/
│   ├── css/style.css  ← Main styles
│   ├── js/main.js     ← Main script
│   ├── images/        ← (Empty - for images)
│   ├── icons/         ← (Empty - for app icons)
│   └── fonts/         ← (Empty - for fonts)
│
├── components/        ← (Empty - for components)
├── pages/             ← (Empty - for pages)
├── tools/             ← (Empty - for PDF tools)
├── utils/             ← (Empty - for helpers)
├── workers/           ← (Empty - for Web Workers)
├── docs/              ← Documentation
├── tests/             ← (Empty - for tests)
│
└── README.md          ← Full documentation
```

---

## Common Tasks

### View Source Code

Open these files to understand the foundation:

1. **index.html** - See semantic HTML structure, SEO tags, meta tags
2. **assets/css/style.css** - See CSS variables, responsive design
3. **assets/js/main.js** - See SW registration, feature detection
4. **sw.js** - See service worker lifecycle
5. **manifest.json** - See PWA configuration

### Add New CSS

1. Open `assets/css/style.css`
2. Add your CSS at the bottom
3. Refresh browser (Ctrl+R)
4. Changes appear immediately

### Add New JavaScript

1. Open `assets/js/main.js`
2. Add functions before the last line
3. Call them from `initializeApp()` or event listeners
4. Refresh browser
5. Changes appear immediately

### Create New Page

1. Create `pages/something.html`
2. Copy content from `index.html`
3. Modify title and content
4. Create link in navigation
5. Test in browser

---

## Troubleshooting

### "Cannot GET /"
- Make sure you started a local server
- Try http://localhost:8000 (not just localhost)
- Check server output in terminal

### Service Worker not showing
- Press Ctrl+Shift+Delete to clear cache
- Refresh page
- Check DevTools again

### CSS changes not showing
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or: Ctrl+F5
- Or: Open DevTools → Settings → Disable cache (while DevTools open)

### JavaScript errors
- Open DevTools → Console tab
- Read error messages
- Check browser compatibility
- Try different browser

---

## Next Steps

### For Learning
1. Read [README.md](../README.md) - Full architecture
2. Read [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - What was created
3. Explore each folder
4. Read comments in CSS and JS

### For Development
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test in browser
4. Commit: `git commit -m "feat: my feature"`
5. Create Pull Request on GitHub

### For Deployment
1. Push to GitHub: `git push origin main`
2. GitHub Actions runs tests
3. Vercel auto-deploys
4. Check your domain: pdfeditorbyib.com

---

## Useful Links

- **HTML Reference**: https://developer.mozilla.org/en-US/docs/Web/HTML
- **CSS Reference**: https://developer.mozilla.org/en-US/docs/Web/CSS
- **JavaScript Reference**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **PWA Guide**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Web APIs**: https://developer.mozilla.org/en-US/docs/Web/API

---

## Questions?

- Check [README.md](../README.md) for full documentation
- Check [docs/](.) for architecture guides
- Check [SECURITY.md](../SECURITY.md) for security info
- Check comments in source files

---

**Happy coding! 🚀**

*Last updated: July 16, 2026*

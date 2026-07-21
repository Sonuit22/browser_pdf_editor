# Vercel Setup: Step-by-Step Visual Guide

## 🎯 Goal

Deploy your static HTML/CSS/JS site to Vercel with automatic GitHub integration.

**Time**: ~10 minutes (5 min import + 2 min deploy + 3 min verify)

---

## Step 1: Access Vercel

### 1.1 Visit Vercel Homepage

**URL**: https://vercel.com

You'll see the Vercel landing page with options to sign up or log in.

### 1.2 Click "Sign Up" or "Log In"

**Look for**: Blue button in top right corner

If you already have a Vercel account, click **"Log In"**.

Otherwise, click **"Sign Up"**.

---

## Step 2: Authenticate with GitHub

### 2.1 Choose GitHub Authentication

When asked how to sign up/log in, **select**:

```
Continue with GitHub
```

(This is the easiest method - Vercel will access your GitHub repos)

### 2.2 Authorize Vercel

GitHub will ask for permission. Click:

```
Authorize Vercel
```

Vercel now has access to your GitHub repositories.

### 2.3 Confirm You're Logged In

After login, you'll see the Vercel Dashboard showing:
- Recent projects
- Teams
- Settings
- Option to create new project

---

## Step 3: Create New Project

### 3.1 Add New Project

On the dashboard, look for:

```
Add New...  →  Project
```

**Click it**.

You'll see options to:
- Import Git Repository
- Clone a template
- Continue from CLI

### 3.2 Select "Import Git Repository"

Click **"Import Git Repository"**.

Vercel will connect to your GitHub account and show a list of your repositories.

---

## Step 4: Select Your Repository

### 4.1 Find Your Repository

In the list, look for:

```
Sonuit22 / browser_pdf_editor
```

(Or search by typing "browser_pdf_editor" in the search box)

### 4.2 Click "Import"

Next to your repository, click the **"Import"** button.

Vercel will load the repository settings page.

---

## Step 5: Configure Project Settings

### 5.1 Project Name

**Field**: "Project Name"

**Default Value**: `browser_pdf_editor`

**Action**: Leave as default (no change needed)

### 5.2 Framework Selection

**Field**: "Framework Preset"

**Look for**: Dropdown menu

**Select**: `Other`

(Because this is static HTML/CSS/JS, not a framework)

### 5.3 Root Directory

**Field**: "Root Directory"

**Default Value**: `.` (repository root)

**Action**: Leave as default (no change needed)

All your files are in the root.

### 5.4 Build Command

**Field**: "Build Command"

**Action**: Leave empty

(No build step needed - static files)

### 5.5 Output Directory

**Field**: "Output Directory"

**Action**: Leave empty

(Serve directly from repository root)

### 5.6 Environment Variables

**Field**: "Environment Variables"

**Action**: Skip for now

(Can be added later when integrating APIs)

---

## Step 6: Deploy

### 6.1 Review Settings

Before deploying, verify:

```
Project Name:        browser_pdf_editor
Framework:          Other
Root Directory:     .
Build Command:      (empty)
Output Directory:   (empty)
```

All correct? ✅

### 6.2 Click "Deploy"

Vercel will:
1. Clone your GitHub repository
2. Analyze the project structure
3. Deploy to global CDN
4. Generate a production URL

**This takes 1-2 minutes.**

You'll see a progress bar and deployment logs.

### 6.3 Wait for "Ready"

Look for:

```
✅ Ready — Deployed to Production
```

Green checkmark = Success!

---

## Step 7: Get Your Production URL

### 7.1 Copy Your URL

After deployment completes, Vercel shows:

```
Visit Production: https://browser-pdf-editor.vercel.app
```

(Your actual URL will be different)

**Copy this URL**.

### 7.2 Visit Your Site

Open the URL in your browser.

You should see your **PDF by ib** homepage!

---

## Step 8: Test Your Live Site

### 8.1 Homepage Test

**Visit**: Your Vercel URL

Verify:
- [ ] Page loads without errors
- [ ] All CSS applied (layout looks correct)
- [ ] No white flash or unstyled content
- [ ] All images load (if you have any)

### 8.2 Navigation Test

**Click these links**:
- [ ] Privacy Policy (should load /privacy.html)
- [ ] Terms of Service (should load /terms.html)

### 8.3 Responsive Test

**Resize browser window**:
- [ ] Mobile view works (375px width)
- [ ] Tablet view works (768px width)
- [ ] Desktop view works (1920px width)

### 8.4 Console Check

**Open DevTools** (Press F12):
- [ ] Go to "Console" tab
- [ ] Check for red errors
- [ ] Should see no errors or warnings

**All green?** ✅ Deployment successful!

---

## Step 9: Verify GitHub Integration

### 9.1 On Vercel Dashboard

Go to your project's Vercel dashboard:

1. Click your project name: **browser_pdf_editor**
2. Go to **Settings** → **Git**
3. Verify:
   - [ ] GitHub is connected
   - [ ] Repository shows: `Sonuit22/browser_pdf_editor`
   - [ ] Branch shows: `main`
   - [ ] "Automatically Production Deploy" is enabled

### 9.2 Deployments Tab

Click **Deployments** tab on your project:

1. See your latest deployment (from import)
2. Status should show: **✅ Ready**
3. This is your production version

---

## Step 10: Test Automatic Deployment

### 10.1 Make a Test Change

On your local machine:

1. Open `index.html`
2. Change something small (like add a comment in HTML)
3. Save file
4. Commit and push:

```bash
git add .
git commit -m "test: Verify auto-deployment"
git push origin main
```

### 10.2 Watch Deployment

On Vercel dashboard:

1. Go to **Deployments** tab
2. You should see a new deployment starting
3. Status: "Building..."
4. Wait for it to complete (1-2 minutes)
5. Status changes to "Ready"

### 10.3 Verify Live Site

Visit your Vercel URL again:
- [ ] Your change is visible
- [ ] Page loaded with new content

**Auto-deployment works!** ✅

---

## Common Issues & Solutions

### Issue: "Framework could not be detected"

**Solution**: This is OK! Vercel will serve static files. Just select `Other` in Framework Preset.

### Issue: "404 error on privacy.html"

**Solution**: Make sure you're accessing the full URL:
```
https://your-url/privacy.html
```

Not:
```
https://your-url/privacy
```

### Issue: "Site loads but CSS is missing"

**Solution**: Check asset paths. Verify `<link href="assets/css/style.css">` in your HTML is correct.

### Issue: "Deployment fails"

**Solution**: Check Vercel logs:
1. Go to failed deployment
2. Click "Logs"
3. Look for error message
4. Usually related to missing files or incorrect paths

---

## Success Indicators

✅ You're done when you see:

- [ ] Vercel shows "✅ Ready — Deployed to Production"
- [ ] Your homepage loads at the Vercel URL
- [ ] Privacy and Terms pages load
- [ ] No console errors (F12 → Console)
- [ ] CSS and JavaScript load correctly
- [ ] Mobile layout displays properly
- [ ] HTTPS is active (green lock icon)
- [ ] Auto-deployment works (test push triggers deploy)

---

## Your New Workflow

From this point forward:

```
1. Make changes locally
2. Test in browser
3. Commit: git commit -m "..."
4. Push: git push origin main
5. Vercel auto-deploys
6. Check Vercel dashboard
7. Done! Site is live
```

No FTP. No manual uploads. No waiting.

---

## Next: Configure Custom Domain (Step 4)

Once verified, you can:

1. Add your custom domain: `pdfeditorbyib.com`
2. Configure DNS
3. Enable SSL (automatic)

For now, your site is live on:
```
https://browser-pdf-editor.vercel.app
```

---

## Support Links

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Integration**: https://vercel.com/docs/concepts/git
- **Deployments Guide**: https://vercel.com/docs/concepts/deployments/overview
- **Troubleshooting**: https://vercel.com/docs/support

---

*This guide prepared: July 16, 2026*

**Next**: Follow the 10 steps above to deploy your site.

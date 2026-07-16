# GitHub Repository Setup - Step-by-Step Guide

## 📋 Checklist Before You Start

- [ ] You have a GitHub account
- [ ] You're logged into GitHub
- [ ] You have Git installed locally
- [ ] Your local repository has commits
- [ ] You've read the Git workflow guide

---

## Step 1: Create GitHub Repository

### 1.1 Go to GitHub New Repository

1. Visit [github.com/new](https://github.com/new)
2. You should see the "Create a new repository" form

### 1.2 Fill in Repository Details

**Repository name** (Required)
```
browser-pdf-editor
```
Or if you prefer:
```
pdf-editor-by-ib
```

**Description** (Recommended)
```
A free, browser-based PDF editor. View, edit, merge, split, and compress PDFs 
directly in your browser. No installation needed. 100% client-side processing.
```

**Public or Private?**
- **Public** ← Recommended (open source)
- Private (if you want to keep it private)

### 1.3 Repository Settings

**DO NOT INITIALIZE with:**
- ❌ README (we already have one)
- ❌ .gitignore (we already have one)
- ❌ License (we'll add later if needed)

### 1.4 Create Repository

Click the green **"Create repository"** button.

You'll see a page that says "Quick setup — if you've done this kind of thing before"

---

## Step 2: Connect Your Local Repository

### 2.1 Get Your Repository URL

On the GitHub repository page, look for the green **"Code"** button.

Click it and copy the HTTPS URL:
```
https://github.com/YOUR_USERNAME/browser-pdf-editor.git
```

**Important**: Make sure you copy YOUR actual GitHub username, not the placeholder.

### 2.2 Configure Remote in Local Repository

Open PowerShell/Terminal in your project folder:

```bash
cd "C:\Users\Sonu Kumar\Desktop\browser_pdf_editor"
```

Add the GitHub repository as "origin":

```bash
git remote add origin https://github.com/YOUR_USERNAME/browser-pdf-editor.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 2.3 Verify Remote Configuration

```bash
git remote -v
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/browser-pdf-editor.git (fetch)
origin  https://github.com/YOUR_USERNAME/browser-pdf-editor.git (push)
```

If you see this, you're good! ✅

If you made a mistake:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/browser-pdf-editor.git
```

---

## Step 3: Verify Local Branch

### 3.1 Check Your Current Branch

```bash
git branch
```

**Expected output:**
```
* main
```

If you see `master` instead:
```bash
git branch -M main
```

### 3.2 Verify Commits Exist

```bash
git log --oneline
```

**Expected output:** At least one commit, like:
```
abc1234 Initial project foundation
```

---

## Step 4: Push to GitHub

### 4.1 Push Your Code

This command pushes your commits to GitHub and sets up tracking:

```bash
git push -u origin main
```

**What this does:**
- `-u` = Set up tracking with GitHub
- `origin` = Your GitHub repository
- `main` = Your branch name

### 4.2 Wait for It to Complete

You might be asked to authenticate:
- Enter your GitHub username
- Use a Personal Access Token as password (not your actual password)

**If you don't have a token:**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Check these boxes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow` (update GitHub Action workflows)
4. Click "Generate token"
5. Copy the token (you won't see it again!)
6. Use it as your password when Git asks

### 4.3 Verify Push Success

In PowerShell/Terminal:

```bash
git log --oneline -1
git status
```

**Expected output:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

This means your code is now on GitHub! ✅

---

## Step 5: Verify on GitHub

### 5.1 Refresh GitHub Repository Page

Go to `https://github.com/YOUR_USERNAME/browser-pdf-editor`

You should see:
- ✅ All your files from Step 1
- ✅ Your commit message ("Initial project foundation")
- ✅ Branch name shows "main"
- ✅ File count matches local repository

### 5.2 Check Folder Structure

On GitHub, you should see:
- ✅ `.github/` folder (with workflows and agents)
- ✅ `assets/` folder (with css, js, images, icons, fonts)
- ✅ `components/`, `pages/`, `tools/`, `utils/`, `workers/` (empty but present)
- ✅ `docs/` folder (with setup and architecture guides)
- ✅ `tests/` folder
- ✅ `index.html`, `privacy.html`, `terms.html`
- ✅ `manifest.json`, `sw.js`, `robots.txt`, `sitemap.xml`
- ✅ `README.md`, `SECURITY.md`
- ✅ `.gitignore`, `.gitattributes`, `package.json`, `vercel.json`

If you see all these, you're good! ✅

### 5.3 Check Recent Commits

Click on the commit hash (looks like `abc1234`)

You should see:
- ✅ Your commit message
- ✅ Files changed (all project files)
- ✅ Lines added (green) and removed (red)

---

## Step 6: Configure GitHub Settings (Optional but Recommended)

### 6.1 Go to Repository Settings

1. On your GitHub repository page
2. Click **Settings** (⚙️ icon, near top right)
3. You should see the Settings sidebar

### 6.2 Configure General Settings

**Under "Default branch":**
- Make sure `main` is selected (it should be)

**Under "Automatically delete head branches":**
- ✅ Enable this (cleans up merged branches automatically)

### 6.3 Configure Security

**Under "Code security and analysis":**
- ✅ Enable "Dependabot alerts" (warns about vulnerable dependencies)
- ✅ Enable "Dependabot security updates" (auto-fixes security issues)

### 6.4 Add Collaborators (If Needed)

**Under "Manage access":**
- If you want to add team members, add them here

### 6.5 GitHub Pages (Optional - for Project Website)

**Under "Pages":**
- You can set up a project website
- For now, just note this option exists
- Will configure when adding project documentation site

---

## Step 7: Connect with Vercel (Auto-Deployment)

### 7.1 Visit Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (click "Continue with GitHub")
3. Authorize Vercel to access your GitHub account

### 7.2 Import Your Repository

1. Click "New Project"
2. Find `browser-pdf-editor` in the list
3. Click "Import"

### 7.3 Configure Project

**Framework Preset**: Select `Other` (static site)

**Root Directory**: `.` (current directory)

**Build Command**: Leave empty (it's static HTML/CSS/JS)

**Output Directory**: Leave empty

### 7.4 Deploy

Click the blue **"Deploy"** button.

Vercel will:
1. Build your project
2. Deploy to production
3. Give you a live URL

**Your site is now live!** 🎉

### 7.5 Custom Domain (Future)

Once deployed, you can:
1. Add your domain (pdfeditorbyib.com)
2. Configure DNS settings
3. Enable HTTPS (automatic)

---

## Step 8: Enable GitHub Actions

### 8.1 Check Actions

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see your `deploy.yml` workflow

### 8.2 Verify Workflow

Look for:
- ✅ `Deploy to Vercel/Netlify` workflow
- ✅ Recent run (should be green ✅ if it passed)
- ✅ Status checks listed

### 8.3 If Workflow Failed

Click on the failed run to see error details.

Common issues:
- Node.js version mismatch
- Missing dependencies
- Syntax errors in code

(Should not happen with Step 1 foundation)

---

## Step 9: Daily Development

### 9.1 Before Starting Work

```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

### 9.2 Make Your Changes

Edit files in VS Code as normal.

### 9.3 Commit and Push

```bash
git add .
git commit -m "feat: Add my new feature"
git push origin feature/my-new-feature
```

### 9.4 Create Pull Request (Optional)

On GitHub:
1. You'll see a notification about your new branch
2. Click **"Compare & pull request"**
3. Add description
4. Click **"Create pull request"**

Vercel will automatically create a preview URL!

### 9.5 Merge to Main

Once you're happy:
1. Click **"Merge pull request"** (on GitHub)
2. Vercel auto-deploys to production
3. Your site updates live!

---

## 🔐 Security Checklist

- [ ] No `.env` files committed
- [ ] No API keys in code
- [ ] `.gitignore` is comprehensive
- [ ] GitHub secrets configured (if using APIs)
- [ ] Branch protection enabled on `main`
- [ ] Dependabot alerts enabled

---

## ✅ Final Verification

### Check These Points

```bash
# 1. Local repository connected to GitHub?
git remote -v

# 2. Commits pushed to GitHub?
git log -1

# 3. On the main branch?
git branch

# 4. No uncommitted changes?
git status
```

**All green?** You're ready! ✅

### On GitHub Website

- [ ] Repository exists at correct URL
- [ ] All files visible
- [ ] Commit history shows correctly
- [ ] `main` branch is default
- [ ] GitHub Actions shows workflow (green checkmark)
- [ ] Vercel integration active
- [ ] Live site accessible

---

## 🆘 Troubleshooting

### "fatal: origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/browser-pdf-editor.git
```

### "authentication failed"
- Use a GitHub Personal Access Token (not your password)
- Generate one at [github.com/settings/tokens](https://github.com/settings/tokens)

### "rejected: main → main (non-fast-forward)"
```bash
git pull origin main
git push origin main
```

### "fatal: A branch named 'main' already exists"
```bash
git branch -M main
```

### Push not showing on GitHub
- Wait a moment (GitHub sometimes takes a few seconds)
- Refresh the GitHub page
- Check if you're on the right repository

---

## 📞 Getting Help

- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Git Tutorials**: [git-scm.com](https://git-scm.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Community**: [github.community](https://github.community)

---

## Summary

After completing these steps:

✅ GitHub repository created  
✅ Local repository connected  
✅ Code pushed to GitHub  
✅ Vercel deployment active  
✅ GitHub Actions configured  
✅ Ready for development  
✅ Auto-deployment working  

**You're all set!** 🚀

Push code → GitHub → Vercel → Live! ✨

---

*Last updated: July 16, 2026*

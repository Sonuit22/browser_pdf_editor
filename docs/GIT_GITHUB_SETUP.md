# Git & GitHub Setup Guide - PDF Editor by ib

## Current Status ✅

Git has been initialized locally with the initial commit already created. 

### What's Done
- ✅ Git repository initialized (`.git/` folder present)
- ✅ `.gitignore` configured (comprehensive, production-ready)
- ✅ `.gitattributes` configured (line ending consistency)
- ✅ Initial commit created (foundation files)
- ✅ All project files staged and committed

### What's Next
1. Create GitHub repository
2. Connect local repository to GitHub
3. Push initial commit to GitHub
4. Configure GitHub settings
5. Enable Vercel auto-deployment

---

## 🔧 Step 1: Verify Local Git Setup

### Check Current Status

Run this command to see the repository state:

```bash
cd "C:\Users\Sonu Kumar\Desktop\browser_pdf_editor"
git log --oneline
```

**Expected output**: Should show at least one commit (the initial foundation commit)

### Check Git Configuration

```bash
git config --local user.name
git config --local user.email
```

**If empty**, configure Git user:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### View Commit History

```bash
git log --oneline --graph --all
```

**Expected**: Clean history with initial commit

---

## 🚀 Step 2: Create GitHub Repository

### Create on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `browser-pdf-editor` (or `pdf-editor-by-ib`)
3. **Description**: "A free, browser-based PDF editor. View, edit, merge, split, and compress PDFs directly in your browser."
4. **Public** (recommended for open-source)
5. **Do NOT initialize with:**
   - README (we have one)
   - .gitignore (we have one)
   - License (add later if needed)
6. Click **Create repository**

### After Creation

GitHub will show commands. **Use the ones below instead** (more reliable):

---

## 🔌 Step 3: Connect to GitHub

### Add Remote Repository

Replace `<username>` with your GitHub username:

```bash
git remote add origin https://github.com/<username>/browser-pdf-editor.git
```

### Verify Remote

```bash
git remote -v
```

**Expected output**:
```
origin  https://github.com/<username>/browser-pdf-editor.git (fetch)
origin  https://github.com/<username>/browser-pdf-editor.git (push)
```

### Rename Default Branch

If your local branch is not `main`, rename it:

```bash
git branch -M main
```

### Push to GitHub

```bash
git push -u origin main
```

This will:
- Push all commits to GitHub
- Set `main` as the default branch
- Configure upstream tracking

### Verify Push Success

```bash
git log --oneline
git status
```

Both should show:
- ✅ Commits are on GitHub
- ✅ No uncommitted changes
- ✅ Branch is tracking `origin/main`

---

## 📋 Step 4: GitHub Repository Settings

### Configure Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Configure these settings:

#### General Settings
- **Default branch**: Set to `main`
- **Require branches to be up to date before merging**: Enable
- **Require status checks to pass**: Enable (GitHub Actions)
- **Require approvals**: Optional
- **Require code reviews**: Optional for solo development

#### Branch Protection Rules (Optional but Recommended)
1. Click **Branches** (left sidebar)
2. Add rule for `main` branch:
   - Require a pull request
   - Require status checks to pass
   - Require branches to be up to date

#### Secrets & Variables
1. Click **Secrets and variables** (left sidebar)
2. Click **Actions**
3. Add these if needed (currently empty, add when Phase 1 starts):
   - `VERCEL_TOKEN` (if auto-deploying to Vercel)
   - Any API keys when features are added

---

## 🔄 Step 5: Git Workflow

### Daily Development Workflow

```bash
# 1. Create feature branch from main
git checkout -b feature/pdf-viewer
git checkout -b feature/merge-pdfs
git checkout -b feature/pdf-utilities

# 2. Make changes locally
# (Edit files in your editor)

# 3. Test locally
# (Run tests, verify in browser)

# 4. Check what changed
git status
git diff

# 5. Stage changes
git add .
# Or stage specific files:
git add assets/js/main.js
git add docs/ARCHITECTURE.md

# 6. Commit with clear message
git commit -m "feat: Add PDF viewer with pdf.js"

# 7. Push to GitHub
git push origin feature/pdf-viewer

# 8. Create Pull Request on GitHub (optional for solo work)
# Or merge directly if solo development:
git checkout main
git merge feature/pdf-viewer
git push origin main

# 9. Delete branch locally
git branch -d feature/pdf-viewer

# 10. Vercel auto-deploys when code lands on main
```

### Important Rules

✅ **Always** work on feature branches  
✅ **Never** commit directly to `main`  
✅ **Always** test locally before pushing  
✅ **Always** write clear commit messages  
✅ **Never** force-push (`git push -f`) to `main`  
❌ **Don't** commit `.env` files with secrets  
❌ **Don't** commit build artifacts  
❌ **Don't** commit `node_modules/` folder  

---

## 💬 Step 6: Commit Message Convention

### Format

```
<type>: <subject>
```

### Types

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (no logic change) |
| `refactor` | Code reorganization |
| `test` | Add or update tests |
| `chore` | Dependencies, config, tooling |
| `perf` | Performance improvement |

### Examples

✅ **Good**
```
feat: Add PDF viewer with page navigation
fix: Correct service worker caching logic
docs: Update API documentation
refactor: Reorganize utils folder structure
perf: Optimize image loading in toolbar
test: Add unit tests for file validator
chore: Update dependencies
```

❌ **Bad**
```
update
fix stuff
changes
WIP
asdf
Update README
```

### Subject Line Rules

- Use imperative mood ("add" not "added" or "adds")
- Start with lowercase (except when naming things)
- No period at the end
- Max 50 characters
- Be specific and descriptive

### Example with Details

For complex changes, add more detail:

```
feat: Implement PDF merge functionality

- Add file selection UI in merge.html
- Create merge algorithm in tools/pdf-merger.js
- Add unit tests in tests/pdf-merger.test.js
- Update docs with merge API reference
- Resolves #15
```

---

## 🔐 Step 7: Security Best Practices

### Never Commit Secrets

```bash
# ❌ WRONG - Don't commit this
API_KEY=sk-1234567890abcdef...

# ✅ CORRECT - Use .env.example as template
# Add real API_KEY in .env (which is in .gitignore)
```

### Check Before Pushing

```bash
# See what you're about to push
git diff origin/main..HEAD

# Check for accidentally staged secrets
git diff --cached

# If you see secrets, STOP and fix:
git reset HEAD <file>
git checkout -- <file>
```

### Secret Rotation

If you accidentally commit a secret:

1. **Immediately rotate** the secret (generate new API key)
2. Remove from Git history (advanced Git command)
3. Add to `.gitignore` for future
4. Create a new commit

---

## 📊 Step 8: Monitoring & Maintenance

### Regular Tasks

#### Daily
```bash
git status  # Check uncommitted changes
git log -1  # See latest commit
```

#### Before Push
```bash
git log --oneline origin/main..HEAD  # See your changes
git diff origin/main                 # See exact changes
```

#### Weekly
```bash
git log --oneline -10  # See recent history
git branch -a          # See all branches
```

#### Monthly
```bash
git log --oneline --all           # Full history
git reflog                         # See all actions
git remote -v                      # See connections
```

### Cleanup

```bash
# Delete local branches that no longer exist on GitHub
git fetch -p

# Delete local feature branch after merging
git branch -d feature/old-feature

# See which branches can be deleted
git branch -v
```

---

## 🔗 Step 9: Connect with Vercel (Deployment)

### Automatic Deployment

Vercel automatically deploys when you push to GitHub:

```
Your Push to GitHub
        ↓
GitHub Actions Runs (CI/CD)
        ↓
Tests Pass
        ↓
Vercel Detects Change
        ↓
Vercel Deploys to Production
        ↓
Your Site Updates Live
```

### Setup Vercel

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your `browser-pdf-editor` repository
5. Click "Import"
6. Framework: **Other** (static site)
7. Root Directory: `.` (current)
8. Build Command: (leave empty - it's static)
9. Output Directory: (leave empty - uses public files)
10. Click "Deploy"

### After Deployment

Every push to `main` will:
- ✅ Run GitHub Actions (tests, security checks)
- ✅ Deploy to production (pdfeditorbyib.com)
- ✅ Create preview for pull requests
- ✅ Show deployment status in GitHub

---

## 📝 Step 10: Documentation Updates

### Keep Docs Current

When adding features, update:

1. **README.md** - Update feature list
2. **docs/ARCHITECTURE.md** - Update if structure changes
3. **Commit message** - Explain the change

### Future Documentation

When Phase 1 begins, create:

- `docs/API.md` - Tool APIs
- `docs/COMPONENTS.md` - Component library
- `docs/DEPLOYMENT.md` - Deployment guide

---

## ✅ Validation Checklist

Run these commands to verify everything is set up correctly:

### Local Repository

```bash
# 1. Check Git is initialized
git rev-parse --git-dir
# Expected: .git

# 2. Check main branch exists
git branch
# Expected: * main

# 3. Check commits exist
git log --oneline
# Expected: At least one commit

# 4. Check no uncommitted changes
git status
# Expected: "On branch main" and "nothing to commit"
```

### Remote Repository

```bash
# 5. Check remote is configured
git remote -v
# Expected: Shows origin with GitHub URL

# 6. Check tracking branch
git branch -v
# Expected: main tracking origin/main

# 7. Verify push works
git push --dry-run
# Expected: No errors (should show what would push, nothing if current)
```

### GitHub Repository

```
# 8. Visit your GitHub repo
https://github.com/<username>/browser-pdf-editor

# Expected to see:
✅ All files from Step 1 (HTML, CSS, JS, etc.)
✅ Correct branch name (main)
✅ "Initial project foundation" commit
✅ .github/workflows visible
✅ Green checkmark on commits (if CI/CD configured)
```

### GitHub Actions

```
# 9. Check GitHub Actions status
https://github.com/<username>/browser-pdf-editor/actions

# Expected:
✅ Deploy workflow exists
✅ Latest run shows green checkmark
✅ Security checks passed
```

---

## 🎯 Quick Reference Commands

### Most Common Commands

```bash
# See what changed since last commit
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: Description of change"

# Push to GitHub
git push

# See last 5 commits
git log --oneline -5

# Create and switch to feature branch
git checkout -b feature/name

# Switch to main branch
git checkout main

# See the difference
git diff

# Undo uncommitted changes in a file
git checkout -- filename.txt

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See remote configuration
git remote -v
```

### Emergency Commands

```bash
# See everything you've done
git reflog

# Undo a pushed commit (careful!)
git revert HEAD

# Check what will be pushed
git diff origin/main..HEAD
```

---

## 📚 Additional Resources

- [GitHub Guide](https://guides.github.com/)
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Commit Message Convention](https://www.conventionalcommits.org/)
- [Vercel Docs](https://vercel.com/docs)

---

## Summary

### What's Complete ✅
- ✅ Git repository initialized locally
- ✅ `.gitignore` configured
- ✅ `.gitattributes` configured
- ✅ Initial commit created
- ✅ Project structure stable

### What's Ready ✅
- ✅ To push to GitHub
- ✅ To connect with Vercel
- ✅ For team collaboration
- ✅ For continuous deployment
- ✅ For professional development

### Next Action
1. Create GitHub repository (if not done)
2. Run `git remote add origin` command
3. Run `git push -u origin main`
4. Verify on GitHub
5. Connect with Vercel for auto-deployment

---

**Your project is ready for GitHub!** 🚀

*Last updated: July 16, 2026*

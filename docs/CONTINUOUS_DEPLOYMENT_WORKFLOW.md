# Continuous Deployment Workflow

**PDF Editor by ib** - Daily Development & Deployment

---

## Overview

After Vercel is connected, your development workflow becomes:

```
Make changes → Commit → Push → Auto-Deploy → Live
(Local)       (Git)     (Git)   (Vercel)     (Production)
```

**No manual uploads. No FTP. Automatic!**

---

## The Daily Workflow

### 1. Start Your Day

```bash
cd 'C:\Users\Sonu Kumar\Desktop\browser_pdf_editor'

# Get latest code from GitHub
git pull origin main

# Create feature branch for new work
git checkout -b feature/my-new-feature
```

### 2. Make Changes

In VS Code:
- Edit files normally
- Save changes
- Test locally in browser (open `index.html`)
- No build step needed - refresh browser to see changes

### 3. Commit When Done

```bash
# Check what changed
git status

# Stage all changes
git add .

# Commit with clear message
git commit -m "feat: Add my new feature"

# Or if fixing a bug:
git commit -m "fix: Correct the issue"

# Or documentation:
git commit -m "docs: Update README"
```

**Commit message format:**
```
type: description

feat:      New feature
fix:       Bug fix
docs:      Documentation
style:     Formatting (no code change)
refactor:  Code reorganization (no feature change)
perf:      Performance improvement
test:      Adding/updating tests
```

### 4. Push to GitHub

```bash
# Push your feature branch
git push origin feature/my-new-feature
```

### 5. Vercel Auto-Deploys

**On your Vercel dashboard:**
1. Go to "Deployments" tab
2. See new deployment appearing
3. Status: "Building..."
4. After 1-2 minutes: "Ready ✅"

**Your changes are now live!**

### 6. Merge to Production (Optional)

For solo development, you can push directly:

```bash
# Switch to main branch
git checkout main

# Pull latest (ensure you have latest code)
git pull origin main

# Merge feature branch
git merge feature/my-new-feature

# Push to GitHub (triggers Vercel deploy)
git push origin main
```

**Alternative: Pull Request on GitHub**

If you want to review before merging:

1. Push feature branch to GitHub
2. Go to GitHub repository
3. Click "Create Pull Request"
4. Review your changes
5. Click "Merge Pull Request"
6. Vercel automatically deploys

---

## Branching Strategy

### Main Branch (`main`)

- Always production-ready
- Protected (no force-push)
- Auto-deploys to live site
- Every commit should be tested

### Feature Branches

- For new features: `feature/feature-name`
- For bug fixes: `fix/issue-name`
- For experiments: `experiment/thing-to-try`
- Get preview deployments (if enabled)

### Branch Lifecycle

```
main (production)
  ↑
  ├─ feature/pdf-viewer
  │   ├─ Edit files
  │   ├─ Commit
  │   ├─ Push to GitHub
  │   ├─ Test in Vercel preview
  │   └─ Merge back to main
  │
  ├─ fix/error-handling
  │   └─ Same process
  │
  └─ feature/annotations
      └─ Same process
```

---

## Detailed Workflow Examples

### Example 1: Add New Feature

```bash
# 1. Create feature branch
git checkout -b feature/text-selection

# 2. Edit files in VS Code
# (Add JavaScript for text selection)

# 3. Test locally
# (Open index.html in browser, test functionality)

# 4. Commit changes
git add .
git commit -m "feat: Add text selection capability"

# 5. Push to GitHub
git push origin feature/text-selection

# 6. Watch Vercel deploy preview
# (Vercel creates preview URL)

# 7. Test preview deployment
# (Visit preview URL, test feature)

# 8. Merge to main
git checkout main
git pull origin main
git merge feature/text-selection
git push origin main

# 9. Watch production deployment
# (Vercel deploys to live site)

# 10. Clean up feature branch
git branch -d feature/text-selection
git push origin -d feature/text-selection
```

### Example 2: Quick Bug Fix

```bash
# 1. Create fix branch
git checkout -b fix/css-mobile-layout

# 2. Edit CSS in assets/css/style.css

# 3. Test on mobile (responsive design in DevTools)

# 4. Commit
git add .
git commit -m "fix: Correct mobile layout issue"

# 5. Push
git push origin fix/css-mobile-layout

# 6. Verify in preview

# 7. Merge when ready
git checkout main
git pull origin main
git merge fix/css-mobile-layout
git push origin main

# 8. Live!
```

### Example 3: Direct to Main (Simple Change)

For very simple changes (typo, small style tweak):

```bash
# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Edit file (e.g., typo in HTML)

# 4. Commit
git add .
git commit -m "fix: Correct typo in privacy page"

# 5. Push to main
git push origin main

# 6. Auto-deploys! ✅
```

---

## Deployment Frequency

Your site can deploy multiple times per day:

| Change Type | Frequency | Impact |
|------------|-----------|--------|
| Typo fix | Anytime | Live within 1 min |
| CSS tweak | Anytime | Live within 2 min |
| HTML update | Anytime | Live within 2 min |
| JavaScript fix | After testing | Live within 2 min |
| Feature addition | After testing | Live within 2 min |

---

## Testing Before Push

### Local Testing Checklist

Before committing:

- [ ] Open `index.html` in browser
- [ ] Test the change works
- [ ] Check all pages (index, privacy, terms)
- [ ] Test responsive design (F12 → Device mode)
- [ ] Check console (F12 → Console) for errors
- [ ] Verify CSS loads
- [ ] Verify JavaScript works
- [ ] No broken links

### Commit Message Checklist

Before committing:

- [ ] Message is clear and descriptive
- [ ] Follows format: `type: description`
- [ ] All changes are staged (`git add .`)
- [ ] No accidental files committed
- [ ] `.env` files not committed

### Push Checklist

Before pushing:

- [ ] Local tests pass
- [ ] Commit message is good
- [ ] On correct branch
- [ ] Ready for others to see (or production)

---

## Monitoring Deployments

### Vercel Dashboard

After pushing:

1. **Go to**: https://vercel.com/dashboard
2. **Select**: `browser_pdf_editor` project
3. **Click**: "Deployments" tab
4. **Watch**: New deployment building

Status progression:
```
Building... → Ready ✅ (live!)
```

### Deployment Logs

If deployment fails:

1. Click failed deployment
2. Go to "Build" tab
3. Review error messages
4. Fix locally
5. Commit and push again

### GitHub Integration

On GitHub after push:

1. Go to: https://github.com/Sonuit22/browser_pdf_editor
2. New commit shows
3. Check mark = passed GitHub Actions
4. Vercel deploys automatically

---

## Rollback (Revert Changes)

If something goes wrong:

### Option 1: Revert Last Commit

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Or undo and discard changes
git reset --hard HEAD~1
git push origin main --force
```

### Option 2: Revert via Vercel

1. Go to Vercel dashboard
2. Deployments tab
3. Find the previous good deployment
4. Click "Redeploy"
5. Site reverts instantly

### Option 3: New Commit to Fix

```bash
# Make the fix
git add .
git commit -m "fix: Revert previous change"
git push origin main
# Vercel auto-deploys the fix
```

---

## Continuous Integration (GitHub Actions)

Every push runs automated checks:

1. **Security Check**: Scans for exposed secrets
2. **Code Validation**: Checks file syntax
3. **Deployment**: Triggers Vercel deployment

If checks fail:
- Commit gets a ❌
- Vercel deployment pauses
- Fix and push again

---

## Daily Checklist

**Every Morning:**
- [ ] Pull latest code: `git pull origin main`
- [ ] Create feature branch: `git checkout -b feature/...`

**While Coding:**
- [ ] Test locally before committing
- [ ] Write clear commit messages
- [ ] Commit frequently (not one giant commit)

**Before Push:**
- [ ] All tests pass
- [ ] No console errors
- [ ] No broken links
- [ ] Responsive design works

**After Push:**
- [ ] Check Vercel dashboard
- [ ] Verify deployment succeeds
- [ ] Test live site
- [ ] Confirm changes are live

---

## Common Patterns

### Pattern 1: Feature Completion
```
feature/new-feature → Test locally → Commit → Push → 
Vercel preview → Verify → Merge to main → Live! ✅
```

### Pattern 2: Bug Fix
```
fix/bug-name → Fix code → Commit → Push → 
Vercel preview → Test fix → Merge → Live! ✅
```

### Pattern 3: Documentation
```
docs/update → Edit README/docs → Commit → 
Push to main → Auto-deploy → Live! ✅
```

### Pattern 4: Style Improvement
```
style/refactor → Improve CSS/HTML → Commit → 
Push → Vercel preview → Verify → Merge → Live! ✅
```

---

## Best Practices

### Commits
✅ Commit frequently (multiple small commits)  
✅ Write descriptive messages  
✅ One feature per commit when possible  
❌ Don't commit broken code  
❌ Don't commit with large unrelated changes  

### Branches
✅ Create branch for each feature  
✅ Delete branch after merging  
✅ Keep branch names descriptive  
❌ Don't push to main directly (optional, but safer)  

### Testing
✅ Test locally before pushing  
✅ Use DevTools to check responsiveness  
✅ Test on multiple browsers  
❌ Don't push broken code  
❌ Don't assume it works without testing  

### Deployment
✅ Check Vercel dashboard after push  
✅ Monitor for errors  
✅ Test live site after deployment  
❌ Don't push and forget  
❌ Don't push untested code  

---

## The Complete Loop

```
You start coding
        ↓
git checkout -b feature/...
        ↓
Edit files in VS Code
        ↓
Test locally (refresh browser)
        ↓
git commit -m "feat: ..."
        ↓
git push origin feature/...
        ↓
Vercel creates preview deployment
        ↓
Test in Vercel preview
        ↓
Merge to main (via GitHub or git merge)
        ↓
Vercel deploys to production
        ↓
Test live site
        ↓
Done! Feature is live! ✨
        ↓
Repeat for next feature
```

---

## Time Estimates

- **Simple change** (typo, small style): 2 minutes
- **Bug fix** (test + fix + deploy): 10 minutes
- **Small feature** (code + test + deploy): 30 minutes
- **Medium feature** (multiple changes): 1-2 hours
- **Large feature**: Breaks into smaller PRs

---

## Support

**Stuck?** Check these:

- `docs/GIT_GITHUB_SETUP.md` - Git help
- `docs/GIT_QUICK_REFERENCE.md` - Git commands
- `docs/VERCEL_SETUP_STEPBYSTEP.md` - Vercel help
- `docs/VERCEL_DEPLOYMENT_CHECKLIST.md` - Verification

---

## Summary

**Workflow**:
1. Create feature branch
2. Edit files
3. Commit changes
4. Push to GitHub
5. Vercel auto-deploys
6. Site is live!

**That's it!** The entire CI/CD pipeline is automated.

**No manual steps required.** No uploads. No servers to manage.

Just code → commit → push → deployed!

---

*Workflow guide: July 16, 2026*

**Ready to start Phase 1 development!** 🚀

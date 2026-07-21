# Git & GitHub Quick Reference - PDF by ib

## 🚀 The 5-Minute Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Edit files in VS Code
# (Your changes here)

# 3. Check what changed
git status

# 4. Stage everything
git add .

# 5. Commit with clear message
git commit -m "feat: Add my feature"

# 6. Push to GitHub
git push origin feature/my-feature

# 7. GitHub → Vercel → Live! ✨
```

---

## 📝 Commit Message Examples

| Scenario | Command |
|----------|---------|
| **New Feature** | `git commit -m "feat: Add PDF viewer"` |
| **Bug Fix** | `git commit -m "fix: Correct page numbering"` |
| **Documentation** | `git commit -m "docs: Update merge API docs"` |
| **Performance** | `git commit -m "perf: Optimize PDF rendering"` |
| **Refactoring** | `git commit -m "refactor: Simplify file handler"` |

---

## 🔍 Checking Your Work

```bash
git status              # What files changed?
git log --oneline -5    # Last 5 commits?
git diff                # See exact changes?
git branch              # Which branch am I on?
git remote -v           # Where do I push?
```

---

## 🛠️ Common Tasks

### Before Starting Work
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature
```

### After Making Changes
```bash
git status
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature
```

### Before Pushing
```bash
git diff origin/main..HEAD  # See what you're pushing
git log --oneline -10       # See recent commits
```

### After Pushing
```bash
# Visit GitHub to create PR or merge
# Vercel auto-deploys when merged to main
```

---

## ⚠️ Never Do These

| ❌ Don't | ✅ Instead |
|----------|-----------|
| Commit to `main` directly | Work on feature branch |
| Force push (`-f`) to `main` | Create PR and merge normally |
| Commit `.env` files | Use `.env.example` template |
| Commit `node_modules/` | It's in `.gitignore` |
| Push without testing | Test locally first |
| Vague messages ("update") | Clear messages ("feat: add viewer") |

---

## 🔄 If Something Goes Wrong

### Undo uncommitted changes
```bash
git checkout -- filename.txt
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
git add .
git commit -m "Better message"
```

### See what happened
```bash
git reflog
```

### Revert a pushed commit
```bash
git revert <commit-hash>
git push
```

---

## 📊 The GitHub → Vercel Pipeline

```
1. git push to GitHub
2. GitHub Actions runs tests
3. ✅ Tests pass
4. Vercel detects change
5. Vercel builds project
6. Vercel deploys live
7. Your site updates instantly
```

---

## 🎯 Daily Checklist

- [ ] Am I on the right branch?
- [ ] Have I tested locally?
- [ ] Are my changes staged?
- [ ] Is my commit message clear?
- [ ] Will this break anything?
- [ ] Have I pushed to GitHub?

---

## 🔗 Important Links

- **GitHub Repo**: https://github.com/<username>/browser-pdf-editor
- **Live Site**: https://pdfeditorbyib.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Git Docs**: https://git-scm.com/docs

---

**Print this and pin it to your desk!** 📌


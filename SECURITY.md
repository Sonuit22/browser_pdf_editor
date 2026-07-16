# Security Policy

## Secure Deployment Practices

### Environment Secrets

**NEVER commit the following to GitHub:**
- API keys
- Database credentials
- Private tokens
- AWS/Google/Azure credentials
- Encryption keys

**DO use deployment platform's secret management:**

#### Vercel
- Dashboard > Settings > Environment Variables
- Set as "Sensitive" for production secrets

#### Netlify
- Site Settings > Build & Deploy > Environment
- Add environment variables for each deploy context (Production, Preview)

### Pre-commit Checks

This repo includes checks to prevent accidental secret commits:
- `.env` files are in `.gitignore`
- Only `.env.example` is committed (template)

### Deployment Checklist

Before deploying:
- [ ] All secrets moved to platform's environment management
- [ ] No API keys in code or config files
- [ ] `.env.local` is in `.gitignore`
- [ ] Sensitive environment variables marked as "Sensitive" in deployment platform

### GitHub Actions Security

- Secrets are injected only during build/deploy steps
- Never log or echo secrets
- Use GitHub Secrets for CI/CD variables

## Reporting Security Issues

Do not open public issues for security vulnerabilities. Please email security concerns privately.

## Regular Updates

Keep dependencies updated:
```bash
npm audit
npm update
```

Enable Dependabot alerts in GitHub Settings > Security & analysis.

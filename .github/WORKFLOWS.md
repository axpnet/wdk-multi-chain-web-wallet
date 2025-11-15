# 🤖 GitHub Actions Workflows

This directory contains automated workflows for the WDK Multi-Wallet project.

## 📋 Available Workflows

### 1. CI/CD Pipeline (`ci.yml`)
**Triggers:** Push to `main`/`develop`, Pull Requests

**What it does:**
- ✅ Runs ESLint for code quality
- 🏗️ Builds the project
- 🚀 Deploys to GitHub Pages (on `main` branch)
- 📦 Uploads build artifacts

**Status:** Always active

---

### 2. Auto Release (`release.yml`)
**Triggers:** Push version tags (`v*.*.*`)

**What it does:**
- 🏗️ Builds production bundle
- 📦 Creates ZIP and TAR.GZ archives
- 📝 Generates automatic changelog
- 🎉 Creates GitHub Release with downloadable files

**How to use:**
```bash
# Create and push a version tag
git tag -a v1.1.0 -m "Release v1.1.0 - Chain Icons Update"
git push origin v1.1.0

# The workflow will automatically:
# 1. Build the app
# 2. Package it
# 3. Create a GitHub Release
```

**Example Release:**
- **Tag:** `v1.1.0`
- **Title:** "Release v1.1.0"
- **Files:** `wdk-wallet-v1.1.0.zip`, `wdk-wallet-v1.1.0.tar.gz`
- **Changelog:** Auto-generated from commits

---

### 3. Code Quality & Security (`quality.yml`)
**Triggers:** 
- Push to `main`/`develop`
- Pull Requests
- Weekly schedule (Mondays)

**What it does:**
- 🔍 ESLint code quality check
- 💅 Prettier formatting check
- 📊 Code complexity analysis
- 🔒 npm audit security scan
- 🛡️ Snyk vulnerability scan (requires token)
- 🔆 Lighthouse performance audit
- 📦 Bundle size analysis

**Benefits:**
- Catches security issues early
- Ensures code quality standards
- Monitors performance metrics
- Tracks bundle size changes

---

### 4. Dependency Updates (`dependencies.yml`)
**Triggers:** 
- Weekly schedule (Mondays at 9 AM)
- Manual trigger

**What it does:**
- 📦 Checks for outdated packages
- ⬆️ Updates minor and patch versions
- 🧪 Tests the build with updated dependencies
- 📝 Creates automated Pull Request

**Benefits:**
- Keeps dependencies up-to-date
- Automated security patches
- No manual work required

**Manual trigger:**
```bash
# Go to Actions tab → Dependency Updates → Run workflow
```

---

### 5. PR Auto Labeler (`pr-labeler.yml`)
**Triggers:** Pull Request opened/updated

**What it does:**
- 🏷️ Auto-labels based on changed files
- 🔍 Labels based on PR title (conventional commits)
- 📊 Adds size labels (XS/S/M/L/XL)

**Label examples:**
- `feat: add icons` → `enhancement`
- `fix: notification bug` → `bug`
- `docs: update README` → `documentation`
- Changed `package.json` → `dependencies`
- 10 lines changed → `size/XS`

---

## 🎯 Workflow Status

Check workflow runs: [Actions Tab](../../actions)

### Current Status Badges

Add these to README.md:

```markdown
[![CI/CD](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/ci.yml)
[![Code Quality](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/quality.yml/badge.svg)](https://github.com/axpnet/wdk-multi-chain-web-wallet/actions/workflows/quality.yml)
```

---

## 🔧 Configuration

### Secrets Required (Optional)

Some workflows work better with these secrets configured:

**Settings → Secrets → Actions:**

1. **SNYK_TOKEN** (for security scanning)
   - Get token from: https://snyk.io
   - Add to repository secrets
   - Free for open source

2. **GITHUB_TOKEN** (automatic)
   - Already available
   - No setup needed

---

## 📝 How to Create a Release

### Method 1: Automatic (Recommended)

```bash
# 1. Make sure main branch is up to date
git checkout main
git pull origin main

# 2. Create and push version tag
git tag -a v1.1.0 -m "Release v1.1.0 - Description"
git push origin v1.1.0

# 3. Wait ~2 minutes
# → GitHub Action creates the release automatically
# → Check: https://github.com/axpnet/wdk-multi-chain-web-wallet/releases
```

### Method 2: Manual

1. Go to: [Releases](../../releases)
2. Click "Draft a new release"
3. Click "Choose a tag" → Create new tag (e.g., `v1.1.0`)
4. Fill title and description
5. Click "Publish release"

---

## 🎨 Semantic Versioning

Follow these rules for version numbers:

```
v1.2.3
│ │ │
│ │ └─ PATCH: Bug fixes (1.2.3 → 1.2.4)
│ └─── MINOR: New features (1.2.0 → 1.3.0)
└───── MAJOR: Breaking changes (1.0.0 → 2.0.0)
```

**Examples:**
- `v1.0.1` - Fix notification bug
- `v1.1.0` - Add chain icons feature
- `v2.0.0` - Complete UI redesign

---

## 🚀 Best Practices

### Commit Messages

Use conventional commits for auto-labeling:

```bash
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### Before Releasing

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` (if exists)
- [ ] Test build locally: `npm run build`
- [ ] Review all changes
- [ ] Create meaningful release notes

### After Releasing

- [ ] Verify release on GitHub
- [ ] Test download links
- [ ] Announce on social media (optional)
- [ ] Update documentation if needed

---

## 📊 Monitoring

### View Workflow Results

1. **Recent runs:** [Actions Tab](../../actions)
2. **Failed runs:** Filter by status
3. **Logs:** Click on any workflow run

### Email Notifications

Enable in: **Settings → Notifications → Actions**

- ✅ Only failures
- ✅ Only successful first run after failures

---

## 🛠️ Troubleshooting

### Workflow not running?

**Check:**
1. Workflow is enabled (Actions tab)
2. Branch protection rules
3. Permissions in workflow file

### Release not created?

**Common issues:**
1. Tag format wrong (must be `v*.*.*`)
2. Build failed
3. Permissions issue

**Fix:**
```bash
# Delete and recreate tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.0 -m "Release message"
git push origin v1.0.0
```

### Dependencies PR not created?

**Check:**
1. No outdated packages
2. Workflow permissions
3. Previous PR not merged

---

## 📚 Learn More

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🤝 Contributing

To add new workflows:

1. Create `.github/workflows/your-workflow.yml`
2. Test locally with [act](https://github.com/nektos/act)
3. Document in this README
4. Submit PR with `ci/cd` label

---

**Last Updated:** October 2025
**Maintained by:** axpdev

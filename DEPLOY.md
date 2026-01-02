# SIMPLE DEPLOYMENT GUIDE

## Quick Start (No GitHub Actions Needed!)

This package uses the `gh-pages` npm package for deployment. It's simpler and more reliable than GitHub Actions.

---

## First Time Setup (5 minutes)

### Step 1: Extract and Install

```bash
# Extract the zip
# Navigate to folder
cd scc-dashboard-bundled

# Install dependencies (includes gh-pages)
npm install
```

### Step 2: Configure Base Path

Edit `vite.config.js`:

```js
base: '/your-repo-name/',  // Must match your GitHub repo name!
```

### Step 3: Push to GitHub (via GitHub Desktop)

1. Open GitHub Desktop
2. Add Local Repository → Choose this folder
3. Create repository (name it the same as your base path!)
4. Commit all files
5. Publish repository to GitHub

---

## Deploy Your Site

Just run this one command:

```bash
npm run deploy
```

This will:
1. Build your site (`npm run build`)
2. Deploy to gh-pages branch automatically
3. Done!

---

## Enable GitHub Pages (One Time)

After first deployment:

1. Go to your repo on GitHub.com
2. Click **Settings**
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Select: **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/ (root)**
5. Click **Save**

**Your site will be live at:**
`https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## Regular Workflow

Every time you make changes:

```bash
# 1. Make changes to files

# 2. Test locally
npm run dev

# 3. Deploy
npm run deploy
```

**That's it!** No GitHub Actions, no complex configuration.

---

## Why No GitHub Actions?

GitHub Actions has issues with deprecated artifact actions. The `gh-pages` package:
- ✓ Deploys directly (no actions needed)
- ✓ One command (`npm run deploy`)
- ✓ More reliable
- ✓ Faster (30 seconds vs 2-3 minutes)
- ✓ Simpler

---

## Troubleshooting

### Site not updating?

1. Clear browser cache (Ctrl+Shift+R)
2. Check Settings → Pages → make sure gh-pages branch is selected
3. Wait 1-2 minutes

### Base path wrong?

Make sure `vite.config.js` base matches your repo name:
- Repo: `scc-dashboard` → Base: `/scc-dashboard/`
- Repo: `my-dashboard` → Base: `/my-dashboard/`

### Deploy command not found?

Run `npm install` first to install gh-pages package.

---

## Commands Reference

```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run deploy       # Build + Deploy to GitHub Pages
```

---

**Deployment made simple!** 🎉

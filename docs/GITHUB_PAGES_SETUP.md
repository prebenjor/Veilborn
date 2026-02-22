# GitHub Pages Setup (Veilborn)

This guide assumes the repo is `https://github.com/prebenjor/Veilborn` and the app is a React SPA.

## Recommended Path: GitHub Actions + Pages

Use this if you want deploys from `main` without running local deploy commands.

## 1. Configure Vite Base Path

If the app uses Vite, set `base` in `vite.config.ts` or `vite.config.js`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Veilborn/",
});
```

Why: project pages are served from `/<repo-name>/`.

## 2. Add Pages Workflow

Create `.github/workflows/deploy-pages.yml`:

```yml
name: Deploy Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 3. Enable Pages in Repo Settings

In GitHub:

1. Go to `Settings` -> `Pages`.
2. Under `Build and deployment`, select `Source: GitHub Actions`.
3. Save.

## 4. Push to `main`

Every push to `main` will build and deploy.

Site URL:

- `https://prebenjor.github.io/Veilborn/`

## 5. SPA Refresh Fix (Optional but Recommended)

If you add client-side routing, direct deep-link refreshes can 404 on Pages.
Add a fallback copy step after build, so `404.html` serves the app shell:

```json
{
  "scripts": {
    "build": "vite build && cp dist/index.html dist/404.html"
  }
}
```

On Windows in CI, use a cross-platform helper (for example `shx cp`) if needed.

## Alternative: `gh-pages` Branch Deploy

Use only if you prefer local deploy commands over Actions.

1. Install: `npm i -D gh-pages`
2. Add scripts:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```
3. Run: `npm run deploy`
4. In `Settings` -> `Pages`, use `Deploy from a branch`, select `gh-pages` and `/ (root)`.

Actions is usually cleaner for team workflows.

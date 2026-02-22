# Veilborn

Incremental browser game based on `MANIFESTO.md` (Revision B).

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion

## Local Development

```bash
npm install
npm run dev
```

Local URL is printed by Vite (typically `http://localhost:5173`).

## Build

```bash
npm run build
```

Build output is generated in `dist/`.

## GitHub Pages Deployment

This repo deploys with GitHub Actions.

1. In GitHub, open `Settings -> Pages`.
2. Set `Build and deployment` source to `GitHub Actions`.
3. Push to `main`.

Workflow file: `.github/workflows/deploy-pages.yml`

Project page URL:

- `https://prebenjor.github.io/Veilborn/`

## M0 Folder Baseline

- `src/core/engine`
- `src/core/state`
- `src/core/content`
- `src/ui`


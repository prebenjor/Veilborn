# Veilborn

Incremental browser game based on `MANIFESTO.md` (Revision B).

## Current Runtime Notes

- Lineage mechanics were removed from runtime and save schema (no hidden lineage conversion modifiers).
- Era II+ whisper targeting uses `Prophets` and `Cults` (no crowd/boosted target variants in later eras).
- Current whisper target tuning:
  - `Prophets`: `+50` surcharge, `+3%` passive follower-rate effect, cooldown-gated.
  - `Cults`: `+80` surcharge, `+5%` passive follower-rate effect, cooldown-gated.
- Passive follower arrival in doctrine flow now includes acolytes, prophets, and cults (so promotion consumption does not collapse follower momentum as sharply).
- Echo Trees are split into 5 focused roots: `Whisper`, `Conversion`, `Doctrine`, `Stability`, and `Cataclysm`.
- Ghost Echo controls were removed from the Ascension panel surface.
- Doctrine in active flow is focused on Prophets/Cults and Acts (no lineage section).

## Docs Source of Truth

- Vision and canonical constants: `MANIFESTO.md`
- Formula/runtime implementation reference: `docs/GAME_REFERENCE.md`
- Milestone and PF execution ledger: `docs/roadmap.json`
- Human-readable roadmap summary: `docs/ROADMAP.md`
- UI composition/disclosure structure: `docs/UI_RESTRUCTURE.md`

When mechanics/formulas change, update all affected docs in the same change set.

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
CI safety workflow: `.github/workflows/ci.yml`

Project page URL:

- `https://prebenjor.github.io/Veilborn/`

### Continuous Testing Flow

- All milestone commits are pushed to `main`.
- Every push to `main` triggers:
  - CI build validation (`CI` workflow).
  - Pages deployment (`Deploy Pages` workflow).
- Build creates `dist/404.html` automatically for SPA-safe refreshes on Pages.
- Build also writes `dist/.nojekyll` to prevent Jekyll processing side effects.
- After each push, test the live page at:
  - `https://prebenjor.github.io/Veilborn/`

### Pages Troubleshooting

If you see a blank page and console errors like `GET /src/main.tsx 404`:

1. Open Actions and confirm latest `Deploy Pages` workflow succeeded.
2. Hard refresh the site (`Ctrl+Shift+R`).
3. Re-open `https://prebenjor.github.io/Veilborn/` after deploy completes.

## M0 Folder Baseline

- `src/core/engine`
- `src/core/state`
- `src/core/content`
- `src/ui`

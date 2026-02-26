# Veilborn UI Restructure Canonical Rules

Purpose: lock the era-progression UI language and disclosure behavior so future work stays consistent.

This document governs presentation-only rules. It does not change formulas or mechanics.

## Core Principle

The UI is the Veil. It starts sparse and becomes legible as power grows.

Progression must happen through:
- panel revelation by era
- visual density increase by era
- vocabulary evolution by era

## Era Vocabulary Progression

Event log header labels are canonical:
- Era I: `Murmurs`
- Era II: `Whispers`
- Era III: `Omens`

Gate labels are canonical:
- Era I: `Threshold`
- Era II: `Threshold`
- Era III: `Gate`

Bottom status line behavior is canonical:
- Era I: one quiet atmospheric line
- Era II: one directive line
- Era III: hidden

## Disclosure Rules

- Forward-facing systems stay era-locked.
- Future-era mechanics must never appear before unlock.
- Same-era systems may reveal by proximity (for example, near affordability).

Stats visibility rule:
- Stats is backward-facing and is not a spoiler surface.
- Stats access must remain available in every era and every tab.
- Stats content should grow by era and only include active or already encountered systems.
- Desktop (`>=800px`): Stats is a fixed top-right dock with a collapsed-by-default `STATS` trigger.
- Mobile (`<800px`): Stats remains a floating button that opens the drawer.
- Top stat bar rates (`/sec`) for Belief, Influence, and Followers are visible in all eras.
- Stats surface uses internal sub-tabs: `STATS`, `LORE`, `TOOLS`.
- `LORE` shows era-context guidance and milestone tracking.
- `TOOLS` hosts save archive, telemetry exports, and optional dev controls.

## Layout Rules

- Era I: minimal single-column surface with tabs: `ACTIVE`, `THRESHOLD`, `LEGACY`.
- Era I `ACTIVE` order: Whispers -> Acolytes.
- Era I `ACTIVE` containers are collapsible with persisted state.
- Era I is acolyte-only; prophet conversion begins in Era II.
- Era I `THRESHOLD` is a dedicated tab and uses a collapsible container.
- Era I `LEGACY` is a dedicated tab and uses a collapsible `Legacy Echoes` container.
- Era I: Whisper/Recruit actions and conversion controls remain in the same active-flow surface.
- Desktop shell breakpoint is `800px`:
  - left column holds era content
  - right sidebar holds the omen feed only
  - right sidebar width: `240px` (`300px` on large screens)
  - left column min width: `500px`
- Era II: `ACTIVE`, `GROWTH`, `LEGACY`, and constrained `META`.
- Era II tab contract:
  - `ACTIVE` order: Whispers -> Doctrine (merged container).
  - Influence remains in the top stat bar; there is no separate `ACTIVE` Influence container.
  - Whispers in Era II keep the familiar Era I interaction style (no subtitle); cadence prompt and optional rival-drain nudge line may appear.
  - `ACTIVE` containers are collapsible with persisted state.
  - Doctrine and Doctrine Seeds content are merged into one `DOCTRINE` container in `ACTIVE`; Era II shows progression surfaces (Prophets/Cults) but no rite controls.
  - `GROWTH` order: Domains -> Rivals -> Threshold.
  - All `GROWTH` containers are collapsible with persisted state.
  - Rivals collapse to a single-line summary when inactive and auto-expand when active.
  - Threshold is not rendered in `ACTIVE`; it sits at the bottom of `GROWTH`, collapsed by default.
  - `LEGACY` is a dedicated tab for Ascension/Echo spending and uses a collapsible container.
  - `META` excludes Ascension and keeps overview/remembrance/pantheon surfaces only.
  - Meta tab label is always `Meta` (no `Meta (Lite)` suffix).
- Era III: full `ACTIVE`, `GROWTH`, `GATE`, `LEGACY`, `META`.
- Era III `ACTIVE` order: Whispers -> Doctrine (merged doctrine progression and acts).
- Era III `GROWTH` order: Domains -> Rivals.
- Era III `GATE` tab contains Gate Rites (rite invocation + Veil pressure) and the gate progression panel; it replaces the old persistent strip.
- Era III `LEGACY` is a dedicated tab for Ascension/Echo spending and uses a collapsible container.
- Era II+ `META` containers are collapsible with persisted state.
- Era III critical actions must be reachable without long scroll.
- Omen feed contract:
  - header follows era vocabulary (`Murmurs` / `Whispers` / `Omens`)
  - active surface is run-scoped (`entry.at >= runStartTimestamp`)
  - feed is capped to 6 entries (`OMEN_LOG_MAX_ENTRIES`)
  - no desktop expand control; keep it a short rolling feed

## Implementation Notes

- Use `data-era` driven styling tokens for palette and density shifts.
- Keep panel internals intact unless a separate task explicitly includes panel redesign.
- Keep era-specific composition in `src/ui/eras/*` (Era I/II/III layout files).
- Keep shared shell surfaces in `src/ui/layout/*` (stat bar, tab dock, omen surface).
- Keep `App.tsx` focused on state/selector/action orchestration.
- When changing any rule in this document, update `MANIFESTO.md` and `docs/GAME_REFERENCE.md` in the same change.

## Interaction Patterns (Concrete Spec)

These are implementation-ready UI patterns to keep run readability high without adding new mechanics.

Run Core Anchor:
- Keep one always-visible run core in the top stat bar.
- Required cards and order: `Belief`, `Influence`, `Followers`.
- Required subline under each card: rate-first (`/sec`) where applicable.
- Era III only: Veil stability descriptor remains attached to the Followers card.

Next Unlock Ghost Row:
- Each progression surface should expose one muted "next unlock" line at the bottom.
- Examples:
  - `Acolytes`: `Next ordination at <followers>`
  - `Prophets`: `Next anointing at <followers> + <acolytes>`
  - `Cults` (Era III): `Next cult at <belief> + <prophets>`
  - `Gate`: `Next rite milestone at <veil strain target>`
- Style: low-emphasis text, no border, no CTA, always one line.

Bulk Spend Controls:
- Bulk controls are allowed only where action batching already exists (for example domain investing and echo rank purchase).
- Canonical labels: `x1`, `x10`, `MAX`.
- Placement: top-right of the owning container header.
- Never add bulk controls to core active actions (`Whisper`, `Recruit`, `Ordain`, `Anoint`, `Found Cult`).

Ascension Preview Contract:
- Ascension container must show a deterministic preview before the CTA.
- Required lines:
  - `This run yields <echoes> Echoes`
  - `Next Echo at <belief target>`
- Keep copy mechanical and short; no flavor prose in the preview lines.

Rate-First Surface Rule:
- Generator/progression cards lead with per-second impact before costs.
- Required order inside cards:
  - primary state (count/level)
  - rate line (`x/s` or `% passive gain`)
  - next cost/threshold
  - CTA
- If space is constrained, hide explanatory prose first; never hide the rate line.

Event Feed Compression:
- Primary omen feed remains short and recent.
- Keep capped rolling history behavior (`OMEN_LOG_MAX_ENTRIES`).
- Do not introduce expandable long-history controls in the primary gameplay shell.

Major Event Toast:
- Use a compact top-left toast for major events only.
- Allowed toast events: era transition and ascension completion.
- Do not emit toasts for routine actions (Whisper, Recruit, Invest, Act start).

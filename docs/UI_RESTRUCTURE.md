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

## Layout Rules

- Era I: minimal single-column surface, no tabs.
- Era I: Whisper/Recruit actions and Prophet conversion live in one merged card.
- Desktop shell breakpoint is `800px`:
  - left column holds era content
  - right sidebar holds the omen feed only
  - right sidebar width: `240px` (`300px` on large screens)
  - left column min width: `500px`
- Era II: `ACTIVE` and `GROWTH`, with constrained `META` content.
- Era II tab contract:
  - `ACTIVE` order: Whispers -> Doctrine (merged container).
  - Influence remains in the top stat bar; there is no separate `ACTIVE` Influence container.
  - Whispers in Era II keep the familiar Era I interaction style (no subtitle); cadence prompt and optional rival-drain nudge line may appear.
  - `ACTIVE` containers are collapsible with persisted state.
  - Doctrine and Doctrine Seeds content are merged into one `DOCTRINE` container in `ACTIVE`, ordered as Prophets/Cults, Lineage, then Acts.
  - `GROWTH` order: Domains -> Rivals -> Threshold.
  - All `GROWTH` containers are collapsible with persisted state.
  - Rivals collapse to a single-line summary when inactive and auto-expand when active.
  - Threshold is not rendered in `ACTIVE`; it sits at the bottom of `GROWTH`, collapsed by default.
  - Meta tab label is always `Meta` (no `Meta (Lite)` suffix).
- Era III: full `ACTIVE`, `GROWTH`, `GATE`, `META`.
- Era III `ACTIVE` order: Whispers -> Doctrine (merged) -> Cataclysm.
- Era III `GROWTH` order: Domains -> Rivals.
- Era III `GATE` tab contains the unraveling progression panel and replaces the old persistent strip.
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

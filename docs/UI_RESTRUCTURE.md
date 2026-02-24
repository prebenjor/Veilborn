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
- Era III: `Unraveling Gate`

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

## Layout Rules

- Era I: minimal single-column surface, no tabs.
- Era I: Whisper/Recruit actions and Prophet conversion live in one merged card.
- Era II: `ACTIVE` and `GROWTH`, with constrained `META` content.
- Era II tab contract:
  - `ACTIVE` order: Whispers -> Influence meter -> Doctrine (Acts) -> Doctrine Seeds.
  - Whispers in Era II keep the familiar Era I interaction style (no subtitle); cadence prompt and optional rival-drain nudge line may appear.
  - `ACTIVE` containers are collapsible with persisted state.
  - `GROWTH` order: Doctrine (merged container) -> Domains -> Rivals -> Threshold.
  - Doctrine and Doctrine Seeds content are merged into one `DOCTRINE` container in `GROWTH`, ordered as Prophets/Cults, Lineage, then Acts.
  - All `GROWTH` containers are collapsible with persisted state.
  - Rivals collapse to a single-line summary when inactive and auto-expand when active.
  - Threshold is not rendered in `ACTIVE`; it sits at the bottom of `GROWTH`, collapsed by default.
  - Meta tab label is always `Meta` (no `Meta (Lite)` suffix).
- Era III: full `ACTIVE`, `GROWTH`, `META`.
- Era III `GROWTH` order: Doctrine (merged) -> Domains -> Rivals (Threshold remains in the persistent Unraveling strip).
- Era II+ `META` containers are collapsible with persisted state.
- Era III critical actions must be reachable without long scroll.

## Implementation Notes

- Use `data-era` driven styling tokens for palette and density shifts.
- Keep panel internals intact unless a separate task explicitly includes panel redesign.
- Keep era-specific composition in `src/ui/eras/*` (Era I/II/III layout files).
- Keep shared shell surfaces in `src/ui/layout/*` (stat bar, tab dock, omen surface).
- Keep `App.tsx` focused on state/selector/action orchestration.
- When changing any rule in this document, update `MANIFESTO.md` and `docs/GAME_REFERENCE.md` in the same change.

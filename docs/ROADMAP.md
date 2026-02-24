# Veilborn Roadmap (Revision B)

Canonical source: `MANIFESTO.md` (System Manifesto, Revision B).

This roadmap is ordered for autonomous implementation.
When a milestone is complete, update `docs/roadmap.json`, commit, and push to `origin/main`.

## Execution Protocol

1. Select the earliest incomplete milestone whose dependencies are complete.
2. Build only milestone scope unless blocked by a hard dependency.
3. Validate against milestone done criteria.
4. Commit with message prefix `M#:` and push to `origin/main`.
5. Update milestone status in `docs/roadmap.json`.

## Current Priority Order (Feature-First)

1. `M14` balance lock and pacing calibration (beginner vs ascended) with telemetry-driven tests.
2. `M18` convergence mode once M14 timing is stable.
3. `M19` documentation/wiki foundation sync once feature and pacing behavior are stable.

## Milestones

## M0 - Foundation and Deployment

Objective: Initialize production-ready browser project and deployment pipeline.

Deliverables:
- React + TypeScript scaffold.
- Tailwind + Framer Motion integration.
- Core folders:
  - `src/core/engine`
  - `src/core/state`
  - `src/core/content`
  - `src/ui`
- GitHub Pages workflow.
- `README.md` with local and deploy instructions.

Definition of Done:
- `npm run dev` works locally.
- `npm run build` produces deployable output.
- Pages deploy from `main` succeeds.

## M1 - Core Tick Engine and Save Model

Objective: Establish deterministic simulation loop and persistent run state.

Deliverables:
- Tick loop with deterministic step interval.
- State model for Belief, Influence, Veil, Followers, Prophets, Domains.
- Save/load via `localStorage`.
- Versioned save schema and migration hook.

Definition of Done:
- Reload restores run state exactly.
- Engine runs continuously without memory leak over 30+ minutes.

## M2 - Resource and Formula Layer

Objective: Implement active numerical model from manifesto.

Deliverables:
- Belief generation stack (uncapped).
- Faith decay with Echo floor behavior.
- Influence cap/regen and action costs.
- Prophet threshold scaling and cult cost scaling.
- Domain XP/level/investment formulas.

Definition of Done:
- Runtime values match manifesto formulas within floating-point tolerance.
- No global Belief softcap logic exists in runtime.

## M3 - Whispers Loop (Era I)

Objective: First fully playable era with active engagement cadence.

Deliverables:
- Whisper and recruit actions.
- Prophet conversion pipeline.
- Event cadence hooks to prevent passive dead zones.
- Era I gate checks.

Definition of Done:
- Player can reliably reach 3 prophets and 500 followers through active play.
- Decisions occur at least every 30-60 seconds during active session.

## M4 - Doctrine Loop (Era II)

Objective: Cult and act gameplay with domain synergies and rivals.

Deliverables:
- Cult formation and growth.
- Act execution with return formula and floor logic.
- Rival spawn/drain/suppress lifecycle.
- Era II gate checks.

Definition of Done:
- Cults and rivals coexist with measurable strategic tradeoffs.
- Era II -> III gate requires mixed-system mastery (not single-stat rush).

## M5 - Veil, Miracles, and Civilization Pressure (Era III)

Objective: High-risk optimization layer and end-of-run tension.

Deliverables:
- Veil bonus, regen, erosion, and collapse rules.
- Miracle tiers with civ damage and civ-stability-adjusted returns.
- Civilization health, collapse, and rebuild systems.
- Unraveling gate checks.

Definition of Done:
- Veil 30-55 is demonstrably strong but risky.
- Miracle spam self-limits via civ stability degradation.
- Unraveling is reachable but not trivial to rush.

## M6 - Offline Progression Engine

Objective: Simulate bounded offline time without removing active-play advantage.

Deliverables:
- Offline delta simulation with 8h cap and 85% Belief efficiency.
- Offline rules:
  - Influence resets to 50% max.
  - Faith decay applies.
  - Rival drain at 50%.
  - No rival spawns.
  - No miracle/collapse processing.
  - Veil floor clamp at 15.
- Return summary renderer (lore + numeric deltas).

Definition of Done:
- 8h offline return yields coherent, playable state.
- No offline collapse can occur.
- Return summary communicates both narrative and numbers.

## M7 - Ascension and Echo Trees

Objective: Prestige loop with meaningful run-to-run transformation.

Deliverables:
- Ascension reset pipeline.
- Echo gain calculation using Revision B divisor (150000).
- Echo trees and Fibonacci rank costs.
- Early bottleneck-fix upgrades (start_inf, prophet_threshold, faith_floor, etc.).

Definition of Done:
- Run 2 feels structurally different, not just numerically faster.
- Echo spending decisions create distinct build paths.

## M8 - Social Memory and Lineages

Objective: Persistent consequence across generations and runs.

Deliverables:
- Mortal trait inheritance.
- Betrayal skepticism and trust-debt modifiers.
- Historical markers surfaced in events and conversion outcomes.

Definition of Done:
- Prior decisions measurably alter future generation behavior.
- World state feels historical, not stateless.

## M9 - Pantheon Layer (Run 2+)

Objective: Alliance and betrayal systems with long-horizon consequences.

Deliverables:
- Pantheon entity generation.
- Alliance/betrayal mechanics.
- Domain poisoning and persistence windows.
- Name letter condition hook for betrayal.

Definition of Done:
- Betrayal has clear short-term gain and long-term cost.
- Alliance path remains competitively viable.

## M10 - UI as Veil + Omen Log

Objective: Make readability and revelation part of progression.

Deliverables:
- Veil-driven progressive disclosure of labels/tooltips.
- Early opacity and mid-game legibility transitions.
- In-universe prose event log baseline.

Definition of Done:
- New players can infer systems before full UI clarity unlocks.
- Log entries are lore-forward, not spreadsheet text.

## M11 - Audio as System Feedback

Objective: Convert domain and stability state into audible signal.

Deliverables:
- Tone.js layer mapping domains to instruments.
- Instability detune/dropout behavior.
- Performance-safe fallbacks and mute controls.
- Layered signal chain (dry bus + reverb bus + master filter) with era-sensitive mix behavior.
- Low-Veil drone and staged instability transitions (detune -> dropout -> muffling).

Definition of Done:
- Players can hear destabilization before major visual consequences.
- Audio remains readable (no clipping/chaotic overlap) across full Era III density.

## M12 - Ghost Echoes and Async Signatures

Objective: Import optional other-player fingerprints without hard multiplayer.

Deliverables:
- Signature export/import format.
- Anomaly injection rules.
- Offline-safe fallback when signatures are absent.

Definition of Done:
- Imported signatures produce recognizable world variation.
- Core loop remains complete without ghost data.

## M13 - Architecture Layer, Remembrance, and Final Choice

Objective: Endgame meta-rules and ambiguous terminal resolution.

Deliverables:
- Rule-editing layer for belief formation/civ growth/domain semantics.
- All Name Letter conditions and tracking.
- Secret final choice presentation (no explicit confirmation UX).

Definition of Done:
- Remembrance path completable.
- Final choice is mechanically real and intentionally ambiguous.

## M14 - Balance and Runtime Targets

Objective: Hit cadence and compression targets from Revision B.

Notes:
- Execute after `M21` and `M17` (feature-first ordering).
- Regression harness for formula/offline checks is available via `npm run regression:m14`.
- Telemetry timing audit is available via `npm run audit:m14 -- <telemetry-export-1.json> [telemetry-export-2.json ...]`.
- Beginner-vs-ascended comparison (including Era I and Era II phase checks) is available via `npm run compare:m14 -- <beginner-session.json> <ascended-session.json>`.
- Pace lock loop:
  - `npm run regression:m14`
  - `npm run compare:m14 -- <beginner-session.json> <ascended-session.json>`
  - `npm run audit:m14 -- <telemetry-export-1.json> [telemetry-export-2.json ...]`
- Pace lock target bands:
  - Ascended/Beginner Era I speed ratio should be `< 1.00` and `>= 0.45`.
  - Ascended/Beginner Era II speed ratio should be `< 1.00` and `>= 0.45`.
- Export-driven M14 loop: gather 2-3 beginner + 2-3 ascended telemetry exports, run compare/audit, apply one small constant delta, then re-run.
- Remaining M14 scope is economy constant calibration against target run durations.

Deliverables:
- Economy tuning against run targets:
  - Run 1: ~6.5h
  - Run 2: ~4.0h
  - Run 3: ~2.5h
  - Run 5: ~1.2h
  - Run 8+: ~45m floor
- 30-60 second active decision cadence checks.
- Per-run action cadence summary in telemetry (`avg/median/p90` action interval + in-window hit rate).
- Era pacing audit within runs: Era II acceleration should be noticeable but not abrupt relative to Era I progression.
- 20-40 minute milestone cadence checks.
- Regression tests for core formulas and offline simulation.

Definition of Done:
- Playtest data aligns with timing targets.
- Compression floor (~45m) is preserved.
- No high-severity simulation regressions.

## M20 - Era UI Restructure and Disclosure Consolidation

Objective: Resolve late-era clutter and decision-latency by formalizing the era-progression layout system.

Notes:
- This milestone consolidates scope previously split across PF-02 and PF-03.
- Completed and now serving as the baseline layout shell for M17/M21/M14 work.

Deliverables:
- Era-locked shell behavior:
  - Era I: minimal single-column layout, no tabs
  - Era II: ACTIVE + GROWTH (+ constrained META content) tabbed structure
  - Era III: full ACTIVE/GROWTH/META flow with low-scroll decision surfaces
- Era II tab contract:
  - ACTIVE order: Whispers, Influence meter, Doctrine (Acts), Doctrine Seeds
  - ACTIVE containers are collapsible with persisted state
  - GROWTH order: Doctrine (merged), Domains, Rivals, Threshold
  - Doctrine + Doctrine Seeds are merged into one collapsible Doctrine container in GROWTH
  - All GROWTH containers are collapsible with persisted state
  - Rivals collapse to one-line summary when inactive and expand only when active
  - Threshold sits at bottom of GROWTH (not ACTIVE) and defaults to collapsed
- Era III GROWTH order: Doctrine (merged), Domains, Rivals (Threshold remains in persistent Unraveling strip)
- Era II+ META containers are collapsible with persisted state
- ACTIVE tab prioritizes time-sensitive systems (Cataclysm, rivals, whispers, Influence pressure).
- Unraveling gate as persistent strip in Era III.
- Echo trees and other between-run systems constrained to META view.
- Omen surface persistent across tabs (drawer/strip), not competing as a main panel.
- Era-based theme token progression (`data-era`) for palette/texture/typography density shifts.
- Era composition extracted into dedicated files (`src/ui/eras/*`) with shared shell surfaces in `src/ui/layout/*`.
- Strict future-era disclosure enforcement via shared reveal helper.

Definition of Done:
- Era III critical actions are accessible without long scrolling.
- Future-era systems are not visible before unlock.
- Layout remains coherent at 375px without horizontal overflow in core loop screens.

## M21 - Devotion Path System

Objective: Expand the Era I Devotion foundation into behavior-shaped Era II/III path identity and run-to-run memory.

Notes:
- Era I foundation (stacks, recruit amplification, omen milestones, persistence/reset rules) is implemented.
- This milestone covers only path differentiation and lineage carryover behavior.
- Full architecture reference: `docs/DEVOTION_SYSTEM.md`.
- Prioritized before M14 so pace tuning calibrates against final Devotion-era mechanics.
- Status: completed.

Deliverables:
- Era II path emergence from play pattern:
  - Act-heavy behavior pulls toward `Fervour`
  - Cult-heavy behavior pulls toward `Accord`
- Era III path crystallization into:
  - `Fervour`, `Accord`, `Reverence`, `Ardour`
- Distinct per-path mechanical effects (acts/miracles, cults/domains, Veil resilience, faith stability).
- Path switching requires sustained behavioral change (not instantaneous).
- Omen log announces path shifts in-world.
- Run 2+ lineage memory grants one starting stack toward prior dominant path.
- Stats surface displays current devotion path and stack state.
- `MANIFESTO.md` and `docs/GAME_REFERENCE.md` updated for full path formulas when implemented.

Definition of Done:
- Era II path emergence tracks player behavior reliably.
- Era III paths are distinct, viable, and none is strictly dominant.
- Path switching is possible with sustained behavior change.
- Lineage path memory applies correctly on run 2+.
- Devotion remains non-decaying and inactivity-safe.

## M15 - Save Integrity and Recovery

Objective: Ensure players never lose meaningful progress due to schema drift or corrupted save state.

Notes:
- Must precede M14 balance stress tuning.
- Players must not lose runs during stress testing or normal play due to save corruption.

Deliverables:
- Versioned save migration pipeline for schema changes.
- Secondary snapshot slot: auto-saved "last good state" before each ascension and each era transition.
- Manual save export to JSON file (download).
- Save import with version validation and conflict warnings.
- Graceful corruption recovery: detect bad state, offer rollback or fresh run with explanation.

Definition of Done:
- Corrupted localStorage does not crash the game.
- Exported save can be re-imported and continues correctly.
- Schema migration from prior version produces valid state.
- Ascension snapshot correctly reflects pre-reset state.

## M16 - Instrumentation and Playtesting Telemetry

Objective: Make balance tuning evidence-based through local, structured run instrumentation.

Notes:
- Must precede or run parallel with M14.
- All telemetry is local-only unless opt-in is explicitly added later.

Deliverables:
- Structured local event log for era transitions, collapses, ascensions, rival suppression, and miracle use; each entry includes timestamp and key state snapshot.
- Per-run summary object written to localStorage on ascension: total time, belief earned, echo gained, peak B/s, collapse count, and miracle count by tier.
- In-game Stats page reading and displaying run history summaries.
- Optional console/JSON export for manual analysis during playtesting.
- Hooks for M14 regression tests to read instrumentation output.

Definition of Done:
- Era transition events are logged with correct timestamps.
- Per-run summary is written correctly on ascension.
- Stats page renders run history without performance impact.
- Log does not grow unbounded; cap at last 20 runs.

## M17 - Accessibility and Mobile Resilience

Objective: Ensure the full core loop remains completable and readable on mobile and accessible across input/visual preferences.

Notes:
- The 45-minute floor run and offline check-in model imply intermittent mobile use.
- This milestone ensures the game is completable on mobile without layout breakage or battery abuse.
- Execute after M20 so accessibility hardening applies to the consolidated era shell.
- Status: completed.

Deliverables:
- Responsive layout audit: all panels usable at 375px width without horizontal scroll.
- Touch target sizing: all interactive elements meet 44x44px minimum.
- Tick rate throttling when tab is backgrounded or device signals low power.
- Reduced-motion support: disable Framer Motion animations when prefers-reduced-motion is set.
- Keyboard navigation for all primary actions (Whisper, Recruit, Invest, Act, Miracle).
- Focus management when new panels unlock progressively.

Definition of Done:
- Full Era I loop completable on 375px mobile viewport.
- No layout overflow or hidden buttons at small sizes.
- Background tab does not spin CPU at full tick rate.
- All primary actions reachable via keyboard alone.
- Reduced-motion mode produces no animation jank.

## M18 - New Game+ Convergence Mode

Objective: Add run 8+ structural novelty beyond speed compression while preserving core cadence and ending ambiguity.

Notes:
- Run 8+ needs structural novelty beyond compression speed.
- Convergence is not a difficulty mode; it is a layered game state where prior-run echoes alter run shape.
- Design must not break the 45-minute floor or the ambiguous final choice.

Deliverables:
- Convergence flag unlocked after completing Remembrance path once.
- Ghost interference layer: imported or locally-generated prior-run signatures passively alter domain synergy, faith decay timing, and rival spawn patterns in the active run.
- Accumulated betrayal/alliance history produces Pantheon disposition modifiers that compound across Convergence runs.
- Convergence-only omen log entries that reference prior-run events by name.
- Convergence does not alter core formulas or gate conditions; pressure is narrative and systemic, not numerical inflation.
- Optional Convergence run summary screen showing which ghost echoes were active and their observed effects.

Definition of Done:
- Convergence run is structurally distinct from standard run 8+.
- Ghost interference is perceptible but does not guarantee win or loss.
- Final choice presentation remains ambiguous and unresolved.
- 45-minute floor is preserved under Convergence conditions.
- Convergence does not require M12 Ghost Echoes import to function; it falls back to local prior-run signatures.

## M19 - Documentation and Wiki Foundation

Objective: Produce and maintain a canonical implementation reference, then promote it into a public wiki structure.

Notes:
- Initial internal reference exists as `docs/GAME_REFERENCE.md`.
- This milestone converts that baseline into stable wiki-facing documentation.

Deliverables:
- Keep `docs/GAME_REFERENCE.md` synchronized with implemented formulas and feature behavior.
- Add a wiki page map and ownership model for ongoing updates.
- Create first-pass wiki pages for:
  - Core loop by era
  - Formula compendium
  - Prestige, pantheon, and remembrance systems
  - Save/offline/telemetry troubleshooting
- Add documentation validation checklist to development workflow (`AGENTS.md` + PR checklist if introduced).

Definition of Done:
- Documentation covers all currently implemented mechanics with formula-level clarity.
- Internal reference and wiki pages are consistent and cross-linked.
- Roadmap/manifesto/doc updates are performed together when mechanics change.

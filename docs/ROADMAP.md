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
- Player can reliably reach 3 prophets and domain level 3 through active play.
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

Definition of Done:
- Players can hear destabilization before major visual consequences.

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

Deliverables:
- Economy tuning against run targets:
  - Run 1: ~6.5h
  - Run 2: ~4.0h
  - Run 3: ~2.5h
  - Run 5: ~1.2h
  - Run 8+: ~45m floor
- 30-60 second active decision cadence checks.
- 20-40 minute milestone cadence checks.
- Regression tests for core formulas and offline simulation.

Definition of Done:
- Playtest data aligns with timing targets.
- Compression floor (~45m) is preserved.
- No high-severity simulation regressions.

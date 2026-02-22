# Veilborn Roadmap

Canonical source: `MANIFESTO.md`

This roadmap converts the manifesto into implementation milestones with explicit done criteria.

## Execution Protocol (Agent)

1. Always pick the earliest incomplete milestone whose dependencies are complete.
2. Implement only tasks in that milestone unless blocked.
3. Run milestone validation checks.
4. Commit with `M#:` prefix and push to `origin/main`.
5. Mark milestone status update in `docs/roadmap.json`.

## Milestones

## M0 - Project Foundation

Objective: Create runnable React baseline and enforce manifesto-first workflow.

Deliverables:
- React + TypeScript app scaffold.
- Tailwind + Framer Motion wiring.
- Core folder structure:
  - `src/core/engine`
  - `src/core/state`
  - `src/core/content`
  - `src/ui`
- `README.md` with local dev instructions.
- GitHub Pages workflow file.

Definition of Done:
- `npm run dev` starts locally.
- `npm run build` produces `dist`.
- Pages workflow exists and is valid YAML.

## M1 - Core Simulation Loop (Whispers)

Objective: First playable loop with one mortal, influence spend, and belief generation.

Deliverables:
- Tick-based world engine (`worldTick`).
- Core resources: `influence`, `belief`, `time`.
- First mortal entity with trait seed.
- Prophet conversion action with probabilistic outcome.
- Passive belief generation from prophet.
- Save/load in `localStorage`.

Definition of Done:
- Player can start from zero and create first prophet.
- Belief increases passively after prophet conversion.
- Save/load reproduces world state after reload.

## M2 - Domains + Veil Probability Layer

Objective: Make outcomes shaped by domains rather than direct deterministic commands.

Deliverables:
- Domain model (`Fire`, `Death`, `Harvest`, `Storm`, extensible).
- Domain investment UI and state.
- Veil probability resolver where domain weights alter outcome tables.
- Event schema for nudges and outcomes.

Definition of Done:
- Same nudge produces different distributions with different domain allocations.
- Outcome preview remains partial (probabilistic, not deterministic).

## M3 - Doctrine Systems (Followers, Cults, Acts)

Objective: Expand into mid-game structure and synergies.

Deliverables:
- Followers generated from prophet activity.
- Cult formation rules.
- Act system (`shrine`, `ritual`, `proselytize`).
- Domain synergy multipliers for act results.
- Rival cult generator from world pressure.

Definition of Done:
- At least one player cult can form and execute acts.
- Rival cult can appear without direct player creation.
- Belief economy changes based on synergy choices.

## M4 - UI-As-Veil Progression

Objective: Interface legibility is a progression mechanic.

Deliverables:
- Veil thickness state variable tied to progression.
- Progressive reveal rules for labels/tooltips/panels.
- Early-game cryptic UI mode and mid-game readable mode.
- Omen-style event log renderer (in-universe prose only).

Definition of Done:
- New run starts partially opaque.
- UI elements unlock legibility over time.
- Event log avoids sterile system phrasing.

## M5 - Miracles + Stability + Unraveling

Objective: Late-game power with collapse pressure and ascension trigger.

Deliverables:
- Miracle system with high-impact world events.
- World stability meter and collapse effects.
- Civilization collapse consequences (follower loss/reset pressure).
- Unraveling trigger and ascension handoff.

Definition of Done:
- Miracles can swing belief significantly.
- Overuse creates measurable destabilization.
- Unraveling can be reached in a full run.

## M6 - Ascension 1 (Echoes)

Objective: First prestige loop with permanent progression.

Deliverables:
- Ascension reset pipeline.
- Echo currency and persistent upgrades.
- New world seed per run with varied cultures.
- Ghost-layer memory bonus hook.

Definition of Done:
- Complete run -> ascend -> new run starts with retained Echo progression.
- Early game compresses in run 2.

## M7 - Social Memory + Lineages

Objective: World remembers prior actions through inherited traits and social debt.

Deliverables:
- Trait inheritance across generations.
- Social memory markers (betrayal skepticism, trust debt, resilience).
- Conversion and act modifiers linked to memory markers.

Definition of Done:
- Descendant populations reflect lineage traits.
- Prior betrayals measurably alter later conversion dynamics.

## M8 - Pantheon Layer (Ascension 2)

Objective: Introduce alliance/betrayal among gods with lasting consequences.

Deliverables:
- Forgotten gods roster generation.
- Alliance and betrayal actions.
- Belief sharing model.
- Domain poisoning model for betrayal aftermath.

Definition of Done:
- Alliance and betrayal produce distinct short/long-term tradeoffs.
- Betrayal legacy persists across runs.

## M9 - Audio System (Belief Frequency)

Objective: Make sound a predictive gameplay channel.

Deliverables:
- Tone.js integration layer.
- Domain-to-instrument mapping.
- Instability-driven detune/dropout behavior.
- Mute and performance-safe fallback.

Definition of Done:
- Domain choices audibly alter layered score.
- Destabilization is audible before obvious visual collapse.

## M10 - Ghost Echoes (Other Players, Async)

Objective: Opt-in anomalous influence from other players' run signatures.

Deliverables:
- Run signature export/import format.
- Local ghost cache and deterministic application rules.
- World anomaly injector based on imported signatures.
- Offline-safe behavior when no signatures exist.

Definition of Done:
- Imported signatures alter world behavior in identifiable ways.
- Core game remains fully playable without ghost data.

## M11 - Architecture Layer (Ascension 3) + Endgame

Objective: Meta-rule editing and final remembrance arc.

Deliverables:
- Rule-mutation layer (belief formation, civ growth, domain semantics).
- Name-letter milestone system.
- Secret final choice implementation without explicit confirmation UI.
- Ending branches:
  - remember and break seal
  - forget again and preserve seal

Definition of Done:
- Player can finish remembrance path.
- Final decision is mechanically real and intentionally ambiguous in presentation.

## M12 - Balance, Tuning, and Content Expansion

Objective: Hit pacing targets and session cadence.

Deliverables:
- Economy tuning passes to target:
  - Run 1: 6-10h
  - Runs 2-3: 3-5h
  - Runs 4+: 1-3h
  - Emotional core around 25h
- 20-40 minute milestone cadence instrumentation.
- Expanded omen prose packs and name generation dictionaries.
- Regression test suite for simulation determinism boundaries.

Definition of Done:
- Playtest data supports target durations.
- Most sessions produce at least one meaningful milestone in <= 40 minutes.
- No critical simulation regressions in test suite.

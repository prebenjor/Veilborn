# Veilborn Game Reference (Implementation Snapshot)

Purpose: canonical implementation-level reference for current game behavior.
Use this with `MANIFESTO.md` and `docs/roadmap.json`.

This document is the seed for a future public wiki.

## Scope and Source of Truth

Priority when implementing:
1. `MANIFESTO.md`
2. `docs/roadmap.json`
3. This file (`docs/GAME_REFERENCE.md`)
4. Runtime code

When runtime and manifesto diverge, either:
- update runtime to match manifesto, or
- revise manifesto and roadmap in the same change.

## Current Build Snapshot

- Save schema: `17`
- Core loop: deterministic tick (`250ms`)
- Persistence: localStorage save + migration + recovery snapshot
- Offline sim: enabled (`8h cap`, `85% belief efficiency`)
- Deployment target: GitHub Pages SPA

## Feature Status (High-Level)

Completed milestones in code:
- `M0` through `M13`
- `M15`
- `M16`
- `M17`
- `M20`
- `M21`

Pending milestones:
- `M14` balance/runtime targets (feature-first ordering: after M21 + M17)
- `M18` convergence mode
- `M19` documentation/wiki foundation

Completed PFs currently reflected in runtime:
- `PF-01` bulk domain investing
- `PF-02` strict era-locked disclosure
- `PF-03` anti-clutter layout pass
- `PF-04` runtime formatting in stats
- `PF-06` omen frequency/authenticity baseline pass
- `PF-07` progressive HUD reveal
- `PF-09` number legibility formatting
- `PF-15` act projection/result clarity baseline
- `PF-18` veil mastery zone indicator baseline
- `PF-17` domain synergy feedback baseline
- `PF-22` era III influence cap scaling
- `PF-25` veil pressure rebalance and miracle naming baseline
- `PF-26` desktop omens sidebar + fixed stats dock (run-scoped/capped omen feed)
- `PF-27` miracle reserve + legacy echo access
- `PF-28` whisper evolution + expanded echo sink scaling

## Core Systems and Formulas

### Resources

- Belief: primary currency/output
- Influence: action currency (regens, capped)
- Veil: stability meter with upside/downside
- Followers: conversion/structure pressure resource
- Echoes: prestige currency

### Belief Generation

Runtime formula:

`B/s = (prophetStack + cultStack + followerTrickle) * veilBonus * ghostBonus * pantheonModifier * architectureBeliefModifier`

Components:

- `prophetOutput = 2 + totalDomainLevel * 0.1`
- `domainMultiplier = 1 + totalDomainLevel * 0.15`
- `cultOutput = prophets * followers * 0.08 * domainSynergy`
- `domainSynergy = (1 + 0.25 * matchingPairs) * architecture/final-choice/ghost adjustments`
- `veilBonus = 1 + ((100 - veil) * 0.008)`
- `followerTrickle = followers * 0.002`

### Influence Economy

Cap:

`influenceCap = 100 + (20 * prophets) + 50 if startInf`

Era III bonus terms:

`+ 5 * max(0, cults - 3)`

`+ 2 * max(0, avgDomainLevel - 5)`

`+ 0.5 * max(0, shrinesBuilt - 20)`

Total regen per second:

`total = base + shrine + cult + echo`

- `base = 1 + (0.5 * prophets)`
- `shrine = shrinesBuilt * 0.2`
- `cult = min(avgFollowersPerCult * 0.001, 2.0) * cultCount`
- `echo = 2.0 if resonantWord`

Notes:
- Cult regen uses average followers per cult and applies a per-cult cap before multiplying.
- Stats page exposes full influence regen breakdown.
- Overflow Influence at cap is redirected into Era III `miracleReserve` (no offline gain, no decay).
- Miracles spend total power: `influence + miracleReserve` (Influence spent first).

Miracle reserve cap (Era III):

`miracleReserveCap = min(5000, floor(600 + 20*prophets + 30*cults + 4*shrines + 25*max(0, avgDomainLevel-4) + 150 if startInf + 60*max(0, cataclysmTreeRank-5)))`

### Whisper and Recruit

Whisper base cycle:
- Window reset: `4 minutes`
- Base cycle cost: `baseCycleCost = ceil(10 * 1.4^whispersInWindow)`
- Base belief gain on use: `+2` (plus cadence bonus when active)

Era I whisper profile:
- Single action only (`Crowd`, `base`)
- No fail chance, no target cooldown

Era II whisper targets:
- `Crowd`: surcharge `+0`, follower multiplier `1.0`, fail chance `0.00`
- `Prophets`: surcharge `+8`, follower multiplier `1.4`, fail chance `0.08`
- `Cults`: surcharge `+12`, follower multiplier `1.6`, fail chance `0.12`, cooldown `45s`

Era III magnitude layer:
- Base variants remain available.
- Boosted variants unlock:
  - `Open Proclamation` (`Crowd boosted`): cost multiplier `2.5`, follower multiplier `2.0`, fail chance `0.06`
  - `Sacred Charge` (`Prophets boosted`): cost multiplier `2.5`, follower multiplier `2.5`, fail chance `0.14`
  - `Doctrine Wave` (`Cults boosted`): cost multiplier `3.0`, follower multiplier `3.0`, fail chance `0.20`, cooldown `90s`

Whisper cost by profile:

`whisperCost = ceil((baseCycleCost + targetSurcharge + oneTimeDelta) * magnitudeMultiplier)`

Notes:
- `oneTimeDelta` is used by temporary event effects (for example, next-whisper modifiers).
- Doctrine echo overflow can reduce target surcharge (up to 20%).

Whisper follower outcomes:

`baseFollowersRaw = (1 + cadenceFollowerBonus) * targetMultiplier * magnitudeMultiplier * (1 + whisperEchoYieldBonus)`

`successFollowers = floor(baseFollowersRaw * lineageModifier)`

`strainedFollowers = floor(baseFollowersRaw * 0.6 * lineageModifier)` (runtime uses strain multiplier before lineage rounding)

Whisper strain/fail chance:

`failChance = clamp(baseFail * 0.96^completedRuns - whisperEchoFailReduction - boostedFailReduction, 0, 0.95)`

If strained, whisper still resolves but uses `strainedFollowers` instead of `successFollowers`.

Whisper cooldowns:
- Only `Cults` target has cooldown.
- Cooldown ends are stored per target in session state.
- Doctrine echo overflow reduces cult-target cooldown by `4s` per overflow rank (max `32s`).

Recruit:
- Cost: `25 Influence` (flat)
- Follower base: `4 + 2*prophets + floor(totalDomainLevel / 2)`
- Random bonus: `0..2`
- Devotion multiplier: `* (1 + 0.08 * devotionStacks)`

Cadence prompt:
- Trigger after `45s` inactivity
- Next action bonus: `+5 belief`, `+1 follower`

Lineage conversion modifier applies to whisper/recruit follower gains.

### Devotion (Path System Active)

Devotion stacks:
- Range: `0..3` (Era I cap)
- Qualifying actions: Whisper, Recruit, Anoint Prophet
- Gain rule: +1 stack per qualifying action, capped at `3`
- No decay from inactivity

Effect:

`recruit_followers = base_followers * (1 + 0.08 * devotion_stacks)`

Persistence:
- Persists through offline sessions (no gain/loss offline)
- Resets on ascension only

Omen milestones (once per run):
- First stack: `Something stirs at the edge of attention.`
- First max stack: `The devotion of your followers has taken root.`
- First qualifying action after ascension: `The stillness returns. Begin again.`

Path differentiation:
- Era II candidates: `Fervour`, `Accord`
- Era III candidates: `Fervour`, `Accord`, `Reverence`, `Ardour`
- Emergence threshold: top momentum `>= 4`
- Switching threshold: challenger `>= 7` and lead over active path `>= 3`
- Run 2+ lineage memory: dominant prior-run path starts next run with `+1` momentum toward that path

Momentum sources:
- `Fervour`: start act `+2`, cast miracle `+2` (Era III)
- `Accord`: form cult `+2`, follower rite `+1` (Era III)
- `Reverence`: suppress rival `+2` (Era III)
- `Ardour`: whisper/recruit/anoint prophet `+1` (Era III)

Path effects (stack + momentum scaled):
- `momentumScale = clamp(1 + momentum*0.01, 1.0, 1.4)`
- `Fervour`: act return multiplier and Era III miracle gain multiplier
- `Accord`: cult output multiplier and Era III domain synergy bonus
- `Reverence`: Era III veil erosion reduction multiplier
- `Ardour`: Era III prophet output multiplier

### Era I Moments of Doubt

Runtime behavior:
- Era I-only binary-choice event cards in the `Murmurs` panel.
- First event fires at a randomized `3-5m` window, then every `4-7m` after resolution.
- At most one active event at a time; active events auto-resolve after `3m` as narrative-only `let it pass` outcomes.
- Event firing is suppressed while total Belief is below `50` and stops once Era II is entered.

Resolution model:
- Two choices per event; some `B` choices consume Influence (`<= 25`).
- Outcomes apply lightweight follower/devotion/next-whisper-cost effects per event definition.
- Delayed probabilistic outcomes roll at choice time and reveal by omen line when due.
- If a tab closes with an unresolved event, the next load applies narrative-only timeout resolution (no mechanical change).

### Prophet and Cult Economy

Prophet threshold:

`followersNeeded = base * 1.6^prophets`

- base `50`
- base `20` with `prophetThreshold` echo bonus

Cult formation cost:

`cost = base * 2^cults`

- base `500`
- base `350` with `cultCostBase` echo bonus

### Domain Investment

Invest cost:

`ceil(50 * 1.8^level)`

XP needed:

`ceil(3 * 1.5^level)`

Bulk investing:
- `+1`, `+10%`, `+25%`, `+50%`, `Max`
- Previewed spend and projected levels

### Acts (Doctrine)

Act types:
- `shrine`: cost `20`, duration `30s`, base mult `2.5`
- `ritual`: cost `80`, duration `45s`, base mult `4.0`
- `proclaim`: cost `150`, duration `60s`, base mult `7.0`

Cost discount:
- x`0.85` if `actDiscount` echo bonus

Belief return:

`reward = currentBps * duration * beliefMult * 0.3`

`beliefMult = max(actFloor, baseMult + matchingPairs * 0.2)`

Act floor:
- base `1.0`
- `1.5` with `actFloor` echo bonus

Act slot cap:
- `max(1, cults)`

### Rivals

Spawn:
- Available in era `>=2`, requires cults
- Base interval `300s`
- +`60s` with `rivalDelay`
- Max active: `2`

Strength:

`strength = max(1, beliefPerSecond * 0.08) * weakenedModifier`

- weakened modifier `0.8` with `rivalWeaken`, else `1.0`

Drain:

`followerDrain = rivalStrength * 0.015 /s`

Drain only applies if:
- `rivalStrength > cultOutput * 0.5`

Suppress:
- Cost `200 Influence`

### Era III Passive Follower Arrival

Active in era `3` only, and disabled if civilization health `<= 0`.

`rate = (0.35*cults + 0.25*shrines + 0.05*prophets) * (civHealth/100) * veilZoneMult`

Veil zone multiplier:
- veil `>55`: `0.8`
- veil `30-55`: `1.1`
- veil `<30`: `1.25`

Integrated in online and offline simulation.

### Era III Doctrine Follower Rites

Purpose:
- high-cost active follower burst actions in Doctrine panel
- scaling by usage count, no timer-based reset

Rites:
- `Pilgrim Procession`
- `Convergence March`

Base costs:
- Procession: `220 Influence`, `12,000 Belief`
- Convergence: `680 Influence`, `90,000 Belief`

Cost scaling:
- Procession x`1.28^uses`
- Convergence x`1.35^uses`

Follower gain base:
- Procession: `180`
- Convergence: `900`

Follower gain multiplier includes:
- cult count, shrine count, prophet count
- matching domain pairs
- total domain level
- civilization health
- veil zone
- lineage conversion modifier

### Veil and Collapse

Regen:
- base `1 / 120s`
- base `1 / 80s` with `veilRegen`
- shrine regen: `(shrines * baseShrineRate) / (1 + shrines * 0.015)`
  - baseShrineRate: `1/90`
  - with `veilRegen` echo: baseShrineRate `1/80`

Erosion in era III:

`erosion = 0.001 * log10(totalBeliefEarned) + 0.0002 * shrines` (with final-choice adjustment)

Collapse threshold:
- base `15`
- `8` with `collapseThreshold`

On veil collapse:
- followers x`0.4`
- lose `2` prophets
- optional immunity `30s` with `collapseImmunity`

### Miracles and Civilization

Miracle influence costs:
- Whisper of Providence: `500`
- The Anointing: `1600`
- The Rending: `4100`
- Unraveling: `10000`

Miracle base gains:
- Whisper of Providence: `5500`
- The Anointing: `30000`
- The Rending: `90000`
- Unraveling: `300000`

Miracle veil costs:
- Whisper of Providence: `10` (`5` with `miracleVeilDiscount`)
- The Anointing: `15`
- The Rending: `25`
- Unraveling: `40`

Civilization damage:
- Whisper of Providence: `5`
- The Anointing: `8`
- The Rending: `14`
- Unraveling: `24`

Miracle belief gain:

`gain = baseGain * (civHealth/100) * (1 + dominantDomainLevel * 0.1)`

Civilization:
- natural regen `0.5 / min`
- shrine bonus `0.2 / shrine / min`
- collapse at `<= 0`
- collapse followers to `15%` of peak
- rebuild base `180s`, x`0.6` with `civRebuild`

### Era Gates

Era I -> II:
- belief earned target (`10000`, or x`0.7` with `era1Gate`)
- `3` prophets
- `500` followers

Era II -> III:
- belief earned target (`275000`, or x`0.75` with `era2Gate`)
- `3` cults
- survived rival event

Unraveling:
- total belief earned `>= 5,000,000`
- veil `<=20`
- miracles this run `>=2`
- runtime gate `>=240m` (soft gate logic handled in formula checks)

### Prestige and Echo Trees

Ascension echo gain:

`floor(sqrt(totalBeliefEarned / 750000))`

Echo trees:
- `whispers`, `doctrine`, `cataclysm`
- max rank `12`
- rank cost formula:

`nextRankCost(rank) = ceil(2 * 2^rank * (1 + 0.25 * rank))` where `rank` is current rank (`0`-indexed)

Reference next-rank costs:
- Rank 1: `2`
- Rank 2: `5`
- Rank 3: `12`
- Rank 4: `28`
- Rank 5: `64`
- Rank 6: `144`
- Rank 7: `320`
- Rank 8: `704`
- Rank 9: `1536`
- Rank 10: `3328`
- Rank 11: `7168`
- Rank 12: `15360`
- post-ascension Era I includes a `Legacy Echoes` quick-spend panel so Echoes can be invested before returning to Era III

Overflow rank model:
- Core branch unlocks remain concentrated in the first 5 ranks.
- Overflow rank is `max(0, rank - 5)` and drives late-game sink bonuses:
  - `whispers` overflow: whisper follower yield bonus (`+2%` per rank, max `+24%`) and fail chance reduction (`-1.5%` per rank, max `-24%`)
  - `doctrine` overflow: whisper target surcharge reduction (`-2%` per rank, max `-20%`) and cult-target cooldown reduction (`-4s` per rank, max `-32s`)
  - `cataclysm` overflow: boosted-whisper fail reduction (`-1%` per rank, max `-10%`) and miracle reserve cap increase (`+60` per overflow rank)

Domain carry:
- `domain_carry` is currently a planned upgrade path and not active in runtime.

### Lineage Memory

Persistent lineage dimensions:
- trust debt
- skepticism
- betrayal scars
- trait inheritance (skeptical/cautious/zealous)

System events can add/reduce lineage debt and affect conversion modifier.

### Pantheon (Run 2+)

Implemented:
- unlock after completed runs threshold
- generated allies
- alliance/betrayal decisions
- domain poisoning windows
- betrayal memory hooks

### Ghost Echoes

Implemented:
- local run signatures
- import/export bundle format
- active ghost influence deltas:
  - domain synergy
  - rival spawn interval

Core game remains complete without imported signatures.

### Architecture and Remembrance

Implemented:
- architecture rule selectors (belief/civilization/domain)
- remembrance letter tracking and unlock sync
- final choice invocation path

### UI and Era Disclosure

Era I:
- no tabbed shell
- minimal surface
- Whisper/Recruit and Prophets render in a single merged card (no `Doctrine Seeds` section header)
- Whisper/Recruit follower yield hints are shown on action hover/focus (not as static text)
- Devotion indicator appears in the Whispers card after first qualifying action (`●/○`, max 3)
- event log header: `Murmurs`
- bottom status: one quiet atmospheric line

Era II+:
- tabbed shell (`active`, `growth`, `meta`)
- sticky tab dock
- app shell orchestration in `src/App.tsx`; era-specific composition extracted to `src/ui/eras/*`
- shared shell surfaces extracted to `src/ui/layout/*` (stat bar, tab dock, persistent omen surface)
- tab containers in `active`, `growth`, and `meta` are collapsible with persisted localStorage state
- desktop shell breakpoint is `>=800px` (two-column layout with left content + right omens sidebar)
- right omens sidebar width is `240px` (`300px` on large screens); left column enforces a `500px` minimum
- desktop stats uses a separate fixed top-right dock (collapsed by default, trigger label `STATS`)
- the right omens sidebar has no expand control and shows a short rolling feed (max 6 entries)

Era II:
- `active` order: Whisper/Recruit -> Doctrine (merged)
- influence is displayed in the top stat bar only (no separate active-tab Influence container)
- era-II whisper surface keeps controls/cadence only (no additional subtitle text)
- `active` containers persist collapse state (`active_whispers_collapsed`, `active_doctrine_collapsed`)
- doctrine and doctrine-seeds content merge into one collapsible `Doctrine` container in `active` with internal order:
  - Prophets/Cults
  - Lineage Memory
  - Acts (+Follower Rites when available)
- `growth` order: Domains -> Rivals -> Threshold
- all `growth` containers are collapsible and persist collapse state (`growth_domains_collapsed`, `growth_rivals_collapsed`, `growth_threshold_collapsed`)
- rivals render as a single-line summary when inactive and auto-expand when active
- threshold renders at the bottom of `growth` (not in `active`)
- threshold defaults to collapsed in Era II
- meta tab label is `Meta` (no lite suffix)
- event log header: `Whispers`
- gate label: `Threshold`
- bottom status: one directive line

Era III:
- cataclysm in active flow
- `active` order: Cataclysm -> Rivals -> Whispers (collapsible containers)
- `active` containers persist collapse state (`active_cataclysm_collapsed`, `active_rivals_collapsed`, `active_whispers_collapsed`)
- `growth` order: Doctrine (merged) -> Domains -> Rivals
- `meta` containers persist collapse state (`meta_overview_collapsed`, `meta_ascension_collapsed`, `meta_remembrance_collapsed`, `meta_pantheon_collapsed`)
- unraveling gate strip always visible
- event log header: `Omens`
- gate label: `Unraveling Gate`
- bottom status line removed

Disclosure policy:
- future-era systems hidden until unlock
- cult controls reveal near affordability threshold (`90%`)
- stats surface is always accessible (fixed top-right dock on desktop, floating drawer on mobile) and only shows unlocked-system metrics
- active omen surfaces are run-scoped (`entry.at >= runStartTimestamp`) so prior-run lines do not leak into fresh runs
- omen feed is capped to the latest 6 entries (`OMEN_LOG_MAX_ENTRIES`)

### Stats, Telemetry, and Exports

Stats surface:
- always accessible in every era and tab
- desktop (`>=800px`): fixed top-right dock with collapsed-by-default trigger (`STATS`)
- mobile (`<800px`): floating button opens drawer
- run timers and cadence info
- follower flow lines
- devotion path + stack line (path appears in Era II+)
- influence source breakdown
- run history (includes cadence summary and era pacing durations for ascended runs)
- save archive controls (export/import/restore snapshot)
- optional unlockable Dev Tools section for local pacing tests:
  - gate priming (Era I / Era II)
  - jump to Era II / Era III
  - temporary resource boost
  - unlock state persists via localStorage key `veilborn.ui.dev_tools.enabled.v1`
- content scales by era without spoiling future systems

Stats content by era:
- Era I: no doctrine or cataclysm metrics (no cult output line, no shrine/cult influence lines, no rival or passive follower lines); Devotion stack line visible.
- Era II: doctrine metrics appear (cults, shrines, rival-related flow where active) and Devotion path label appears.
- Era III: cataclysm-era metrics appear (passive follower arrival and other era-III-only lines).

Telemetry:
- local structured events:
  - era transition
  - veil collapse
  - civilization collapse
  - ascension
  - rival suppression
  - miracle use
- per-run action cadence capture on successful player actions:
  - total actions
  - average / median / p90 interval seconds
  - `%` of action intervals in `30-60s` target window
  - sub-1s intervals filtered from cadence metrics to avoid burst-noise skew
  - cadence buffer initialized at run start so phase timing can be measured even in low-action sessions
- per-run era milestones in run summary:
  - Era I -> II seconds
  - Era II -> III seconds
  - Era III -> ascension seconds
- run summaries capped to last `20`
- JSON export + console dump helpers
- M14 regression harness: `npm run regression:m14` (formula + offline simulation assertions)
- M14 timing/cadence audit: `npm run audit:m14 -- <telemetry-export-1.json> [telemetry-export-2.json ...]`
- M14 non-ascended session comparison: `npm run compare:m14 -- <session-a.json> <session-b.json>` (includes Era I and Era II phase duration/belief checks when transition data exists)
- Export-driven tuning loop:
  - collect 2-3 telemetry exports from ascended runs
  - run `audit:m14` across all exports
  - apply one small constant adjustment (5-10% gate delta or +0.03 to +0.08 scalar delta)
  - repeat until run timing/cadence reports stabilize

### Save Integrity and Recovery

Implemented:
- schema migration pipeline
- corruption-safe load fallback
- snapshot before ascension and era transition
- manual save export/import
- restore last good snapshot flow

## Offline Rules (Runtime)

- Simulation cap: `8h`
- Belief: close-state `B/s * seconds * 0.85`
- Influence: set to `50%` of cap on return
- Veil: regen/erosion applied, clamped to floor `15`, no offline collapse
- Rivals: existing rivals can drain at `50%`, no new spawns
- Passive follower arrival included
- Acts continue by end timestamp; expired acts are cleared on return

## Known Divergence / Pending Balance Pass

Documented in manifesto as pressure systems but not active in runtime yet:
- Domain Hunger upkeep sink
- Cult Fragmentation schism sink

These should be decided in `M14` tuning pass:
- either implemented in runtime, or
- removed/replaced in manifesto with explicit revision note.

## Wiki Seed Backlog

Suggested future wiki top-level pages:
1. Core Loop by Era
2. Formula Compendium
3. Echo Tree Upgrade Guide
4. Veil Mastery and Collapse Recovery
5. Pantheon and Betrayal Strategy
6. Ghost Signatures and Import Guide
7. Audio Behavior and Accessibility
8. Save, Recovery, and Troubleshooting
9. Modding/Data Surface (if exposed later)

Recommended process:
- keep this file as internal source
- mirror stable sections into `/wiki/*` pages in milestone `M19`

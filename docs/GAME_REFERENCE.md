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

- Save schema: `23`
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
- `PF-29` era shell parity (Legacy tab in all eras + Era I threshold tab + Era I acolyte orders)

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
- `domainSynergy = (1 + 0.25 * activeResonancePairs + 0.05 * tempestMemoryTier) * architecture/final-choice/ghost adjustments`
- `veilBonus = 1 + ((100 - veil) * 0.008)`
- `followerTrickle = followers * 0.002`

### Influence Economy

Cap:

`influenceCap = 100 + (20 * prophets)`

Era III bonus terms:

`+ 5 * max(0, cults - 3)`

`+ 2 * max(0, avgDomainLevel - 5)`

`+ 0.5 * max(0, shrinesBuilt - 20)`

Total regen per second:

`total = base + shrine + cult + acolyteOrder`

- `base = 1 + (0.5 * prophets)`
- `shrine = shrinesBuilt * 0.2`
- `cult = min(avgFollowersPerCult * 0.001, 2.0) * cultCount`
- `acolyteOrder` (Era I only): active `Steady` order bonus, capped by order rules

Notes:
- Cult regen uses average followers per cult and applies a per-cult cap before multiplying.
- Stats page exposes full influence regen breakdown.
- Overflow Influence at cap is redirected into Era III `miracleReserve` (no offline gain, no decay).
- Gate rites spend total rite budget: `influence + miracleReserve` (Influence spent first).

Miracle reserve cap (Era III):

`miracleReserveCap = min(5000, floor(600 + 20*prophets + 30*cults + 4*shrines + 25*max(0, avgDomainLevel-4) + 20*reservoirTreeRank))`

### Whisper and Recruit

Whisper baseline:
- Base cost: `10` (flat, no cycle reset)
- Base belief gain on use: `+2` (plus cadence bonus when active)

Era I whisper profile:
- Single action only (`Crowd`, `base`)
- No fail chance, no target cooldown

Era II+ whisper targets:
- `Prophets`: surcharge `+50`, follower multiplier `1.25`, fail chance `0.08`, cooldown `60s`
- `Cults`: surcharge `+80`, follower multiplier `1.4`, fail chance `0.12`, cooldown `90s`
- Passive follower-rate impact from last whisper target:
  - `Prophets`: `+3%`
  - `Cults`: `+5%`
- Light-Void resonance additionally modifies both targets:
  - `-8%` surcharge per resonance tier
  - `-4s` cooldown per resonance tier

Whisper cost by profile:

`whisperCost = ceil(baseWhisperCost + targetSurcharge + oneTimeDelta)`

Notes:
- `oneTimeDelta` is used by temporary event effects (for example, next-whisper modifiers).
- Whisper root affects reliability only (strain chance reduction); it does not modify surcharge, cooldown, or follower yield.

Whisper follower outcomes:

`baseFollowersRaw = (1 + cadenceFollowerBonus) * targetMultiplier * magnitudeMultiplier * (1 + whisperEchoYieldBonus)`

`successFollowers = floor(baseFollowersRaw)`

`strainedFollowers = floor(baseFollowersRaw * 0.6)` (runtime uses strain multiplier before rounding)

Whisper strain/fail chance:

`failChance = clamp(baseFail * 0.96^completedRuns - whisperEchoFailReduction - cultFailReduction, 0, 0.95)`

If strained, whisper still resolves but uses `strainedFollowers` instead of `successFollowers`.

Whisper cooldowns:
- `Prophets` and `Cults` targets both have cooldowns.
- Cooldown ends are stored per target in session state.

Recruit:
- Cost: `25 Influence` (flat)
- Follower base: `4 + 2*prophets + floor(totalDomainLevel / 2)`
- Random bonus: `0..2`
- Devotion multiplier: `* (1 + 0.08 * devotionStacks)`

Cadence prompt:
- Trigger after `45s` inactivity
- Next action bonus: `+5 belief`, `+1 follower`

Era I acolyte orders:
- Available when Era I has at least one acolyte.
- One active order at a time; order duration: `45s`.
- Repeat penalty on reissuing the same order:
  - `penalty = min(0.45, repeatCount * 0.15)`
  - `potency = max(0.1, 1 - penalty)`
- `Gather`:
  - immediate followers: `floor((4 + 2*acolytes) * potency)`, minimum `1`
  - passive followers per second while active: `acolytes * 0.08 * potency`
- `Listen`:
  - next recruit and recruit preview multiplier while active: `1 + 0.35 * potency`
- `Steady`:
  - influence regen bonus while active: `min(1.5, acolytes * 0.12) * potency`
- Orders auto-expire by timestamp and clear to `none` on expiry.

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
- Run 2+ devotion memory: dominant prior-run path starts next run with `+1` momentum toward that path

Momentum sources:
- `Fervour`: start act `+2`, cast miracle `+2` (Era III)
- `Accord`: form cult `+2` (Era III)
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

Era unlock:
- Era I: acolytes only (prophet anointing disabled)
- Era II+: prophet anointing enabled

Acolyte threshold:

`followersNeededForNextAcolyte = 18 * 1.45^acolytes * conversionThresholdMult`

Prophet threshold:

`followersNeeded = base * 1.6^prophets * conversionThresholdMult`

- base `50`
- base `50` (no prophet-threshold echo override in focused-root model)

Prophet acolyte requirement:

`acolytesNeeded = ceil((2 + floor(prophets / 4)) * conversionThresholdMult)`

Anointing a prophet consumes both follower and acolyte requirements.

Cult formation cost:

`cost = base * 2^cults * conversionThresholdMult`

- base `500` (no cult-base echo override in focused-root model)

Cult prophet requirement:

`prophetsNeeded = ceil((1 + floor(cults / 3)) * conversionThresholdMult)`

Founding a cult consumes the required prophets.

Conversion threshold multiplier:

`conversionThresholdMult = max(0.8, 1 - (0.01 * conversionRootRank))`

### Domain Investment

Runtime domain labels:
- Light, Death, Life, Tempest, Memory, Void

Invest cost:

`ceil(50 * 1.8^level * eraMult * tierMult)`

`eraMult`:
- Era II: `0.85`
- Era III: `1.0`

`tierMult` by current level:
- `<2`: `0.8`
- `2-4`: `1.0`
- `5-8`: `1.3`
- `>=9`: `1.65`

XP needed:

`ceil(3 * 1.5^level)`

Doctrine resonance pairs (based on minimum level within each pair):
- `Life-Death`: Tier I/II/III at min level `2/5/9`, bonus `+4%` prophet passive follower rate per tier
- `Light-Void`: Tier I/II/III at min level `2/5/9`, bonus `-8%` whisper surcharge and `-4s` whisper cooldown per tier
- `Tempest-Memory`: Tier I/II/III at min level `2/5/9`, bonus `+5%` cult passive follower rate per tier

Bulk investing:
- `+1`, `+10%`, `+25%`, `+50%`, `Max`
- Previewed spend and projected levels

### Doctrine Acts (Era III Doctrine)

Act types:
- `shrine`: cost `20`, duration `30s`, base mult `2.5`
- `ritual`: cost `80`, duration `45s`, base mult `4.0`
- `proclaim`: cost `150`, duration `60s`, base mult `7.0`

Cost discount:
- no act-discount echo override in focused-root model

Belief return:

`reward = currentBps * duration * beliefMult * 0.3`

`beliefMult = max(actFloor, baseMult + activeResonancePairs * 0.12 + tempestMemoryTier * 0.05)`

Act floor:
- `1.0` (no act-floor echo override in focused-root model)

Act slot cap:
- `max(1, cults)`

Availability:
- Act controls are unlocked in Era III only.
- Era II doctrine surface does not expose act controls.

### Rivals

Spawn:
- Available in era `>=2`, requires cults
- Base interval `300s`
- no echo-delay override in focused-root model
- Max active: `2`

Strength:

`strength = max(1, beliefPerSecond * 0.08)` (no echo-weaken override in focused-root model)

Drain:

`followerDrain = rivalStrength * 0.015 /s`

Drain only applies if:
- `rivalStrength > cultOutput * 0.5`

Suppress:
- Cost `200 Influence`

### Passive Follower Arrival (Era II/III)

Era II:

`rate = (0.015*acolytes + (0.03*prophets*(1+lifeDeathBonus))) * whisperTargetMult`

Era III (disabled if civilization health `<= 0`):

`rate = ((0.03*acolytes) + (0.06*prophets*(1+lifeDeathBonus)) + (0.45*cults*(1+tempestMemoryBonus)) + 0.25*shrines) * whisperTargetMult * (civHealth/100) * veilZoneMult`

Veil zone multiplier:
- veil `>55`: `0.8`
- veil `30-55`: `1.1`
- veil `<30`: `1.25`

Integrated in online and offline simulation.

### Veil and Collapse

Regen:
- base `1 / 120s`
- shrine regen: `(shrines * baseShrineRate) / (1 + shrines * 0.015)`
  - baseShrineRate: `1/90`

Erosion in era III:

`erosion = 0.001 * log10(totalBeliefEarned) + 0.0002 * shrines` (with final-choice adjustment)

Collapse threshold:
- base `15`

On veil collapse:
- followers x`0.4`
- lose `2` prophets
- no echo-immunity override in focused-root model

### Miracles and Civilization

Miracle influence costs:
- Whisper of Providence: `300`
- The Anointing: `650`
- The Rending: `1000`

Miracle base gains:
- Whisper of Providence: `7000`
- The Anointing: `24000`
- The Rending: `70000`

Miracle veil costs:
- Whisper of Providence: `10`
- The Anointing: `18`
- The Rending: `28`

Civilization damage:
- Whisper of Providence: `4`
- The Anointing: `7`
- The Rending: `11`

Miracle belief gain:

`gain = baseGain * (civHealth/100) * (1 + dominantDomainLevel * 0.1)`

Civilization:
- natural regen `0.5 / min`
- shrine bonus `0.2 / shrine / min`
- collapse at `<= 0`
- collapse followers to `15%` of peak
- rebuild base `180s` (no echo-rebuild override in focused-root model)

### Era Gates

Era I -> II:
- belief earned target (`10000`)
- `5` acolytes
- `500` followers

Era II -> III:
- belief earned target (`275000`)
- `3` cults
- survived rival event

Gate (Era III):
- total belief earned `>= 5,000,000`
- veil `<=20`
- gate rites this run `>=2`
- veil strain from rites `>=50`
- runtime gate `>=240m` (soft gate logic handled in formula checks)

### Prestige and Echo Trees

Ascension echo gain:

`floor(sqrt(totalBeliefEarned / 750000))`

Echo trees:
- Runtime ids: `whispers`, `conversion`, `doctrine`, `stability`, `cataclysm`
- Player-facing root names: `Whisper`, `Conversion`, `Doctrine`, `Fracture`, `Reservoir`
- Compatibility note: runtime id `cataclysm` is a legacy save key that maps to the `Reservoir` root.
- Legacy `echoBonuses` flags were removed from runtime state; older saves are migrated by inferring tree ranks.
- max rank `20`
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
- Rank 13: `32768`
- Rank 14: `69632`
- Rank 15: `147456`
- Rank 16: `311296`
- Rank 17: `655360`
- Rank 18: `1376256`
- Rank 19: `2883584`
- Rank 20: `6029312`
- post-ascension Era I includes a `Legacy Echoes` quick-spend panel so Echoes can be invested before returning to Era III

Focused rank model:
- `whispers`: whisper strain reduction (`-0.4%` per rank, cap `-8%`)
- `conversion`: conversion thresholds reduction (`-1.0%` per rank, cap `-20%`)
- `doctrine`: act-cost reduction (`-0.75%` per rank, cap `-15%`)
- `stability` (Fracture root): gate-rite Veil strain bonus (`+1.5%` per rank, cap `+30%`)
- `cataclysm` (Reservoir root): rite reserve cap increase (`+20` per rank)

Domain carry:
- `domain_carry` is currently a planned upgrade path and not active in runtime.

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
Ghost controls are currently not exposed in the Ascension panel UI.

### Architecture and Remembrance

Implemented:
- architecture rule selectors (belief/civilization/domain)
- remembrance letter tracking and unlock sync
- final choice invocation path

### UI and Era Disclosure

Era I:
- tabbed shell: `active`, `threshold`, `legacy`
- minimal surface with dedicated threshold and legacy views
- `active` order: Whispers -> Acolytes
- active containers are collapsible and persist state (`era1_active_whispers_collapsed`, `era1_active_acolytes_collapsed`, `era1_active_prophets_collapsed`)
- `threshold` tab uses a collapsible container (`era1_threshold_collapsed`)
- `legacy` tab uses a collapsible `Legacy Echoes` container (`era1_legacy_collapsed`)
- Whisper/Recruit follower yield hints are shown on action hover/focus (not as static text)
- Devotion indicator appears in the Whispers card after first qualifying action (max 3)
- event log header: `Murmurs`
- bottom status: one quiet atmospheric line

Era II+:
- tabbed shell with dedicated `legacy` tab
- sticky tab dock
- app shell orchestration in `src/App.tsx`; era-specific composition extracted to `src/ui/eras/*`
- shared shell surfaces extracted to `src/ui/layout/*` (stat bar, tab dock, persistent omen surface)
- tab containers in `active`, `growth`, `legacy`, and `meta` are collapsible with persisted localStorage state
- desktop shell breakpoint is `>=800px` (two-column layout with left content + right omens sidebar)
- right omens sidebar width is `240px` (`300px` on large screens); left column enforces a `500px` minimum
- desktop stats uses a separate fixed top-right dock (collapsed by default, trigger label `STATS`)
- the right omens sidebar has no expand control and shows a short rolling feed (max 6 entries)

Era II:
- tabs: `active`, `growth`, `legacy`, `meta`
- `active` order: Whisper/Recruit -> Doctrine (merged)
- influence is displayed in the top stat bar only (no separate active-tab Influence container)
- era-II whisper surface keeps controls/cadence only (no additional subtitle text)
- `active` containers persist collapse state (`active_whispers_collapsed`, `active_doctrine_collapsed`)
- doctrine and doctrine-seeds content merge into one collapsible `Doctrine` container in `active` with internal order:
  - Prophets/Cults
  - Doctrine Acts are Era III-only (not shown in Era II)
- `growth` order: Domains -> Rivals -> Threshold
- all `growth` containers are collapsible and persist collapse state (`growth_domains_collapsed`, `growth_rivals_collapsed`, `growth_threshold_collapsed`)
- rivals render as a single-line summary when inactive and auto-expand when active
- threshold renders at the bottom of `growth` (not in `active`)
- threshold defaults to collapsed in Era II
- `legacy` tab hosts ascension/echo controls in a collapsible container (`legacy_ascension_collapsed`)
- `meta` excludes ascension and keeps overview/remembrance/pantheon containers
- meta tab label is `Meta` (no lite suffix)
- event log header: `Whispers`
- gate label: `Threshold`
- bottom status: one directive line

Era III:
- tabs: `active`, `growth`, `gate`, `legacy`, `meta`
- `active` order: Whispers -> Doctrine (collapsible containers)
- `active` containers persist collapse state (`active_whispers_collapsed`, `active_doctrine_collapsed`)
- rivals are moved out of active flow and live in `growth`
- `growth` order: Domains -> Rivals
- `gate` is a dedicated tab (separate from `meta`) for gate rites + gate progression
- `legacy` tab hosts ascension/echo controls in a collapsible container (`legacy_ascension_collapsed`)
- `meta` containers persist collapse state (`meta_overview_collapsed`, `meta_remembrance_collapsed`, `meta_pantheon_collapsed`)
- no persistent unraveling strip in Era III
- event log header: `Omens`
- gate label: `Gate`
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
- Era I: no doctrine or gate-rite metrics (no cult output line, no shrine/cult influence lines, no rival lines); Devotion stack line visible, and active `Steady` acolyte-order influence bonus appears in influence breakdown.
- Era II: doctrine metrics appear (cults, shrines, rival-related flow where active) and Devotion path label appears.
- Era III: gate-rite metrics appear (reserve, rite budget, passive follower arrival and other era-III-only lines).

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


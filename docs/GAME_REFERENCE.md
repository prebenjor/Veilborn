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

- Save schema: `12`
- Core loop: deterministic tick (`250ms`)
- Persistence: localStorage save + migration + recovery snapshot
- Offline sim: enabled (`8h cap`, `85% belief efficiency`)
- Deployment target: GitHub Pages SPA

## Feature Status (High-Level)

Completed milestones in code:
- `M0` through `M13`
- `M15`
- `M16`

Pending milestones:
- `M14` balance/runtime targets
- `M17` accessibility/mobile resilience
- `M18` convergence mode

Completed PFs currently reflected in runtime:
- `PF-01` bulk domain investing
- `PF-02` strict era-locked disclosure
- `PF-04` runtime formatting in stats
- `PF-06` omen frequency/authenticity baseline pass
- `PF-07` progressive HUD reveal
- `PF-09` number legibility formatting
- `PF-15` act projection/result clarity baseline
- `PF-17` domain synergy feedback baseline

## Core Systems and Formulas

### Resources

- Belief: primary currency/output
- Influence: action currency (regens, capped)
- Veil: stability meter with upside/downside
- Followers: conversion/structure pressure resource
- Echoes: prestige currency

### Belief Generation

Runtime formula:

`B/s = (prophetStack + cultStack) * veilBonus * ghostBonus * pantheonModifier * architectureBeliefModifier`

Components:

- `prophetOutput = 2 + totalDomainLevel * 0.1`
- `domainMultiplier = 1 + totalDomainLevel * 0.15`
- `faithDecay = max(floor, 0.95^(minutesSinceLastEventAdjusted))`
- `cultOutput = prophets * followers * 0.08 * domainSynergy`
- `domainSynergy = (1 + 0.25 * matchingPairs) * architecture/final-choice/ghost adjustments`
- `veilBonus = 1 + ((100 - veil) * 0.008)`

Faith floor:
- base `0.0`
- `0.8` with echo bonus `faithFloor`

### Influence Economy

Cap:

`influenceCap = 100 + (20 * prophets) + 50 if startInf`

Total regen per second:

`total = base + shrine + cult + echo`

- `base = 1 + (0.5 * prophets)`
- `shrine = shrinesBuilt * 0.2`
- `cult = min(avgFollowersPerCult * 0.001, 2.0) * cultCount`
- `echo = 2.0 if resonantWord`

Notes:
- Cult regen uses average followers per cult and applies a per-cult cap before multiplying.
- Stats page exposes full influence regen breakdown.

### Whisper and Recruit

Whisper:
- Cost: `ceil(10 * 1.4^whispersInWindow)`, 4-minute reset window
- Gain: `belief +2`, `followers +1` before modifiers

Recruit:
- Cost: `25 Influence` (flat)
- Follower base: `4 + 2*prophets + floor(totalDomainLevel / 2)`
- Random bonus: `0..2`

Cadence prompt:
- Trigger after `45s` inactivity
- Next action bonus: `+5 belief`, `+1 follower`

Lineage conversion modifier applies to whisper/recruit follower gains.

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

`rate = (0.35*cults + 0.25*shrines + 0.05*prophets) * faithDecay * (civHealth/100) * veilZoneMult`

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
- faith decay
- civilization health
- veil zone
- lineage conversion modifier

### Veil and Collapse

Regen:
- base `1 / 120s`
- base `1 / 80s` with `veilRegen`
- shrine regen: `+1 / 90s` per shrine

Erosion in era III:

`erosion = 0.001 * log10(totalBeliefEarned)` (with final-choice adjustment)

Collapse threshold:
- base `15`
- `8` with `collapseThreshold`

On veil collapse:
- followers x`0.4`
- lose `2` prophets
- optional immunity `30s` with `collapseImmunity`

### Miracles and Civilization

Miracle influence costs:
- `500`, `1600`, `4100`, `10000`

Miracle base gains:
- `8000`, `30000`, `90000`, `300000`

Miracle veil costs:
- `8`, `15`, `25`, `40`
- tier 1 reduced to `5` with `miracleVeilDiscount`

Civilization damage:
- `4`, `8`, `14`, `24`

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
- belief earned target (`250000`, or x`0.75` with `era2Gate`)
- `3` cults
- survived rival event

Unraveling:
- total belief earned `>= 5,000,000`
- veil `<=20`
- miracles this run `>=2`
- runtime gate `>=240m` (soft gate logic handled in formula checks)

### Prestige and Echo Trees

Ascension echo gain:

`floor(sqrt(totalBeliefEarned / 150000))`

Echo trees:
- `whispers`, `doctrine`, `cataclysm`
- max rank `5`
- rank costs: `1, 2, 3, 5, 8`

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
  - faith decay pressure

Core game remains complete without imported signatures.

### Architecture and Remembrance

Implemented:
- architecture rule selectors (belief/civilization/domain)
- remembrance letter tracking and unlock sync
- final choice invocation path

### Audio System

Tone.js audio engine implemented with:
- per-domain layers (fire/death/harvest/storm/memory/void)
- instability-driven detune/dropout/filtering
- era + domain-level driven tempo range
- low-veil drone in era III
- mute + silent fallback + preference persistence

### UI and Era Disclosure

Era I:
- no tabbed shell
- minimal surface
- Whisper/Recruit and Prophets render in a single merged card (no `Doctrine Seeds` section header)
- Whisper/Recruit follower yield hints are shown on action hover/focus (not as static text)
- event log header: `Murmurs`
- bottom status: one quiet atmospheric line

Era II+:
- tabbed shell (`active`, `growth`, `meta`)
- sticky tab dock

Era II:
- `active` order: Whisper/Recruit -> Influence meter -> Doctrine (Acts) -> Doctrine Seeds
- era-II whisper surface keeps controls/cadence only (no additional subtitle text)
- `growth` order: Domains -> Rivals -> Threshold
- rivals render as a single-line summary when inactive and expand to full panel when active
- threshold renders at the bottom of `growth` (not in `active`)
- threshold defaults to collapsed in Era II
- meta tab label is `Meta` (no lite suffix)
- event log header: `Whispers`
- gate label: `Threshold`
- bottom status: one directive line

Era III:
- cataclysm in active flow
- unraveling gate strip always visible
- event log header: `Omens`
- gate label: `Unraveling Gate`
- bottom status line removed

Disclosure policy:
- future-era systems hidden until unlock
- cult controls reveal near affordability threshold (`90%`)
- stats drawer is always visible (all eras, all tabs) and only shows unlocked-system metrics.

### Stats, Telemetry, and Exports

Stats drawer:
- always accessible in every era and tab
- run timers and cadence info
- follower flow lines
- influence source breakdown
- run history
- audio controls
- content scales by era without spoiling future systems

Stats content by era:
- Era I: no doctrine or cataclysm metrics (no cult output line, no shrine/cult influence lines, no rival or passive follower lines).
- Era II: doctrine metrics appear (cults, shrines, rival-related flow where active).
- Era III: cataclysm-era metrics appear (passive follower arrival and other era-III-only lines).

Telemetry:
- local structured events:
  - era transition
  - veil collapse
  - civilization collapse
  - ascension
  - rival suppression
  - miracle use
- run summaries capped to last `20`
- JSON export + console dump helpers

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

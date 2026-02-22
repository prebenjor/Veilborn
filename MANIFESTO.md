# VEILBORN MANIFESTO

This document is the canonical design source for Veilborn.
If implementation details conflict with this manifesto, this manifesto wins unless explicitly revised.

## Core Premise

You are a dying god whose name has been forgotten by mortals.
Belief is the core currency.
You never directly control the world. You act through intermediaries (prophets, cults, phenomena) that can fail, defect, and evolve unpredictably.

## Signature Mechanic: The Veil System

- Spend Influence to nudge outcomes, not to force them.
- Outcomes are probabilistic.
- Your invested Domains shape the probability space.
- Tension comes from partial control and uncertainty.
- The mechanic and narrative must align: a fading god can influence, but not command.

## Core Loop

1. Phase 1 - Whispers (Early Game)
- Start with one mortal listener.
- Guide them toward becoming a Prophet.
- Prophets generate Belief and recruit Followers.
- Domain investment determines which world events become likely.

2. Phase 2 - Doctrine (Mid Game)
- Followers form Cults.
- Cults perform Acts (shrines, rituals, spread doctrine).
- Acts cost time/resources and return Belief based on Domain synergy.
- Rival cults emerge from simulation pressure and must be outmaneuvered through influence and domain play.

3. Phase 3 - Miracles (Late Game)
- Spend Belief for major world events (flood, plague, golden harvest, etc.).
- Miracles can massively swing Belief.
- Excessive Miracle use destabilizes civilizations and can collapse your follower base.

4. Phase 4 - The Unraveling
- The world fractures under divine interference.
- Trigger first Ascension.

## Prestige Arc: Cycle of Names

1. Ascension 1 - Rebirth
- Reset world.
- Keep Echoes (prestige currency).
- Echoes unlock permanent domain upgrades and passive Belief.
- New run contains different cultures and conditions.

2. Ascension 2 - The Pantheon
- Other forgotten gods are discovered.
- Form alliances or betray.
- Alliances share bonuses but split Belief.
- Betrayal grants spike value but poisons future domain potential.

3. Ascension 3 - The Architecture
- Unlock meta-rules editing.
- Change belief formation, civilization growth, and domain meaning.

4. True Endgame - Remembrance
- Reconstruct your name as milestone letters via domain mastery combinations.
- Final choice: restore self and break the seal, or forget again and preserve it.

## UI Progression Rule: The Interface Is The Veil

- Early UI should be opaque, cryptic, low-legibility.
- As power grows, UI becomes clearer.
- Tooltips and labels unlock progressively.
- Mystery is intentional; discovery is progression.
- Returning players should recognize that clarity itself is a reward.

## Memory Rule: The World Remembers

- Mortals and lineages retain traits across generations.
- Social memory persists: betrayals, skepticism, and trust debt affect future conversion and doctrine spread.
- Prior choices should be felt as archaeological layers in later runs.

## Asynchronous God Echoes

- Other players' past runs may appear as anomalies (opt-in, offline-safe if absent).
- Their domain patterns leave fingerprints on your world simulation.
- No direct multiplayer interaction required.

## Audio Is Gameplay

- Belief should have audible structure.
- Domains add instrument layers and tonal behavior.
- Instability must be heard before it is fully understood visually.

## Event Log Voice

- Event feed must be in-universe prose.
- Avoid sterile systems text where possible.
- Logs should read as omens and chronicles that players want to share.

## Consequence Rule: Betrayal Has A Face

- Betrayed allies and sacrificed prophets remain named and resurfaced.
- Their legacy appears later as haunting, not just punishment.
- Optimization should feel emotionally costly.

## Secret Ending Rule

- Final ending should remain ambiguous in presentation.
- Avoid explicit confirmation UI for the terminal choice.
- Preserve community-driven interpretation.

## Target Playtime Architecture

- Run 1: 6-10 hours.
- Runs 2-3: 3-5 hours each.
- Runs 4+: 1-3 hours each.
- Remembrance endgame: roughly 25-40 total hours for core emotional completion.

## Session Cadence Requirement

- Every 20-40 minutes, a meaningful save-worthy milestone should occur.
- Example milestones: prophet recruited, cult threshold reached, miracle fired, domain synergy unlocked.

## Story Throughline

- Each Ascension reveals why the name was lost.
- Core reveal: forgetting was a chosen sacrifice to hold back something worse.
- Repeated Unravelings weaken the seal.
- Final choice reframes all prior progression.

## Technical Baseline

- Browser-playable.
- React front end.
- JSON-driven world engine.
- Local-only save via localStorage.
- Lightweight procedural name generation.
- Tailwind + Framer Motion for constellation/veil visual language.
- Optional Tone.js layer for generative audio system.

## Design North Star

The game should feel like it remembers the player more than the player remembers it.
That inversion is the identity of Veilborn and must remain intact across all features.

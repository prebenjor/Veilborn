# VEILBORN - SYSTEM MANIFESTO (REVISION B)

This document is the canonical design source for Veilborn.
If implementation details conflict with this manifesto, this manifesto wins unless explicitly revised.

Revision B is now active:
- No global Belief softcap.
- Offline progression enabled.
- Late-game balance uses scaling sinks and pressure systems, not invisible output throttling.

## The Philosophy

Every number must do at least one job:
- Create tension.
- Reward mastery.
- Compress time for veterans.

If a formula does none of these, it does not belong in the game.
The player should feel like they are managing, not waiting.

## Resource Architecture

Four core resources, each with a distinct role:

1. Belief
- Primary currency and score.
- Generated passively and spent on structure/progression.
- Should feel scarce but not punitive.
- Must always have meaningful sinks in late game.

2. Influence
- Active agency resource.
- Regenerates over time.
- Spent on Whispers, Recruit actions, suppression, and Miracles.
- Must encourage spend-before-cap behavior.

3. Veil Thickness
- Stability meter framed as a resource.
- Easy to drain, slow to recover.
- Lower Veil increases Belief bonus and collapse risk.
- Era III mastery revolves around intentionally riding Veil in the danger zone.

4. Echoes
- Prestige memory currency across runs.
- Should feel high-value and strategic.
- Upgrade costs follow Fibonacci progression.

## Core Belief Generation (Uncapped)

Active formula:

`B/s = [sum(prophet_output * domain_multiplier * faith_decay) + sum(cult_output * domain_synergy)] * veil_bonus * ghost_bonus`

No post-formula softcap modifier is applied.
Output growth is controlled by scaling costs and systemic pressure, not hidden multipliers.

### Component formulas

`prophet_output = 2 + (total_domain_level * 0.1)`

`domain_multiplier = 1 + (0.15 * total_domain_level)`

`faith_decay = 0.95^(minutes_since_last_event)`
- Floor: `0.0`, or `0.80` with Echo upgrade `faith_floor`.

`cult_output = prophet_count * follower_count * 0.08 * domain_synergy`

`domain_synergy = 1 + (0.25 * matching_domain_pairs)`

`veil_bonus = 1 + ((100 - veil) * 0.008)`

Faith decay is mandatory engagement pressure, especially in Era I.

## Follower and Prophet Economy

Followers needed for next prophet:

`threshold = base_threshold * 1.6^(prophets_owned)`

`base_threshold = 50`, or `20` with Echo `prophet_threshold` rank.

Reference values with base threshold 50:
- Prophet 1: 50
- Prophet 2: 80
- Prophet 3: 128
- Prophet 4: 205
- Prophet 5: 328
- Prophet 6: 524

Prophets are high-meaning units, not disposable commodities.
Loss events must feel consequential.

## Influence Economy

`influence_max = 100 + (20 * prophet_count) + 50 if start_inf upgrade is owned`

`influence_regen_per_second = 1 + (0.5 * prophet_count)`

Costs:
- Whisper: `10 * 1.4^(whispers_today)` (resets every 4 real minutes).
- Recruit: `25` flat.
- Act: `20-150` by tier, with Echo discount factor `0.85`.
- Miracle tiers: `500 / 1600 / 4100 / 10000`.

The 4-minute whisper reset defines the short-cycle cadence and supports periodic check-ins.

## Domain System

Six domains with level and XP progression.

Belief invest cost:

`domain_invest_cost = 50 * 1.8^(current_level)`

XP requirement:

`xp_needed_next = 3 * 1.5^(current_level)`

Domain level effects:
- `+0.1` prophet base output per total level.
- `+0.15` base domain multiplier per total level.
- `+0.25` cult synergy per matching pair.

Meta-progression anchor:
- Echo `domain_carry`: retain 20% of peak domain level into new runs.

## Cult and Act System

Cult formation cost:

`cult_cost = cult_cost_base * 2^(cults_owned)`

`cult_cost_base = 500`, or `350` with Echo upgrade.

Reference values with base 500:
- Cult 1: 500
- Cult 2: 1000
- Cult 3: 2000
- Cult 4: 4000

Act return:

`belief_gained = current_B/s * act_duration * belief_mult * 0.3`

`belief_mult = max(act_floor, base_mult + domain_match * 0.2)`

`act_floor = 1.0`, or `1.5` with Echo `act_floor`.

Base multipliers by act type:
- `2.5 / 4.0 / 7.0 / 1.5`

Acts must reward engagement without invalidating passive systems.

## Rival System

`rival_strength = max(1, current_B/s * 0.08) * weakened_modifier`

`weakened_modifier = 0.80` if Echo `rival_weaken` exists, else `1.0`.

Follower drain:

`rival_follower_drain_per_second = rival_strength * 0.015`

Drain applies only if:

`rival_strength > cult_output * 0.5`

Spawn rules:
- Spawn timer: `300s` base, `+60s` with Echo `rival_delay`.
- Max concurrent rivals: `2`.

Interaction:
- Suppress cost: `200 Influence`.
- Optional neutral conversion upgrade: no suppression cost, +50 followers.

Rivals are pressure valves, not pure combat encounters.

## Veil Mechanics

Base regen:
- `+1 Veil / 120s`
- Shrine tier 1: `+1 / 90s` per shrine
- Echo regen upgrade: base improves to `+1 / 80s`

Miracle Veil costs:
- Tier 1: `-8`, or `-5` with Echo veil discount
- Tier 2: `-15`
- Tier 3: `-25`
- Tier 4: `-40`

Collapse threshold:
- `15`, or `8` with Echo collapse threshold upgrade

Belief bonus from low Veil:

`veil_bonus = 1 + ((100 - veil) * 0.008)`

Reference points:
- Veil 50: x1.40
- Veil 20: x1.64
- Veil 0: x1.80

Target mastery zone:
- Veil `30-55` optimal.
- Below 30 high-risk/high-reward.
- Above 55 safe but underperforming.

Collapse penalty:
- Followers reduced to 40%.
- Lose last 2 gained prophets.
- 30s immunity with Echo `collapse_immunity`.

## Miracle and Civilization Health

Miracle return:

`B_gain = base_gain * civ_stability * (1 + domain_bonus)`

`civ_stability = civHealth / 100`

`domain_bonus = domain_level * 0.1`

Tier constants:
- Tier 1: cost 500, base gain 8000, Veil cost 8, civ damage 4
- Tier 2: cost 1600, base gain 30000, Veil cost 15, civ damage 8
- Tier 3: cost 4100, base gain 90000, Veil cost 25, civ damage 14
- Tier 4: cost 10000, base gain 300000, Veil cost 40, civ damage 24

Civilization health:
- Starts at 100 each run.
- Damage per miracle uses tier weights `1, 2, 3.5, 6` multiplied by 4.
- Natural regen: `+0.5 / 60s`.
- Shrine bonus: `+0.2 per shrine / 60s`.
- Collapse when `civHealth <= 0`.
- Collapse penalty: followers reset to 15% of peak.
- Rebuild timer: `180s`, multiplied by `0.60` with Echo `civ_rebuild`.
- Permanent stat: `civRebuilds` (used for Name Letter condition).

## Prestige: Echo Formula

Base Echo gain on ascension:

`base_echoes = floor(sqrt(totalBeliefEarned / 150000))`

Revision note:
- Divisor is `150000` (not 100000) to keep yields in target range under uncapped output.

Optional multiplier:

`final_echoes = floor(base_echoes * (1 + 0.08 * completed_runs))` if `echo_multiplier` is purchased.

Echo costs (Fibonacci ranks):
- `1, 2, 3, 5, 8, 13, 21`

## Era Gates

Era I -> Era II:
- `totalBeliefEarned >= 10000 * (0.70 with era1_gate Echo else 1.0)`
- `prophets >= 3`
- `any domain >= level 3`

Era II -> Era III:
- `totalBeliefEarned >= 250000 * (0.75 with era2_gate Echo else 1.0)`
- `cults >= 3`
- Survived at least one rival event

Era III -> Unraveling:
- `totalBeliefEarned >= 5000000`
- `veil <= 20`
- `miraclesThisRun >= 2`
- `runTime >= 240 minutes` soft gate
- Soft gate may be bypassed on run 3+ with full Echo progression

Gate design rule:
- All gates are multi-condition.
- No single stat rush should bypass systemic engagement.

## Remembrance: Name Letter Conditions

Permanent, cross-run conditions:

1. One domain at level 10.
2. 50,000 total lifetime Echoes.
3. Survive Veil 0 for 60 consecutive seconds.
4. Betray a Pantheon ally.
5. Three civilizations rebuilt after collapse.
6. All six domains at level 8+.
7. 1,000,000 simultaneous followers.
8. Total Belief earned > 1,000,000,000.

Letter 3 is the Veil skill check.
Letter 4 requires Pantheon and real strategic sacrifice.

## Offline Progression (Active)

Core rules:
- Maximum offline simulation window: 8 hours.
- Offline Belief efficiency: 85% of close-state `B/s`.

`offline_belief_gained = beliefPS_at_close * elapsed_seconds * 0.85`

Influence:
- Does not accumulate offline.
- On return, set Influence to 50% of max.

Veil offline behavior:
- Shrine regen applies.
- Natural Era III erosion applies.
- No miracles or collapse triggers while offline.
- Offline Veil floor is 15.

`net_offline_veil_delta = (shrine_regen - erosion) * elapsed_seconds`

Followers offline:
- Prophet passive generation applies (if unlocked).
- Rival drain applies at 50% rate.
- No new rivals spawn.

Faith decay:
- Applies fully while offline.

Return UX:
- Present narrative summary first, then compact numeric deltas.

Offline design intent:
- Reward regular return without allowing indefinite unattended simulation.
- Preserve a playable return state with urgency, not punishment.

## Late-Game Pressure Replacing Softcap

No hidden global output modifier is used.

Balancing pressure mechanisms:

1. Domain Hunger
- Domains above level 5 consume Belief continuously.
- `upkeep_per_second = 0.5 * (level - 5)^1.4` per domain.

Reference:
- Level 6: 0.5 B/s
- Level 8: 3.0 B/s
- Level 10: 10.2 B/s
- Level 15: 52.7 B/s

2. Cult Fragmentation
- For cult counts above 4, each excess cult has 0.5% chance per minute to fracture.
- Fracture moves 30% of that cult's followers to neutral pool unless stabilized by act activity.

3. Natural Veil Erosion (Era III)
- `erosion_per_second = 0.001 * log10(totalBeliefEarned)`
- Reference:
  - At 1M total Belief: -0.006/s
  - At 10M: -0.007/s
  - At 100M: -0.008/s

## Run Compression Targets

Targeted median run totals:
- Run 1: ~6.5 hours
- Run 2: ~4.0 hours
- Run 3: ~2.5 hours
- Run 5: ~1.2 hours
- Run 8+: ~45 minutes floor

Hard rule:
- Compression should not push mastered runs below ~45 minutes.
- If upgrades exceed this compression, apply floor-preserving constraints.

## Delivery Roadmap and PF Queue

Implementation governance is now formally bound to `docs/roadmap.json`.
That file is the machine-readable execution ledger and includes:

- Milestones `M0` through `M18`.
- Post-final improvements `PF-01` through `PF-20`.

Expanded roadmap commitments:
- `M15` Save Integrity and Recovery must be completed before `M14` balance stress tuning.
- `M16` Instrumentation and Playtesting Telemetry must be completed before or in parallel with `M14`.
- `M17` Accessibility and Mobile Resilience is required for 375px-playable completion and low-power resilience.
- `M18` New Game+ Convergence Mode adds run 8+ structural novelty without breaking the 45-minute floor or final-choice ambiguity.

Expanded PF commitments (additions beyond `PF-01` to `PF-07`):
- `PF-08` through `PF-20` are adopted, including onboarding veil pacing, number legibility, faith-decay indicator, influence nudges, rival readability, collapse recovery UX, echo tree clarity, act result clarity, offline narrative polish, domain synergy feedback, veil mastery zones, pantheon legibility, and remembrance condition tracking.

Sync rule:
- Any change to milestone or PF definitions must update both `docs/roadmap.json` and this manifesto section in the same change.

## UI Disclosure and Legibility Progression

The UI is the Veil. Information is progression and must be revealed intentionally.

Rules:
- Era-locked disclosure: do not show mechanics, panels, or labels for future eras before their era is unlocked.
- Proximity reveal: show same-era locked actions only when the player is within ~10% of the requirement or has explicit prerequisite progress.
- Early HUD minimalism: Era I top-level HUD should stay sparse. Metrics like Veil Thickness and Domain totals appear only after they are mechanically relevant and explained once.
- First-contact explanation: when a new meter appears, attach one concise in-world explanation so players know what changed and why it matters.
- Density budget: prioritize single-screen decision-making. Move long-form details to compact drawers, tabs, or a dedicated stats page.

## Design Rules (Do Not Break)

1. Compression is earned by removing known pain points, not by gifting speed.
2. No single optimal path; multiple viable imperfect builds must exist.
3. The Veil stays dangerous; it may become more forgiving but never ignorable.
4. Engagement cadence: player-facing decision pressure every 30-60 seconds.
5. Numbers must stay legible and meaningful through visible sinks and outcomes.
6. Mechanics must have narrative justification and consequence.
7. Offline progression is generous but bounded: 8h cap at 85% efficiency.
8. Large Belief values must always have meaningful destinations.
9. Future-era systems must stay hidden until unlocked; no spoiler UI.
10. Newly revealed UI must be introduced with context, not raw labels.
11. As progression increases complexity, layout density must still preserve fast decisions and low scroll burden.

## Narrative Throughline

You chose to be forgotten to seal something worse.
Each run restores memory while weakening that seal.
The final choice must remain ambiguous in presentation:
- Remember fully and break the seal.
- Forget again and preserve it.

Veilborn must feel like it remembers the player more than the player remembers it.

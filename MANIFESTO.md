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
- Upgrade costs use steep formula scaling with overflow-rank sinks to preserve multi-run planning.

## Core Belief Generation (Uncapped)

Active formula:

`B/s = [sum(prophet_output * domain_multiplier) + sum(cult_output * domain_synergy) + follower_trickle] * veil_bonus * ghost_bonus * pantheon_modifier * architecture_belief_modifier`

No post-formula softcap modifier is applied.
Output growth is controlled by scaling costs and systemic pressure, not hidden multipliers.

### Component formulas

`prophet_output = 2 + (total_domain_level * 0.1)`

`domain_multiplier = 1 + (0.15 * total_domain_level)`

`cult_output = prophet_count * follower_count * 0.08 * domain_synergy`

`domain_synergy = 1 + (0.25 * active_resonance_pairs) + (0.05 * tempest_memory_resonance_tier)`

`veil_bonus = 1 + ((100 - veil) * 0.008)`

`follower_trickle = follower_count * 0.002`

Passive floor term:
- Active in all eras.
- Prevents static Belief counters when followers exist.
- Intentionally negligible relative to prophet/cult output at later scale.

`pantheon_modifier = 1.0` if no active alliance, else alliance share/bonus modifier from Pantheon state.

`architecture_belief_modifier = architecture_belief_rule_modifier * final_choice_belief_modifier`

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

## Devotion System

Devotion is a momentum resource that builds from player action and holds through inactivity.
It does not decay and does not punish absence.

Era I implementation (current runtime):
- Stacks: `0-3` (cap `3`)
- Qualifying actions: Whisper, Recruit, Anoint Prophet
- Effect on Recruit yield:

`recruit_followers = base_followers * (1 + 0.08 * devotion_stacks)`

- Stacks persist through offline sessions.
- Stacks reset on ascension.

Era II+ implementation (current runtime):
- Path momentum does not decay and persists in save state.
- Era II path candidates: `Fervour`, `Accord`.
- Era III path candidates: `Fervour`, `Accord`, `Reverence`, `Ardour`.
- Path emergence: top momentum `>= 4`.
- Path switching: challenger momentum `>= 7` and lead over active path `>= 3`.
- Run 2+ devotion memory: the dominant prior-run path starts the next run with `+1` momentum in that path.

Momentum sources:
- `Fervour`: start act `+2`, cast miracle `+2` (Era III)
- `Accord`: form cult `+2`, perform follower rite `+1` (Era III)
- `Reverence`: suppress rival `+2` (Era III)
- `Ardour`: whisper/recruit/anoint prophet `+1` (Era III)

Path effect layer (multipliers are stack-scaled and momentum-weighted):
- `momentum_scale = clamp(1 + momentum * 0.01, 1.0, 1.4)`
- `Fervour`: `act_return *= (1 + 0.05 * stacks) * momentum_scale`; in Era III also `miracle_gain *= (1 + 0.06 * stacks) * momentum_scale`
- `Accord`: `cult_output *= (1 + 0.03 * stacks) * momentum_scale`; in Era III also `domain_synergy *= (1 + 0.02 * stacks + min(0.08, momentum * 0.002))`
- `Reverence` (Era III): `veil_erosion *= max(0.58, 1 - 0.08 * stacks - min(0.1, momentum * 0.003))`
- `Ardour` (Era III): `prophet_output *= (1 + 0.03 * stacks) * momentum_scale`

## Influence Economy

`influence_max = 100 + (20 * prophet_count) + 50 if start_inf upgrade is owned`

Era III cap scaling (runtime):

`+5 per cult above 3`

`+2 per point of average domain level above 5`

`+0.5 per shrine above 20`

`influence_regen_per_second = 1 + (0.5 * prophet_count)`

Implementation-expanded regen stack:

`total_influence_regen_per_second = base + shrine + cult + resonant_word`

- `base = 1 + (0.5 * prophet_count)`
- `shrine = 0.2 * shrine_count`
- `cult = min(avg_followers_per_cult * 0.001, 2.0) * cult_count`
- `resonant_word = +2.0` flat if Echo upgrade is owned

Costs:
- Whisper base cost: `10` flat.
- Era II+ whisper targets:
  - Prophets: surcharge `+50`, follower multiplier `1.25`, fail chance `0.08`, cooldown `60s`, passive follower-rate bonus `+3%`
  - Cults: surcharge `+80`, follower multiplier `1.4`, fail chance `0.12`, cooldown `90s`, passive follower-rate bonus `+5%`
- Domain resonance modifier (Light-Void):
  - whisper surcharge reduction: `8%` per resonance tier
  - whisper cooldown reduction: `4s` per resonance tier
- Whisper profile cost:

`whisper_cost = ceil(base_whisper_cost + target_surcharge + one_time_delta)`

- Whisper strain model:

`fail_chance = clamp(base_fail * 0.96^completed_runs - whisper_echo_fail_reduction - cult_fail_reduction, 0, 0.95)`

`strained_followers = floor(base_followers_raw * 0.6)`

- Recruit: `25` flat.
- Act: `20-150` by tier, with Echo discount factor `0.85`.
- Miracle costs (Influence):
  - Whisper of Providence: `500`
  - The Anointing: `1600`
  - The Rending: `4100`
  - Unraveling: `10000`

Miracle Reserve (Era III):
- Overflow Influence at cap is redirected into a reserve pool instead of being lost.
- Miracles consume total power: `influence + reserve`.
- Reserve does not gain offline and does not decay.

`miracle_reserve_cap = 600 + 20*prophets + 30*cults + 4*shrines + 25*max(0,avg_domain_level-4) + 150 if start_inf + 60*max(0,cataclysm_tree_rank-5)`

`miracle_reserve_cap` is clamped to `5000`.

## Domain System

Six domains with level and XP progression.

Domain labels in UI/runtime:
- `Light` (fire id)
- `Death` (death id)
- `Life` (harvest id)
- `Tempest` (storm id)
- `Memory` (memory id)
- `Void` (void id)

Belief invest cost:

`domain_invest_cost = 50 * 1.8^(current_level) * era_mult * tier_mult`

`era_mult = 0.85` in Era II, `1.0` in Era III

`tier_mult` by current level:
- level `<2`: `0.8`
- level `2-4`: `1.0`
- level `5-8`: `1.3`
- level `>=9`: `1.65`

XP requirement:

`xp_needed_next = 3 * 1.5^(current_level)`

Domain level effects:
- `+0.1` prophet base output per total level.
- `+0.15` base domain multiplier per total level.
- `+0.25` cult synergy per active resonance pair.
- Resonance pairs and doctrine hooks:
  - `Life-Death`: prophet passive follower-rate bonus `+4%` per resonance tier.
  - `Light-Void`: whisper surcharge reduction `8%` per tier and cooldown reduction `4s` per tier.
  - `Tempest-Memory`: cult rite and cult passive follower-rate bonus `+5%` per tier.

Resonance tier thresholds use the minimum level of each pair:
- Tier I at min level `2`
- Tier II at min level `5`
- Tier III at min level `9`

Meta-progression anchor:
- Echo `domain_carry`: retained as a planned meta-progression upgrade (not yet active in current runtime).

## Cult and Act System

Acolyte ordination:

`followers_needed_for_next_acolyte = 18 * 1.45^acolytes`

Prophet anointing:

`followers_needed_for_next_prophet = prophet_base * 1.6^prophets`

`prophet_base = 50`, or `20` with Echo upgrade.

`acolytes_needed_for_next_prophet = 2 + floor(prophets / 3)`

Anointing a prophet consumes both follower and acolyte requirements.

Cult formation cost:

`cult_cost = cult_cost_base * 2^(cults_owned)`

`cult_cost_base = 500`, or `350` with Echo upgrade.

Cult leadership requirement:

`prophets_needed_for_next_cult = 1 + floor(cults_owned / 2)`

Founding a cult consumes the required prophets.

Reference values with base 500:
- Cult 1: 500
- Cult 2: 1000
- Cult 3: 2000
- Cult 4: 4000

Act return:

`belief_gained = current_B/s * act_duration * belief_mult * 0.3`

`belief_mult = max(act_floor, base_mult + (0.12 * active_resonance_pairs) + (0.05 * tempest_memory_resonance_tier))`

`act_floor = 1.0`, or `1.5` with Echo `act_floor`.

Base multipliers by act type:
- `2.5 / 4.0 / 7.0`

Acts must reward engagement without invalidating passive systems.

## Era III Follower Flow Additions (Implemented)

Passive follower arrival (Era III only):

`passiveFollowerRate = ((0.35*cults*(1+tempest_memory_bonus)) + 0.25*shrines + (0.05*prophets*(1+life_death_bonus))) * whisper_target_mult * (civHealth/100) * veilZoneMult`

`veilZoneMult`:
- Veil `>55`: `0.8`
- Veil `30-55`: `1.1`
- Veil `<30`: `1.25`

Doctrine follower rites (Era III only):
- Added high-cost rites for active follower bursts in Doctrine panel.
- Costs scale per-rite by usage count and do not reset on short timers.
- Rites consume both Belief and Influence and scale from cult/shrine/prophet/domain/veil/civ state.

Rite cost formulas:

`rite_influence_cost(type, uses) = base_influence[type] * cost_scalar[type]^uses`

`rite_belief_cost(type, uses) = base_belief[type] * cost_scalar[type]^uses`

Constants:
- `base_influence[procession] = 220`
- `base_influence[convergence] = 680`
- `base_belief[procession] = 12000`
- `base_belief[convergence] = 90000`
- `cost_scalar[procession] = 1.28`
- `cost_scalar[convergence] = 1.35`

Rite follower gain:

`rite_followers = base_followers[type] * infrastructure_mult * (civHealth/100) * rite_veil_mult`

`base_followers[procession] = 180`

`base_followers[convergence] = 900`

`infrastructure_mult = 1 + (0.08*cults) + (0.06*shrines) + (0.04*prophets) + (0.07*matching_domain_pairs) + (0.01*total_domain_level)`

`rite_veil_mult`:
- Veil `>55`: `0.95`
- Veil `30-55`: `1.10`
- Veil `<30`: `1.20`

Implementation note:
- Rite use counters currently scale within a run (not a short timer reset) and reset on ascension/new run.

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
- Shrine Veil regen (diminishing returns):
  - `shrine_regen_per_second = (shrine_count * base_shrine_rate) / (1 + shrine_count * 0.015)`
  - `base_shrine_rate = 1/90s` (or `1/80s` with Echo `veilRegen`)
- Echo regen upgrade: base improves to `+1 / 80s`

Natural erosion (Era III):
- `erosion_per_second = 0.001 * log10(totalBeliefEarned) + 0.0002 * shrine_count`

Miracle Veil costs:
- Tier 1: `-10`, or `-5` with Echo veil discount
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
- Whisper of Providence: cost 500, base gain 5500, Veil cost 10, civ damage 5
- The Anointing: cost 1600, base gain 30000, Veil cost 15, civ damage 8
- The Rending: cost 4100, base gain 90000, Veil cost 25, civ damage 14
- Unraveling: cost 10000, base gain 300000, Veil cost 40, civ damage 24

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

`base_echoes = floor(sqrt(totalBeliefEarned / 750000))`

Revision note:
- Divisor is `750000` to keep first-ascension yields from trivializing full Echo tree progression.

Echo tree progression:
- Trees: `whispers`, `doctrine`, `cataclysm`
- Max rank per tree: `12`
- Next-rank cost formula:

`next_rank_cost(rank) = ceil(2 * 2^rank * (1 + 0.25 * rank))` where `rank` is current rank (`0`-indexed)

Reference next-rank costs:
- `2, 5, 12, 28, 64, 144, 320, 704, 1536, 3328, 7168, 15360`

Overflow sink model:
- Core branch unlocks remain concentrated in the first 5 ranks.
- Overflow rank is `max(0, rank - 5)` and drives late-game sinks:
  - Whispers tree overflow: follower-yield bonus and fail-chance reduction
  - Doctrine tree overflow: whisper surcharge reduction and target cooldown reduction
  - Cataclysm tree overflow: cult-target whisper fail reduction and miracle reserve cap growth

## Era Gates

Era I -> Era II:
- `totalBeliefEarned >= 10000 * (0.70 with era1_gate Echo else 1.0)`
- `prophets >= 3`
- `followers >= 500`

Era II -> Era III:
- `totalBeliefEarned >= 275000 * (0.75 with era2_gate Echo else 1.0)`
- `cults >= 3`
- Survived at least one rival event

Era III -> Unraveling:
- `totalBeliefEarned >= 5000000`
- `veil <= 20`
- `miraclesThisRun >= 2`
- `runTime >= 240 minutes` soft gate
- Soft gate may be bypassed on run 3+ with full Echo progression

Revision note (Era I gate):
- Domain condition removed. Domains are not accessible in Era I and cannot be a gate requirement for leaving it.
- Replaced with `followers >= 500`, which tests active Era I engagement using systems the player can see and interact with.

Revision note (Veil regen, PF-25):
- Shrine regen now uses diminishing returns to prevent late-game shrine counts from trivializing Veil pressure.
- Shrine-count erosion term added: more infrastructure now pushes harder against the Veil.
- Early Era III (around 10 shrines) remains broadly stable between miracles.

Revision note (Miracle access and pacing, PF-27):
- Era III Influence cap now scales with cult count, average domain level, and shrine count.
- Overflow Influence at cap is redirected into Miracle Reserve and consumed by miracles as total power (`influence + reserve`).
- Whisper of Providence was retuned to reduce early-miracle overperformance while preserving the same cost tier.
- Echo spending remains reachable immediately after ascension via an Era I legacy quick-spend surface.

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
- `erosion_per_second = 0.001 * log10(totalBeliefEarned) + 0.0002 * shrine_count`
- Reference:
  - At 1M total Belief with 10 shrines: -0.008/s
  - At 10M with 60 shrines: -0.019/s
  - At 100M with 120 shrines: -0.032/s

Implementation note:
- Natural Veil erosion is active.
- Domain Hunger and Cult Fragmentation are currently tracked as balance targets for `M14` and must be resolved during that pass (implement or revise manifesto explicitly).

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

- Milestones `M0` through `M21`.
- Post-final improvements `PF-01` through `PF-28`.

Expanded roadmap commitments:
- `M15` Save Integrity and Recovery must be completed before `M14` balance stress tuning.
- `M16` Instrumentation and Playtesting Telemetry must be completed before or in parallel with `M14`.
- `M17` Accessibility and Mobile Resilience is required for 375px-playable completion and low-power resilience.
- `M18` New Game+ Convergence Mode adds run 8+ structural novelty without breaking the 45-minute floor or final-choice ambiguity.
- `M19` Documentation and Wiki Foundation formalizes `docs/GAME_REFERENCE.md` and future wiki publication workflow.
- `M20` Era UI Restructure and Disclosure Consolidation captures ACTIVE/GROWTH/META structure, progressive era theming, and anti-clutter layout scope previously split across PFs.
- `M21` Devotion Path System expands Era I Devotion into Era II/III path differentiation with run-to-run devotion memory carryover.

Expanded PF commitments (additions beyond `PF-01` to `PF-07`):
- `PF-08` through `PF-28` are adopted, including onboarding veil pacing, number legibility, influence nudges, rival readability, collapse recovery UX, echo tree clarity, act result clarity, offline narrative polish, domain synergy feedback, veil mastery zones, pantheon legibility, remembrance condition tracking, miracle reserve flow, desktop shell refinements, and whisper-evolution/echo-sink expansion.
- `PF-21` is superseded by `PF-25` and is not executed independently.

Sync rule:
- Any change to milestone or PF definitions must update both `docs/roadmap.json` and this manifesto section in the same change.
- Mechanics/formula changes must update `docs/GAME_REFERENCE.md` in the same change set.

## UI Disclosure and Legibility Progression

The UI is the Veil. Information is progression and must be revealed intentionally.

Rules:
- Era-locked disclosure: do not show mechanics, panels, or labels for future eras before their era is unlocked.
- Proximity reveal: show same-era locked actions only when the player is within ~10% of the requirement or has explicit prerequisite progress.
- Early HUD minimalism: Era I top-level HUD should stay sparse. Metrics like Veil Thickness and Domain totals appear only after they are mechanically relevant and explained once.
- First-contact explanation: when a new meter appears, attach one concise in-world explanation so players know what changed and why it matters.
- Density budget: prioritize single-screen decision-making. Move long-form details to compact drawers, tabs, or a dedicated stats page.
- Era II tab split is strict: `ACTIVE` contains Whisper/Recruit, Influence pressure, and Doctrine progression surfaces (Prophets/Cults); `GROWTH` contains Domains, Rivals, and Threshold progress surfaces.
- Era III doctrine expands to include cult rites as an active-control layer.
- In Era II+, `ACTIVE`, `GROWTH`, and `META` use collapsible containers with persisted collapsed/expanded state.
- `GROWTH` containers persist collapsed/expanded state between sessions.
- Era II rivals may collapse to a one-line status when inactive; expand to full controls only when active.
- Era II threshold tracking belongs in `GROWTH`, not `ACTIVE`, and should default to collapsed.
- Era III `GROWTH` mirrors the same container hierarchy for Doctrine, Domains, and Rivals while Threshold remains in the persistent Unraveling strip.
- Vocabulary progression is era-locked: Era I uses `Murmurs`, Era II uses `Whispers`, Era III uses `Omens`.
- Gate naming progression is era-locked: Era I and Era II use `Threshold`, Era III uses `Unraveling Gate`.
- Bottom status line progression is era-locked: Era I one quiet atmospheric line, Era II one directive line, Era III hidden.
- Stats page is exempt from era-lock visibility and must remain accessible in every era and tab.
- Stats content still follows progressive disclosure: only show metrics for systems the player has already unlocked or experienced.
- After the first ascension, Echo spending must be reachable before returning to Era III (legacy quick-spend surface in Era I is acceptable).
- UI architecture should preserve era boundaries in code: keep era composition in dedicated layout files, with `App.tsx` as orchestration only.

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

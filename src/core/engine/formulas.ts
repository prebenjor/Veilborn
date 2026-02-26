import {
  ACT_BASE_COST,
  ACT_BASE_MULTIPLIER,
  ACT_DURATION_SECONDS,
  ACT_FLOOR_BASE,
  ACT_RETURN_FACTOR,
  CIV_HEALTH_MAX,
  CIV_REBUILD_BASE_SECONDS,
  CIV_REGEN_PER_MINUTE,
  CIV_REGEN_PER_SHRINE_PER_MINUTE,
  CULT_COST_BASE,
  CULT_COST_SCALAR,
  CULT_OUTPUT_SCALE,
  DOMAIN_INVEST_BASE_COST,
  DOMAIN_INVEST_COST_SCALAR,
  DOMAIN_INVEST_COST_ERA_TWO_MULTIPLIER,
  DOMAIN_INVEST_COST_ERA_THREE_MULTIPLIER,
  DOMAIN_INVEST_COST_PRE_TIER_MULTIPLIER,
  DOMAIN_INVEST_COST_TIER_ONE_MULTIPLIER,
  DOMAIN_INVEST_COST_TIER_TWO_MULTIPLIER,
  DOMAIN_INVEST_COST_TIER_THREE_MULTIPLIER,
  DOMAIN_RESONANCE_TIER_ONE_LEVEL,
  DOMAIN_RESONANCE_TIER_TWO_LEVEL,
  DOMAIN_RESONANCE_TIER_THREE_LEVEL,
  DOMAIN_RESONANCE_PROPHET_PASSIVE_PER_TIER,
  DOMAIN_RESONANCE_WHISPER_SURCHARGE_REDUCTION_PER_TIER,
  DOMAIN_RESONANCE_WHISPER_COOLDOWN_REDUCTION_MS_PER_TIER,
  DOMAIN_RESONANCE_CULT_PASSIVE_PER_TIER,
  DOMAIN_MULTIPLIER_SCALE,
  DOMAIN_SYNERGY_SCALE,
  DOMAIN_XP_BASE,
  DOMAIN_XP_SCALAR,
  ECHO_CONVERSION_THRESHOLD_REDUCTION_MAX,
  ECHO_CONVERSION_THRESHOLD_REDUCTION_PER_RANK,
  ECHO_DOCTRINE_ACT_COST_REDUCTION_MAX,
  ECHO_DOCTRINE_ACT_COST_REDUCTION_PER_RANK,
  ECHO_FRACTURE_RITE_STRAIN_BONUS_MAX,
  ECHO_FRACTURE_RITE_STRAIN_BONUS_PER_RANK,
  ECHO_ASCENSION_DIVISOR,
  ECHO_TREE_MAX_RANK,
  ECHO_TREE_COST_BASE,
  ECHO_TREE_COST_EXPONENT,
  ECHO_TREE_COST_LINEAR_SCALE,
  ERA_ONE_BELIEF_GATE_BASE,
  ERA_ONE_FOLLOWER_GATE,
  ERA_ONE_PROPHET_GATE,
  ERA_TWO_BELIEF_GATE_BASE,
  ERA_TWO_CULT_GATE,
  MIRACLE_BASE_GAIN,
  MIRACLE_CIV_DAMAGE,
  MIRACLE_DOMAIN_BONUS_SCALE,
  MIRACLE_INFLUENCE_COST,
  MIRACLE_VEIL_COST,
  PANTHEON_ALLIANCE_DOMAIN_BONUS_BASE,
  PANTHEON_ALLIANCE_DOMAIN_BONUS_SCALE,
  PANTHEON_ALLIANCE_SHARE_MULTIPLIER,
  PANTHEON_DOMAIN_POISON_OUTPUT_MULTIPLIER,
  PANTHEON_UNLOCK_COMPLETED_RUNS,
  PASSIVE_FOLLOWER_RATE_PER_CULT,
  PASSIVE_FOLLOWER_RATE_PER_PROPHET_ERA_TWO,
  PASSIVE_FOLLOWER_RATE_PER_PROPHET,
  PASSIVE_FOLLOWER_RATE_PER_ACOLYTE_ERA_TWO,
  PASSIVE_FOLLOWER_RATE_PER_ACOLYTE,
  PASSIVE_FOLLOWER_RATE_PER_SHRINE,
  PASSIVE_FOLLOWER_VEIL_DANGER_MULTIPLIER,
  PASSIVE_FOLLOWER_VEIL_OPTIMAL_MULTIPLIER,
  PASSIVE_FOLLOWER_VEIL_SAFE_MULTIPLIER,
  WHISPER_PASSIVE_FOLLOWER_RATE_EFFECT,
  GHOST_BONUS_BASE,
  INFLUENCE_BASE_CAP,
  INFLUENCE_BASE_REGEN_PER_SECOND,
  INFLUENCE_CAP_CULT_BASELINE,
  INFLUENCE_CAP_DOMAIN_LEVEL_BASELINE,
  INFLUENCE_CAP_PER_PROPHET,
  INFLUENCE_CAP_PER_CULT_OVER_BASE,
  INFLUENCE_CAP_PER_DOMAIN_LEVEL_OVER_BASE,
  INFLUENCE_CAP_PER_SHRINE_OVER_BASE,
  INFLUENCE_CAP_SHRINE_BASELINE,
  INFLUENCE_REGEN_PER_CULT_CAP,
  INFLUENCE_REGEN_PER_CULT_FOLLOWER,
  INFLUENCE_REGEN_PER_PROPHET_PER_SECOND,
  INFLUENCE_REGEN_PER_SHRINE_PER_SECOND,
  MIRACLE_RESERVE_BASE_CAP,
  MIRACLE_RESERVE_DOMAIN_LEVEL_BASELINE,
  MIRACLE_RESERVE_MAX_CAP,
  MIRACLE_RESERVE_PER_CULT,
  MIRACLE_RESERVE_PER_DOMAIN_LEVEL_OVER_BASE,
  MIRACLE_RESERVE_PER_PROPHET,
  MIRACLE_RESERVE_PER_SHRINE,
  MIRACLE_RESERVE_ECHO_BONUS_PER_RANK,
  FOLLOWER_BELIEF_TRICKLE_PER_FOLLOWER,
  PROPHET_DOMAIN_OUTPUT_SCALE,
  PROPHET_OUTPUT_BASE,
  PROPHET_THRESHOLD_BASE,
  PROPHET_THRESHOLD_SCALAR,
  ACOLYTE_THRESHOLD_BASE,
  ACOLYTE_THRESHOLD_SCALAR,
  PROPHET_ACOLYTE_REQUIREMENT_BASE,
  PROPHET_ACOLYTE_REQUIREMENT_STEP,
  CULT_PROPHET_REQUIREMENT_BASE,
  CULT_PROPHET_REQUIREMENT_STEP,
  RECRUIT_BASE_FOLLOWERS,
  RECRUIT_DOMAIN_FOLLOWER_DIVISOR,
  RECRUIT_PROPHET_FOLLOWER_BONUS,
  DEVOTION_STACK_MAX,
  DEVOTION_RECRUIT_BONUS_PER_STACK,
  RIVAL_SPAWN_BASE_MS,
  RIVAL_STRENGTH_SCALE,
  UNRAVELING_BELIEF_GATE,
  UNRAVELING_RITE_VEIL_STRAIN_GATE,
  UNRAVELING_MIRACLES_GATE,
  UNRAVELING_RUNTIME_GATE_SECONDS,
  UNRAVELING_VEIL_GATE,
  VEIL_COLLAPSE_THRESHOLD_BASE,
  VEIL_BONUS_SCALE,
  VEIL_EROSION_LOG_SCALE,
  VEIL_EROSION_PER_SHRINE_SCALE,
  VEIL_REGEN_BASE_SECONDS,
  VEIL_REGEN_PER_SHRINE_SECONDS,
  VEIL_REGEN_SHRINE_DIMINISHING_SCALE,
  WHISPER_BASE_COST,
  WHISPER_BASE_COST_SURCHARGE,
  WHISPER_BASE_FAIL_CHANCE,
  WHISPER_BASE_TARGET_FOLLOWER_MULTIPLIER,
  WHISPER_FOLLOWER_GAIN,
  WHISPER_PROPHETS_BASE_COOLDOWN_MS,
  WHISPER_CULTS_BASE_COOLDOWN_MS,
  WHISPER_FAIL_FOLLOWER_MULTIPLIER,
  WHISPER_ASCENSION_FAIL_MULTIPLIER,
  WHISPER_ECHO_FAIL_REDUCTION_MAX,
  WHISPER_ECHO_FAIL_REDUCTION_PER_RANK,
  WHISPER_WINDOW_MS,
  CADENCE_ACTION_FOLLOWER_BONUS,
  type ActType,
  type ActivityState,
  type DevotionMomentum,
  type DevotionPath,
  type DomainProgress,
  type DomainId,
  type EchoTreeId,
  type WhisperMagnitude,
  type WhisperTarget,
  type GameState,
  type MiracleTier
} from "../state/gameState";

interface NormalizedWhisperCycle {
  whisperWindowStartedAt: number;
  whispersInWindow: number;
}

interface WhisperActionProfile {
  target: WhisperTarget;
  magnitude: WhisperMagnitude;
}

export interface WhisperFollowerPreview {
  successFollowers: number;
  strainedFollowers: number;
}

export interface PantheonAllianceFactors {
  sharePenalty: number;
  domainBonus: number;
  totalModifier: number;
}

export interface GhostInfluenceTotals {
  domainSynergyDelta: number;
  rivalSpawnDelta: number;
}

export interface InfluenceRegenBreakdown {
  totalPerSecond: number;
  basePerSecond: number;
  shrinePerSecond: number;
  cultPerSecond: number;
  echoPerSecond: number;
  shrineCount: number;
  cultCount: number;
  cap: number;
  fillTimeSeconds: number | null;
}

export interface BeliefGenerationBreakdown {
  totalPerSecond: number;
  prophetPerSecond: number;
  cultPerSecond: number;
  followerPerSecond: number;
}

export interface PassiveFollowerRateBreakdown {
  totalPerSecond: number;
  acolytePerSecond: number;
  prophetPerSecond: number;
  cultPerSecond: number;
  shrinePerSecond: number;
}

type DoctrineResonanceFocus = "prophets" | "whispers" | "cults";
type DoctrineResonancePairId = "life_death" | "light_void" | "tempest_memory";

interface DoctrineResonancePairDefinition {
  id: DoctrineResonancePairId;
  focus: DoctrineResonanceFocus;
  left: DomainId;
  right: DomainId;
}

export interface DoctrineResonancePairState {
  id: DoctrineResonancePairId;
  focus: DoctrineResonanceFocus;
  left: DomainId;
  right: DomainId;
  leftLevel: number;
  rightLevel: number;
  minimumLevel: number;
  tier: 0 | 1 | 2 | 3;
  nextTierLevel: number | null;
  prophetPassiveBonus: number;
  whisperSurchargeReduction: number;
  whisperCooldownReductionMs: number;
  cultPassiveBonus: number;
}

export interface DoctrineResonanceState {
  pairs: DoctrineResonancePairState[];
  activePairs: number;
  prophetPassiveBonus: number;
  whisperSurchargeReduction: number;
  whisperCooldownReductionMs: number;
  cultPassiveBonus: number;
}

export interface EraOneGateStatus {
  beliefTarget: number;
  beliefReady: boolean;
  prophetsTarget: number;
  prophetsReady: boolean;
  followersTarget: number;
  followersReady: boolean;
  ready: boolean;
}

export interface EraTwoGateStatus {
  beliefTarget: number;
  beliefReady: boolean;
  cultsTarget: number;
  cultsReady: boolean;
  rivalEventReady: boolean;
  ready: boolean;
}

export interface UnravelingGateStatus {
  beliefTarget: number;
  beliefReady: boolean;
  veilTarget: number;
  veilReady: boolean;
  miraclesTarget: number;
  miraclesReady: boolean;
  riteVeilStrainTarget: number;
  riteVeilStrainReady: boolean;
  runTimeTargetSeconds: number;
  runTimeReady: boolean;
  ready: boolean;
}

export interface DomainInvestmentSimulation {
  investments: number;
  totalCost: number;
  resultingDomain: DomainProgress;
  levelsGained: number;
}

interface DevotionPathModifiers {
  actRewardMultiplier: number;
  miracleBeliefMultiplier: number;
  cultOutputMultiplier: number;
  domainSynergyBonus: number;
  prophetOutputMultiplier: number;
  veilErosionMultiplier: number;
}

const DEVOTION_PATH_LABELS: Record<DevotionPath, string> = {
  none: "Dormant",
  fervour: "Fervour",
  accord: "Accord",
  reverence: "Reverence",
  ardour: "Ardour"
};

function getDefaultDevotionPathModifiers(): DevotionPathModifiers {
  return {
    actRewardMultiplier: 1,
    miracleBeliefMultiplier: 1,
    cultOutputMultiplier: 1,
    domainSynergyBonus: 0,
    prophetOutputMultiplier: 1,
    veilErosionMultiplier: 1
  };
}

function getDevotionMomentumValue(momentum: DevotionMomentum, path: DevotionPath): number {
  if (path === "none") return 0;
  return momentum[path];
}

export function getDevotionPath(state: GameState): DevotionPath {
  if (state.era < 2) return "none";
  if (state.era === 2 && (state.devotionPath === "reverence" || state.devotionPath === "ardour")) {
    return "none";
  }
  return state.devotionPath;
}

export function getDevotionPathLabel(path: DevotionPath): string {
  return DEVOTION_PATH_LABELS[path];
}

function getDevotionPathModifiers(state: GameState): DevotionPathModifiers {
  if (state.era < 2) return getDefaultDevotionPathModifiers();

  const path = getDevotionPath(state);
  const stacks = getDevotionStacks(state);
  if (path === "none" || stacks <= 0) return getDefaultDevotionPathModifiers();

  const modifiers = getDefaultDevotionPathModifiers();
  const momentumScore = getDevotionMomentumValue(state.devotionMomentum, path);
  const momentumScale = Math.max(1, Math.min(1.4, 1 + momentumScore * 0.01));

  if (path === "fervour") {
    modifiers.actRewardMultiplier = (1 + stacks * 0.05) * momentumScale;
    if (state.era >= 3) {
      modifiers.miracleBeliefMultiplier = (1 + stacks * 0.06) * momentumScale;
    }
    return modifiers;
  }

  if (path === "accord") {
    modifiers.cultOutputMultiplier = (1 + stacks * 0.03) * momentumScale;
    if (state.era >= 3) {
      modifiers.domainSynergyBonus = stacks * 0.02 + Math.min(0.08, momentumScore * 0.002);
    }
    return modifiers;
  }

  if (state.era < 3) return modifiers;

  if (path === "reverence") {
    modifiers.veilErosionMultiplier = Math.max(0.58, 1 - stacks * 0.08 - Math.min(0.1, momentumScore * 0.003));
    return modifiers;
  }

  if (path === "ardour") {
    modifiers.prophetOutputMultiplier = (1 + stacks * 0.03) * momentumScale;
    return modifiers;
  }

  return modifiers;
}

function getFinalChoiceBeliefModifier(state: GameState): number {
  if (state.prestige.remembrance.finalChoice === "remember") return 1.08;
  if (state.prestige.remembrance.finalChoice === "forget") return 0.94;
  return 1;
}

function getFinalChoiceDomainModifier(state: GameState): number {
  if (state.prestige.remembrance.finalChoice === "remember") return 1.03;
  if (state.prestige.remembrance.finalChoice === "forget") return 0.98;
  return 1;
}

function getFinalChoiceCivilizationModifier(state: GameState): number {
  if (state.prestige.remembrance.finalChoice === "remember") return 0.88;
  if (state.prestige.remembrance.finalChoice === "forget") return 1.12;
  return 1;
}

export function isArchitectureUnlocked(state: GameState): boolean {
  return state.prestige.completedRuns >= 2;
}

export function getArchitectureBeliefModifier(state: GameState): number {
  if (!isArchitectureUnlocked(state)) return 1;
  if (state.prestige.architecture.beliefRule === "fervor") return 1.12;
  if (state.prestige.architecture.beliefRule === "litany") return 0.93;
  return 1;
}

export function getArchitectureDomainModifier(state: GameState): number {
  if (!isArchitectureUnlocked(state)) return 1;
  if (state.prestige.architecture.domainRule === "focused") return 0.92;
  if (state.prestige.architecture.domainRule === "chaotic") return 1.12;
  return 1;
}

export function getArchitectureCivilizationModifier(state: GameState): number {
  if (!isArchitectureUnlocked(state)) return 1;
  if (state.prestige.architecture.civilizationRule === "expansion") return 1.15;
  if (state.prestige.architecture.civilizationRule === "fracture") return 0.82;
  return 1;
}

export function getEchoTreeRank(state: GameState, treeId: EchoTreeId): number {
  return Math.max(0, Math.min(ECHO_TREE_MAX_RANK, state.prestige.treeRanks[treeId]));
}

function getEchoOverflowRanks(state: GameState, treeId: EchoTreeId): number {
  return Math.max(0, getEchoTreeRank(state, treeId));
}

function getConversionEchoThresholdMultiplier(state: GameState): number {
  const ranks = getEchoOverflowRanks(state, "conversion");
  return Math.max(
    1 - ECHO_CONVERSION_THRESHOLD_REDUCTION_MAX,
    1 - ranks * ECHO_CONVERSION_THRESHOLD_REDUCTION_PER_RANK
  );
}

function getDoctrineEchoActCostMultiplier(state: GameState): number {
  const ranks = getEchoOverflowRanks(state, "doctrine");
  return Math.max(
    1 - ECHO_DOCTRINE_ACT_COST_REDUCTION_MAX,
    1 - ranks * ECHO_DOCTRINE_ACT_COST_REDUCTION_PER_RANK
  );
}

export function getFractureEchoRiteVeilStrainMultiplier(state: GameState): number {
  const ranks = getEchoOverflowRanks(state, "stability");
  const bonus = Math.min(
    ECHO_FRACTURE_RITE_STRAIN_BONUS_MAX,
    ranks * ECHO_FRACTURE_RITE_STRAIN_BONUS_PER_RANK
  );
  return 1 + bonus;
}

export function getWhisperEchoYieldBonus(state: GameState): number {
  void state;
  return 0;
}

export function getWhisperEchoFailReduction(state: GameState): number {
  const overflowRanks = getEchoTreeRank(state, "whispers");
  return Math.min(
    WHISPER_ECHO_FAIL_REDUCTION_MAX,
    overflowRanks * WHISPER_ECHO_FAIL_REDUCTION_PER_RANK
  );
}

export function getWhisperEchoBoostedFailReduction(state: GameState): number {
  return getWhisperEchoFailReduction(state);
}

export function getWhisperEchoSurchargeReduction(state: GameState): number {
  void state;
  return 0;
}

export function getWhisperEchoCooldownReductionMs(state: GameState): number {
  void state;
  return 0;
}

export function getEchoTreeNextRankCost(rank: number): number | null {
  if (rank < 0 || rank >= ECHO_TREE_MAX_RANK) return null;
  const step = rank + 1;
  return Math.ceil(
    ECHO_TREE_COST_BASE *
      Math.pow(ECHO_TREE_COST_EXPONENT, rank) *
      (1 + ECHO_TREE_COST_LINEAR_SCALE * (step - 1))
  );
}

export function getEchoTreeNextCost(state: GameState, treeId: EchoTreeId): number | null {
  return getEchoTreeNextRankCost(getEchoTreeRank(state, treeId));
}

export function isEchoTreeMaxed(state: GameState, treeId: EchoTreeId): boolean {
  return getEchoTreeRank(state, treeId) >= ECHO_TREE_MAX_RANK;
}

export function getAscensionEchoGain(totalBeliefEarned: number): number {
  if (totalBeliefEarned <= 0) return 0;
  return Math.floor(Math.sqrt(totalBeliefEarned / ECHO_ASCENSION_DIVISOR));
}

export function getTotalDomainLevel(state: GameState): number {
  return state.domains.reduce((sum, domain) => sum + getEffectiveDomainLevel(state, domain.id), 0);
}

export function isPantheonUnlocked(state: GameState): boolean {
  return state.pantheon.unlocked || state.prestige.completedRuns >= PANTHEON_UNLOCK_COMPLETED_RUNS;
}

export function hasPantheonBetrayalHook(state: GameState): boolean {
  return state.prestige.pantheon.betrayedAllyEver;
}

export function getDomainPoisonRunsRemaining(state: GameState, domainId: DomainId): number {
  if (!isPantheonUnlocked(state)) return 0;
  return Math.max(0, state.prestige.pantheon.domainPoisonRuns[domainId] ?? 0);
}

export function isDomainPoisoned(state: GameState, domainId: DomainId): boolean {
  return getDomainPoisonRunsRemaining(state, domainId) > 0;
}

export function getEffectiveDomainLevel(state: GameState, domainId: DomainId): number {
  const domain = state.domains.find((item) => item.id === domainId);
  if (!domain) return 0;
  if (!isDomainPoisoned(state, domainId)) return domain.level;
  return domain.level * PANTHEON_DOMAIN_POISON_OUTPUT_MULTIPLIER;
}

function getActivePantheonAllyDomain(state: GameState): DomainId | null {
  if (!isPantheonUnlocked(state)) return null;
  const activeId = state.pantheon.activeAllyId;
  if (!activeId) return null;
  const ally = state.pantheon.allies.find((entry) => entry.id === activeId);
  if (!ally || ally.disposition !== "allied") return null;
  return ally.domain;
}

export function getPantheonAllianceFactors(state: GameState): PantheonAllianceFactors {
  const activeDomain = getActivePantheonAllyDomain(state);
  if (!activeDomain) {
    return {
      sharePenalty: 1,
      domainBonus: 1,
      totalModifier: 1
    };
  }

  const domainLevel = getEffectiveDomainLevel(state, activeDomain);
  const sharePenalty = PANTHEON_ALLIANCE_SHARE_MULTIPLIER;
  const domainBonus = 1 + PANTHEON_ALLIANCE_DOMAIN_BONUS_BASE + domainLevel * PANTHEON_ALLIANCE_DOMAIN_BONUS_SCALE;
  return {
    sharePenalty,
    domainBonus,
    totalModifier: Math.max(0.4, sharePenalty * domainBonus)
  };
}

const DOCTRINE_RESONANCE_PAIRS: DoctrineResonancePairDefinition[] = [
  { id: "life_death", focus: "prophets", left: "harvest", right: "death" },
  { id: "light_void", focus: "whispers", left: "fire", right: "void" },
  { id: "tempest_memory", focus: "cults", left: "storm", right: "memory" }
];

function getDoctrineResonanceTier(minimumLevel: number): 0 | 1 | 2 | 3 {
  if (minimumLevel >= DOMAIN_RESONANCE_TIER_THREE_LEVEL) return 3;
  if (minimumLevel >= DOMAIN_RESONANCE_TIER_TWO_LEVEL) return 2;
  if (minimumLevel >= DOMAIN_RESONANCE_TIER_ONE_LEVEL) return 1;
  return 0;
}

function getNextDoctrineResonanceTierLevel(minimumLevel: number): number | null {
  if (minimumLevel < DOMAIN_RESONANCE_TIER_ONE_LEVEL) return DOMAIN_RESONANCE_TIER_ONE_LEVEL;
  if (minimumLevel < DOMAIN_RESONANCE_TIER_TWO_LEVEL) return DOMAIN_RESONANCE_TIER_TWO_LEVEL;
  if (minimumLevel < DOMAIN_RESONANCE_TIER_THREE_LEVEL) return DOMAIN_RESONANCE_TIER_THREE_LEVEL;
  return null;
}

export function getDoctrineResonanceState(state: GameState): DoctrineResonanceState {
  const pairs = DOCTRINE_RESONANCE_PAIRS.map<DoctrineResonancePairState>((pair) => {
    const leftLevel = getEffectiveDomainLevel(state, pair.left);
    const rightLevel = getEffectiveDomainLevel(state, pair.right);
    const minimumLevel = Math.min(leftLevel, rightLevel);
    const tier = getDoctrineResonanceTier(minimumLevel);
    const nextTierLevel = getNextDoctrineResonanceTierLevel(minimumLevel);

    return {
      id: pair.id,
      focus: pair.focus,
      left: pair.left,
      right: pair.right,
      leftLevel,
      rightLevel,
      minimumLevel,
      tier,
      nextTierLevel,
      prophetPassiveBonus: pair.focus === "prophets" ? tier * DOMAIN_RESONANCE_PROPHET_PASSIVE_PER_TIER : 0,
      whisperSurchargeReduction:
        pair.focus === "whispers" ? tier * DOMAIN_RESONANCE_WHISPER_SURCHARGE_REDUCTION_PER_TIER : 0,
      whisperCooldownReductionMs:
        pair.focus === "whispers" ? tier * DOMAIN_RESONANCE_WHISPER_COOLDOWN_REDUCTION_MS_PER_TIER : 0,
      cultPassiveBonus: pair.focus === "cults" ? tier * DOMAIN_RESONANCE_CULT_PASSIVE_PER_TIER : 0
    };
  });

  return pairs.reduce<DoctrineResonanceState>(
    (accumulator, pair) => ({
      pairs: [...accumulator.pairs, pair],
      activePairs: accumulator.activePairs + (pair.tier > 0 ? 1 : 0),
      prophetPassiveBonus: accumulator.prophetPassiveBonus + pair.prophetPassiveBonus,
      whisperSurchargeReduction: accumulator.whisperSurchargeReduction + pair.whisperSurchargeReduction,
      whisperCooldownReductionMs: accumulator.whisperCooldownReductionMs + pair.whisperCooldownReductionMs,
      cultPassiveBonus: accumulator.cultPassiveBonus + pair.cultPassiveBonus
    }),
    {
      pairs: [],
      activePairs: 0,
      prophetPassiveBonus: 0,
      whisperSurchargeReduction: 0,
      whisperCooldownReductionMs: 0,
      cultPassiveBonus: 0
    }
  );
}

export function getHighestDomainLevel(state: GameState): number {
  return state.domains.reduce((max, domain) => Math.max(max, domain.level), 0);
}

export function getDominantDomainLevel(state: GameState): number {
  return getHighestDomainLevel(state);
}

export function getMatchingDomainPairs(state: GameState): number {
  return getDoctrineResonanceState(state).activePairs;
}

export function getProphetOutput(totalDomainLevel: number, state?: GameState): number {
  const base = PROPHET_OUTPUT_BASE + totalDomainLevel * PROPHET_DOMAIN_OUTPUT_SCALE;
  if (!state) return base;
  const modifiers = getDevotionPathModifiers(state);
  return base * modifiers.prophetOutputMultiplier;
}

export function getDomainMultiplier(totalDomainLevel: number): number {
  return 1 + DOMAIN_MULTIPLIER_SCALE * totalDomainLevel;
}

export function getDomainSynergy(state: GameState): number {
  const resonance = getDoctrineResonanceState(state);
  const devotionModifiers = getDevotionPathModifiers(state);
  const baseSynergy =
    (1 + DOMAIN_SYNERGY_SCALE * state.matchingDomainPairs + resonance.cultPassiveBonus) *
    (1 + devotionModifiers.domainSynergyBonus) *
    getArchitectureDomainModifier(state) *
    getFinalChoiceDomainModifier(state);
  const ghostInfluence = getGhostInfluenceTotals(state);
  return Math.max(0.5, baseSynergy * (1 + ghostInfluence.domainSynergyDelta));
}

export function getVeilBonus(veil: number): number {
  return 1 + (100 - veil) * VEIL_BONUS_SCALE;
}

function getPassiveFollowerVeilZoneMultiplier(veil: number): number {
  if (veil > 55) return PASSIVE_FOLLOWER_VEIL_SAFE_MULTIPLIER;
  if (veil < 30) return PASSIVE_FOLLOWER_VEIL_DANGER_MULTIPLIER;
  return PASSIVE_FOLLOWER_VEIL_OPTIMAL_MULTIPLIER;
}

export function getWhisperFollowerRateMultiplierForTarget(
  state: GameState,
  target: WhisperTarget
): number {
  if (state.era < 2 || target === "crowd") return 1;
  const combinedMultiplier = WHISPER_BASE_TARGET_FOLLOWER_MULTIPLIER[target];
  return Math.max(1, 1 + (combinedMultiplier - 1) * WHISPER_PASSIVE_FOLLOWER_RATE_EFFECT);
}

export function getWhisperFollowerRateMultiplier(state: GameState): number {
  return getWhisperFollowerRateMultiplierForTarget(state, state.activity.lastWhisperTarget);
}

export function getPassiveFollowerRateBreakdown(
  state: GameState,
  nowMs: number
): PassiveFollowerRateBreakdown {
  void nowMs;
  if (state.era < 2) {
    return {
      totalPerSecond: 0,
      acolytePerSecond: 0,
      prophetPerSecond: 0,
      cultPerSecond: 0,
      shrinePerSecond: 0
    };
  }

  const resonance = getDoctrineResonanceState(state);
  const whisperFollowerRateMultiplier = getWhisperFollowerRateMultiplier(state);
  const acolyteBaseRatePerSecond =
    (state.era >= 3 ? PASSIVE_FOLLOWER_RATE_PER_ACOLYTE : PASSIVE_FOLLOWER_RATE_PER_ACOLYTE_ERA_TWO) *
    state.acolytes;
  const prophetBaseRatePerSecond =
    (state.era >= 3
      ? PASSIVE_FOLLOWER_RATE_PER_PROPHET
      : PASSIVE_FOLLOWER_RATE_PER_PROPHET_ERA_TWO) *
    state.prophets *
    whisperFollowerRateMultiplier *
    (1 + resonance.prophetPassiveBonus);

  if (state.era < 3) {
    const acolytePerSecond = Math.max(0, acolyteBaseRatePerSecond);
    const prophetPerSecond = Math.max(0, prophetBaseRatePerSecond);
    return {
      totalPerSecond: acolytePerSecond + prophetPerSecond,
      acolytePerSecond,
      prophetPerSecond,
      cultPerSecond: 0,
      shrinePerSecond: 0
    };
  }

  if (state.cataclysm.civilizationHealth <= 0) {
    return {
      totalPerSecond: 0,
      acolytePerSecond: 0,
      prophetPerSecond: 0,
      cultPerSecond: 0,
      shrinePerSecond: 0
    };
  }

  const cultBaseRatePerSecond =
    PASSIVE_FOLLOWER_RATE_PER_CULT *
    state.cults *
    whisperFollowerRateMultiplier *
    (1 + resonance.cultPassiveBonus);
  const shrineBaseRatePerSecond = PASSIVE_FOLLOWER_RATE_PER_SHRINE * state.doctrine.shrinesBuilt;
  const civHealthMultiplier = Math.max(0, state.cataclysm.civilizationHealth / 100);
  const veilZoneMultiplier = getPassiveFollowerVeilZoneMultiplier(state.resources.veil);
  const globalMultiplier = civHealthMultiplier * veilZoneMultiplier;
  const acolytePerSecond = Math.max(0, acolyteBaseRatePerSecond * globalMultiplier);
  const prophetPerSecond = Math.max(0, prophetBaseRatePerSecond * globalMultiplier);
  const cultPerSecond = Math.max(0, cultBaseRatePerSecond * globalMultiplier);
  const shrinePerSecond = Math.max(0, shrineBaseRatePerSecond * globalMultiplier);

  return {
    totalPerSecond: acolytePerSecond + prophetPerSecond + cultPerSecond + shrinePerSecond,
    acolytePerSecond,
    prophetPerSecond,
    cultPerSecond,
    shrinePerSecond
  };
}

export function getPassiveFollowerRate(state: GameState, nowMs: number): number {
  return getPassiveFollowerRateBreakdown(state, nowMs).totalPerSecond;
}

export function getVeilRegenPerSecond(state: GameState): number {
  const baseSeconds = VEIL_REGEN_BASE_SECONDS;
  const baseRegen = 1 / baseSeconds;
  const shrineCount = state.doctrine.shrinesBuilt;
  const shrineBaseSeconds = VEIL_REGEN_PER_SHRINE_SECONDS;
  const shrineBaseRate = 1 / shrineBaseSeconds;
  const shrineRegen =
    shrineCount > 0
      ? (shrineCount * shrineBaseRate) / (1 + shrineCount * VEIL_REGEN_SHRINE_DIMINISHING_SCALE)
      : 0;
  return baseRegen + shrineRegen;
}

export function getVeilErosionPerSecond(state: GameState): number {
  if (state.era < 3) return 0;
  const belief = Math.max(1, state.stats.totalBeliefEarned);
  const shrineTerm = state.doctrine.shrinesBuilt * VEIL_EROSION_PER_SHRINE_SCALE;
  let base = VEIL_EROSION_LOG_SCALE * Math.log10(belief) + shrineTerm;
  if (state.prestige.remembrance.finalChoice === "remember") base *= 1.15;
  if (state.prestige.remembrance.finalChoice === "forget") base *= 0.9;
  return base * getDevotionPathModifiers(state).veilErosionMultiplier;
}

export function getVeilCollapseThreshold(state: GameState): number {
  void state;
  return VEIL_COLLAPSE_THRESHOLD_BASE;
}

export function getCultOutput(state: GameState): number {
  if (state.cults <= 0 || state.prophets <= 0 || state.resources.followers <= 0) return 0;
  const resonance = getDoctrineResonanceState(state);
  const baseOutput =
    state.prophets *
    state.resources.followers *
    CULT_OUTPUT_SCALE *
    getDomainSynergy(state) *
    (1 + resonance.cultPassiveBonus);
  return baseOutput * getDevotionPathModifiers(state).cultOutputMultiplier;
}

function getFollowerBeliefTrickle(state: GameState): number {
  return Math.max(0, state.resources.followers) * FOLLOWER_BELIEF_TRICKLE_PER_FOLLOWER;
}

export function getBeliefGenerationBreakdown(state: GameState, nowMs: number): BeliefGenerationBreakdown {
  void nowMs;
  const totalDomainLevel = getTotalDomainLevel(state);
  const prophetOutput = getProphetOutput(totalDomainLevel, state);
  const domainMultiplier = getDomainMultiplier(totalDomainLevel);
  const domainSynergy = getDomainSynergy(state);

  const prophetStack = state.prophets * prophetOutput * domainMultiplier;
  const cultStack = getCultOutput(state) * domainSynergy;
  const followerTrickle = getFollowerBeliefTrickle(state);

  const pantheonModifier = getPantheonAllianceFactors(state).totalModifier;
  const architectureBeliefModifier =
    getArchitectureBeliefModifier(state) * getFinalChoiceBeliefModifier(state);
  const globalModifier =
    getVeilBonus(state.resources.veil) * GHOST_BONUS_BASE * pantheonModifier * architectureBeliefModifier;

  const prophetPerSecond = prophetStack * globalModifier;
  const cultPerSecond = cultStack * globalModifier;
  const followerPerSecond = followerTrickle * globalModifier;
  const totalPerSecond = Math.max(0, prophetPerSecond + cultPerSecond + followerPerSecond);

  return {
    totalPerSecond,
    prophetPerSecond,
    cultPerSecond,
    followerPerSecond
  };
}

export function getBeliefPerSecond(state: GameState, nowMs: number): number {
  return getBeliefGenerationBreakdown(state, nowMs).totalPerSecond;
}

function getAverageDomainLevel(state: GameState): number {
  if (state.domains.length <= 0) return 0;
  return getTotalDomainLevel(state) / state.domains.length;
}

export function getInfluenceCap(state: GameState): number {
  const baseCap = INFLUENCE_BASE_CAP + state.prophets * INFLUENCE_CAP_PER_PROPHET;
  if (state.era < 3) return baseCap;

  const cultBonus =
    Math.max(0, state.cults - INFLUENCE_CAP_CULT_BASELINE) * INFLUENCE_CAP_PER_CULT_OVER_BASE;
  const averageDomainLevel = getAverageDomainLevel(state);
  const domainBonus =
    Math.max(0, averageDomainLevel - INFLUENCE_CAP_DOMAIN_LEVEL_BASELINE) *
    INFLUENCE_CAP_PER_DOMAIN_LEVEL_OVER_BASE;
  const shrineBonus =
    Math.max(0, state.doctrine.shrinesBuilt - INFLUENCE_CAP_SHRINE_BASELINE) *
    INFLUENCE_CAP_PER_SHRINE_OVER_BASE;

  return Math.floor(baseCap + cultBonus + domainBonus + shrineBonus);
}

export function getMiracleReserveCap(state: GameState): number {
  if (state.era < 3) return 0;

  const averageDomainLevel = getAverageDomainLevel(state);
  const echoOverflowRanks = getEchoTreeRank(state, "cataclysm");
  const echoReserveBonus = echoOverflowRanks * MIRACLE_RESERVE_ECHO_BONUS_PER_RANK;
  const total =
    MIRACLE_RESERVE_BASE_CAP +
    state.prophets * MIRACLE_RESERVE_PER_PROPHET +
    state.cults * MIRACLE_RESERVE_PER_CULT +
    state.doctrine.shrinesBuilt * MIRACLE_RESERVE_PER_SHRINE +
    Math.max(0, averageDomainLevel - MIRACLE_RESERVE_DOMAIN_LEVEL_BASELINE) *
      MIRACLE_RESERVE_PER_DOMAIN_LEVEL_OVER_BASE +
    echoReserveBonus;

  return Math.max(0, Math.min(MIRACLE_RESERVE_MAX_CAP, Math.floor(total)));
}

function getInfluenceBaseRegenPerSecond(state: GameState): number {
  return INFLUENCE_BASE_REGEN_PER_SECOND + state.prophets * INFLUENCE_REGEN_PER_PROPHET_PER_SECOND;
}

function getInfluenceShrineRegenPerSecond(state: GameState): number {
  return state.doctrine.shrinesBuilt * INFLUENCE_REGEN_PER_SHRINE_PER_SECOND;
}

function getInfluenceCultRegenPerSecond(state: GameState): { totalPerSecond: number; cultCount: number } {
  const cultCount = Math.max(0, Math.floor(state.cults));
  if (cultCount <= 0) {
    return { totalPerSecond: 0, cultCount: 0 };
  }

  const averageCultFollowers = state.resources.followers / cultCount;
  const perCultRegen = Math.min(
    averageCultFollowers * INFLUENCE_REGEN_PER_CULT_FOLLOWER,
    INFLUENCE_REGEN_PER_CULT_CAP
  );

  return {
    totalPerSecond: perCultRegen * cultCount,
    cultCount
  };
}

function getInfluenceEchoRegenPerSecond(state: GameState): number {
  void state;
  return 0;
}

export function getInfluenceRegenBreakdown(state: GameState): InfluenceRegenBreakdown {
  const basePerSecond = getInfluenceBaseRegenPerSecond(state);
  const shrinePerSecond = getInfluenceShrineRegenPerSecond(state);
  const cultRegen = getInfluenceCultRegenPerSecond(state);
  const echoPerSecond = getInfluenceEchoRegenPerSecond(state);
  const totalPerSecond = basePerSecond + shrinePerSecond + cultRegen.totalPerSecond + echoPerSecond;
  const cap = getInfluenceCap(state);
  const fillTimeSeconds = totalPerSecond > 0 ? Math.ceil(cap / totalPerSecond) : null;

  return {
    totalPerSecond,
    basePerSecond,
    shrinePerSecond,
    cultPerSecond: cultRegen.totalPerSecond,
    echoPerSecond,
    shrineCount: Math.max(0, Math.floor(state.doctrine.shrinesBuilt)),
    cultCount: cultRegen.cultCount,
    cap,
    fillTimeSeconds
  };
}

export function getInfluenceRegenPerSecond(state: GameState): number {
  return getInfluenceRegenBreakdown(state).totalPerSecond;
}

export function normalizeWhisperCycle(activity: ActivityState, nowMs: number): NormalizedWhisperCycle {
  const elapsed = nowMs - activity.whisperWindowStartedAt;
  if (elapsed < WHISPER_WINDOW_MS) {
    return {
      whisperWindowStartedAt: activity.whisperWindowStartedAt,
      whispersInWindow: activity.whispersInWindow
    };
  }

  const windowsElapsed = Math.floor(elapsed / WHISPER_WINDOW_MS);
  return {
    whisperWindowStartedAt: activity.whisperWindowStartedAt + windowsElapsed * WHISPER_WINDOW_MS,
    whispersInWindow: 0
  };
}

function getWhisperCostFromCount(whispersInWindow: number): number {
  void whispersInWindow;
  return WHISPER_BASE_COST;
}

export function getWhisperCost(state: GameState, nowMs: number): number {
  const normalized = normalizeWhisperCycle(state.activity, nowMs);
  return getWhisperCostFromCount(normalized.whispersInWindow);
}

function normalizeWhisperProfile(
  state: GameState,
  profile?: Partial<WhisperActionProfile>
): WhisperActionProfile {
  if (state.era <= 1) {
    return {
      target: "crowd",
      magnitude: "base"
    };
  }

  const target =
    profile?.target && (profile.target === "prophets" || profile.target === "cults")
      ? profile.target
      : "prophets";
  const magnitude = "base";
  return {
    target,
    magnitude
  };
}

export function getWhisperTargetCooldownEndsAt(state: GameState, target: WhisperTarget): number {
  return Math.max(0, Math.floor(state.activity.whisperTargetCooldowns[target] ?? 0));
}

export function getWhisperTargetCooldownMs(
  state: GameState,
  target: WhisperTarget,
  magnitude: WhisperMagnitude
): number {
  void magnitude;
  if (state.era < 2 || target === "crowd") return 0;
  const baseCooldownMs =
    target === "cults" ? WHISPER_CULTS_BASE_COOLDOWN_MS : WHISPER_PROPHETS_BASE_COOLDOWN_MS;
  const resonanceReductionMs = getDoctrineResonanceState(state).whisperCooldownReductionMs;
  return Math.max(0, baseCooldownMs - getWhisperEchoCooldownReductionMs(state) - resonanceReductionMs);
}

export function isWhisperTargetOnCooldown(
  state: GameState,
  nowMs: number,
  target: WhisperTarget
): boolean {
  return nowMs < getWhisperTargetCooldownEndsAt(state, target);
}

function getWhisperTargetCostSurcharge(state: GameState, target: WhisperTarget): number {
  if (state.era < 2) return 0;
  const baseSurcharge = WHISPER_BASE_COST_SURCHARGE[target];
  const surchargeMultiplier = 1 - getWhisperEchoSurchargeReduction(state);
  const resonanceReduction = getDoctrineResonanceState(state).whisperSurchargeReduction;
  return Math.max(0, Math.ceil(baseSurcharge * surchargeMultiplier * (1 - resonanceReduction)));
}

function getWhisperTargetFollowerMultiplier(
  state: GameState,
  target: WhisperTarget,
  magnitude: WhisperMagnitude
): number {
  void magnitude;
  const baseTargetMultiplier = state.era >= 2 ? WHISPER_BASE_TARGET_FOLLOWER_MULTIPLIER[target] : 1;
  const echoYieldMultiplier = 1 + getWhisperEchoYieldBonus(state);
  return baseTargetMultiplier * echoYieldMultiplier;
}

function getWhisperFollowerGainRaw(
  state: GameState,
  profile: WhisperActionProfile,
  cadenceFollowerBonus: number,
  strainedOutcome: boolean
): number {
  const baseFollowers = WHISPER_FOLLOWER_GAIN + cadenceFollowerBonus;
  const targetMultiplier = getWhisperTargetFollowerMultiplier(
    state,
    profile.target,
    profile.magnitude
  );
  const strainMultiplier = strainedOutcome ? WHISPER_FAIL_FOLLOWER_MULTIPLIER : 1;
  return Math.max(1, baseFollowers * targetMultiplier * strainMultiplier);
}

export function getWhisperFailChance(
  state: GameState,
  profile?: Partial<WhisperActionProfile>
): number {
  const normalized = normalizeWhisperProfile(state, profile);
  if (state.era < 2) return 0;

  const baseChance = WHISPER_BASE_FAIL_CHANCE[normalized.target];
  const ascensionMultiplier = Math.pow(
    WHISPER_ASCENSION_FAIL_MULTIPLIER,
    Math.max(0, state.prestige.completedRuns)
  );
  const baseReduction = getWhisperEchoFailReduction(state);
  const cultReduction = normalized.target === "cults" ? getWhisperEchoBoostedFailReduction(state) : 0;
  return Math.max(0, Math.min(0.95, baseChance * ascensionMultiplier - baseReduction - cultReduction));
}

export function getWhisperCostForProfile(
  state: GameState,
  nowMs: number,
  profile?: Partial<WhisperActionProfile>,
  oneTimeCostDelta = 0
): number {
  void nowMs;
  const normalized = normalizeWhisperProfile(state, profile);
  const baseCycleCost = WHISPER_BASE_COST;
  const targetSurcharge = getWhisperTargetCostSurcharge(state, normalized.target);
  return Math.max(1, Math.ceil(baseCycleCost + targetSurcharge + oneTimeCostDelta));
}

export function getWhisperFollowerPreview(
  state: GameState,
  profile?: Partial<WhisperActionProfile>
): WhisperFollowerPreview {
  const normalized = normalizeWhisperProfile(state, profile);
  const cadenceFollowerBonus = state.activity.cadencePromptActive ? CADENCE_ACTION_FOLLOWER_BONUS : 0;
  const successFollowers = Math.max(
    1,
    Math.floor(getWhisperFollowerGainRaw(state, normalized, cadenceFollowerBonus, false))
  );
  const strainedFollowers = Math.max(
    1,
    Math.floor(getWhisperFollowerGainRaw(state, normalized, cadenceFollowerBonus, true))
  );

  return {
    successFollowers,
    strainedFollowers
  };
}

export function getFollowersForNextProphet(state: GameState): number {
  return Math.ceil(
    PROPHET_THRESHOLD_BASE *
      Math.pow(PROPHET_THRESHOLD_SCALAR, state.prophets) *
      getConversionEchoThresholdMultiplier(state)
  );
}

export function getFollowersForNextAcolyte(state: GameState): number {
  return Math.ceil(
    ACOLYTE_THRESHOLD_BASE *
      Math.pow(ACOLYTE_THRESHOLD_SCALAR, state.acolytes) *
      getConversionEchoThresholdMultiplier(state)
  );
}

export function getAcolytesForNextProphet(state: GameState): number {
  return Math.max(
    1,
    Math.ceil(
      (PROPHET_ACOLYTE_REQUIREMENT_BASE + Math.floor(state.prophets / PROPHET_ACOLYTE_REQUIREMENT_STEP)) *
        getConversionEchoThresholdMultiplier(state)
    )
  );
}

export function getProphetsForNextCult(state: GameState): number {
  return Math.max(
    1,
    Math.ceil(
      (CULT_PROPHET_REQUIREMENT_BASE + Math.floor(state.cults / CULT_PROPHET_REQUIREMENT_STEP)) *
        getConversionEchoThresholdMultiplier(state)
    )
  );
}

export function getCultFormationCost(state: GameState): number {
  return Math.ceil(
    CULT_COST_BASE * Math.pow(CULT_COST_SCALAR, state.cults) * getConversionEchoThresholdMultiplier(state)
  );
}

export function getRecruitFollowerGainBase(state: GameState): number {
  return (
    RECRUIT_BASE_FOLLOWERS +
    state.prophets * RECRUIT_PROPHET_FOLLOWER_BONUS +
    Math.floor(getTotalDomainLevel(state) / RECRUIT_DOMAIN_FOLLOWER_DIVISOR)
  );
}

export function getDevotionStacks(state: GameState): number {
  return Math.max(0, Math.min(DEVOTION_STACK_MAX, Math.floor(state.devotionStacks)));
}

export function getDevotionRecruitMultiplier(state: GameState): number {
  return 1 + getDevotionStacks(state) * DEVOTION_RECRUIT_BONUS_PER_STACK;
}

function getDomainInvestEraMultiplier(era: GameState["era"]): number {
  return era >= 3 ? DOMAIN_INVEST_COST_ERA_THREE_MULTIPLIER : DOMAIN_INVEST_COST_ERA_TWO_MULTIPLIER;
}

function getDomainInvestTierMultiplier(level: number): number {
  if (level < DOMAIN_RESONANCE_TIER_ONE_LEVEL) return DOMAIN_INVEST_COST_PRE_TIER_MULTIPLIER;
  if (level < DOMAIN_RESONANCE_TIER_TWO_LEVEL) return DOMAIN_INVEST_COST_TIER_ONE_MULTIPLIER;
  if (level < DOMAIN_RESONANCE_TIER_THREE_LEVEL) return DOMAIN_INVEST_COST_TIER_TWO_MULTIPLIER;
  return DOMAIN_INVEST_COST_TIER_THREE_MULTIPLIER;
}

export function getDomainInvestCost(domain: DomainProgress, era: GameState["era"] = 3): number {
  const base = DOMAIN_INVEST_BASE_COST * Math.pow(DOMAIN_INVEST_COST_SCALAR, domain.level);
  const eraMultiplier = getDomainInvestEraMultiplier(era);
  const tierMultiplier = getDomainInvestTierMultiplier(domain.level);
  return Math.ceil(base * eraMultiplier * tierMultiplier);
}

export function getDomainXpNeeded(domain: DomainProgress): number {
  return Math.ceil(DOMAIN_XP_BASE * Math.pow(DOMAIN_XP_SCALAR, domain.level));
}

export function simulateDomainInvestments(
  domain: DomainProgress,
  beliefBudget: number,
  maxInvestments = Number.POSITIVE_INFINITY,
  era: GameState["era"] = 3
): DomainInvestmentSimulation {
  if (beliefBudget <= 0 || maxInvestments <= 0) {
    return {
      investments: 0,
      totalCost: 0,
      resultingDomain: { ...domain },
      levelsGained: 0
    };
  }

  let remainingBelief = beliefBudget;
  let investments = 0;
  let totalCost = 0;
  let level = domain.level;
  let xp = domain.xp;

  while (investments < maxInvestments) {
    const currentDomain: DomainProgress = {
      id: domain.id,
      level,
      xp
    };
    const cost = getDomainInvestCost(currentDomain, era);
    if (cost > remainingBelief) break;

    remainingBelief -= cost;
    totalCost += cost;
    investments += 1;

    const xpNeeded = getDomainXpNeeded(currentDomain);
    let nextXp = xp + 1;
    let nextLevel = level;
    if (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
    }

    level = nextLevel;
    xp = nextXp;
  }

  return {
    investments,
    totalCost,
    resultingDomain: {
      id: domain.id,
      level,
      xp
    },
    levelsGained: level - domain.level
  };
}

export function getActCost(state: GameState, type: ActType): number {
  return Math.ceil(ACT_BASE_COST[type] * getDoctrineEchoActCostMultiplier(state));
}

export function getActDurationSeconds(type: ActType): number {
  return ACT_DURATION_SECONDS[type];
}

export function getActBaseMultiplier(type: ActType): number {
  return ACT_BASE_MULTIPLIER[type];
}

export function getActResonantBonus(state: GameState): number {
  const resonance = getDoctrineResonanceState(state);
  return state.matchingDomainPairs * 0.12 + resonance.cultPassiveBonus;
}

export function getActBeliefMultiplier(state: GameState, baseMultiplier: number): number {
  return Math.max(ACT_FLOOR_BASE, baseMultiplier + getActResonantBonus(state));
}

export function getActRewardBelief(
  state: GameState,
  beliefPerSecond: number,
  durationSeconds: number,
  baseMultiplier: number
): number {
  const beliefMultiplier = getActBeliefMultiplier(state, baseMultiplier);
  return (
    beliefPerSecond *
    durationSeconds *
    beliefMultiplier *
    ACT_RETURN_FACTOR *
    getDevotionPathModifiers(state).actRewardMultiplier
  );
}

export function getCivilizationStability(state: GameState): number {
  return Math.max(0, Math.min(1, state.cataclysm.civilizationHealth / CIV_HEALTH_MAX));
}

export function getCivilizationRegenPerSecond(state: GameState): number {
  const base = CIV_REGEN_PER_MINUTE / 60;
  const shrine = (CIV_REGEN_PER_SHRINE_PER_MINUTE * state.doctrine.shrinesBuilt) / 60;
  return (
    (base + shrine) *
    getArchitectureCivilizationModifier(state) *
    getFinalChoiceCivilizationModifier(state)
  );
}

export function getCivilizationRebuildSeconds(state: GameState): number {
  void state;
  return Math.ceil(CIV_REBUILD_BASE_SECONDS);
}

export function getMiracleInfluenceCost(tier: MiracleTier): number {
  return MIRACLE_INFLUENCE_COST[tier];
}

export function getMiracleBaseGain(tier: MiracleTier): number {
  return MIRACLE_BASE_GAIN[tier];
}

export function getMiracleVeilCost(state: GameState, tier: MiracleTier): number {
  void state;
  return MIRACLE_VEIL_COST[tier];
}

export function getMiracleCivDamage(tier: MiracleTier): number {
  return MIRACLE_CIV_DAMAGE[tier];
}

export function getMiracleDomainBonus(state: GameState): number {
  return getDominantDomainLevel(state) * MIRACLE_DOMAIN_BONUS_SCALE;
}

export function getMiracleBeliefGain(state: GameState, tier: MiracleTier): number {
  const base = getMiracleBaseGain(tier);
  const civStability = getCivilizationStability(state);
  const domainBonus = getMiracleDomainBonus(state);
  return base * civStability * (1 + domainBonus) * getDevotionPathModifiers(state).miracleBeliefMultiplier;
}

export function getRivalSpawnIntervalMs(state: GameState): number {
  const baseInterval = RIVAL_SPAWN_BASE_MS;
  const ghostInfluence = getGhostInfluenceTotals(state);
  return Math.ceil(Math.max(45 * 1000, baseInterval * (1 + ghostInfluence.rivalSpawnDelta)));
}

export function getRivalStrength(state: GameState, beliefPerSecond: number): number {
  void state;
  return Math.max(1, beliefPerSecond * RIVAL_STRENGTH_SCALE);
}

export function getTotalRivalStrength(state: GameState): number {
  return state.doctrine.rivals.reduce((sum, rival) => sum + rival.strength, 0);
}

export function getGhostInfluenceTotals(state: GameState): GhostInfluenceTotals {
  if (state.ghost.activeInfluences.length <= 0) {
    return {
      domainSynergyDelta: 0,
      rivalSpawnDelta: 0
    };
  }

  const totals = state.ghost.activeInfluences.reduce(
    (accumulator, influence) => {
      accumulator.domainSynergyDelta += influence.domainSynergyDelta;
      accumulator.rivalSpawnDelta += influence.rivalSpawnDelta;
      return accumulator;
    },
    {
      domainSynergyDelta: 0,
      rivalSpawnDelta: 0
    }
  );

  return {
    domainSynergyDelta: Math.max(-0.25, Math.min(0.25, totals.domainSynergyDelta)),
    rivalSpawnDelta: Math.max(-0.3, Math.min(0.3, totals.rivalSpawnDelta))
  };
}

export function getEraOneBeliefGateTarget(state: GameState): number {
  void state;
  return Math.ceil(ERA_ONE_BELIEF_GATE_BASE);
}

export function getEraOneGateStatus(state: GameState): EraOneGateStatus {
  const beliefTarget = getEraOneBeliefGateTarget(state);
  const prophetsTarget = ERA_ONE_PROPHET_GATE;
  const followersTarget = ERA_ONE_FOLLOWER_GATE;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const prophetsReady = state.prophets >= prophetsTarget;
  const followersReady = state.resources.followers >= followersTarget;

  return {
    beliefTarget,
    beliefReady,
    prophetsTarget,
    prophetsReady,
    followersTarget,
    followersReady,
    ready: beliefReady && prophetsReady && followersReady
  };
}

export function getEraTwoBeliefGateTarget(state: GameState): number {
  void state;
  return Math.ceil(ERA_TWO_BELIEF_GATE_BASE);
}

export function getEraTwoGateStatus(state: GameState): EraTwoGateStatus {
  const beliefTarget = getEraTwoBeliefGateTarget(state);
  const cultsTarget = ERA_TWO_CULT_GATE;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const cultsReady = state.cults >= cultsTarget;
  const rivalEventReady = state.doctrine.survivedRivalEvent;

  return {
    beliefTarget,
    beliefReady,
    cultsTarget,
    cultsReady,
    rivalEventReady,
    ready: beliefReady && cultsReady && rivalEventReady
  };
}

export function getUnravelingGateStatus(state: GameState): UnravelingGateStatus {
  const beliefTarget = UNRAVELING_BELIEF_GATE;
  const veilTarget = UNRAVELING_VEIL_GATE;
  const miraclesTarget = UNRAVELING_MIRACLES_GATE;
  const riteVeilStrainTarget = UNRAVELING_RITE_VEIL_STRAIN_GATE;
  const runTimeTargetSeconds = UNRAVELING_RUNTIME_GATE_SECONDS;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const veilReady = state.resources.veil <= veilTarget;
  const miraclesReady = state.cataclysm.miraclesThisRun >= miraclesTarget;
  const riteVeilStrainReady = state.cataclysm.gateRiteVeilSpent >= riteVeilStrainTarget;
  const runTimeReady = state.simulation.totalElapsedMs / 1000 >= runTimeTargetSeconds;

  return {
    beliefTarget,
    beliefReady,
    veilTarget,
    veilReady,
    miraclesTarget,
    miraclesReady,
    riteVeilStrainTarget,
    riteVeilStrainReady,
    runTimeTargetSeconds,
    runTimeReady,
    ready: beliefReady && veilReady && miraclesReady && riteVeilStrainReady && runTimeReady
  };
}

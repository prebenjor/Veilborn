import {
  ACT_BASE_COST,
  ACT_BASE_MULTIPLIER,
  ACT_COST_DISCOUNT,
  ACT_DURATION_SECONDS,
  ACT_FLOOR_BASE,
  ACT_FLOOR_ECHO,
  ACT_RETURN_FACTOR,
  CIV_HEALTH_MAX,
  CIV_REBUILD_BASE_SECONDS,
  CIV_REBUILD_ECHO_MULTIPLIER,
  CIV_REGEN_PER_MINUTE,
  CIV_REGEN_PER_SHRINE_PER_MINUTE,
  CULT_COST_BASE,
  CULT_COST_ECHO_BASE,
  CULT_COST_SCALAR,
  CULT_OUTPUT_SCALE,
  DOMAIN_INVEST_BASE_COST,
  DOMAIN_INVEST_COST_SCALAR,
  DOMAIN_MULTIPLIER_SCALE,
  DOMAIN_SYNERGY_SCALE,
  DOMAIN_XP_BASE,
  DOMAIN_XP_SCALAR,
  ECHO_ASCENSION_DIVISOR,
  ECHO_TREE_MAX_RANK,
  ECHO_TREE_ORDER,
  ECHO_TREE_RANK_COSTS,
  ERA_ONE_BELIEF_GATE_BASE,
  ERA_ONE_DOMAIN_LEVEL_GATE,
  ERA_ONE_GATE_ECHO_MULTIPLIER,
  ERA_ONE_PROPHET_GATE,
  ERA_TWO_BELIEF_GATE_BASE,
  ERA_TWO_CULT_GATE,
  ERA_TWO_GATE_ECHO_MULTIPLIER,
  MIRACLE_BASE_GAIN,
  MIRACLE_CIV_DAMAGE,
  MIRACLE_DOMAIN_BONUS_SCALE,
  MIRACLE_INFLUENCE_COST,
  MIRACLE_VEIL_COST,
  MIRACLE_VEIL_COST_TIER_ONE_ECHO,
  LINEAGE_SKEPTICISM_MAX,
  LINEAGE_TRUST_DEBT_MAX,
  PANTHEON_ALLIANCE_DOMAIN_BONUS_BASE,
  PANTHEON_ALLIANCE_DOMAIN_BONUS_SCALE,
  PANTHEON_ALLIANCE_SHARE_MULTIPLIER,
  PANTHEON_DOMAIN_POISON_OUTPUT_MULTIPLIER,
  PANTHEON_UNLOCK_COMPLETED_RUNS,
  PASSIVE_FOLLOWER_RATE_PER_CULT,
  PASSIVE_FOLLOWER_RATE_PER_PROPHET,
  PASSIVE_FOLLOWER_RATE_PER_SHRINE,
  PASSIVE_FOLLOWER_VEIL_DANGER_MULTIPLIER,
  PASSIVE_FOLLOWER_VEIL_OPTIMAL_MULTIPLIER,
  PASSIVE_FOLLOWER_VEIL_SAFE_MULTIPLIER,
  FAITH_DECAY_BASE,
  FAITH_DECAY_ECHO_FLOOR,
  FAITH_DECAY_FLOOR,
  GHOST_BONUS_BASE,
  INFLUENCE_BASE_CAP,
  INFLUENCE_BASE_REGEN_PER_SECOND,
  INFLUENCE_CAP_PER_PROPHET,
  INFLUENCE_REGEN_PER_CULT_CAP,
  INFLUENCE_REGEN_PER_CULT_FOLLOWER,
  INFLUENCE_REGEN_PER_PROPHET_PER_SECOND,
  INFLUENCE_REGEN_PER_SHRINE_PER_SECOND,
  INFLUENCE_RESONANT_WORD_BONUS_PER_SECOND,
  INFLUENCE_START_BONUS,
  FOLLOWER_RITE_BASE_BELIEF_COST,
  FOLLOWER_RITE_BASE_FOLLOWERS,
  FOLLOWER_RITE_BASE_INFLUENCE_COST,
  FOLLOWER_RITE_COST_SCALAR,
  FOLLOWER_RITE_PER_CULT_SCALE,
  FOLLOWER_RITE_PER_DOMAIN_LEVEL_SCALE,
  FOLLOWER_RITE_PER_DOMAIN_PAIR_SCALE,
  FOLLOWER_RITE_PER_PROPHET_SCALE,
  FOLLOWER_RITE_PER_SHRINE_SCALE,
  FOLLOWER_RITE_VEIL_DANGER_MULTIPLIER,
  FOLLOWER_RITE_VEIL_OPTIMAL_MULTIPLIER,
  FOLLOWER_RITE_VEIL_SAFE_MULTIPLIER,
  FOLLOWER_BELIEF_TRICKLE_PER_FOLLOWER,
  PROPHET_DOMAIN_OUTPUT_SCALE,
  PROPHET_OUTPUT_BASE,
  PROPHET_THRESHOLD_BASE,
  PROPHET_THRESHOLD_ECHO_BASE,
  PROPHET_THRESHOLD_SCALAR,
  RECRUIT_BASE_FOLLOWERS,
  RECRUIT_DOMAIN_FOLLOWER_DIVISOR,
  RECRUIT_PROPHET_FOLLOWER_BONUS,
  RIVAL_SPAWN_BASE_MS,
  RIVAL_SPAWN_ECHO_DELAY_MS,
  RIVAL_STRENGTH_SCALE,
  RIVAL_WEAKENED_MULTIPLIER,
  UNRAVELING_BELIEF_GATE,
  UNRAVELING_MIRACLES_GATE,
  UNRAVELING_RUNTIME_GATE_SECONDS,
  UNRAVELING_VEIL_GATE,
  VEIL_COLLAPSE_THRESHOLD_BASE,
  VEIL_COLLAPSE_THRESHOLD_ECHO,
  VEIL_BONUS_SCALE,
  VEIL_EROSION_LOG_SCALE,
  VEIL_REGEN_BASE_SECONDS,
  VEIL_REGEN_ECHO_SECONDS,
  VEIL_REGEN_PER_SHRINE_SECONDS,
  WHISPER_BASE_COST,
  WHISPER_COST_SCALAR,
  WHISPER_WINDOW_MS,
  type ActType,
  type ActivityState,
  type DomainProgress,
  type DomainId,
  type EchoBonuses,
  type EchoTreeId,
  type FollowerRiteType,
  type EchoTreeRanks,
  type GameState,
  type MortalTrait,
  type MiracleTier
} from "../state/gameState";

interface NormalizedWhisperCycle {
  whisperWindowStartedAt: number;
  whispersInWindow: number;
}

const TRAIT_ORDER: MortalTrait[] = ["skeptical", "cautious", "zealous"];
const TRAIT_CONVERSION_EFFECT: Record<MortalTrait, number> = {
  skeptical: -0.08,
  cautious: 0,
  zealous: 0.08
};

export interface TraitDistribution {
  skeptical: number;
  cautious: number;
  zealous: number;
}

export interface LineageConversionFactors {
  traitBias: number;
  trustDebtPenalty: number;
  skepticismPenalty: number;
  betrayalPenalty: number;
  totalModifier: number;
}

export interface PantheonAllianceFactors {
  sharePenalty: number;
  domainBonus: number;
  totalModifier: number;
}

export interface GhostInfluenceTotals {
  domainSynergyDelta: number;
  rivalSpawnDelta: number;
  faithDecayDelta: number;
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

export interface FollowerRiteCost {
  influenceCost: number;
  beliefCost: number;
  uses: number;
}

export interface EraOneGateStatus {
  beliefTarget: number;
  beliefReady: boolean;
  prophetsTarget: number;
  prophetsReady: boolean;
  domainTarget: number;
  domainReady: boolean;
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

function getFinalChoiceFaithPressure(state: GameState): number {
  if (state.prestige.remembrance.finalChoice === "remember") return 0.06;
  if (state.prestige.remembrance.finalChoice === "forget") return -0.06;
  return 0;
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

const WHISPERS_TREE_UNLOCKS: Array<keyof EchoBonuses> = [
  "startInf",
  "prophetThreshold",
  "faithFloor",
  "era1Gate",
  "rivalWeaken"
];

const DOCTRINE_TREE_UNLOCKS: Array<keyof EchoBonuses> = [
  "cultCostBase",
  "rivalDelay",
  "actFloor",
  "actDiscount",
  "era2Gate"
];

const CATACLYSM_TREE_UNLOCKS: Array<keyof EchoBonuses> = [
  "veilRegen",
  "miracleVeilDiscount",
  "collapseThreshold",
  "collapseImmunity",
  "civRebuild"
];

const TREE_UNLOCKS: Record<EchoTreeId, Array<keyof EchoBonuses>> = {
  whispers: WHISPERS_TREE_UNLOCKS,
  doctrine: DOCTRINE_TREE_UNLOCKS,
  cataclysm: CATACLYSM_TREE_UNLOCKS
};

export function getEchoBonusesFromTreeRanks(treeRanks: EchoTreeRanks): EchoBonuses {
  const bonuses: EchoBonuses = {
    startInf: false,
    faithFloor: false,
    prophetThreshold: false,
    resonantWord: false,
    cultCostBase: false,
    era1Gate: false,
    era2Gate: false,
    actFloor: false,
    actDiscount: false,
    rivalDelay: false,
    rivalWeaken: false,
    veilRegen: false,
    miracleVeilDiscount: false,
    collapseThreshold: false,
    collapseImmunity: false,
    civRebuild: false
  };

  for (const treeId of ECHO_TREE_ORDER) {
    const rank = Math.max(0, Math.min(ECHO_TREE_MAX_RANK, treeRanks[treeId]));
    const unlocks = TREE_UNLOCKS[treeId];
    for (let i = 0; i < rank && i < unlocks.length; i += 1) {
      bonuses[unlocks[i]] = true;
    }
  }

  // Resonant Word unlocks at rank 3 on the whispers tree (cost: 3 echoes).
  bonuses.resonantWord = Math.max(0, Math.min(ECHO_TREE_MAX_RANK, treeRanks.whispers)) >= 3;

  return bonuses;
}

export function getEchoTreeRank(state: GameState, treeId: EchoTreeId): number {
  return Math.max(0, Math.min(ECHO_TREE_MAX_RANK, state.prestige.treeRanks[treeId]));
}

export function getEchoTreeNextRankCost(rank: number): number | null {
  if (rank < 0 || rank >= ECHO_TREE_MAX_RANK) return null;
  return ECHO_TREE_RANK_COSTS[rank];
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

export function getHighestDomainLevel(state: GameState): number {
  return state.domains.reduce((max, domain) => Math.max(max, domain.level), 0);
}

export function getDominantDomainLevel(state: GameState): number {
  return getHighestDomainLevel(state);
}

export function getMatchingDomainPairs(state: GameState): number {
  const activeDomains = state.domains.filter((domain) => domain.level > 0).length;
  return Math.floor(activeDomains / 2);
}

export function getProphetOutput(totalDomainLevel: number): number {
  return PROPHET_OUTPUT_BASE + totalDomainLevel * PROPHET_DOMAIN_OUTPUT_SCALE;
}

export function getDomainMultiplier(totalDomainLevel: number): number {
  return 1 + DOMAIN_MULTIPLIER_SCALE * totalDomainLevel;
}

export function getFaithDecay(state: GameState, nowMs: number): number {
  const minutesSinceLastEvent = Math.max(0, (nowMs - state.activity.lastEventAt) / 60000);
  const ghostInfluence = getGhostInfluenceTotals(state);
  let architecturePressure = 0;
  if (isArchitectureUnlocked(state)) {
    if (state.prestige.architecture.beliefRule === "fervor") architecturePressure += 0.08;
    if (state.prestige.architecture.beliefRule === "litany") architecturePressure -= 0.08;
  }
  architecturePressure += getFinalChoiceFaithPressure(state);

  const adjustedMinutes =
    minutesSinceLastEvent * Math.max(0.25, 1 + ghostInfluence.faithDecayDelta + architecturePressure);
  const baseDecay = Math.pow(FAITH_DECAY_BASE, adjustedMinutes);
  const floor = state.echoBonuses.faithFloor ? FAITH_DECAY_ECHO_FLOOR : FAITH_DECAY_FLOOR;
  return Math.max(floor, baseDecay);
}

export function getDomainSynergy(state: GameState): number {
  const baseSynergy =
    (1 + DOMAIN_SYNERGY_SCALE * state.matchingDomainPairs) *
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

function getFollowerRiteVeilZoneMultiplier(veil: number): number {
  if (veil > 55) return FOLLOWER_RITE_VEIL_SAFE_MULTIPLIER;
  if (veil < 30) return FOLLOWER_RITE_VEIL_DANGER_MULTIPLIER;
  return FOLLOWER_RITE_VEIL_OPTIMAL_MULTIPLIER;
}

export function getPassiveFollowerRate(state: GameState, nowMs: number): number {
  if (state.era < 3) return 0;
  if (state.cataclysm.civilizationHealth <= 0) return 0;

  const baseRate =
    PASSIVE_FOLLOWER_RATE_PER_CULT * state.cults +
    PASSIVE_FOLLOWER_RATE_PER_SHRINE * state.doctrine.shrinesBuilt +
    PASSIVE_FOLLOWER_RATE_PER_PROPHET * state.prophets;
  if (baseRate <= 0) return 0;

  const faithDecay = getFaithDecay(state, nowMs);
  const civHealthMultiplier = Math.max(0, state.cataclysm.civilizationHealth / 100);
  const veilZoneMultiplier = getPassiveFollowerVeilZoneMultiplier(state.resources.veil);
  return Math.max(0, baseRate * faithDecay * civHealthMultiplier * veilZoneMultiplier);
}

export function getFollowerRiteUses(state: GameState, type: FollowerRiteType): number {
  return Math.max(0, Math.floor(state.doctrine.followerRitesUsed?.[type] ?? 0));
}

export function getFollowerRiteCost(state: GameState, type: FollowerRiteType): FollowerRiteCost {
  const uses = getFollowerRiteUses(state, type);
  return {
    influenceCost: Math.ceil(
      FOLLOWER_RITE_BASE_INFLUENCE_COST[type] * Math.pow(FOLLOWER_RITE_COST_SCALAR[type], uses)
    ),
    beliefCost: Math.ceil(
      FOLLOWER_RITE_BASE_BELIEF_COST[type] * Math.pow(FOLLOWER_RITE_COST_SCALAR[type], uses)
    ),
    uses
  };
}

export function getFollowerRiteFollowerGain(
  state: GameState,
  type: FollowerRiteType,
  nowMs: number
): number {
  if (state.era < 3) return 0;
  if (state.cults <= 0) return 0;
  if (state.cataclysm.civilizationHealth <= 0) return 0;

  const baseFollowers = FOLLOWER_RITE_BASE_FOLLOWERS[type];
  const infrastructureMultiplier =
    1 +
    state.cults * FOLLOWER_RITE_PER_CULT_SCALE +
    state.doctrine.shrinesBuilt * FOLLOWER_RITE_PER_SHRINE_SCALE +
    state.prophets * FOLLOWER_RITE_PER_PROPHET_SCALE +
    state.matchingDomainPairs * FOLLOWER_RITE_PER_DOMAIN_PAIR_SCALE +
    getTotalDomainLevel(state) * FOLLOWER_RITE_PER_DOMAIN_LEVEL_SCALE;
  const faithDecay = getFaithDecay(state, nowMs);
  const civHealthMultiplier = Math.max(0, Math.min(1, state.cataclysm.civilizationHealth / 100));
  const veilMultiplier = getFollowerRiteVeilZoneMultiplier(state.resources.veil);
  const lineageMultiplier = getLineageConversionModifier(state);
  return Math.max(
    1,
    Math.floor(
      baseFollowers *
        infrastructureMultiplier *
        faithDecay *
        civHealthMultiplier *
        veilMultiplier *
        lineageMultiplier
    )
  );
}

export function getVeilRegenPerSecond(state: GameState): number {
  const baseSeconds = state.echoBonuses.veilRegen ? VEIL_REGEN_ECHO_SECONDS : VEIL_REGEN_BASE_SECONDS;
  const baseRegen = 1 / baseSeconds;
  const shrineRegen = state.doctrine.shrinesBuilt > 0 ? state.doctrine.shrinesBuilt / VEIL_REGEN_PER_SHRINE_SECONDS : 0;
  return baseRegen + shrineRegen;
}

export function getVeilErosionPerSecond(state: GameState): number {
  if (state.era < 3) return 0;
  const belief = Math.max(1, state.stats.totalBeliefEarned);
  const base = VEIL_EROSION_LOG_SCALE * Math.log10(belief);
  if (state.prestige.remembrance.finalChoice === "remember") return base * 1.15;
  if (state.prestige.remembrance.finalChoice === "forget") return base * 0.9;
  return base;
}

export function getVeilCollapseThreshold(state: GameState): number {
  return state.echoBonuses.collapseThreshold ? VEIL_COLLAPSE_THRESHOLD_ECHO : VEIL_COLLAPSE_THRESHOLD_BASE;
}

export function getCultOutput(state: GameState): number {
  if (state.cults <= 0 || state.prophets <= 0 || state.resources.followers <= 0) return 0;
  return state.prophets * state.resources.followers * CULT_OUTPUT_SCALE * getDomainSynergy(state);
}

function getFollowerBeliefTrickle(state: GameState): number {
  return Math.max(0, state.resources.followers) * FOLLOWER_BELIEF_TRICKLE_PER_FOLLOWER;
}

export function getBeliefGenerationBreakdown(state: GameState, nowMs: number): BeliefGenerationBreakdown {
  const totalDomainLevel = getTotalDomainLevel(state);
  const prophetOutput = getProphetOutput(totalDomainLevel);
  const domainMultiplier = getDomainMultiplier(totalDomainLevel);
  const faithDecay = getFaithDecay(state, nowMs);
  const domainSynergy = getDomainSynergy(state);

  const prophetStack = state.prophets * prophetOutput * domainMultiplier * faithDecay;
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

export function getInfluenceCap(state: GameState): number {
  const startBonus = state.echoBonuses.startInf ? INFLUENCE_START_BONUS : 0;
  return INFLUENCE_BASE_CAP + state.prophets * INFLUENCE_CAP_PER_PROPHET + startBonus;
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
  return state.echoBonuses.resonantWord ? INFLUENCE_RESONANT_WORD_BONUS_PER_SECOND : 0;
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
  return Math.ceil(WHISPER_BASE_COST * Math.pow(WHISPER_COST_SCALAR, whispersInWindow));
}

export function getWhisperCost(state: GameState, nowMs: number): number {
  const normalized = normalizeWhisperCycle(state.activity, nowMs);
  return getWhisperCostFromCount(normalized.whispersInWindow);
}

export function getFollowersForNextProphet(state: GameState): number {
  const base = state.echoBonuses.prophetThreshold ? PROPHET_THRESHOLD_ECHO_BASE : PROPHET_THRESHOLD_BASE;
  return Math.ceil(base * Math.pow(PROPHET_THRESHOLD_SCALAR, state.prophets));
}

export function getCultFormationCost(state: GameState): number {
  const base = state.echoBonuses.cultCostBase ? CULT_COST_ECHO_BASE : CULT_COST_BASE;
  return Math.ceil(base * Math.pow(CULT_COST_SCALAR, state.cults));
}

export function getRecruitFollowerGainBase(state: GameState): number {
  return (
    RECRUIT_BASE_FOLLOWERS +
    state.prophets * RECRUIT_PROPHET_FOLLOWER_BONUS +
    Math.floor(getTotalDomainLevel(state) / RECRUIT_DOMAIN_FOLLOWER_DIVISOR)
  );
}

export function getLineageTraitDistribution(state: GameState): TraitDistribution {
  const counts: TraitDistribution = {
    skeptical: 0,
    cautious: 0,
    zealous: 0
  };

  for (const mortal of state.mortals) {
    counts[mortal.trait] += 1;
  }

  const total = Math.max(1, state.mortals.length);
  return {
    skeptical: counts.skeptical / total,
    cautious: counts.cautious / total,
    zealous: counts.zealous / total
  };
}

function getLineageTraitBias(state: GameState): number {
  const distribution = getLineageTraitDistribution(state);
  return TRAIT_ORDER.reduce((sum, trait) => {
    return sum + distribution[trait] * TRAIT_CONVERSION_EFFECT[trait];
  }, 0);
}

export function getLineageConversionFactors(state: GameState): LineageConversionFactors {
  const traitBias = getLineageTraitBias(state);
  const trustDebtPenalty = (Math.max(0, state.lineage.trustDebt) / LINEAGE_TRUST_DEBT_MAX) * 0.35;
  const skepticismPenalty = (Math.max(0, state.lineage.skepticism) / LINEAGE_SKEPTICISM_MAX) * 0.25;
  const betrayalPenalty = Math.min(0.2, Math.max(0, state.lineage.betrayalScars) * 0.02);
  const totalModifier = Math.max(
    0.35,
    Math.min(1.25, 1 + traitBias - trustDebtPenalty - skepticismPenalty - betrayalPenalty)
  );

  return {
    traitBias,
    trustDebtPenalty,
    skepticismPenalty,
    betrayalPenalty,
    totalModifier
  };
}

export function getLineageConversionModifier(state: GameState): number {
  return getLineageConversionFactors(state).totalModifier;
}

export function getLineageInheritanceWeights(state: GameState): TraitDistribution {
  const distribution = getLineageTraitDistribution(state);
  const skepticismRatio = Math.max(0, Math.min(1, state.lineage.skepticism / LINEAGE_SKEPTICISM_MAX));
  const trustRatio = Math.max(0, Math.min(1, state.lineage.trustDebt / LINEAGE_TRUST_DEBT_MAX));
  const betrayalPressure = Math.min(1, state.lineage.betrayalScars / 10);

  let skeptical = distribution.skeptical + skepticismRatio * 0.45 + betrayalPressure * 0.2;
  let cautious = distribution.cautious + trustRatio * 0.25 + skepticismRatio * 0.1;
  let zealous =
    distribution.zealous +
    Math.max(0, 0.25 - skepticismRatio * 0.2) +
    Math.max(0, 0.2 - trustRatio * 0.15);

  const total = Math.max(0.0001, skeptical + cautious + zealous);
  skeptical /= total;
  cautious /= total;
  zealous /= total;

  return {
    skeptical,
    cautious,
    zealous
  };
}

export function getDomainInvestCost(domain: DomainProgress): number {
  return Math.ceil(DOMAIN_INVEST_BASE_COST * Math.pow(DOMAIN_INVEST_COST_SCALAR, domain.level));
}

export function getDomainXpNeeded(domain: DomainProgress): number {
  return Math.ceil(DOMAIN_XP_BASE * Math.pow(DOMAIN_XP_SCALAR, domain.level));
}

export function simulateDomainInvestments(
  domain: DomainProgress,
  beliefBudget: number,
  maxInvestments = Number.POSITIVE_INFINITY
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
    const cost = getDomainInvestCost(currentDomain);
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
  const discount = state.echoBonuses.actDiscount ? ACT_COST_DISCOUNT : 1;
  return Math.ceil(ACT_BASE_COST[type] * discount);
}

export function getActDurationSeconds(type: ActType): number {
  return ACT_DURATION_SECONDS[type];
}

export function getActBaseMultiplier(type: ActType): number {
  return ACT_BASE_MULTIPLIER[type];
}

export function getActBeliefMultiplier(state: GameState, baseMultiplier: number): number {
  const floor = state.echoBonuses.actFloor ? ACT_FLOOR_ECHO : ACT_FLOOR_BASE;
  return Math.max(floor, baseMultiplier + state.matchingDomainPairs * 0.2);
}

export function getActRewardBelief(
  state: GameState,
  beliefPerSecond: number,
  durationSeconds: number,
  baseMultiplier: number
): number {
  const beliefMultiplier = getActBeliefMultiplier(state, baseMultiplier);
  return beliefPerSecond * durationSeconds * beliefMultiplier * ACT_RETURN_FACTOR;
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
  const multiplier = state.echoBonuses.civRebuild ? CIV_REBUILD_ECHO_MULTIPLIER : 1;
  return Math.ceil(CIV_REBUILD_BASE_SECONDS * multiplier);
}

export function getMiracleInfluenceCost(tier: MiracleTier): number {
  return MIRACLE_INFLUENCE_COST[tier];
}

export function getMiracleBaseGain(tier: MiracleTier): number {
  return MIRACLE_BASE_GAIN[tier];
}

export function getMiracleVeilCost(state: GameState, tier: MiracleTier): number {
  if (tier === 1 && state.echoBonuses.miracleVeilDiscount) {
    return MIRACLE_VEIL_COST_TIER_ONE_ECHO;
  }
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
  return base * civStability * (1 + domainBonus);
}

export function getRivalSpawnIntervalMs(state: GameState): number {
  const baseInterval = RIVAL_SPAWN_BASE_MS + (state.echoBonuses.rivalDelay ? RIVAL_SPAWN_ECHO_DELAY_MS : 0);
  const ghostInfluence = getGhostInfluenceTotals(state);
  return Math.ceil(Math.max(45 * 1000, baseInterval * (1 + ghostInfluence.rivalSpawnDelta)));
}

export function getRivalStrength(state: GameState, beliefPerSecond: number): number {
  const weakened = state.echoBonuses.rivalWeaken ? RIVAL_WEAKENED_MULTIPLIER : 1;
  return Math.max(1, beliefPerSecond * RIVAL_STRENGTH_SCALE) * weakened;
}

export function getTotalRivalStrength(state: GameState): number {
  return state.doctrine.rivals.reduce((sum, rival) => sum + rival.strength, 0);
}

export function getGhostInfluenceTotals(state: GameState): GhostInfluenceTotals {
  if (state.ghost.activeInfluences.length <= 0) {
    return {
      domainSynergyDelta: 0,
      rivalSpawnDelta: 0,
      faithDecayDelta: 0
    };
  }

  const totals = state.ghost.activeInfluences.reduce(
    (accumulator, influence) => {
      accumulator.domainSynergyDelta += influence.domainSynergyDelta;
      accumulator.rivalSpawnDelta += influence.rivalSpawnDelta;
      accumulator.faithDecayDelta += influence.faithDecayDelta;
      return accumulator;
    },
    {
      domainSynergyDelta: 0,
      rivalSpawnDelta: 0,
      faithDecayDelta: 0
    }
  );

  return {
    domainSynergyDelta: Math.max(-0.25, Math.min(0.25, totals.domainSynergyDelta)),
    rivalSpawnDelta: Math.max(-0.3, Math.min(0.3, totals.rivalSpawnDelta)),
    faithDecayDelta: Math.max(-0.2, Math.min(0.2, totals.faithDecayDelta))
  };
}

export function getEraOneBeliefGateTarget(state: GameState): number {
  const multiplier = state.echoBonuses.era1Gate ? ERA_ONE_GATE_ECHO_MULTIPLIER : 1;
  return Math.ceil(ERA_ONE_BELIEF_GATE_BASE * multiplier);
}

export function getEraOneGateStatus(state: GameState): EraOneGateStatus {
  const beliefTarget = getEraOneBeliefGateTarget(state);
  const prophetsTarget = ERA_ONE_PROPHET_GATE;
  const domainTarget = ERA_ONE_DOMAIN_LEVEL_GATE;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const prophetsReady = state.prophets >= prophetsTarget;
  const domainReady = getHighestDomainLevel(state) >= domainTarget;

  return {
    beliefTarget,
    beliefReady,
    prophetsTarget,
    prophetsReady,
    domainTarget,
    domainReady,
    ready: beliefReady && prophetsReady && domainReady
  };
}

export function getEraTwoBeliefGateTarget(state: GameState): number {
  const multiplier = state.echoBonuses.era2Gate ? ERA_TWO_GATE_ECHO_MULTIPLIER : 1;
  return Math.ceil(ERA_TWO_BELIEF_GATE_BASE * multiplier);
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
  const runTimeTargetSeconds = UNRAVELING_RUNTIME_GATE_SECONDS;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const veilReady = state.resources.veil <= veilTarget;
  const miraclesReady = state.cataclysm.miraclesThisRun >= miraclesTarget;
  const runTimeReady = state.simulation.totalElapsedMs / 1000 >= runTimeTargetSeconds;

  return {
    beliefTarget,
    beliefReady,
    veilTarget,
    veilReady,
    miraclesTarget,
    miraclesReady,
    runTimeTargetSeconds,
    runTimeReady,
    ready: beliefReady && veilReady && miraclesReady && runTimeReady
  };
}

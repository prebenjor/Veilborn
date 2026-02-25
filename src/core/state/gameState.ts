import { openingOmen } from "../content/omens";

export const GAME_STATE_SCHEMA_VERSION = 18;
export const WORLD_TICK_MS = 250;
export const OFFLINE_MAX_SECONDS = 8 * 60 * 60;
export const OFFLINE_BELIEF_EFFICIENCY = 0.85;
export const OFFLINE_INFLUENCE_RETURN_RATIO = 0.5;
export const OFFLINE_RIVAL_DRAIN_MULTIPLIER = 0.5;
export const OFFLINE_VEIL_FLOOR = 15;
export const ECHO_ASCENSION_DIVISOR = 750000;
export const ECHO_TREE_MAX_RANK = 12;
export const ECHO_TREE_COST_BASE = 2;
export const ECHO_TREE_COST_EXPONENT = 2;
export const ECHO_TREE_COST_LINEAR_SCALE = 0.25;
export const OMEN_LOG_MAX_ENTRIES = 6;

export const PROPHET_OUTPUT_BASE = 2;
export const PROPHET_DOMAIN_OUTPUT_SCALE = 0.1;
export const DOMAIN_MULTIPLIER_SCALE = 0.15;
export const CULT_OUTPUT_SCALE = 0.08;
export const DOMAIN_SYNERGY_SCALE = 0.25;
export const VEIL_BONUS_SCALE = 0.008;
export const GHOST_BONUS_BASE = 1;
export const FOLLOWER_BELIEF_TRICKLE_PER_FOLLOWER = 0.002;

export const INFLUENCE_BASE_CAP = 100;
export const INFLUENCE_CAP_PER_PROPHET = 20;
export const INFLUENCE_START_BONUS = 50;
export const INFLUENCE_CAP_CULT_BASELINE = 3;
export const INFLUENCE_CAP_PER_CULT_OVER_BASE = 5;
export const INFLUENCE_CAP_DOMAIN_LEVEL_BASELINE = 5;
export const INFLUENCE_CAP_PER_DOMAIN_LEVEL_OVER_BASE = 2;
export const INFLUENCE_CAP_SHRINE_BASELINE = 20;
export const INFLUENCE_CAP_PER_SHRINE_OVER_BASE = 0.5;
export const INFLUENCE_BASE_REGEN_PER_SECOND = 1;
export const INFLUENCE_REGEN_PER_PROPHET_PER_SECOND = 0.5;
export const INFLUENCE_REGEN_PER_SHRINE_PER_SECOND = 0.2;
export const INFLUENCE_REGEN_PER_CULT_FOLLOWER = 0.001;
export const INFLUENCE_REGEN_PER_CULT_CAP = 2.0;
export const INFLUENCE_RESONANT_WORD_BONUS_PER_SECOND = 2.0;
export const MIRACLE_RESERVE_BASE_CAP = 600;
export const MIRACLE_RESERVE_MAX_CAP = 5000;
export const MIRACLE_RESERVE_PER_PROPHET = 20;
export const MIRACLE_RESERVE_PER_CULT = 30;
export const MIRACLE_RESERVE_PER_SHRINE = 4;
export const MIRACLE_RESERVE_DOMAIN_LEVEL_BASELINE = 4;
export const MIRACLE_RESERVE_PER_DOMAIN_LEVEL_OVER_BASE = 25;
export const MIRACLE_RESERVE_START_BONUS = 150;
export const MIRACLE_RESERVE_ECHO_BONUS_PER_RANK = 60;

export const WHISPER_BASE_COST = 10;
export const WHISPER_COST_SCALAR = 1.4;
export const WHISPER_WINDOW_MS = 4 * 60 * 1000;
export const WHISPER_BELIEF_GAIN = 2;
export const WHISPER_FOLLOWER_GAIN = 1;
export type WhisperTarget = "crowd" | "prophets" | "cults";
export type WhisperMagnitude = "base" | "boosted";
export const WHISPER_TARGETS: WhisperTarget[] = ["crowd", "prophets", "cults"];
export const WHISPER_BASE_COST_SURCHARGE: Record<WhisperTarget, number> = {
  crowd: 0,
  prophets: 8,
  cults: 12
};
export const WHISPER_BASE_TARGET_FOLLOWER_MULTIPLIER: Record<WhisperTarget, number> = {
  crowd: 1,
  prophets: 1.4,
  cults: 1.6
};
export const WHISPER_BOOSTED_COST_MULTIPLIER: Record<WhisperTarget, number> = {
  crowd: 2.5,
  prophets: 2.5,
  cults: 3
};
export const WHISPER_BOOSTED_FOLLOWER_MULTIPLIER: Record<WhisperTarget, number> = {
  crowd: 2,
  prophets: 2.5,
  cults: 3
};
export const WHISPER_BASE_FAIL_CHANCE: Record<WhisperTarget, number> = {
  crowd: 0,
  prophets: 0.08,
  cults: 0.12
};
export const WHISPER_BOOSTED_FAIL_CHANCE: Record<WhisperTarget, number> = {
  crowd: 0.06,
  prophets: 0.14,
  cults: 0.2
};
export const WHISPER_FAIL_FOLLOWER_MULTIPLIER = 0.6;
export const WHISPER_ASCENSION_FAIL_MULTIPLIER = 0.96;
export const WHISPER_CULTS_BASE_COOLDOWN_MS = 45 * 1000;
export const WHISPER_CULTS_BOOSTED_COOLDOWN_MS = 90 * 1000;
export const WHISPER_ECHO_FAIL_REDUCTION_PER_RANK = 0.015;
export const WHISPER_ECHO_FAIL_REDUCTION_MAX = 0.24;
export const WHISPER_ECHO_YIELD_BONUS_PER_RANK = 0.02;
export const WHISPER_ECHO_YIELD_BONUS_MAX = 0.24;
export const WHISPER_ECHO_SURCHARGE_REDUCTION_PER_RANK = 0.02;
export const WHISPER_ECHO_SURCHARGE_REDUCTION_MAX = 0.2;
export const WHISPER_ECHO_COOLDOWN_REDUCTION_PER_RANK_MS = 4000;
export const WHISPER_ECHO_COOLDOWN_REDUCTION_MAX_MS = 32000;
export const WHISPER_ECHO_BOOSTED_FAIL_REDUCTION_PER_RANK = 0.01;
export const WHISPER_ECHO_BOOSTED_FAIL_REDUCTION_MAX = 0.1;
export const RECRUIT_INFLUENCE_COST = 25;
export const RECRUIT_BASE_FOLLOWERS = 4;
export const RECRUIT_PROPHET_FOLLOWER_BONUS = 2;
export const RECRUIT_DOMAIN_FOLLOWER_DIVISOR = 2;
export const RECRUIT_RANDOM_FOLLOWER_MAX = 2;
export const DEVOTION_STACK_MAX = 3;
export const DEVOTION_RECRUIT_BONUS_PER_STACK = 0.08;
export type DevotionPath = "none" | "fervour" | "accord" | "reverence" | "ardour";
export const DEVOTION_PATH_IDS = ["none", "fervour", "accord", "reverence", "ardour"] as const;

export interface DevotionMomentum {
  fervour: number;
  accord: number;
  reverence: number;
  ardour: number;
}

export const CADENCE_PROMPT_INTERVAL_MS = 45 * 1000;
export const CADENCE_ACTION_BELIEF_BONUS = 5;
export const CADENCE_ACTION_FOLLOWER_BONUS = 1;

export const PASSIVE_FOLLOWER_RATE_PER_CULT = 0.35;
export const PASSIVE_FOLLOWER_RATE_PER_SHRINE = 0.25;
export const PASSIVE_FOLLOWER_RATE_PER_PROPHET = 0.05;
export const PASSIVE_FOLLOWER_RATE_PER_PROPHET_ERA_TWO = 0.02;
export const WHISPER_PASSIVE_FOLLOWER_RATE_EFFECT = 0.35;
export const PASSIVE_FOLLOWER_VEIL_SAFE_MULTIPLIER = 0.8;
export const PASSIVE_FOLLOWER_VEIL_OPTIMAL_MULTIPLIER = 1.1;
export const PASSIVE_FOLLOWER_VEIL_DANGER_MULTIPLIER = 1.25;

export const PROPHET_THRESHOLD_BASE = 50;
export const PROPHET_THRESHOLD_ECHO_BASE = 20;
export const PROPHET_THRESHOLD_SCALAR = 1.6;

export const CULT_COST_BASE = 500;
export const CULT_COST_ECHO_BASE = 350;
export const CULT_COST_SCALAR = 2;

export type ActType = "shrine" | "ritual" | "proclaim";
export const ACT_TYPES: ActType[] = ["shrine", "ritual", "proclaim"];
export const ACT_BASE_COST: Record<ActType, number> = {
  shrine: 20,
  ritual: 80,
  proclaim: 150
};
export const ACT_DURATION_SECONDS: Record<ActType, number> = {
  shrine: 30,
  ritual: 45,
  proclaim: 60
};
export const ACT_BASE_MULTIPLIER: Record<ActType, number> = {
  shrine: 2.5,
  ritual: 4.0,
  proclaim: 7.0
};
export const ACT_RETURN_FACTOR = 0.3;
export const ACT_FLOOR_BASE = 1.0;
export const ACT_FLOOR_ECHO = 1.5;
export const ACT_COST_DISCOUNT = 0.85;

export type FollowerRiteType = "procession" | "convergence";
export const FOLLOWER_RITE_TYPES: FollowerRiteType[] = ["procession", "convergence"];
export const FOLLOWER_RITE_BASE_INFLUENCE_COST: Record<FollowerRiteType, number> = {
  procession: 220,
  convergence: 680
};
export const FOLLOWER_RITE_BASE_BELIEF_COST: Record<FollowerRiteType, number> = {
  procession: 12000,
  convergence: 90000
};
export const FOLLOWER_RITE_COST_SCALAR: Record<FollowerRiteType, number> = {
  procession: 1.28,
  convergence: 1.35
};
export const FOLLOWER_RITE_BASE_FOLLOWERS: Record<FollowerRiteType, number> = {
  procession: 180,
  convergence: 900
};
export const FOLLOWER_RITE_PER_CULT_SCALE = 0.08;
export const FOLLOWER_RITE_PER_SHRINE_SCALE = 0.06;
export const FOLLOWER_RITE_PER_PROPHET_SCALE = 0.04;
export const FOLLOWER_RITE_PER_DOMAIN_PAIR_SCALE = 0.07;
export const FOLLOWER_RITE_PER_DOMAIN_LEVEL_SCALE = 0.01;
export const FOLLOWER_RITE_VEIL_SAFE_MULTIPLIER = 0.95;
export const FOLLOWER_RITE_VEIL_OPTIMAL_MULTIPLIER = 1.1;
export const FOLLOWER_RITE_VEIL_DANGER_MULTIPLIER = 1.2;

export const RIVAL_SPAWN_BASE_MS = 300 * 1000;
export const RIVAL_SPAWN_ECHO_DELAY_MS = 60 * 1000;
export const RIVAL_EVENT_DURATION_MS = 90 * 1000;
export const RIVAL_MAX_ACTIVE = 2;
export const RIVAL_STRENGTH_SCALE = 0.08;
export const RIVAL_DRAIN_RATE = 0.015;
export const RIVAL_WEAKENED_MULTIPLIER = 0.8;
export const RIVAL_SUPPRESS_INFLUENCE_COST = 200;

export const DOMAIN_INVEST_BASE_COST = 50;
export const DOMAIN_INVEST_COST_SCALAR = 1.8;
export const DOMAIN_XP_BASE = 3;
export const DOMAIN_XP_SCALAR = 1.5;

export const ERA_ONE_BELIEF_GATE_BASE = 10000;
export const ERA_ONE_GATE_ECHO_MULTIPLIER = 0.7;
export const ERA_ONE_PROPHET_GATE = 3;
export const ERA_ONE_FOLLOWER_GATE = 500;
export const ERA_TWO_BELIEF_GATE_BASE = 275000;
export const ERA_TWO_GATE_ECHO_MULTIPLIER = 0.75;
export const ERA_TWO_CULT_GATE = 3;
export const UNRAVELING_BELIEF_GATE = 5000000;
export const UNRAVELING_VEIL_GATE = 20;
export const UNRAVELING_MIRACLES_GATE = 2;
export const UNRAVELING_RUNTIME_GATE_SECONDS = 240 * 60;

export const VEIL_MIN = 0;
export const VEIL_MAX = 100;
export const VEIL_REGEN_BASE_SECONDS = 120;
export const VEIL_REGEN_ECHO_SECONDS = 80;
export const VEIL_REGEN_PER_SHRINE_SECONDS = 90;
export const VEIL_REGEN_SHRINE_DIMINISHING_SCALE = 0.015;
export const VEIL_EROSION_LOG_SCALE = 0.001;
export const VEIL_EROSION_PER_SHRINE_SCALE = 0.0002;
export const VEIL_COLLAPSE_THRESHOLD_BASE = 15;
export const VEIL_COLLAPSE_THRESHOLD_ECHO = 8;
export const VEIL_COLLAPSE_FOLLOWER_RETENTION = 0.4;
export const VEIL_COLLAPSE_PROPHET_LOSS = 2;
export const VEIL_COLLAPSE_IMMUNITY_SECONDS = 30;

export type MiracleTier = 1 | 2 | 3 | 4;
export const MIRACLE_TIERS: MiracleTier[] = [1, 2, 3, 4];
export const MIRACLE_NAMES: Record<MiracleTier, string> = {
  1: "Whisper of Providence",
  2: "The Anointing",
  3: "The Rending",
  4: "Unraveling"
};
export const MIRACLE_INFLUENCE_COST: Record<MiracleTier, number> = {
  1: 500,
  2: 1600,
  3: 4100,
  4: 10000
};
export const MIRACLE_BASE_GAIN: Record<MiracleTier, number> = {
  1: 5500,
  2: 30000,
  3: 90000,
  4: 300000
};
export const MIRACLE_VEIL_COST: Record<MiracleTier, number> = {
  1: 10,
  2: 15,
  3: 25,
  4: 40
};
export const MIRACLE_VEIL_COST_TIER_ONE_ECHO = 5;
export const MIRACLE_CIV_DAMAGE: Record<MiracleTier, number> = {
  1: 5,
  2: 8,
  3: 14,
  4: 24
};
export const MIRACLE_DOMAIN_BONUS_SCALE = 0.1;

export const CIV_HEALTH_MAX = 100;
export const CIV_HEALTH_MIN = 0;
export const CIV_REGEN_PER_MINUTE = 0.5;
export const CIV_REGEN_PER_SHRINE_PER_MINUTE = 0.2;
export const CIV_COLLAPSE_FOLLOWER_RETENTION = 0.15;
export const CIV_REBUILD_BASE_SECONDS = 180;
export const CIV_REBUILD_ECHO_MULTIPLIER = 0.6;
export const LINEAGE_HISTORY_LIMIT = 40;
export const LINEAGE_TRUST_DEBT_MAX = 100;
export const LINEAGE_SKEPTICISM_MAX = 100;
export const LINEAGE_ASCENSION_TRUST_DECAY = 0.7;
export const LINEAGE_ASCENSION_SKEPTICISM_DECAY = 0.75;
export const LINEAGE_SUPPRESS_TRUST_DEBT = 6;
export const LINEAGE_SUPPRESS_SKEPTICISM = 4;
export const LINEAGE_CIV_COLLAPSE_TRUST_DEBT = 12;
export const LINEAGE_CIV_COLLAPSE_SKEPTICISM = 8;
export const LINEAGE_VEIL_COLLAPSE_TRUST_DEBT = 10;
export const LINEAGE_VEIL_COLLAPSE_SKEPTICISM = 6;
export const LINEAGE_CIV_RECOVERY_TRUST_RECOVERY = 5;
export const LINEAGE_CIV_RECOVERY_SKEPTICISM_RECOVERY = 3;
export const LINEAGE_ACTION_RECOVERY_WHISPER = 0.2;
export const LINEAGE_ACTION_RECOVERY_RECRUIT = 0.35;
export const LINEAGE_ACTION_RECOVERY_ACT = 0.5;
export const LINEAGE_PANTHEON_BETRAYAL_TRUST_DEBT = 16;
export const LINEAGE_PANTHEON_BETRAYAL_SKEPTICISM = 10;

export const PANTHEON_UNLOCK_COMPLETED_RUNS = 1;
export const PANTHEON_ALLY_COUNT = 3;
export const PANTHEON_ALLIANCE_SHARE_MULTIPLIER = 0.75;
export const PANTHEON_ALLIANCE_DOMAIN_BONUS_BASE = 0.12;
export const PANTHEON_ALLIANCE_DOMAIN_BONUS_SCALE = 0.07;
export const PANTHEON_BETRAYAL_BELIEF_SECONDS = 240;
export const PANTHEON_BETRAYAL_BELIEF_MIN = 12000;
export const PANTHEON_DOMAIN_POISON_RUNS = 3;
export const PANTHEON_DOMAIN_POISON_OUTPUT_MULTIPLIER = 0.65;

export type MortalTrait = "skeptical" | "zealous" | "cautious";
export type DomainId = "fire" | "death" | "harvest" | "storm" | "memory" | "void";
export const DOMAIN_IDS: DomainId[] = ["fire", "death", "harvest", "storm", "memory", "void"];
export type HistoryMarkerKind =
  | "origin"
  | "prophet_lineage"
  | "rival_suppressed"
  | "pantheon_betrayal"
  | "civ_collapse"
  | "veil_collapse"
  | "civ_rebuild"
  | "ascension";

export const DOMAIN_LABELS: Record<DomainId, string> = {
  fire: "Fire",
  death: "Death",
  harvest: "Harvest",
  storm: "Storm",
  memory: "Memory",
  void: "Void"
};

export interface Mortal {
  id: string;
  name: string;
  trait: MortalTrait;
  generation: number;
  parentId: string | null;
}

export interface HistoryMarker {
  id: string;
  at: number;
  runId: string;
  kind: HistoryMarkerKind;
  text: string;
  trustDebtDelta: number;
  skepticismDelta: number;
}

export interface LineageState {
  generation: number;
  trustDebt: number;
  skepticism: number;
  betrayalScars: number;
  history: HistoryMarker[];
  nextMarkerId: number;
}

export interface DomainProgress {
  id: DomainId;
  level: number;
  xp: number;
}

export interface OmenEntry {
  id: string;
  at: number;
  text: string;
}

export interface RunResources {
  belief: number;
  influence: number;
  veil: number;
  followers: number;
}

export interface EchoBonuses {
  startInf: boolean;
  prophetThreshold: boolean;
  resonantWord: boolean;
  cultCostBase: boolean;
  era1Gate: boolean;
  era2Gate: boolean;
  actFloor: boolean;
  actDiscount: boolean;
  rivalDelay: boolean;
  rivalWeaken: boolean;
  veilRegen: boolean;
  miracleVeilDiscount: boolean;
  collapseThreshold: boolean;
  collapseImmunity: boolean;
  civRebuild: boolean;
}

export type DomainPoisonRuns = Record<DomainId, number>;

export interface PantheonLegacyState {
  domainPoisonRuns: DomainPoisonRuns;
  betrayalsLifetime: number;
  betrayedAllyEver: boolean;
}

export type EchoTreeId = "whispers" | "doctrine" | "cataclysm";
export const ECHO_TREE_ORDER: EchoTreeId[] = ["whispers", "doctrine", "cataclysm"];

export interface EchoTreeRanks {
  whispers: number;
  doctrine: number;
  cataclysm: number;
}

export type ArchitectureBeliefRule = "orthodox" | "fervor" | "litany";
export type ArchitectureCivilizationRule = "steady" | "expansion" | "fracture";
export type ArchitectureDomainRule = "constellation" | "focused" | "chaotic";

export interface ArchitectureState {
  beliefRule: ArchitectureBeliefRule;
  civilizationRule: ArchitectureCivilizationRule;
  domainRule: ArchitectureDomainRule;
}

export interface RemembranceLetters {
  domainLevelTen: boolean;
  lifetimeEchoesFiftyThousand: boolean;
  veilZeroSixtySeconds: boolean;
  betrayedPantheonAlly: boolean;
  civilizationsRebuiltThree: boolean;
  allDomainsEight: boolean;
  followersMillion: boolean;
  beliefBillion: boolean;
}

export type FinalChoice = "none" | "remember" | "forget";

export interface RemembranceState {
  letters: RemembranceLetters;
  lifetimeBeliefEarned: number;
  lifetimeCivilizationRebuilds: number;
  peakFollowersEver: number;
  bestVeilZeroStreakMs: number;
  finalChoice: FinalChoice;
  finalChoiceAt: number | null;
}

export interface PrestigeState {
  echoes: number;
  lifetimeEchoes: number;
  completedRuns: number;
  dominantDevotionPath: DevotionPath;
  treeRanks: EchoTreeRanks;
  pantheon: PantheonLegacyState;
  architecture: ArchitectureState;
  remembrance: RemembranceState;
}

export type PantheonDisposition = "neutral" | "allied" | "betrayed";

export interface PantheonAlly {
  id: string;
  name: string;
  domain: DomainId;
  disposition: PantheonDisposition;
  joinedAt: number;
  betrayedAt: number | null;
}

export interface PantheonState {
  unlocked: boolean;
  allies: PantheonAlly[];
  activeAllyId: string | null;
  pendingPoisonDomains: DomainId[];
  betrayalsThisRun: number;
  nextAllyId: number;
}

export type GhostSignatureSource = "local" | "imported";

export interface GhostRunSignature {
  id: string;
  label: string;
  source: GhostSignatureSource;
  createdAt: number;
  dominantDomain: DomainId;
  domainLevels: Record<DomainId, number>;
  miracles: number;
  betrayals: number;
  veilCollapses: number;
  totalBelief: number;
}

export interface GhostInfluence {
  id: string;
  signatureId: string;
  source: GhostSignatureSource;
  title: string;
  description: string;
  dominantDomain: DomainId;
  domainSynergyDelta: number;
  rivalSpawnDelta: number;
}

export interface GhostState {
  localSignatures: GhostRunSignature[];
  importedSignatures: GhostRunSignature[];
  activeInfluences: GhostInfluence[];
  lastRunIdInitialized: string | null;
  nextSignatureId: number;
}

export interface ActivityState {
  lastEventAt: number;
  whisperWindowStartedAt: number;
  whispersInWindow: number;
  whisperTargetCooldowns: Record<WhisperTarget, number>;
  lastWhisperTarget: WhisperTarget;
  lastWhisperMagnitude: WhisperMagnitude;
  lastCadencePromptAt: number;
  cadencePromptActive: boolean;
}

export interface RunStats {
  totalBeliefEarned: number;
}

export interface ActiveAct {
  id: string;
  type: ActType;
  startedAt: number;
  endsAt: number;
  durationSeconds: number;
  baseMultiplier: number;
  cost: number;
}

export interface RivalState {
  id: string;
  strength: number;
  spawnedAt: number;
}

export interface DoctrineState {
  activeActs: ActiveAct[];
  actsCompleted: number;
  shrinesBuilt: number;
  followerRitesUsed: Record<FollowerRiteType, number>;
  rivals: RivalState[];
  lastRivalSpawnAt: number;
  survivedRivalEvent: boolean;
  nextActId: number;
  nextRivalId: number;
}

export interface CataclysmState {
  miraclesThisRun: number;
  miracleReserve: number;
  civilizationHealth: number;
  civilizationCollapsed: boolean;
  civilizationRebuildEndsAt: number;
  civilizationRebuilds: number;
  peakFollowers: number;
  veilZeroStreakMs: number;
  wasBelowVeilCollapseThreshold: boolean;
  totalVeilCollapses: number;
  veilCollapseImmunityUntil: number;
}

export interface RunMeta {
  schemaVersion: number;
  runId: string;
  runStartTimestamp: number;
  createdAt: number;
  updatedAt: number;
}

export interface SimulationState {
  tickMs: number;
  lastTickAt: number;
  accumulatedMs: number;
  totalTicks: number;
  totalElapsedMs: number;
}

export interface GameState {
  meta: RunMeta;
  simulation: SimulationState;
  resources: RunResources;
  activity: ActivityState;
  stats: RunStats;
  doctrine: DoctrineState;
  cataclysm: CataclysmState;
  prestige: PrestigeState;
  lineage: LineageState;
  pantheon: PantheonState;
  ghost: GhostState;
  echoBonuses: EchoBonuses;
  era: 1 | 2 | 3;
  mortals: Mortal[];
  domains: DomainProgress[];
  prophets: number;
  cults: number;
  devotionStacks: number;
  devotionPath: DevotionPath;
  devotionMomentum: DevotionMomentum;
  matchingDomainPairs: number;
  rngState: number;
  omenLog: OmenEntry[];
  nextEventId: number;
}

function createRunId(nowMs: number): string {
  return `run-${nowMs.toString(36)}`;
}

function createDefaultDomains(): DomainProgress[] {
  return [
    { id: "fire", level: 0, xp: 0 },
    { id: "death", level: 0, xp: 0 },
    { id: "harvest", level: 0, xp: 0 },
    { id: "storm", level: 0, xp: 0 },
    { id: "memory", level: 0, xp: 0 },
    { id: "void", level: 0, xp: 0 }
  ];
}

function createInitialRngState(nowMs: number): number {
  const seeded = (nowMs ^ 0x9e3779b9) >>> 0;
  return seeded === 0 ? 0x6d2b79f5 : seeded;
}

export function createDefaultEchoTreeRanks(): EchoTreeRanks {
  return {
    whispers: 0,
    doctrine: 0,
    cataclysm: 0
  };
}

export function createDefaultDomainPoisonRuns(): DomainPoisonRuns {
  return {
    fire: 0,
    death: 0,
    harvest: 0,
    storm: 0,
    memory: 0,
    void: 0
  };
}

export function createDefaultPantheonLegacyState(): PantheonLegacyState {
  return {
    domainPoisonRuns: createDefaultDomainPoisonRuns(),
    betrayalsLifetime: 0,
    betrayedAllyEver: false
  };
}

export function createDefaultEchoBonuses(): EchoBonuses {
  return {
    startInf: false,
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
}

export function createDefaultArchitectureState(): ArchitectureState {
  return {
    beliefRule: "orthodox",
    civilizationRule: "steady",
    domainRule: "constellation"
  };
}

export function createDefaultRemembranceLetters(): RemembranceLetters {
  return {
    domainLevelTen: false,
    lifetimeEchoesFiftyThousand: false,
    veilZeroSixtySeconds: false,
    betrayedPantheonAlly: false,
    civilizationsRebuiltThree: false,
    allDomainsEight: false,
    followersMillion: false,
    beliefBillion: false
  };
}

export function createDefaultRemembranceState(): RemembranceState {
  return {
    letters: createDefaultRemembranceLetters(),
    lifetimeBeliefEarned: 0,
    lifetimeCivilizationRebuilds: 0,
    peakFollowersEver: 0,
    bestVeilZeroStreakMs: 0,
    finalChoice: "none",
    finalChoiceAt: null
  };
}

export function createDefaultPrestigeState(): PrestigeState {
  return {
    echoes: 0,
    lifetimeEchoes: 0,
    completedRuns: 0,
    dominantDevotionPath: "none",
    treeRanks: createDefaultEchoTreeRanks(),
    pantheon: createDefaultPantheonLegacyState(),
    architecture: createDefaultArchitectureState(),
    remembrance: createDefaultRemembranceState()
  };
}

export function createDefaultDevotionMomentum(): DevotionMomentum {
  return {
    fervour: 0,
    accord: 0,
    reverence: 0,
    ardour: 0
  };
}

export function createDefaultPantheonState(): PantheonState {
  return {
    unlocked: false,
    allies: [],
    activeAllyId: null,
    pendingPoisonDomains: [],
    betrayalsThisRun: 0,
    nextAllyId: 1
  };
}

export function createDefaultGhostState(): GhostState {
  return {
    localSignatures: [],
    importedSignatures: [],
    activeInfluences: [],
    lastRunIdInitialized: null,
    nextSignatureId: 1
  };
}

export function createDefaultLineageState(nowMs: number, runId: string): LineageState {
  return {
    generation: 1,
    trustDebt: 0,
    skepticism: 6,
    betrayalScars: 0,
    history: [
      {
        id: "hist-0",
        at: nowMs,
        runId,
        kind: "origin",
        text: "The first listener kept your silence and named no witness.",
        trustDebtDelta: 0,
        skepticismDelta: 0
      }
    ],
    nextMarkerId: 1
  };
}

export function createInitialGameState(nowMs = Date.now()): GameState {
  const runId = createRunId(nowMs);
  return {
    meta: {
      schemaVersion: GAME_STATE_SCHEMA_VERSION,
      runId,
      runStartTimestamp: nowMs,
      createdAt: nowMs,
      updatedAt: nowMs
    },
    simulation: {
      tickMs: WORLD_TICK_MS,
      lastTickAt: nowMs,
      accumulatedMs: 0,
      totalTicks: 0,
      totalElapsedMs: 0
    },
    resources: {
      belief: 0,
      influence: INFLUENCE_BASE_CAP,
      veil: 100,
      followers: 0
    },
    activity: {
      lastEventAt: nowMs,
      whisperWindowStartedAt: nowMs,
      whispersInWindow: 0,
      whisperTargetCooldowns: {
        crowd: 0,
        prophets: 0,
        cults: 0
      },
      lastWhisperTarget: "crowd",
      lastWhisperMagnitude: "base",
      lastCadencePromptAt: nowMs,
      cadencePromptActive: false
    },
    stats: {
      totalBeliefEarned: 0
    },
    doctrine: {
      activeActs: [],
      actsCompleted: 0,
      shrinesBuilt: 0,
      followerRitesUsed: {
        procession: 0,
        convergence: 0
      },
      rivals: [],
      lastRivalSpawnAt: nowMs,
      survivedRivalEvent: false,
      nextActId: 1,
      nextRivalId: 1
    },
    cataclysm: {
      miraclesThisRun: 0,
      miracleReserve: 0,
      civilizationHealth: CIV_HEALTH_MAX,
      civilizationCollapsed: false,
      civilizationRebuildEndsAt: 0,
      civilizationRebuilds: 0,
      peakFollowers: 0,
      veilZeroStreakMs: 0,
      wasBelowVeilCollapseThreshold: false,
      totalVeilCollapses: 0,
      veilCollapseImmunityUntil: 0
    },
    prestige: createDefaultPrestigeState(),
    lineage: createDefaultLineageState(nowMs, runId),
    pantheon: createDefaultPantheonState(),
    ghost: createDefaultGhostState(),
    echoBonuses: createDefaultEchoBonuses(),
    era: 1,
    mortals: [
      {
        id: "mortal-1",
        name: "Ilyr of the Hollow",
        trait: "cautious",
        generation: 1,
        parentId: null
      }
    ],
    domains: createDefaultDomains(),
    prophets: 0,
    cults: 0,
    devotionStacks: 0,
    devotionPath: "none",
    devotionMomentum: createDefaultDevotionMomentum(),
    matchingDomainPairs: 0,
    rngState: createInitialRngState(nowMs),
    omenLog: [
      {
        id: "evt-0",
        at: nowMs,
        text: openingOmen
      }
    ],
    nextEventId: 1
  };
}

export const initialGameState: GameState = createInitialGameState();

import { openingOmen } from "../content/omens";

export const GAME_STATE_SCHEMA_VERSION = 7;
export const WORLD_TICK_MS = 250;
export const OFFLINE_MAX_SECONDS = 8 * 60 * 60;
export const OFFLINE_BELIEF_EFFICIENCY = 0.85;
export const OFFLINE_INFLUENCE_RETURN_RATIO = 0.5;
export const OFFLINE_RIVAL_DRAIN_MULTIPLIER = 0.5;
export const OFFLINE_VEIL_FLOOR = 15;
export const ECHO_ASCENSION_DIVISOR = 150000;
export const ECHO_TREE_MAX_RANK = 5;
export const ECHO_TREE_RANK_COSTS = [1, 2, 3, 5, 8] as const;

export const PROPHET_OUTPUT_BASE = 2;
export const PROPHET_DOMAIN_OUTPUT_SCALE = 0.1;
export const DOMAIN_MULTIPLIER_SCALE = 0.15;
export const FAITH_DECAY_BASE = 0.95;
export const FAITH_DECAY_FLOOR = 0.0;
export const FAITH_DECAY_ECHO_FLOOR = 0.8;
export const CULT_OUTPUT_SCALE = 0.08;
export const DOMAIN_SYNERGY_SCALE = 0.25;
export const VEIL_BONUS_SCALE = 0.008;
export const GHOST_BONUS_BASE = 1;

export const INFLUENCE_BASE_CAP = 100;
export const INFLUENCE_CAP_PER_PROPHET = 20;
export const INFLUENCE_START_BONUS = 50;
export const INFLUENCE_BASE_REGEN_PER_SECOND = 1;
export const INFLUENCE_REGEN_PER_PROPHET_PER_SECOND = 0.5;

export const WHISPER_BASE_COST = 10;
export const WHISPER_COST_SCALAR = 1.4;
export const WHISPER_WINDOW_MS = 4 * 60 * 1000;
export const WHISPER_BELIEF_GAIN = 2;
export const WHISPER_FOLLOWER_GAIN = 1;
export const RECRUIT_INFLUENCE_COST = 25;
export const RECRUIT_BASE_FOLLOWERS = 4;
export const RECRUIT_PROPHET_FOLLOWER_BONUS = 2;
export const RECRUIT_DOMAIN_FOLLOWER_DIVISOR = 2;
export const RECRUIT_RANDOM_FOLLOWER_MAX = 2;

export const CADENCE_PROMPT_INTERVAL_MS = 45 * 1000;
export const CADENCE_ACTION_BELIEF_BONUS = 5;
export const CADENCE_ACTION_FOLLOWER_BONUS = 1;

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
export const ERA_ONE_DOMAIN_LEVEL_GATE = 3;
export const ERA_TWO_BELIEF_GATE_BASE = 250000;
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
export const VEIL_EROSION_LOG_SCALE = 0.001;
export const VEIL_COLLAPSE_THRESHOLD_BASE = 15;
export const VEIL_COLLAPSE_THRESHOLD_ECHO = 8;
export const VEIL_COLLAPSE_FOLLOWER_RETENTION = 0.4;
export const VEIL_COLLAPSE_PROPHET_LOSS = 2;
export const VEIL_COLLAPSE_IMMUNITY_SECONDS = 30;

export type MiracleTier = 1 | 2 | 3 | 4;
export const MIRACLE_TIERS: MiracleTier[] = [1, 2, 3, 4];
export const MIRACLE_INFLUENCE_COST: Record<MiracleTier, number> = {
  1: 500,
  2: 1600,
  3: 4100,
  4: 10000
};
export const MIRACLE_BASE_GAIN: Record<MiracleTier, number> = {
  1: 8000,
  2: 30000,
  3: 90000,
  4: 300000
};
export const MIRACLE_VEIL_COST: Record<MiracleTier, number> = {
  1: 8,
  2: 15,
  3: 25,
  4: 40
};
export const MIRACLE_VEIL_COST_TIER_ONE_ECHO = 5;
export const MIRACLE_CIV_DAMAGE: Record<MiracleTier, number> = {
  1: 4,
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

export type MortalTrait = "skeptical" | "zealous" | "cautious";
export type DomainId = "fire" | "death" | "harvest" | "storm" | "memory" | "void";

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
  faithFloor: boolean;
  prophetThreshold: boolean;
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

export type EchoTreeId = "whispers" | "doctrine" | "cataclysm";
export const ECHO_TREE_ORDER: EchoTreeId[] = ["whispers", "doctrine", "cataclysm"];

export interface EchoTreeRanks {
  whispers: number;
  doctrine: number;
  cataclysm: number;
}

export interface PrestigeState {
  echoes: number;
  lifetimeEchoes: number;
  completedRuns: number;
  treeRanks: EchoTreeRanks;
}

export interface ActivityState {
  lastEventAt: number;
  whisperWindowStartedAt: number;
  whispersInWindow: number;
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
  rivals: RivalState[];
  lastRivalSpawnAt: number;
  survivedRivalEvent: boolean;
  nextActId: number;
  nextRivalId: number;
}

export interface CataclysmState {
  miraclesThisRun: number;
  civilizationHealth: number;
  civilizationCollapsed: boolean;
  civilizationRebuildEndsAt: number;
  civilizationRebuilds: number;
  peakFollowers: number;
  wasBelowVeilCollapseThreshold: boolean;
  totalVeilCollapses: number;
  veilCollapseImmunityUntil: number;
}

export interface RunMeta {
  schemaVersion: number;
  runId: string;
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
  echoBonuses: EchoBonuses;
  era: 1 | 2 | 3;
  mortals: Mortal[];
  domains: DomainProgress[];
  prophets: number;
  cults: number;
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

export function createDefaultEchoBonuses(): EchoBonuses {
  return {
    startInf: false,
    faithFloor: false,
    prophetThreshold: false,
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

export function createDefaultPrestigeState(): PrestigeState {
  return {
    echoes: 0,
    lifetimeEchoes: 0,
    completedRuns: 0,
    treeRanks: createDefaultEchoTreeRanks()
  };
}

export function createInitialGameState(nowMs = Date.now()): GameState {
  return {
    meta: {
      schemaVersion: GAME_STATE_SCHEMA_VERSION,
      runId: createRunId(nowMs),
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
      rivals: [],
      lastRivalSpawnAt: nowMs,
      survivedRivalEvent: false,
      nextActId: 1,
      nextRivalId: 1
    },
    cataclysm: {
      miraclesThisRun: 0,
      civilizationHealth: CIV_HEALTH_MAX,
      civilizationCollapsed: false,
      civilizationRebuildEndsAt: 0,
      civilizationRebuilds: 0,
      peakFollowers: 0,
      wasBelowVeilCollapseThreshold: false,
      totalVeilCollapses: 0,
      veilCollapseImmunityUntil: 0
    },
    prestige: createDefaultPrestigeState(),
    echoBonuses: createDefaultEchoBonuses(),
    era: 1,
    mortals: [
      {
        id: "mortal-1",
        name: "Ilyr of the Hollow",
        trait: "cautious"
      }
    ],
    domains: createDefaultDomains(),
    prophets: 0,
    cults: 0,
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

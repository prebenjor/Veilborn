import { openingOmen } from "../content/omens";

export const GAME_STATE_SCHEMA_VERSION = 2;
export const WORLD_TICK_MS = 250;

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

export const PROPHET_THRESHOLD_BASE = 50;
export const PROPHET_THRESHOLD_ECHO_BASE = 20;
export const PROPHET_THRESHOLD_SCALAR = 1.6;

export const CULT_COST_BASE = 500;
export const CULT_COST_ECHO_BASE = 350;
export const CULT_COST_SCALAR = 2;

export const DOMAIN_INVEST_BASE_COST = 50;
export const DOMAIN_INVEST_COST_SCALAR = 1.8;
export const DOMAIN_XP_BASE = 3;
export const DOMAIN_XP_SCALAR = 1.5;

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
}

export interface ActivityState {
  lastEventAt: number;
  whisperWindowStartedAt: number;
  whispersInWindow: number;
}

export interface RunStats {
  totalBeliefEarned: number;
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
  echoBonuses: EchoBonuses;
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
      whispersInWindow: 0
    },
    stats: {
      totalBeliefEarned: 0
    },
    echoBonuses: {
      startInf: false,
      faithFloor: false,
      prophetThreshold: false,
      cultCostBase: false
    },
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

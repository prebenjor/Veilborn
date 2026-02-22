import { openingOmen } from "../content/omens";

export const GAME_STATE_SCHEMA_VERSION = 1;
export const WORLD_TICK_MS = 250;

export const BELIEF_PER_PROPHET_PER_SECOND = 2;
export const INFLUENCE_BASE_CAP = 100;
export const INFLUENCE_CAP_PER_PROPHET = 20;
export const INFLUENCE_BASE_REGEN_PER_SECOND = 1;
export const INFLUENCE_REGEN_PER_PROPHET_PER_SECOND = 0.5;

export const WHISPER_INFLUENCE_COST = 10;
export const WHISPER_BELIEF_GAIN = 2;
export const WHISPER_FOLLOWER_GAIN = 1;

export type MortalTrait = "skeptical" | "zealous" | "cautious";
export type DomainId = "fire" | "death" | "harvest" | "storm" | "memory" | "void";

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
  mortals: Mortal[];
  domains: DomainProgress[];
  prophets: number;
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
    mortals: [
      {
        id: "mortal-1",
        name: "Ilyr of the Hollow",
        trait: "cautious"
      }
    ],
    domains: createDefaultDomains(),
    prophets: 0,
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

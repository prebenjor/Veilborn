import { getBeliefPerSecond } from "../engine/formulas";
import type { GameState, MiracleTier } from "./gameState";

const TELEMETRY_SCHEMA_VERSION = 1;
const TELEMETRY_MAX_RUNS = 20;
const TELEMETRY_EVENTS_KEY = "veilborn.telemetry.events.v1";
const TELEMETRY_RUN_SUMMARIES_KEY = "veilborn.telemetry.run_summaries.v1";
const TELEMETRY_PEAK_BELIEF_KEY = "veilborn.telemetry.peak_belief_per_second.v1";

type TelemetryScalar = string | number | boolean | null;
export type TelemetryEventDetails = Record<string, TelemetryScalar>;

export type TelemetryEventType =
  | "era_transition"
  | "veil_collapse"
  | "civilization_collapse"
  | "ascension"
  | "rival_suppressed"
  | "miracle_use";

export interface TelemetryEventSnapshot {
  runId: string;
  era: 1 | 2 | 3;
  belief: number;
  beliefPerSecond: number;
  totalBeliefEarned: number;
  influence: number;
  followers: number;
  prophets: number;
  cults: number;
  veil: number;
  civilizationHealth: number;
  civilizationCollapsed: boolean;
  rivals: number;
  miraclesThisRun: number;
  veilCollapses: number;
}

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  at: number;
  runId: string;
  era: 1 | 2 | 3;
  snapshot: TelemetryEventSnapshot;
  details: TelemetryEventDetails;
}

export interface TelemetryRunSummary {
  id: string;
  runId: string;
  runNumber: number;
  ascendedAt: number;
  runSeconds: number;
  totalBeliefEarned: number;
  echoesGained: number;
  peakBeliefPerSecond: number;
  veilCollapseCount: number;
  civilizationCollapseCount: number;
  miracleCountByTier: Record<MiracleTier, number>;
}

export interface TelemetrySnapshot {
  schemaVersion: number;
  exportedAt: number;
  events: TelemetryEvent[];
  runSummaries: TelemetryRunSummary[];
  peakBeliefPerSecondByRun: Record<string, number>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function isTelemetryScalar(value: unknown): value is TelemetryScalar {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function sanitizeMiracleCountByTier(value: unknown): Record<MiracleTier, number> {
  const fallback: Record<MiracleTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  if (!isRecord(value)) return fallback;
  return {
    1: Math.max(0, Math.floor(readNumber(value[1], readNumber(value["1"], 0)))),
    2: Math.max(0, Math.floor(readNumber(value[2], readNumber(value["2"], 0)))),
    3: Math.max(0, Math.floor(readNumber(value[3], readNumber(value["3"], 0)))),
    4: Math.max(0, Math.floor(readNumber(value[4], readNumber(value["4"], 0))))
  };
}

function sanitizeDetails(value: unknown): TelemetryEventDetails {
  if (!isRecord(value)) return {};
  const next: TelemetryEventDetails = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isTelemetryScalar(entry)) {
      next[key] = entry;
    }
  }
  return next;
}

function sanitizeEventSnapshot(value: unknown): TelemetryEventSnapshot | null {
  if (!isRecord(value)) return null;
  const eraValue = readNumber(value.era, 1);
  const era: 1 | 2 | 3 = eraValue >= 3 ? 3 : eraValue >= 2 ? 2 : 1;
  return {
    runId: readString(value.runId, "run-unknown"),
    era,
    belief: Math.max(0, readNumber(value.belief, 0)),
    beliefPerSecond: Math.max(0, readNumber(value.beliefPerSecond, 0)),
    totalBeliefEarned: Math.max(0, readNumber(value.totalBeliefEarned, 0)),
    influence: Math.max(0, readNumber(value.influence, 0)),
    followers: Math.max(0, Math.floor(readNumber(value.followers, 0))),
    prophets: Math.max(0, Math.floor(readNumber(value.prophets, 0))),
    cults: Math.max(0, Math.floor(readNumber(value.cults, 0))),
    veil: Math.max(0, readNumber(value.veil, 0)),
    civilizationHealth: Math.max(0, readNumber(value.civilizationHealth, 0)),
    civilizationCollapsed: readBoolean(value.civilizationCollapsed, false),
    rivals: Math.max(0, Math.floor(readNumber(value.rivals, 0))),
    miraclesThisRun: Math.max(0, Math.floor(readNumber(value.miraclesThisRun, 0))),
    veilCollapses: Math.max(0, Math.floor(readNumber(value.veilCollapses, 0)))
  };
}

function sanitizeEvent(value: unknown): TelemetryEvent | null {
  if (!isRecord(value)) return null;
  const type = readString(value.type);
  if (
    type !== "era_transition" &&
    type !== "veil_collapse" &&
    type !== "civilization_collapse" &&
    type !== "ascension" &&
    type !== "rival_suppressed" &&
    type !== "miracle_use"
  ) {
    return null;
  }
  const snapshot = sanitizeEventSnapshot(value.snapshot);
  if (!snapshot) return null;
  const eraValue = readNumber(value.era, snapshot.era);
  const era: 1 | 2 | 3 = eraValue >= 3 ? 3 : eraValue >= 2 ? 2 : 1;
  return {
    id: readString(value.id, `telemetry-${Date.now()}`),
    type,
    at: Math.max(0, readNumber(value.at, Date.now())),
    runId: readString(value.runId, snapshot.runId),
    era,
    snapshot,
    details: sanitizeDetails(value.details)
  };
}

function sanitizeRunSummary(value: unknown): TelemetryRunSummary | null {
  if (!isRecord(value)) return null;
  const runNumber = Math.max(1, Math.floor(readNumber(value.runNumber, 1)));
  return {
    id: readString(value.id, `summary-${Date.now()}`),
    runId: readString(value.runId, "run-unknown"),
    runNumber,
    ascendedAt: Math.max(0, readNumber(value.ascendedAt, Date.now())),
    runSeconds: Math.max(0, Math.floor(readNumber(value.runSeconds, 0))),
    totalBeliefEarned: Math.max(0, readNumber(value.totalBeliefEarned, 0)),
    echoesGained: Math.max(0, Math.floor(readNumber(value.echoesGained, 0))),
    peakBeliefPerSecond: Math.max(0, readNumber(value.peakBeliefPerSecond, 0)),
    veilCollapseCount: Math.max(0, Math.floor(readNumber(value.veilCollapseCount, 0))),
    civilizationCollapseCount: Math.max(
      0,
      Math.floor(readNumber(value.civilizationCollapseCount, 0))
    ),
    miracleCountByTier: sanitizeMiracleCountByTier(value.miracleCountByTier)
  };
}

function loadJsonValue(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function saveJsonValue(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

function trimEventsToRecentRuns(events: TelemetryEvent[]): TelemetryEvent[] {
  if (events.length <= 0) return events;
  const recentRunIds = new Set<string>();
  for (let index = events.length - 1; index >= 0; index -= 1) {
    recentRunIds.add(events[index].runId);
    if (recentRunIds.size >= TELEMETRY_MAX_RUNS) break;
  }
  return events.filter((event) => recentRunIds.has(event.runId));
}

function trimEventsToAllowedRunIds(
  events: TelemetryEvent[],
  allowedRunIds: Set<string>
): TelemetryEvent[] {
  if (allowedRunIds.size <= 0) return [];
  return events.filter((event) => allowedRunIds.has(event.runId));
}

function loadPeakBeliefByRun(): Record<string, number> {
  const raw = loadJsonValue(TELEMETRY_PEAK_BELIEF_KEY);
  if (!isRecord(raw)) return {};
  const peaks: Record<string, number> = {};
  for (const [runId, value] of Object.entries(raw)) {
    peaks[runId] = Math.max(0, readNumber(value, 0));
  }
  return peaks;
}

function savePeakBeliefByRun(peaks: Record<string, number>): void {
  saveJsonValue(TELEMETRY_PEAK_BELIEF_KEY, peaks);
}

function buildEventSnapshot(state: GameState, nowMs: number): TelemetryEventSnapshot {
  return {
    runId: state.meta.runId,
    era: state.era,
    belief: state.resources.belief,
    beliefPerSecond: getBeliefPerSecond(state, nowMs),
    totalBeliefEarned: state.stats.totalBeliefEarned,
    influence: state.resources.influence,
    followers: state.resources.followers,
    prophets: state.prophets,
    cults: state.cults,
    veil: state.resources.veil,
    civilizationHealth: state.cataclysm.civilizationHealth,
    civilizationCollapsed: state.cataclysm.civilizationCollapsed,
    rivals: state.doctrine.rivals.length,
    miraclesThisRun: state.cataclysm.miraclesThisRun,
    veilCollapses: state.cataclysm.totalVeilCollapses
  };
}

export function loadTelemetryEvents(): TelemetryEvent[] {
  const raw = loadJsonValue(TELEMETRY_EVENTS_KEY);
  if (!Array.isArray(raw)) return [];
  const events = raw
    .map((entry) => sanitizeEvent(entry))
    .filter((entry): entry is TelemetryEvent => Boolean(entry));
  return trimEventsToRecentRuns(events);
}

function saveTelemetryEvents(events: TelemetryEvent[]): void {
  saveJsonValue(TELEMETRY_EVENTS_KEY, trimEventsToRecentRuns(events));
}

export function loadTelemetryRunSummaries(): TelemetryRunSummary[] {
  const raw = loadJsonValue(TELEMETRY_RUN_SUMMARIES_KEY);
  if (!Array.isArray(raw)) return [];
  const summaries = raw
    .map((entry) => sanitizeRunSummary(entry))
    .filter((entry): entry is TelemetryRunSummary => Boolean(entry));
  return summaries.slice(-TELEMETRY_MAX_RUNS);
}

function saveTelemetryRunSummaries(summaries: TelemetryRunSummary[]): void {
  saveJsonValue(TELEMETRY_RUN_SUMMARIES_KEY, summaries.slice(-TELEMETRY_MAX_RUNS));
}

export function updateTelemetryPeakBeliefPerSecond(runId: string, beliefPerSecond: number): void {
  if (!runId) return;
  const nextPeak = Math.max(0, beliefPerSecond);
  const peaks = loadPeakBeliefByRun();
  const currentPeak = peaks[runId] ?? 0;
  if (nextPeak <= currentPeak) return;
  peaks[runId] = nextPeak;
  savePeakBeliefByRun(peaks);
}

function consumeTelemetryPeakBeliefPerSecond(runId: string): number {
  const peaks = loadPeakBeliefByRun();
  const peak = Math.max(0, peaks[runId] ?? 0);
  if (runId in peaks) {
    delete peaks[runId];
    savePeakBeliefByRun(peaks);
  }
  return peak;
}

export function appendTelemetryEvent(
  state: GameState,
  type: TelemetryEventType,
  nowMs: number,
  details: TelemetryEventDetails = {}
): TelemetryEvent {
  const events = loadTelemetryEvents();
  const event: TelemetryEvent = {
    id: `${state.meta.runId}-${nowMs}-${events.length + 1}`,
    type,
    at: nowMs,
    runId: state.meta.runId,
    era: state.era,
    snapshot: buildEventSnapshot(state, nowMs),
    details
  };

  events.push(event);
  saveTelemetryEvents(events);
  return event;
}

function countMiraclesByTier(
  events: TelemetryEvent[],
  runId: string
): Record<MiracleTier, number> {
  const counts: Record<MiracleTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const event of events) {
    if (event.runId !== runId) continue;
    if (event.type !== "miracle_use") continue;
    const tierRaw = event.details.tier;
    const tier = Math.floor(typeof tierRaw === "number" ? tierRaw : Number.NaN);
    if (tier === 1 || tier === 2 || tier === 3 || tier === 4) {
      counts[tier] += 1;
    }
  }
  return counts;
}

export function appendTelemetryRunSummary(
  state: GameState,
  nowMs: number,
  echoesGained: number
): TelemetryRunSummary {
  const events = loadTelemetryEvents();
  const peakBeliefPerSecond = Math.max(
    getBeliefPerSecond(state, nowMs),
    consumeTelemetryPeakBeliefPerSecond(state.meta.runId)
  );
  const summary: TelemetryRunSummary = {
    id: `summary-${state.meta.runId}-${nowMs}`,
    runId: state.meta.runId,
    runNumber: state.prestige.completedRuns + 1,
    ascendedAt: nowMs,
    runSeconds: Math.floor(state.simulation.totalElapsedMs / 1000),
    totalBeliefEarned: state.stats.totalBeliefEarned,
    echoesGained: Math.max(0, Math.floor(echoesGained)),
    peakBeliefPerSecond,
    veilCollapseCount: state.cataclysm.totalVeilCollapses,
    civilizationCollapseCount: state.cataclysm.civilizationRebuilds,
    miracleCountByTier: countMiraclesByTier(events, state.meta.runId)
  };

  const nextSummaries = [...loadTelemetryRunSummaries(), summary].slice(-TELEMETRY_MAX_RUNS);
  saveTelemetryRunSummaries(nextSummaries);

  const allowedRunIds = new Set(nextSummaries.map((entry) => entry.runId));
  const trimmedEvents = trimEventsToAllowedRunIds(events, allowedRunIds);
  saveTelemetryEvents(trimmedEvents);

  return summary;
}

export function createTelemetryExportPayload(): string {
  const payload: TelemetrySnapshot = {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    exportedAt: Date.now(),
    events: loadTelemetryEvents(),
    runSummaries: loadTelemetryRunSummaries(),
    peakBeliefPerSecondByRun: loadPeakBeliefByRun()
  };
  return JSON.stringify(payload, null, 2);
}

export function readTelemetryForTests(): TelemetrySnapshot {
  return {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    exportedAt: Date.now(),
    events: loadTelemetryEvents(),
    runSummaries: loadTelemetryRunSummaries(),
    peakBeliefPerSecondByRun: loadPeakBeliefByRun()
  };
}

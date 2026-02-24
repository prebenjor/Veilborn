import { getBeliefPerSecond } from "../engine/formulas";
import type { GameState, MiracleTier } from "./gameState";

const TELEMETRY_SCHEMA_VERSION = 1;
const TELEMETRY_MAX_RUNS = 20;
const TELEMETRY_EVENTS_KEY = "veilborn.telemetry.events.v1";
const TELEMETRY_RUN_SUMMARIES_KEY = "veilborn.telemetry.run_summaries.v1";
const TELEMETRY_PEAK_BELIEF_KEY = "veilborn.telemetry.peak_belief_per_second.v1";
const TELEMETRY_ACTION_CADENCE_KEY = "veilborn.telemetry.action_cadence.v1";
const TELEMETRY_ACTION_INTERVAL_SAMPLE_MAX = 720;

type TelemetryScalar = string | number | boolean | null;
export type TelemetryEventDetails = Record<string, TelemetryScalar>;

export type TelemetryEventType =
  | "era_transition"
  | "veil_collapse"
  | "civilization_collapse"
  | "ascension"
  | "rival_suppressed"
  | "miracle_use";

export type TelemetryActionType =
  | "whisper"
  | "recruit"
  | "invest_domain"
  | "anoint_prophet"
  | "found_cult"
  | "start_act"
  | "perform_follower_rite"
  | "suppress_rival"
  | "cast_miracle"
  | "buy_echo_rank"
  | "set_architecture_rule"
  | "form_pantheon_alliance"
  | "betray_pantheon_ally"
  | "advance_era"
  | "invoke_final_choice"
  | "ascend";

const TELEMETRY_ACTION_TYPES: TelemetryActionType[] = [
  "whisper",
  "recruit",
  "invest_domain",
  "anoint_prophet",
  "found_cult",
  "start_act",
  "perform_follower_rite",
  "suppress_rival",
  "cast_miracle",
  "buy_echo_rank",
  "set_architecture_rule",
  "form_pantheon_alliance",
  "betray_pantheon_ally",
  "advance_era",
  "invoke_final_choice",
  "ascend"
];

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
  actionCadence: TelemetryActionCadenceSummary;
  eraMilestones: TelemetryEraMilestones;
}

export interface TelemetryActionCadenceSummary {
  totalActions: number;
  averageIntervalSeconds: number | null;
  medianIntervalSeconds: number | null;
  p90IntervalSeconds: number | null;
  targetWindowHitRate: number | null;
}

export interface TelemetryEraMilestones {
  eraOneToTwoSeconds: number | null;
  eraTwoToThreeSeconds: number | null;
  eraThreeToAscensionSeconds: number | null;
}

interface TelemetryActionCadenceBuffer {
  runId: string;
  startedAt: number;
  lastActionAt: number | null;
  totalActions: number;
  intervalSamplesMs: number[];
  actionCounts: Record<TelemetryActionType, number>;
}

export interface TelemetrySnapshot {
  schemaVersion: number;
  exportedAt: number;
  events: TelemetryEvent[];
  runSummaries: TelemetryRunSummary[];
  peakBeliefPerSecondByRun: Record<string, number>;
  actionCadenceByRun: Record<string, TelemetryActionCadenceBuffer>;
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

function createEmptyActionCounts(): Record<TelemetryActionType, number> {
  return {
    whisper: 0,
    recruit: 0,
    invest_domain: 0,
    anoint_prophet: 0,
    found_cult: 0,
    start_act: 0,
    perform_follower_rite: 0,
    suppress_rival: 0,
    cast_miracle: 0,
    buy_echo_rank: 0,
    set_architecture_rule: 0,
    form_pantheon_alliance: 0,
    betray_pantheon_ally: 0,
    advance_era: 0,
    invoke_final_choice: 0,
    ascend: 0
  };
}

function sanitizeActionCounts(value: unknown): Record<TelemetryActionType, number> {
  const fallback = createEmptyActionCounts();
  if (!isRecord(value)) return fallback;
  for (const actionType of TELEMETRY_ACTION_TYPES) {
    fallback[actionType] = Math.max(0, Math.floor(readNumber(value[actionType], 0)));
  }
  return fallback;
}

function sanitizeActionCadenceSummary(value: unknown): TelemetryActionCadenceSummary {
  if (!isRecord(value)) {
    return {
      totalActions: 0,
      averageIntervalSeconds: null,
      medianIntervalSeconds: null,
      p90IntervalSeconds: null,
      targetWindowHitRate: null
    };
  }
  const readNullableMetric = (entry: unknown): number | null => {
    if (typeof entry !== "number" || !Number.isFinite(entry)) return null;
    return entry;
  };
  const targetWindowHitRate = readNullableMetric(value.targetWindowHitRate);
  return {
    totalActions: Math.max(0, Math.floor(readNumber(value.totalActions, 0))),
    averageIntervalSeconds: readNullableMetric(value.averageIntervalSeconds),
    medianIntervalSeconds: readNullableMetric(value.medianIntervalSeconds),
    p90IntervalSeconds: readNullableMetric(value.p90IntervalSeconds),
    targetWindowHitRate:
      targetWindowHitRate === null ? null : Math.max(0, Math.min(1, targetWindowHitRate))
  };
}

function sanitizeEraMilestones(value: unknown): TelemetryEraMilestones {
  if (!isRecord(value)) {
    return {
      eraOneToTwoSeconds: null,
      eraTwoToThreeSeconds: null,
      eraThreeToAscensionSeconds: null
    };
  }
  const readNullableSeconds = (entry: unknown): number | null => {
    if (typeof entry !== "number" || !Number.isFinite(entry)) return null;
    return Math.max(0, Math.floor(entry));
  };
  return {
    eraOneToTwoSeconds: readNullableSeconds(value.eraOneToTwoSeconds),
    eraTwoToThreeSeconds: readNullableSeconds(value.eraTwoToThreeSeconds),
    eraThreeToAscensionSeconds: readNullableSeconds(value.eraThreeToAscensionSeconds)
  };
}

function sanitizeCadenceBuffer(value: unknown): TelemetryActionCadenceBuffer | null {
  if (!isRecord(value)) return null;
  const runId = readString(value.runId, "");
  if (!runId) return null;
  const intervalSamplesMs = Array.isArray(value.intervalSamplesMs)
    ? value.intervalSamplesMs
        .map((sample) => Math.max(0, Math.floor(readNumber(sample, -1))))
        .filter((sample) => sample >= 0)
        .slice(-TELEMETRY_ACTION_INTERVAL_SAMPLE_MAX)
    : [];
  const rawLastActionAt = value.lastActionAt;
  const lastActionAt =
    typeof rawLastActionAt === "number" && Number.isFinite(rawLastActionAt)
      ? Math.max(0, rawLastActionAt)
      : null;
  return {
    runId,
    startedAt: Math.max(0, readNumber(value.startedAt, 0)),
    lastActionAt,
    totalActions: Math.max(0, Math.floor(readNumber(value.totalActions, 0))),
    intervalSamplesMs,
    actionCounts: sanitizeActionCounts(value.actionCounts)
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
    miracleCountByTier: sanitizeMiracleCountByTier(value.miracleCountByTier),
    actionCadence: sanitizeActionCadenceSummary(value.actionCadence),
    eraMilestones: sanitizeEraMilestones(value.eraMilestones)
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

function loadActionCadenceByRun(): Record<string, TelemetryActionCadenceBuffer> {
  const raw = loadJsonValue(TELEMETRY_ACTION_CADENCE_KEY);
  if (!isRecord(raw)) return {};
  const buffers: Record<string, TelemetryActionCadenceBuffer> = {};
  for (const [runId, value] of Object.entries(raw)) {
    const sanitized = sanitizeCadenceBuffer(value);
    if (!sanitized) continue;
    if (sanitized.runId !== runId) {
      sanitized.runId = runId;
    }
    buffers[runId] = sanitized;
  }
  return buffers;
}

function saveActionCadenceByRun(buffers: Record<string, TelemetryActionCadenceBuffer>): void {
  saveJsonValue(TELEMETRY_ACTION_CADENCE_KEY, buffers);
}

function trimActionCadenceToAllowedRunIds(
  buffers: Record<string, TelemetryActionCadenceBuffer>,
  allowedRunIds: Set<string>
): Record<string, TelemetryActionCadenceBuffer> {
  const trimmed: Record<string, TelemetryActionCadenceBuffer> = {};
  for (const [runId, buffer] of Object.entries(buffers)) {
    if (!allowedRunIds.has(runId)) continue;
    trimmed[runId] = buffer;
  }
  return trimmed;
}

function createCadenceBufferForRun(runId: string, nowMs: number): TelemetryActionCadenceBuffer {
  return {
    runId,
    startedAt: nowMs,
    lastActionAt: null,
    totalActions: 0,
    intervalSamplesMs: [],
    actionCounts: createEmptyActionCounts()
  };
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

export function recordTelemetryAction(
  state: GameState,
  actionType: TelemetryActionType,
  nowMs: number
): void {
  const runId = state.meta.runId;
  if (!runId) return;
  const allBuffers = loadActionCadenceByRun();
  const current = allBuffers[runId] ?? createCadenceBufferForRun(runId, state.meta.createdAt || nowMs);
  const intervalSamplesMs = [...current.intervalSamplesMs];
  if (current.lastActionAt !== null) {
    const intervalMs = Math.max(0, Math.floor(nowMs - current.lastActionAt));
    intervalSamplesMs.push(intervalMs);
    if (intervalSamplesMs.length > TELEMETRY_ACTION_INTERVAL_SAMPLE_MAX) {
      intervalSamplesMs.splice(0, intervalSamplesMs.length - TELEMETRY_ACTION_INTERVAL_SAMPLE_MAX);
    }
  }

  const nextActionCounts = {
    ...current.actionCounts,
    [actionType]: (current.actionCounts[actionType] ?? 0) + 1
  };

  allBuffers[runId] = {
    ...current,
    startedAt: Math.max(0, current.startedAt || state.meta.createdAt || nowMs),
    lastActionAt: nowMs,
    totalActions: current.totalActions + 1,
    intervalSamplesMs,
    actionCounts: nextActionCounts
  };
  saveActionCadenceByRun(allBuffers);
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

function percentile(sorted: number[], ratio: number): number {
  if (sorted.length <= 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const index = (sorted.length - 1) * clampedRatio;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function buildActionCadenceSummary(
  buffer: TelemetryActionCadenceBuffer | undefined
): TelemetryActionCadenceSummary {
  if (!buffer) {
    return {
      totalActions: 0,
      averageIntervalSeconds: null,
      medianIntervalSeconds: null,
      p90IntervalSeconds: null,
      targetWindowHitRate: null
    };
  }

  const sortedSamplesMs = [...buffer.intervalSamplesMs].sort((a, b) => a - b);
  if (sortedSamplesMs.length <= 0) {
    return {
      totalActions: buffer.totalActions,
      averageIntervalSeconds: null,
      medianIntervalSeconds: null,
      p90IntervalSeconds: null,
      targetWindowHitRate: null
    };
  }

  const totalMs = sortedSamplesMs.reduce((sum, sample) => sum + sample, 0);
  const inTargetCount = sortedSamplesMs.reduce((sum, sample) => {
    return sample >= 30_000 && sample <= 60_000 ? sum + 1 : sum;
  }, 0);
  return {
    totalActions: buffer.totalActions,
    averageIntervalSeconds: totalMs / sortedSamplesMs.length / 1000,
    medianIntervalSeconds: percentile(sortedSamplesMs, 0.5) / 1000,
    p90IntervalSeconds: percentile(sortedSamplesMs, 0.9) / 1000,
    targetWindowHitRate: inTargetCount / sortedSamplesMs.length
  };
}

function buildEraMilestones(
  events: TelemetryEvent[],
  state: GameState,
  ascendedAt: number
): TelemetryEraMilestones {
  const runStartAt = state.meta.createdAt;
  let toEra2At: number | null = null;
  let toEra3At: number | null = null;

  for (const event of events) {
    if (event.runId !== state.meta.runId) continue;
    if (event.type !== "era_transition") continue;
    const toEraRaw = event.details.toEra;
    const toEra = typeof toEraRaw === "number" ? Math.floor(toEraRaw) : Number.NaN;
    if (toEra === 2 && toEra2At === null) {
      toEra2At = event.at;
      continue;
    }
    if (toEra === 3 && toEra3At === null) {
      toEra3At = event.at;
    }
  }

  return {
    eraOneToTwoSeconds: toEra2At === null ? null : Math.max(0, Math.floor((toEra2At - runStartAt) / 1000)),
    eraTwoToThreeSeconds:
      toEra2At === null || toEra3At === null
        ? null
        : Math.max(0, Math.floor((toEra3At - toEra2At) / 1000)),
    eraThreeToAscensionSeconds:
      toEra3At === null ? null : Math.max(0, Math.floor((ascendedAt - toEra3At) / 1000))
  };
}

export function appendTelemetryRunSummary(
  state: GameState,
  nowMs: number,
  echoesGained: number
): TelemetryRunSummary {
  const events = loadTelemetryEvents();
  const actionCadenceByRun = loadActionCadenceByRun();
  const actionCadenceSummary = buildActionCadenceSummary(actionCadenceByRun[state.meta.runId]);
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
    miracleCountByTier: countMiraclesByTier(events, state.meta.runId),
    actionCadence: actionCadenceSummary,
    eraMilestones: buildEraMilestones(events, state, nowMs)
  };

  const nextSummaries = [...loadTelemetryRunSummaries(), summary].slice(-TELEMETRY_MAX_RUNS);
  saveTelemetryRunSummaries(nextSummaries);

  const allowedRunIds = new Set(nextSummaries.map((entry) => entry.runId));
  const trimmedEvents = trimEventsToAllowedRunIds(events, allowedRunIds);
  saveTelemetryEvents(trimmedEvents);

  const trimmedCadenceByRun = trimActionCadenceToAllowedRunIds(actionCadenceByRun, allowedRunIds);
  saveActionCadenceByRun(trimmedCadenceByRun);

  return summary;
}

export function createTelemetryExportPayload(): string {
  const payload: TelemetrySnapshot = {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    exportedAt: Date.now(),
    events: loadTelemetryEvents(),
    runSummaries: loadTelemetryRunSummaries(),
    peakBeliefPerSecondByRun: loadPeakBeliefByRun(),
    actionCadenceByRun: loadActionCadenceByRun()
  };
  return JSON.stringify(payload, null, 2);
}

export function readTelemetryForTests(): TelemetrySnapshot {
  return {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    exportedAt: Date.now(),
    events: loadTelemetryEvents(),
    runSummaries: loadTelemetryRunSummaries(),
    peakBeliefPerSecondByRun: loadPeakBeliefByRun(),
    actionCadenceByRun: loadActionCadenceByRun()
  };
}

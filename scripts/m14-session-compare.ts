import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type ScalarMap = Record<string, unknown>;

interface TelemetryEvent {
  type?: string;
  at?: number;
  runId?: string;
  details?: ScalarMap;
  snapshot?: ScalarMap;
}

interface ActionCadenceBuffer {
  runId?: string;
  startedAt?: number;
  lastActionAt?: number | null;
  totalActions?: number;
  intervalSamplesMs?: number[];
  actionCounts?: ScalarMap;
}

interface TelemetrySnapshot {
  events?: TelemetryEvent[];
  peakBeliefPerSecondByRun?: Record<string, number>;
  actionCadenceByRun?: Record<string, ActionCadenceBuffer>;
}

interface SessionSummary {
  label: string;
  runId: string | null;
  eraReached: 1 | 2 | 3;
  transitionedToEraTwo: boolean;
  transitionedToEraThree: boolean;
  sessionSpanSeconds: number | null;
  eraOneDurationSeconds: number | null;
  eraTwoDurationSeconds: number | null;
  eraOneToTwoBelief: number | null;
  eraTwoToThreeBelief: number | null;
  totalActions: number;
  averageIntervalSeconds: number | null;
  medianIntervalSeconds: number | null;
  p90IntervalSeconds: number | null;
  targetWindowHitRate: number | null;
  peakBeliefPerSecond: number | null;
  totalBeliefEarned: number | null;
  miracleUses: number;
  rivalSuppressions: number;
  veilCollapses: number;
  civilizationCollapses: number;
}

const ACTION_INTERVAL_MIN_MS = 1000;

function usage(): void {
  console.log(
    "Usage: npm run compare:m14 -- <telemetry-export-session-a.json> <telemetry-export-session-b.json>"
  );
}

function formatSeconds(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "n/a";
  const clamped = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatDelta(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return "n/a";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

function formatDeltaWithUnit(value: number | null, unit: string, digits = 1): string {
  const formatted = formatDelta(value, digits);
  return formatted === "n/a" ? formatted : `${formatted}${unit}`;
}

function diffNullable(after: number | null, before: number | null): number | null {
  if (after === null || before === null) return null;
  if (!Number.isFinite(after) || !Number.isFinite(before)) return null;
  return after - before;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function toObject(value: unknown): ScalarMap | null {
  return typeof value === "object" && value !== null ? (value as ScalarMap) : null;
}

function readSnapshot(pathArg: string): TelemetrySnapshot {
  const absolutePath = resolve(pathArg);
  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as TelemetrySnapshot;
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

function summarizeCadence(buffer: ActionCadenceBuffer | undefined): {
  totalActions: number;
  averageIntervalSeconds: number | null;
  medianIntervalSeconds: number | null;
  p90IntervalSeconds: number | null;
  targetWindowHitRate: number | null;
  startedAt: number | null;
  lastActionAt: number | null;
} {
  const startedAt = toFiniteNumber(buffer?.startedAt) ?? null;
  const lastActionAt = toFiniteNumber(buffer?.lastActionAt) ?? null;
  const totalActions = Math.max(0, Math.floor(toFiniteNumber(buffer?.totalActions) ?? 0));

  const samples = Array.isArray(buffer?.intervalSamplesMs)
    ? buffer.intervalSamplesMs
        .map((sample) => Math.max(0, Math.floor(toFiniteNumber(sample) ?? -1)))
        .filter((sample) => sample >= ACTION_INTERVAL_MIN_MS)
    : [];
  if (samples.length <= 0) {
    return {
      totalActions,
      averageIntervalSeconds: null,
      medianIntervalSeconds: null,
      p90IntervalSeconds: null,
      targetWindowHitRate: null,
      startedAt,
      lastActionAt
    };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const totalMs = sorted.reduce((sum, sample) => sum + sample, 0);
  const targetCount = sorted.reduce(
    (sum, sample) => (sample >= 30_000 && sample <= 60_000 ? sum + 1 : sum),
    0
  );

  return {
    totalActions,
    averageIntervalSeconds: totalMs / sorted.length / 1000,
    medianIntervalSeconds: percentile(sorted, 0.5) / 1000,
    p90IntervalSeconds: percentile(sorted, 0.9) / 1000,
    targetWindowHitRate: targetCount / sorted.length,
    startedAt,
    lastActionAt
  };
}

function getSessionRunId(snapshot: TelemetrySnapshot): string | null {
  const runIds = new Set<string>();
  for (const key of Object.keys(snapshot.actionCadenceByRun ?? {})) {
    if (key) runIds.add(key);
  }
  for (const event of snapshot.events ?? []) {
    if (event.runId) runIds.add(event.runId);
  }
  for (const key of Object.keys(snapshot.peakBeliefPerSecondByRun ?? {})) {
    if (key) runIds.add(key);
  }
  if (runIds.size <= 0) return null;

  let bestRunId: string | null = null;
  let bestTimestamp = -1;
  for (const runId of runIds) {
    let timestamp = -1;
    const cadence = snapshot.actionCadenceByRun?.[runId];
    const cadenceLast = toFiniteNumber(cadence?.lastActionAt) ?? toFiniteNumber(cadence?.startedAt) ?? -1;
    timestamp = Math.max(timestamp, cadenceLast);
    for (const event of snapshot.events ?? []) {
      if (event.runId !== runId) continue;
      timestamp = Math.max(timestamp, toFiniteNumber(event.at) ?? -1);
    }
    if (timestamp > bestTimestamp) {
      bestTimestamp = timestamp;
      bestRunId = runId;
    }
  }
  return bestRunId;
}

function summarizeSession(pathArg: string): SessionSummary {
  const snapshot = readSnapshot(pathArg);
  const runId = getSessionRunId(snapshot);
  if (!runId) {
    return {
      label: pathArg,
      runId: null,
      eraReached: 1,
      transitionedToEraTwo: false,
      transitionedToEraThree: false,
      sessionSpanSeconds: null,
      eraOneDurationSeconds: null,
      eraTwoDurationSeconds: null,
      eraOneToTwoBelief: null,
      eraTwoToThreeBelief: null,
      totalActions: 0,
      averageIntervalSeconds: null,
      medianIntervalSeconds: null,
      p90IntervalSeconds: null,
      targetWindowHitRate: null,
      peakBeliefPerSecond: null,
      totalBeliefEarned: null,
      miracleUses: 0,
      rivalSuppressions: 0,
      veilCollapses: 0,
      civilizationCollapses: 0
    };
  }

  const events = (snapshot.events ?? []).filter((event) => event.runId === runId);
  const cadence = summarizeCadence(snapshot.actionCadenceByRun?.[runId]);
  const eventTimes = events.map((event) => toFiniteNumber(event.at)).filter((value): value is number => value !== null);
  const eventSpanSeconds =
    eventTimes.length > 1 ? (Math.max(...eventTimes) - Math.min(...eventTimes)) / 1000 : null;
  const cadenceSpanSeconds =
    cadence.startedAt !== null && cadence.lastActionAt !== null && cadence.lastActionAt >= cadence.startedAt
      ? (cadence.lastActionAt - cadence.startedAt) / 1000
      : null;
  const sessionSpanSeconds = cadenceSpanSeconds ?? eventSpanSeconds ?? null;

  let eraReached: 1 | 2 | 3 = 1;
  let transitionedToEraTwo = false;
  let transitionedToEraThree = false;
  let totalBeliefEarned: number | null = null;
  let eraOneToTwoBelief: number | null = null;
  let eraTwoToThreeBelief: number | null = null;
  let eraOneToTwoAt: number | null = null;
  let eraTwoToThreeAt: number | null = null;
  let miracleUses = 0;
  let rivalSuppressions = 0;
  let veilCollapses = 0;
  let civilizationCollapses = 0;

  for (const event of events) {
    const snapshotEra = toFiniteNumber(toObject(event.snapshot)?.era);
    if (snapshotEra !== null) {
      eraReached = snapshotEra >= 3 ? 3 : snapshotEra >= 2 ? 2 : 1;
    }
    const beliefEarnedRaw = toFiniteNumber(toObject(event.snapshot)?.totalBeliefEarned);
    if (beliefEarnedRaw !== null) {
      totalBeliefEarned = Math.max(totalBeliefEarned ?? 0, beliefEarnedRaw);
    }

    if (event.type === "era_transition") {
      const toEraRaw = toFiniteNumber(toObject(event.details)?.toEra);
      if (toEraRaw !== null) {
        if (toEraRaw >= 2) transitionedToEraTwo = true;
        if (toEraRaw >= 3) transitionedToEraThree = true;
        eraReached = toEraRaw >= 3 ? 3 : toEraRaw >= 2 ? 2 : 1;
      }

      const eventAt = toFiniteNumber(event.at);
      const beliefAtTransition = toFiniteNumber(toObject(event.snapshot)?.totalBeliefEarned);
      if (toEraRaw === 2 && eraOneToTwoAt === null) {
        eraOneToTwoAt = eventAt;
        eraOneToTwoBelief = beliefAtTransition;
      }
      if (toEraRaw === 3 && eraTwoToThreeAt === null) {
        eraTwoToThreeAt = eventAt;
        eraTwoToThreeBelief = beliefAtTransition;
      }
    }
    if (event.type === "miracle_use") miracleUses += 1;
    if (event.type === "rival_suppressed") rivalSuppressions += 1;
    if (event.type === "veil_collapse") veilCollapses += 1;
    if (event.type === "civilization_collapse") civilizationCollapses += 1;
  }

  const runStartAt = cadence.startedAt ?? (eventTimes.length > 0 ? Math.min(...eventTimes) : null);
  const eraOneDurationSeconds =
    runStartAt !== null && eraOneToTwoAt !== null && eraOneToTwoAt > runStartAt
      ? (eraOneToTwoAt - runStartAt) / 1000
      : null;
  const eraTwoDurationSeconds =
    eraOneToTwoAt !== null && eraTwoToThreeAt !== null && eraTwoToThreeAt > eraOneToTwoAt
      ? (eraTwoToThreeAt - eraOneToTwoAt) / 1000
      : null;

  return {
    label: pathArg,
    runId,
    eraReached,
    transitionedToEraTwo,
    transitionedToEraThree,
    sessionSpanSeconds,
    eraOneDurationSeconds,
    eraTwoDurationSeconds,
    eraOneToTwoBelief,
    eraTwoToThreeBelief,
    totalActions: cadence.totalActions,
    averageIntervalSeconds: cadence.averageIntervalSeconds,
    medianIntervalSeconds: cadence.medianIntervalSeconds,
    p90IntervalSeconds: cadence.p90IntervalSeconds,
    targetWindowHitRate: cadence.targetWindowHitRate,
    peakBeliefPerSecond: toFiniteNumber(snapshot.peakBeliefPerSecondByRun?.[runId] ?? null),
    totalBeliefEarned,
    miracleUses,
    rivalSuppressions,
    veilCollapses,
    civilizationCollapses
  };
}

function printSession(title: string, session: SessionSummary): void {
  console.log(title);
  console.log(`- File: ${session.label}`);
  console.log(`- Run id: ${session.runId ?? "n/a"}`);
  console.log(`- Era reached: ${session.eraReached}`);
  console.log(`- Session span (estimate): ${formatSeconds(session.sessionSpanSeconds)}`);
  console.log(`- Era I duration (start -> Era II): ${formatSeconds(session.eraOneDurationSeconds)}`);
  console.log(`- Era II duration (Era II -> Era III): ${formatSeconds(session.eraTwoDurationSeconds)}`);
  console.log(
    `- Belief at Era II transition: ${
      session.eraOneToTwoBelief === null ? "n/a" : session.eraOneToTwoBelief.toLocaleString("en-US")
    }`
  );
  console.log(
    `- Belief at Era III transition: ${
      session.eraTwoToThreeBelief === null ? "n/a" : session.eraTwoToThreeBelief.toLocaleString("en-US")
    }`
  );
  console.log(`- Total actions: ${session.totalActions}`);
  console.log(`- Avg action interval: ${formatSeconds(session.averageIntervalSeconds)}`);
  console.log(`- Median action interval: ${formatSeconds(session.medianIntervalSeconds)}`);
  console.log(`- P90 action interval: ${formatSeconds(session.p90IntervalSeconds)}`);
  console.log(
    `- 30-60s cadence hit-rate: ${
      session.targetWindowHitRate === null ? "n/a" : `${Math.round(session.targetWindowHitRate * 100)}%`
    }`
  );
  console.log(
    `- Peak Belief/s: ${session.peakBeliefPerSecond === null ? "n/a" : session.peakBeliefPerSecond.toFixed(2)}`
  );
  console.log(
    `- Total Belief Earned: ${
      session.totalBeliefEarned === null ? "n/a" : session.totalBeliefEarned.toLocaleString("en-US")
    }`
  );
  console.log(`- Era transitions: to II=${session.transitionedToEraTwo}, to III=${session.transitionedToEraThree}`);
  console.log(
    `- Events: miracles=${session.miracleUses}, rival suppressions=${session.rivalSuppressions}, veil collapses=${session.veilCollapses}, civ collapses=${session.civilizationCollapses}`
  );
}

function compareSessions(a: SessionSummary, b: SessionSummary): void {
  console.log("Comparison (Session B - Session A)");
  console.log(`- Era reached delta: ${b.eraReached - a.eraReached}`);
  console.log(
    `- Session span delta: ${formatDeltaWithUnit(
      diffNullable(b.sessionSpanSeconds, a.sessionSpanSeconds),
      "s",
      0
    )}`
  );
  console.log(
    `- Era I duration delta: ${formatDeltaWithUnit(
      diffNullable(b.eraOneDurationSeconds, a.eraOneDurationSeconds),
      "s",
      0
    )}`
  );
  console.log(
    `- Era II duration delta: ${formatDeltaWithUnit(
      diffNullable(b.eraTwoDurationSeconds, a.eraTwoDurationSeconds),
      "s",
      0
    )}`
  );
  console.log(
    `- Belief-at-Era-II delta: ${formatDelta(diffNullable(b.eraOneToTwoBelief, a.eraOneToTwoBelief), 0)}`
  );
  console.log(
    `- Belief-at-Era-III delta: ${formatDelta(diffNullable(b.eraTwoToThreeBelief, a.eraTwoToThreeBelief), 0)}`
  );
  console.log(`- Total actions delta: ${formatDelta(diffNullable(b.totalActions, a.totalActions), 0)}`);
  console.log(
    `- Avg interval delta: ${formatDeltaWithUnit(
      diffNullable(b.averageIntervalSeconds, a.averageIntervalSeconds),
      "s",
      1
    )} (lower is faster cadence)`
  );
  const cadenceHitDelta = diffNullable(b.targetWindowHitRate, a.targetWindowHitRate);
  console.log(
    `- Cadence hit-rate delta: ${formatDeltaWithUnit(
      cadenceHitDelta === null ? null : cadenceHitDelta * 100,
      "pp",
      1
    )}`
  );
  console.log(
    `- Peak Belief/s delta: ${formatDelta(
      diffNullable(b.peakBeliefPerSecond, a.peakBeliefPerSecond),
      2
    )}`
  );
  console.log(
    `- Total Belief Earned delta: ${formatDelta(
      diffNullable(b.totalBeliefEarned, a.totalBeliefEarned),
      0
    )}`
  );
  console.log(`- Miracle use delta: ${formatDelta(diffNullable(b.miracleUses, a.miracleUses), 0)}`);
  console.log(
    `- Rival suppression delta: ${formatDelta(diffNullable(b.rivalSuppressions, a.rivalSuppressions), 0)}`
  );
  console.log(`- Veil collapse delta: ${formatDelta(diffNullable(b.veilCollapses, a.veilCollapses), 0)}`);
  console.log(
    `- Civilization collapse delta: ${formatDelta(
      diffNullable(b.civilizationCollapses, a.civilizationCollapses),
      0
    )}`
  );

  const eraISpeedRatio =
    a.eraOneDurationSeconds !== null &&
    b.eraOneDurationSeconds !== null &&
    a.eraOneDurationSeconds > 0
      ? b.eraOneDurationSeconds / a.eraOneDurationSeconds
      : null;
  const eraIISpeedRatio =
    a.eraTwoDurationSeconds !== null &&
    b.eraTwoDurationSeconds !== null &&
    a.eraTwoDurationSeconds > 0
      ? b.eraTwoDurationSeconds / a.eraTwoDurationSeconds
      : null;

  console.log(
    `- Era I speed ratio (B/A): ${eraISpeedRatio === null ? "n/a" : eraISpeedRatio.toFixed(2)}`
  );
  console.log(
    `- Era II speed ratio (B/A): ${eraIISpeedRatio === null ? "n/a" : eraIISpeedRatio.toFixed(2)}`
  );
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    usage();
    process.exitCode = 1;
    return;
  }

  let sessionA: SessionSummary;
  let sessionB: SessionSummary;
  try {
    sessionA = summarizeSession(args[0]);
    sessionB = summarizeSession(args[1]);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown read/parse error.";
    console.error(`Failed to read telemetry export: ${reason}`);
    process.exitCode = 1;
    return;
  }

  printSession("Session A", sessionA);
  console.log("");
  printSession("Session B", sessionB);
  console.log("");
  compareSessions(sessionA, sessionB);
}

main();

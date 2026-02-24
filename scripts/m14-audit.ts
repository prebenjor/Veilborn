import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface TelemetryActionCadenceSummary {
  totalActions: number;
  averageIntervalSeconds: number | null;
  medianIntervalSeconds: number | null;
  p90IntervalSeconds: number | null;
  targetWindowHitRate: number | null;
}

interface TelemetryEraMilestones {
  eraOneToTwoSeconds: number | null;
  eraTwoToThreeSeconds: number | null;
  eraThreeToAscensionSeconds: number | null;
}

interface TelemetryRunSummary {
  id: string;
  runId?: string;
  runNumber: number;
  ascendedAt?: number;
  runSeconds: number;
  totalBeliefEarned: number;
  echoesGained: number;
  actionCadence?: TelemetryActionCadenceSummary;
  eraMilestones?: TelemetryEraMilestones;
}

interface TelemetrySnapshot {
  runSummaries?: TelemetryRunSummary[];
}

const TARGET_RUN_SECONDS = new Map<number, number>([
  [1, 6.5 * 60 * 60],
  [2, 4.0 * 60 * 60],
  [3, 2.5 * 60 * 60],
  [5, 1.2 * 60 * 60],
  [8, 45 * 60]
]);

interface GroupedRunStats {
  runNumber: number;
  targetSeconds: number | null;
  sampleCount: number;
  medianRunSeconds: number;
  averageRunSeconds: number;
  medianDeltaPct: number | null;
}

function formatDuration(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function usage(): void {
  console.log("Usage: npm run audit:m14 -- <telemetry-export-1.json> [telemetry-export-2.json ...]");
}

function readSnapshot(pathArg: string): TelemetrySnapshot {
  const absolutePath = resolve(pathArg);
  const raw = readFileSync(absolutePath, "utf8");
  return JSON.parse(raw) as TelemetrySnapshot;
}

function interpolateTargetSeconds(runNumber: number): number | null {
  if (TARGET_RUN_SECONDS.has(runNumber)) {
    return TARGET_RUN_SECONDS.get(runNumber) ?? null;
  }

  if (runNumber === 4) {
    const run3 = TARGET_RUN_SECONDS.get(3) ?? 0;
    const run5 = TARGET_RUN_SECONDS.get(5) ?? 0;
    return Math.round((run3 + run5) / 2);
  }

  if (runNumber === 6 || runNumber === 7) {
    const run5 = TARGET_RUN_SECONDS.get(5) ?? 0;
    const run8 = TARGET_RUN_SECONDS.get(8) ?? 0;
    const ratio = (runNumber - 5) / 3;
    return Math.round(run5 + (run8 - run5) * ratio);
  }

  if (runNumber >= 8) {
    return TARGET_RUN_SECONDS.get(8) ?? null;
  }

  return null;
}

function evaluateTiming(summary: TelemetryRunSummary): { level: "PASS" | "WARN" | "FAIL"; text: string } {
  const targetSeconds = interpolateTargetSeconds(summary.runNumber);
  if (targetSeconds === null) {
    return { level: "WARN", text: `Run ${summary.runNumber}: no target configured.` };
  }

  const actual = summary.runSeconds;
  const deltaPct = ((actual - targetSeconds) / targetSeconds) * 100;

  if (summary.runNumber >= 8) {
    if (actual < targetSeconds) {
      return {
        level: "FAIL",
        text: `Run ${summary.runNumber}: ${formatDuration(actual)} is below 45m floor (${formatDuration(
          targetSeconds
        )}).`
      };
    }
    return {
      level: "PASS",
      text: `Run ${summary.runNumber}: ${formatDuration(actual)} preserves 45m floor.`
    };
  }

  const absDelta = Math.abs(deltaPct);
  if (absDelta <= 20) {
    return {
      level: "PASS",
      text: `Run ${summary.runNumber}: ${formatDuration(actual)} vs target ${formatDuration(
        targetSeconds
      )} (${deltaPct.toFixed(1)}%).`
    };
  }
  if (absDelta <= 35) {
    return {
      level: "WARN",
      text: `Run ${summary.runNumber}: ${formatDuration(actual)} vs target ${formatDuration(
        targetSeconds
      )} (${deltaPct.toFixed(1)}%).`
    };
  }
  return {
    level: "FAIL",
    text: `Run ${summary.runNumber}: ${formatDuration(actual)} vs target ${formatDuration(
      targetSeconds
    )} (${deltaPct.toFixed(1)}%).`
  };
}

function evaluateCadence(summary: TelemetryRunSummary): {
  level: "PASS" | "WARN" | "FAIL";
  text: string;
} {
  const cadence = summary.actionCadence;
  if (!cadence || cadence.totalActions <= 0) {
    return {
      level: "WARN",
      text: `Run ${summary.runNumber}: no action cadence telemetry yet.`
    };
  }
  if (cadence.averageIntervalSeconds === null || cadence.targetWindowHitRate === null) {
    return {
      level: "WARN",
      text: `Run ${summary.runNumber}: insufficient cadence intervals (need at least 2 actions).`
    };
  }

  const targetHitRate = cadence.targetWindowHitRate;
  const avg = cadence.averageIntervalSeconds;
  const median = cadence.medianIntervalSeconds ?? avg;

  if (targetHitRate >= 0.5 && avg >= 20 && avg <= 75) {
    return {
      level: "PASS",
      text: `Run ${summary.runNumber}: avg ${formatDuration(avg)}, median ${formatDuration(
        median
      )}, ${Math.round(targetHitRate * 100)}% in 30-60s window.`
    };
  }

  if (targetHitRate >= 0.35) {
    return {
      level: "WARN",
      text: `Run ${summary.runNumber}: avg ${formatDuration(avg)}, median ${formatDuration(
        median
      )}, ${Math.round(targetHitRate * 100)}% in 30-60s window.`
    };
  }

  return {
    level: "FAIL",
    text: `Run ${summary.runNumber}: avg ${formatDuration(avg)}, median ${formatDuration(
      median
    )}, ${Math.round(targetHitRate * 100)}% in 30-60s window.`
  };
}

function evaluateEraPacing(summary: TelemetryRunSummary): {
  level: "PASS" | "WARN" | "FAIL";
  text: string;
} {
  const milestones = summary.eraMilestones;
  if (!milestones) {
    return {
      level: "WARN",
      text: `Run ${summary.runNumber}: no era pacing telemetry yet.`
    };
  }

  const eraOne = milestones.eraOneToTwoSeconds;
  const eraTwo = milestones.eraTwoToThreeSeconds;
  if (eraOne === null || eraTwo === null || eraOne <= 0) {
    return {
      level: "WARN",
      text: `Run ${summary.runNumber}: incomplete era transition data.`
    };
  }

  const ratio = eraTwo / eraOne;
  const detail = `Run ${summary.runNumber}: Era I ${formatDuration(eraOne)} -> Era II ${formatDuration(
    eraTwo
  )} (ratio ${ratio.toFixed(2)}).`;

  if (ratio < 0.25) {
    return { level: "FAIL", text: `${detail} Era II appears abruptly fast.` };
  }
  if (ratio < 0.45 || ratio > 0.9) {
    return { level: "WARN", text: detail };
  }
  return { level: "PASS", text: detail };
}

function printLine(level: "PASS" | "WARN" | "FAIL", text: string): void {
  const prefix = level === "PASS" ? "[PASS]" : level === "WARN" ? "[WARN]" : "[FAIL]";
  console.log(`${prefix} ${text}`);
}

function numericMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[midpoint];
  return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function groupByRunNumber(runSummaries: TelemetryRunSummary[]): GroupedRunStats[] {
  const grouped = new Map<number, TelemetryRunSummary[]>();
  for (const summary of runSummaries) {
    const bucket = grouped.get(summary.runNumber) ?? [];
    bucket.push(summary);
    grouped.set(summary.runNumber, bucket);
  }

  const stats: GroupedRunStats[] = [];
  for (const [runNumber, summaries] of grouped.entries()) {
    const runSeconds = summaries.map((entry) => entry.runSeconds);
    const averageRunSeconds = runSeconds.reduce((sum, value) => sum + value, 0) / runSeconds.length;
    const medianRunSeconds = numericMedian(runSeconds);
    const targetSeconds = interpolateTargetSeconds(runNumber);
    const medianDeltaPct =
      targetSeconds === null ? null : ((medianRunSeconds - targetSeconds) / targetSeconds) * 100;
    stats.push({
      runNumber,
      targetSeconds,
      sampleCount: summaries.length,
      averageRunSeconds,
      medianRunSeconds,
      medianDeltaPct
    });
  }

  return stats.sort((a, b) => a.runNumber - b.runNumber);
}

function getEraPacingRatioSamples(runSummaries: TelemetryRunSummary[]): number[] {
  return runSummaries
    .map((summary) => {
      const eraOne = summary.eraMilestones?.eraOneToTwoSeconds ?? null;
      const eraTwo = summary.eraMilestones?.eraTwoToThreeSeconds ?? null;
      if (eraOne === null || eraTwo === null || eraOne <= 0) return null;
      return eraTwo / eraOne;
    })
    .filter((value): value is number => value !== null);
}

function getCadenceHitRateSamples(runSummaries: TelemetryRunSummary[]): number[] {
  return runSummaries
    .map((summary) => summary.actionCadence?.targetWindowHitRate ?? null)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function printAggregateTiming(grouped: GroupedRunStats[]): void {
  console.log("Aggregate timing by run number:");
  if (grouped.length <= 0) {
    console.log("- No run summaries available.");
    return;
  }

  for (const entry of grouped) {
    if (entry.targetSeconds === null || entry.medianDeltaPct === null) {
      console.log(
        `- Run ${entry.runNumber} (n=${entry.sampleCount}): median ${formatDuration(
          entry.medianRunSeconds
        )}, no target configured.`
      );
      continue;
    }
    console.log(
      `- Run ${entry.runNumber} (n=${entry.sampleCount}): median ${formatDuration(
        entry.medianRunSeconds
      )} vs target ${formatDuration(entry.targetSeconds)} (${entry.medianDeltaPct.toFixed(1)}%).`
    );
  }
}

function printRecommendations(grouped: GroupedRunStats[], runSummaries: TelemetryRunSummary[]): void {
  const recommendations: string[] = [];

  const run1 = grouped.find((entry) => entry.runNumber === 1);
  if (run1?.medianDeltaPct !== null && run1?.medianDeltaPct !== undefined) {
    if (run1.medianDeltaPct < -15) {
      recommendations.push(
        "Run 1 is too fast: increase ERA_ONE_BELIEF_GATE_BASE by 5-10% (10000 -> 10500-11000)."
      );
    } else if (run1.medianDeltaPct > 15) {
      recommendations.push(
        "Run 1 is too slow: decrease ERA_ONE_BELIEF_GATE_BASE by 5-10% (10000 -> 9500-9000)."
      );
    }
  }

  const run2 = grouped.find((entry) => entry.runNumber === 2);
  if (run2?.medianDeltaPct !== null && run2?.medianDeltaPct !== undefined) {
    if (run2.medianDeltaPct < -15) {
      recommendations.push(
        "Run 2 is too fast: increase ERA_TWO_BELIEF_GATE_BASE by 10-20% (275000 -> 302500-330000)."
      );
      recommendations.push(
        "If Run 2 remains too fast after gate tuning, raise CULT_COST_SCALAR by +0.03 to +0.08 (2.00 -> 2.03-2.08)."
      );
    } else if (run2.medianDeltaPct > 15) {
      recommendations.push(
        "Run 2 is too slow: decrease ERA_TWO_BELIEF_GATE_BASE by 10-15% (275000 -> 247500-233750)."
      );
    }
  }

  const run3 = grouped.find((entry) => entry.runNumber === 3);
  if (run3?.medianDeltaPct !== null && run3?.medianDeltaPct !== undefined) {
    if (run3.medianDeltaPct < -20) {
      recommendations.push(
        "Run 3 is too fast: increase UNRAVELING_BELIEF_GATE by 10-20% (5000000 -> 5500000-6000000)."
      );
    } else if (run3.medianDeltaPct > 20) {
      recommendations.push(
        "Run 3 is too slow: reduce UNRAVELING_BELIEF_GATE by 10-15% (5000000 -> 4500000-4250000)."
      );
    }
  }

  const pacingRatios = getEraPacingRatioSamples(runSummaries);
  if (pacingRatios.length > 0) {
    const ratioMedian = numericMedian(pacingRatios);
    if (ratioMedian < 0.45) {
      recommendations.push(
        "Era II accelerates too abruptly versus Era I: first apply +10% ERA_TWO_BELIEF_GATE_BASE, then re-audit."
      );
    } else if (ratioMedian > 0.9) {
      recommendations.push(
        "Era II pacing is too close to Era I: reduce ERA_TWO_BELIEF_GATE_BASE by 5-10% if run timing also trends slow."
      );
    }
  }

  const cadenceHitRates = getCadenceHitRateSamples(runSummaries);
  if (cadenceHitRates.length > 0) {
    const cadenceMedian = numericMedian(cadenceHitRates);
    if (cadenceMedian < 0.35) {
      recommendations.push(
        "Action cadence hit-rate is low (<35%): investigate action affordability/UI nudges before heavy economy changes."
      );
    }
  }

  console.log("");
  console.log("Tuning recommendations:");
  if (recommendations.length <= 0) {
    console.log("- No urgent retune suggested from current sample set.");
    return;
  }
  for (const recommendation of recommendations) {
    console.log(`- ${recommendation}`);
  }
}

function dedupeSummaries(runSummaries: TelemetryRunSummary[]): TelemetryRunSummary[] {
  const byKey = new Map<string, TelemetryRunSummary>();
  for (const summary of runSummaries) {
    const key = summary.runId
      ? `${summary.runId}:${summary.runNumber}`
      : `${summary.id}:${summary.runNumber}:${summary.ascendedAt ?? 0}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, summary);
      continue;
    }
    const existingAt = existing.ascendedAt ?? 0;
    const nextAt = summary.ascendedAt ?? 0;
    if (nextAt >= existingAt) {
      byKey.set(key, summary);
    }
  }
  return [...byKey.values()];
}

function main(): void {
  const pathArgs = process.argv.slice(2);
  if (pathArgs.length <= 0) {
    usage();
    process.exitCode = 1;
    return;
  }

  const allSummaries: TelemetryRunSummary[] = [];
  for (const pathArg of pathArgs) {
    let snapshot: TelemetrySnapshot;
    try {
      snapshot = readSnapshot(pathArg);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown file read/parse error.";
      console.error(`Failed to read telemetry export (${pathArg}): ${reason}`);
      process.exitCode = 1;
      return;
    }
    const runSummaries = Array.isArray(snapshot.runSummaries) ? snapshot.runSummaries : [];
    allSummaries.push(...runSummaries);
  }

  const runSummaries = dedupeSummaries(allSummaries);
  if (runSummaries.length <= 0) {
    console.log("No ascended run summaries found in provided telemetry export files.");
    console.log(
      "Use non-ascended session compare instead: npm run compare:m14 -- <session-a.json> <session-b.json>"
    );
    return;
  }

  const ordered = [...runSummaries].sort((a, b) => {
    if (a.runNumber !== b.runNumber) return a.runNumber - b.runNumber;
    return (a.ascendedAt ?? 0) - (b.ascendedAt ?? 0);
  });
  let failCount = 0;
  let warnCount = 0;

  console.log(`M14 audit on ${ordered.length} run summaries from ${pathArgs.length} export file(s)`);
  console.log("");
  for (const summary of ordered) {
    const timing = evaluateTiming(summary);
    const cadence = evaluateCadence(summary);
    const pacing = evaluateEraPacing(summary);

    printLine(timing.level, timing.text);
    printLine(cadence.level, cadence.text);
    printLine(pacing.level, pacing.text);
    console.log("");

    for (const level of [timing.level, cadence.level, pacing.level]) {
      if (level === "FAIL") failCount += 1;
      if (level === "WARN") warnCount += 1;
    }
  }

  console.log(
    `Summary: ${failCount} fail, ${warnCount} warn, ${
      ordered.length * 3 - failCount - warnCount
    } pass checks.`
  );
  console.log("");
  printAggregateTiming(groupByRunNumber(ordered));
  printRecommendations(groupByRunNumber(ordered), ordered);
  if (failCount > 0) {
    process.exitCode = 2;
  }
}

main();

import { useRef } from "react";
import { formatDurationCompact } from "../../core/ui/timeFormat";
import { formatResource } from "../../core/ui/numberFormat";
import { MIRACLE_NAMES } from "../../core/state/gameState";

interface StatsDrawerProps {
  presentation?: "floating" | "embedded";
  era: 1 | 2 | 3;
  runSeconds: number;
  totalTicks: number;
  totalBeliefEarned: number;
  beliefBreakdown: {
    totalPerSecond: number;
    prophetPerSecond: number;
    cultPerSecond: number;
    followerPerSecond: number;
  };
  secondsSinceLastEvent: number;
  influenceBreakdown: {
    totalPerSecond: number;
    basePerSecond: number;
    shrinePerSecond: number;
    cultPerSecond: number;
    echoPerSecond: number;
    shrineCount: number;
    cap: number;
    fillTimeSeconds: number | null;
  };
  shrinesBuilt: number;
  miracleReserve: number;
  miracleReserveCap: number;
  currentInfluence: number;
  currentFollowers: number;
  devotionStacks: number;
  devotionPathLabel: string;
  passiveFollowerRate: number;
  rivalFollowerDrainPerSecond: number;
  runHistory: Array<{
    id: string;
    runNumber: number;
    runSeconds: number;
    totalBeliefEarned: number;
    echoesGained: number;
    peakBeliefPerSecond: number;
    veilCollapseCount: number;
    civilizationCollapseCount: number;
    miracleCountByTier: Record<1 | 2 | 3 | 4, number>;
    actionCadence: {
      totalActions: number;
      averageIntervalSeconds: number | null;
      medianIntervalSeconds: number | null;
      p90IntervalSeconds: number | null;
      targetWindowHitRate: number | null;
    };
    eraMilestones: {
      eraOneToTwoSeconds: number | null;
      eraTwoToThreeSeconds: number | null;
      eraThreeToAscensionSeconds: number | null;
    };
  }>;
  snapshotLabel: string | null;
  saveImportStatus: string | null;
  saveImportWarnings: string[];
  telemetryStatus: string | null;
  onExportSave: () => void;
  onImportSave: (file: File) => void;
  onRestoreSnapshot: () => void;
  onExportTelemetry: () => void;
  onDumpTelemetryToConsole: () => void;
  devToolsEnabled: boolean;
  devToolsStatus: string | null;
  onToggleDevTools: () => void;
  onDevBoostResources: () => void;
  onDevPrimeEraOneGate: () => void;
  onDevPrimeEraTwoGate: () => void;
  onDevJumpToEraTwo: () => void;
  onDevJumpToEraThree: () => void;
}

export function StatsDrawer({
  presentation = "floating",
  era,
  runSeconds,
  totalTicks,
  totalBeliefEarned,
  beliefBreakdown,
  secondsSinceLastEvent,
  influenceBreakdown,
  shrinesBuilt,
  miracleReserve,
  miracleReserveCap,
  currentInfluence,
  currentFollowers,
  devotionStacks,
  devotionPathLabel,
  passiveFollowerRate,
  rivalFollowerDrainPerSecond,
  runHistory,
  snapshotLabel,
  saveImportStatus,
  saveImportWarnings,
  telemetryStatus,
  onExportSave,
  onImportSave,
  onRestoreSnapshot,
  onExportTelemetry,
  onDumpTelemetryToConsole,
  devToolsEnabled,
  devToolsStatus,
  onToggleDevTools,
  onDevBoostResources,
  onDevPrimeEraOneGate,
  onDevPrimeEraTwoGate,
  onDevJumpToEraTwo,
  onDevJumpToEraThree
}: StatsDrawerProps) {
  const saveImportInputRef = useRef<HTMLInputElement | null>(null);
  const isEraTwoPlus = era >= 2;
  const isEraThree = era >= 3;
  const devotionStackCount = Math.max(0, Math.min(3, Math.floor(devotionStacks)));
  const devotionDots = [0, 1, 2]
    .map((index) => (index < devotionStackCount ? "●" : "○"))
    .join(" ");
  const recentRuns = [...runHistory].reverse().slice(0, 5);
  const isEmbedded = presentation === "embedded";

  return (
    <details
      open={isEmbedded ? true : undefined}
      className={
        isEmbedded
          ? "group w-full text-xs text-veil/80"
          : "group fixed bottom-3 right-3 z-40 w-52 rounded-xl border border-white/20 bg-black/55 p-2 text-xs text-veil/80 backdrop-blur-sm md:w-64"
      }
    >
      <summary
        onClick={isEmbedded ? (event) => event.preventDefault() : undefined}
        className={`list-none select-none font-medium tracking-[0.2em] text-veil/90 ${
          isEmbedded ? "cursor-default" : "cursor-pointer"
        }`}
      >
        STATS
      </summary>
      <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[11px] text-veil/70">
        <dt>Run Time</dt>
        <dd>{formatDurationCompact(runSeconds)}</dd>
        <dt>Engine Ticks</dt>
        <dd>{formatResource(totalTicks)}</dd>
        <dt>Total Belief</dt>
        <dd>{formatResource(totalBeliefEarned)}</dd>
        <dt>Since Last Event</dt>
        <dd>{formatDurationCompact(secondsSinceLastEvent)}</dd>
      </dl>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Belief</p>
        <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          <dt>Total</dt>
          <dd>{formatResource(beliefBreakdown.totalPerSecond, 2)} /s</dd>
          <dt>Prophets</dt>
          <dd>{formatResource(beliefBreakdown.prophetPerSecond, 2)} /s</dd>
          {isEraTwoPlus ? (
            <>
              <dt>Cults</dt>
              <dd>{formatResource(beliefBreakdown.cultPerSecond, 2)} /s</dd>
            </>
          ) : null}
          {beliefBreakdown.followerPerSecond > 0 ? (
            <>
              <dt>Followers</dt>
              <dd>{formatResource(beliefBreakdown.followerPerSecond, 2)} /s</dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Followers</p>
        <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          <dt>Current</dt>
          <dd>{formatResource(currentFollowers)}</dd>
          {isEraThree ? (
            <>
              <dt>Arriving passively</dt>
              <dd>{formatResource(passiveFollowerRate, 1)} /s</dd>
            </>
          ) : null}
          {isEraTwoPlus && rivalFollowerDrainPerSecond > 0 ? (
            <>
              <dt>Rival drain</dt>
              <dd>-{formatResource(rivalFollowerDrainPerSecond, 1)} /s</dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Devotion</p>
        <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          {isEraTwoPlus ? (
            <>
              <dt>Path</dt>
              <dd>{devotionPathLabel}</dd>
            </>
          ) : null}
          <dt>Stacks</dt>
          <dd>
            {devotionDots} {"\u00b7"} {formatResource(devotionStackCount)} / 3
          </dd>
        </dl>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Influence</p>
        <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          <dt>Regen per second</dt>
          <dd>{formatResource(influenceBreakdown.totalPerSecond, 1)} /s</dd>
          <dt>Base (prophets)</dt>
          <dd>{formatResource(influenceBreakdown.basePerSecond, 1)} /s</dd>
          {isEraTwoPlus ? (
            <>
              <dt>Shrines ({formatResource(influenceBreakdown.shrineCount)})</dt>
              <dd>{formatResource(influenceBreakdown.shrinePerSecond, 1)} /s</dd>
              <dt>Shrines built</dt>
              <dd>{formatResource(shrinesBuilt)}</dd>
              <dt>Cults (active)</dt>
              <dd>{formatResource(influenceBreakdown.cultPerSecond, 1)} /s</dd>
              {influenceBreakdown.echoPerSecond > 0 ? (
                <>
                  <dt>Resonant Word</dt>
                  <dd>{formatResource(influenceBreakdown.echoPerSecond, 1)} /s</dd>
                </>
              ) : null}
            </>
          ) : null}
          <dt>Cap</dt>
          <dd>{formatResource(influenceBreakdown.cap)}</dd>
          {isEraThree ? (
            <>
              <dt>Miracle reserve</dt>
              <dd>
                {formatResource(miracleReserve)} / {formatResource(miracleReserveCap)}
              </dd>
              <dt>Miracle power</dt>
              <dd>{formatResource(currentInfluence + miracleReserve)}</dd>
            </>
          ) : null}
          <dt>Fill time (from 0)</dt>
          <dd>
            {influenceBreakdown.fillTimeSeconds === null
              ? "-"
              : `~${formatDurationCompact(influenceBreakdown.fillTimeSeconds)}`}
          </dd>
        </dl>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Run History</p>
        {recentRuns.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {recentRuns.map((run) => {
              const miracleTotal =
                run.miracleCountByTier[1] +
                run.miracleCountByTier[2] +
                run.miracleCountByTier[3] +
                run.miracleCountByTier[4];
              const namedMiracleCounts = ([1, 2, 3, 4] as const)
                .filter((tier) => run.miracleCountByTier[tier] > 0)
                .map(
                  (tier) =>
                    `${MIRACLE_NAMES[tier]} · ${formatResource(run.miracleCountByTier[tier])} this run`
                )
                .join(" · ");
              return (
                <li key={run.id} className="rounded border border-white/10 bg-black/20 px-2 py-1">
                  <p>
                    Run {formatResource(run.runNumber)} | {formatDurationCompact(run.runSeconds)} | +
                    {formatResource(run.echoesGained)}E
                  </p>
                  <p className="text-[10px] text-veil/65">
                    Peak {formatResource(run.peakBeliefPerSecond, 2)}/s | Belief{" "}
                    {formatResource(run.totalBeliefEarned)}
                  </p>
                  <p className="text-[10px] text-veil/65">
                    Collapses V:{formatResource(run.veilCollapseCount)} C:
                    {formatResource(run.civilizationCollapseCount)} | Miracles {formatResource(miracleTotal)}
                  </p>
                  {namedMiracleCounts ? (
                    <p className="text-[10px] text-veil/65">{namedMiracleCounts}</p>
                  ) : null}
                  <p className="text-[10px] text-veil/65">
                    {run.actionCadence.averageIntervalSeconds === null
                      ? "Cadence n/a"
                      : `Cadence ~${formatDurationCompact(run.actionCadence.averageIntervalSeconds)} · ${Math.round(
                          (run.actionCadence.targetWindowHitRate ?? 0) * 100
                        )}% in target`}
                  </p>
                  {(run.eraMilestones.eraOneToTwoSeconds !== null ||
                    run.eraMilestones.eraTwoToThreeSeconds !== null) ? (
                    <p className="text-[10px] text-veil/65">
                      {run.eraMilestones.eraOneToTwoSeconds !== null
                        ? `Era I ${formatDurationCompact(run.eraMilestones.eraOneToTwoSeconds)}`
                        : "Era I n/a"}
                      {" · "}
                      {run.eraMilestones.eraTwoToThreeSeconds !== null
                        ? `Era II ${formatDurationCompact(run.eraMilestones.eraTwoToThreeSeconds)}`
                        : "Era II n/a"}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-1 text-[10px] text-veil/65">No ascended runs recorded yet.</p>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={onExportTelemetry}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={onDumpTelemetryToConsole}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            Dump Console
          </button>
        </div>
        {telemetryStatus ? <p className="mt-1 text-[10px] text-veil/65">{telemetryStatus}</p> : null}
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Save Archive</p>
        {snapshotLabel ? <p className="mt-1 text-[10px] text-veil/65">Snapshot: {snapshotLabel}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={onExportSave}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            Export Save
          </button>
          <button
            type="button"
            onClick={() => saveImportInputRef.current?.click()}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            Import Save
          </button>
          <button
            type="button"
            onClick={onRestoreSnapshot}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            Restore Snapshot
          </button>
          <input
            ref={saveImportInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportSave(file);
              event.currentTarget.value = "";
            }}
          />
        </div>
        {saveImportStatus ? <p className="mt-1 text-[10px] text-veil/65">{saveImportStatus}</p> : null}
        {saveImportWarnings.length > 0 ? (
          <ul className="mt-1 space-y-1 text-[10px] text-ember/80">
            {saveImportWarnings.map((warning, index) => (
              <li key={`stats-save-warning-${index}`}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-veil/75">
        <p className="uppercase tracking-[0.16em] text-veil/80">Dev Tools</p>
        <p className="mt-1 text-[10px] text-veil/65">{devToolsEnabled ? "Unlocked" : "Locked"}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={onToggleDevTools}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            {devToolsEnabled ? "Lock" : "Unlock"}
          </button>
          {devToolsEnabled ? (
            <>
              <button
                type="button"
                onClick={onDevBoostResources}
                className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
              >
                Boost
              </button>
              {era === 1 ? (
                <button
                  type="button"
                  onClick={onDevPrimeEraOneGate}
                  className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
                >
                  Prime Era I
                </button>
              ) : null}
              {era === 2 ? (
                <button
                  type="button"
                  onClick={onDevPrimeEraTwoGate}
                  className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
                >
                  Prime Era II
                </button>
              ) : null}
              {era < 2 ? (
                <button
                  type="button"
                  onClick={onDevJumpToEraTwo}
                  className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
                >
                  Jump Era II
                </button>
              ) : null}
              {era < 3 ? (
                <button
                  type="button"
                  onClick={onDevJumpToEraThree}
                  className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
                >
                  Jump Era III
                </button>
              ) : null}
            </>
          ) : null}
        </div>
        {devToolsStatus ? <p className="mt-1 text-[10px] text-veil/65">{devToolsStatus}</p> : null}
      </div>

    </details>
  );
}

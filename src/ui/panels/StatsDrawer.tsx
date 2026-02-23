import { formatDurationCompact } from "../../core/ui/timeFormat";
import { formatResource } from "../../core/ui/numberFormat";

interface StatsDrawerProps {
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
  whispersInWindow: number;
  whisperResetInSeconds: number;
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
  currentFollowers: number;
  devotionStacks: number;
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
  }>;
  telemetryStatus: string | null;
  audioControls: {
    supported: boolean;
    mode: "idle" | "running" | "fallback" | "error";
    muted: boolean;
    message: string | null;
  };
  onEnableAudio: () => Promise<void>;
  onDisableAudio: () => void;
  onToggleAudioMute: () => void;
  onUseAudioFallback: () => void;
  onExportTelemetry: () => void;
  onDumpTelemetryToConsole: () => void;
}

export function StatsDrawer({
  era,
  runSeconds,
  totalTicks,
  totalBeliefEarned,
  beliefBreakdown,
  secondsSinceLastEvent,
  whispersInWindow,
  whisperResetInSeconds,
  influenceBreakdown,
  shrinesBuilt,
  currentFollowers,
  devotionStacks,
  passiveFollowerRate,
  rivalFollowerDrainPerSecond,
  runHistory,
  telemetryStatus,
  audioControls,
  onEnableAudio,
  onDisableAudio,
  onToggleAudioMute,
  onUseAudioFallback,
  onExportTelemetry,
  onDumpTelemetryToConsole
}: StatsDrawerProps) {
  const isEraTwoPlus = era >= 2;
  const isEraThree = era >= 3;
  const devotionStackCount = Math.max(0, Math.min(3, Math.floor(devotionStacks)));
  const devotionDots = [0, 1, 2]
    .map((index) => (index < devotionStackCount ? "●" : "○"))
    .join(" ");
  const audioStatusLabel =
    audioControls.mode === "running"
      ? "Active"
      : audioControls.mode === "fallback"
        ? "Silent Fallback"
        : audioControls.mode === "error"
          ? "Error"
          : "Idle";
  const recentRuns = [...runHistory].reverse().slice(0, 5);

  return (
    <details className="group fixed bottom-3 right-3 z-40 w-52 rounded-xl border border-white/20 bg-black/55 p-2 text-xs text-veil/80 backdrop-blur-sm md:w-64">
      <summary className="cursor-pointer list-none select-none font-medium tracking-[0.2em] text-veil/90">
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
        <dt>Whispers This Cycle</dt>
        <dd>{formatResource(whispersInWindow)}</dd>
        <dt>Whisper Reset In</dt>
        <dd>{formatDurationCompact(whisperResetInSeconds)}</dd>
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
        <p className="uppercase tracking-[0.16em] text-veil/80">Audio</p>
        <p className="mt-1">
          {audioStatusLabel}
          {audioControls.mode === "running" ? (audioControls.muted ? " (Muted)" : " (Unmuted)") : null}
        </p>
        {audioControls.message ? <p className="mt-1 text-ember/80">{audioControls.message}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1">
          {audioControls.supported && audioControls.mode !== "running" ? (
            <button
              type="button"
              onClick={() => {
                void onEnableAudio();
              }}
              className="rounded border border-white/25 px-2 py-0.5 text-[10px] text-veil/90 transition hover:border-veil/80 hover:text-white"
            >
              Enable
            </button>
          ) : null}
          {audioControls.mode === "running" ? (
            <>
              <button
                type="button"
                onClick={onToggleAudioMute}
                className="rounded border border-white/25 px-2 py-0.5 text-[10px] text-veil/90 transition hover:border-veil/80 hover:text-white"
              >
                {audioControls.muted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                onClick={onDisableAudio}
                className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
              >
                Disable
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onUseAudioFallback}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-veil/75 transition hover:border-veil/70 hover:text-white"
          >
            Fallback
          </button>
        </div>
      </div>
    </details>
  );
}

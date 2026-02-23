interface StatsDrawerProps {
  runSeconds: number;
  totalTicks: number;
  totalBeliefEarned: number;
  secondsSinceLastEvent: number;
  whispersInWindow: number;
  whisperResetInSeconds: number;
}

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function StatsDrawer({
  runSeconds,
  totalTicks,
  totalBeliefEarned,
  secondsSinceLastEvent,
  whispersInWindow,
  whisperResetInSeconds
}: StatsDrawerProps) {
  return (
    <details className="group fixed bottom-3 right-3 z-20 w-52 rounded-xl border border-white/20 bg-black/55 p-2 text-xs text-veil/80 backdrop-blur-sm md:w-64">
      <summary className="cursor-pointer list-none select-none font-medium tracking-[0.2em] text-veil/90">
        STATS
      </summary>
      <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-[11px] text-veil/70">
        <dt>Run Time</dt>
        <dd>{formatNumber(runSeconds)}s</dd>
        <dt>Engine Ticks</dt>
        <dd>{formatNumber(totalTicks)}</dd>
        <dt>Total Belief</dt>
        <dd>{formatNumber(totalBeliefEarned)}</dd>
        <dt>Since Last Event</dt>
        <dd>{formatNumber(secondsSinceLastEvent)}s</dd>
        <dt>Whispers This Cycle</dt>
        <dd>{formatNumber(whispersInWindow)}</dd>
        <dt>Whisper Reset In</dt>
        <dd>{formatNumber(whisperResetInSeconds)}s</dd>
      </dl>
    </details>
  );
}


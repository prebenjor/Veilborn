import type { OfflineProgressSummary } from "../../core/state/persistence";
import { formatResource, formatSignedResource } from "../../core/ui/numberFormat";
import { formatDurationCompact } from "../../core/ui/timeFormat";

interface OfflineSummaryPanelProps {
  summary: OfflineProgressSummary;
  onDismiss: () => void;
}

export function OfflineSummaryPanel({ summary, onDismiss }: OfflineSummaryPanelProps) {
  return (
    <section className="rounded-2xl border border-omen/40 bg-omen/10 p-4 shadow-veil backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm uppercase tracking-[0.25em] text-omen">Return Omen</h2>
          <p className="mt-2 text-sm text-veil/85">
            {`Time moved for ${formatDurationCompact(summary.elapsedSeconds)} while you slept in the dark.`}
          </p>
          <p className="mt-1 text-sm text-veil/75">
            {summary.wasCapped
              ? "Beyond eight hours, the world held its breath and waited."
              : "Your cults held the line, though not without strain."}
          </p>
          {summary.veilFloorHit ? (
            <p className="mt-1 text-xs text-ember">
              The Veil pressed against its limit while you were absent.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-white/30 px-2 py-1 text-xs text-veil/80 transition hover:bg-white/10"
        >
          Dismiss
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-xs text-veil/75">
        <dt>Belief gathered</dt>
        <dd>{formatSignedResource(summary.beliefGained)}</dd>
        <dt>Veil change</dt>
        <dd>{formatSignedResource(summary.veilDelta, 2)}</dd>
        <dt>Followers change</dt>
        <dd>{formatSignedResource(summary.followersDelta)}</dd>
        <dt>Influence on return</dt>
        <dd>{formatResource(summary.influenceAfter)}</dd>
        <dt>Faith decay now</dt>
        <dd>{`x${formatResource(summary.faithDecayMultiplier, 2)}`}</dd>
      </dl>
    </section>
  );
}

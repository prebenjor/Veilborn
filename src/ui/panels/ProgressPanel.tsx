interface ProgressPanelProps {
  belief: number;
  followers: number;
  prophets: number;
  cults: number;
  nextProphetFollowers: number;
  nextCultBeliefCost: number;
  canAnointProphet: boolean;
  canFormCult: boolean;
  onAnointProphet: () => void;
  onFormCult: () => void;
}

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function ProgressPanel({
  belief,
  followers,
  prophets,
  cults,
  nextProphetFollowers,
  nextCultBeliefCost,
  canAnointProphet,
  canFormCult,
  onAnointProphet,
  onFormCult
}: ProgressPanelProps) {
  const cultRevealThreshold = nextCultBeliefCost * 0.9;
  const showCultControls = cults > 0 || belief >= cultRevealThreshold;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine Seeds</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
          <p className="mt-1 text-sm text-white">
            {formatNumber(prophets)} active • next requires {formatNumber(nextProphetFollowers)} followers
          </p>
          <p className="mt-1 text-xs text-veil/70">
            Current followers: {formatNumber(followers)}
          </p>
          <button
            type="button"
            disabled={!canAnointProphet}
            onClick={onAnointProphet}
            className="mt-2 rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Anoint Prophet
          </button>
        </article>

        {showCultControls ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-1 text-sm text-white">
              {formatNumber(cults)} formed • next costs {formatNumber(nextCultBeliefCost)} belief
            </p>
            <button
              type="button"
              disabled={!canFormCult}
              onClick={onFormCult}
              className="mt-2 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Found Cult
            </button>
          </article>
        ) : (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-1 text-sm text-veil/70">
              The doctrine remains fractured. Greater belief is required before a cult can be founded.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}

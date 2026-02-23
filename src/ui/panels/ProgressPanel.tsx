import { shouldRevealCultControls } from "../../core/engine/revealPolicy";

interface ProgressPanelProps {
  belief: number;
  era: number;
  followers: number;
  prophets: number;
  cults: number;
  nextProphetFollowers: number;
  nextCultBeliefCost: number;
  lineageGeneration: number;
  lineageTrustDebt: number;
  lineageSkepticism: number;
  lineageBetrayalScars: number;
  lineageConversionModifier: number;
  lineageRecentMarker: string | null;
  lineageTraits: {
    skeptical: number;
    cautious: number;
    zealous: number;
  };
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
  era,
  followers,
  prophets,
  cults,
  nextProphetFollowers,
  nextCultBeliefCost,
  lineageGeneration,
  lineageTrustDebt,
  lineageSkepticism,
  lineageBetrayalScars,
  lineageConversionModifier,
  lineageRecentMarker,
  lineageTraits,
  canAnointProphet,
  canFormCult,
  onAnointProphet,
  onFormCult
}: ProgressPanelProps) {
  const showCultControls = shouldRevealCultControls(era as 1 | 2 | 3, belief, nextCultBeliefCost, cults);

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine Seeds</h2>
      <div className={`mt-3 grid gap-3 ${era >= 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
          <p className="mt-1 text-sm text-white">
            {formatNumber(prophets)} active - next requires {formatNumber(nextProphetFollowers)} followers
          </p>
          <p className="mt-1 text-xs text-veil/70">Current followers: {formatNumber(followers)}</p>
          <button
            type="button"
            disabled={!canAnointProphet}
            onClick={onAnointProphet}
            className="mt-2 rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Anoint Prophet
          </button>
        </article>

        {era >= 2 && showCultControls ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-1 text-sm text-white">
              {formatNumber(cults)} formed - next costs {formatNumber(nextCultBeliefCost)} belief
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
        ) : era >= 2 ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-1 text-sm text-veil/70">
              The doctrine remains fractured. Greater belief is required before a cult can be founded.
            </p>
          </article>
        ) : null}
      </div>

      <article className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Lineage Memory</p>
        <p className="mt-1 text-sm text-white">
          Generation {formatNumber(lineageGeneration)} - conversion x
          {formatNumber(lineageConversionModifier)}
        </p>
        <p className="mt-1 text-xs text-veil/65">
          Trust debt {formatNumber(lineageTrustDebt)} | Skepticism {formatNumber(lineageSkepticism)} |
          Betrayal scars {formatNumber(lineageBetrayalScars)}
        </p>
        <p className="mt-1 text-xs text-veil/65">
          Traits: skeptical {formatNumber(lineageTraits.skeptical * 100)}% | cautious{" "}
          {formatNumber(lineageTraits.cautious * 100)}% | zealous{" "}
          {formatNumber(lineageTraits.zealous * 100)}%
        </p>
        <p className="mt-1 text-xs text-veil/60">
          {lineageRecentMarker
            ? `Latest memory: ${lineageRecentMarker}`
            : "No lasting social memory has formed yet."}
        </p>
      </article>
    </section>
  );
}

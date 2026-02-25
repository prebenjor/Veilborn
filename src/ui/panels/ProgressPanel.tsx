import { shouldRevealCultControls } from "../../core/engine/revealPolicy";
import { formatRate, formatResource } from "../../core/ui/numberFormat";

interface ProgressPanelProps {
  belief: number;
  era: number;
  prophets: number;
  cults: number;
  followerGainRatePerSecond: number;
  whisperFollowerRateSource: string | null;
  whisperFollowerRateMultiplier: number;
  nextProphetFollowers: number;
  nextCultBeliefCost: number;
  canAnointProphet: boolean;
  canFormCult: boolean;
  onAnointProphet: () => void;
  onFormCult: () => void;
}

export function ProgressPanel({
  belief,
  era,
  prophets,
  cults,
  followerGainRatePerSecond,
  whisperFollowerRateSource,
  whisperFollowerRateMultiplier,
  nextProphetFollowers,
  nextCultBeliefCost,
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
            {formatResource(prophets)} active {" - "}
            {formatResource(nextProphetFollowers)} followers to next
          </p>
          {era >= 2 ? (
            <p className="mt-1 text-xs text-veil/65">
              {formatRate(followerGainRatePerSecond)}/s followers
              {whisperFollowerRateSource ? ` - ${whisperFollowerRateSource} x${formatResource(whisperFollowerRateMultiplier, 2)}` : ""}
            </p>
          ) : null}
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
              {cults <= 0
                ? `None yet \u00b7 costs ${formatResource(nextCultBeliefCost)} to found`
                : `${formatResource(cults)} formed \u00b7 next costs ${formatResource(nextCultBeliefCost)}`}
            </p>
            <button
              type="button"
              disabled={!canFormCult}
              onClick={onFormCult}
              className="mt-2 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Found a Cult
            </button>
          </article>
        ) : era >= 2 ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-1 text-sm text-veil/70">
              The doctrine remains fractured. Greater Belief is required before a cult can be founded.
            </p>
          </article>
        ) : null}
      </div>

    </section>
  );
}

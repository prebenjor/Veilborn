import { shouldRevealCultControls } from "../../core/engine/revealPolicy";
import { formatRate, formatResource } from "../../core/ui/numberFormat";

interface ProgressPanelProps {
  belief: number;
  era: number;
  acolytes: number;
  prophets: number;
  cults: number;
  acolyteFollowerGainRatePerSecond: number;
  prophetFollowerGainRatePerSecond: number;
  cultFollowerGainRatePerSecond: number;
  prophetResonanceBonus: number;
  cultResonanceBonus: number;
  whisperResonanceSurchargeReduction: number;
  whisperResonanceCooldownReductionMs: number;
  whisperFollowerRateSource: string | null;
  whisperFollowerRateMultiplier: number;
  nextAcolyteFollowers: number;
  nextProphetFollowers: number;
  nextProphetAcolytes: number;
  nextCultBeliefCost: number;
  nextCultProphets: number;
  canOrdainAcolyte: boolean;
  canAnointProphet: boolean;
  canFormCult: boolean;
  onOrdainAcolyte: () => void;
  onAnointProphet: () => void;
  onFormCult: () => void;
}

export function ProgressPanel({
  belief,
  era,
  acolytes,
  prophets,
  cults,
  acolyteFollowerGainRatePerSecond,
  prophetFollowerGainRatePerSecond,
  cultFollowerGainRatePerSecond,
  prophetResonanceBonus,
  cultResonanceBonus,
  whisperResonanceSurchargeReduction,
  whisperResonanceCooldownReductionMs,
  whisperFollowerRateSource,
  whisperFollowerRateMultiplier,
  nextAcolyteFollowers,
  nextProphetFollowers,
  nextProphetAcolytes,
  nextCultBeliefCost,
  nextCultProphets,
  canOrdainAcolyte,
  canAnointProphet,
  canFormCult,
  onOrdainAcolyte,
  onAnointProphet,
  onFormCult
}: ProgressPanelProps) {
  const showCultControls = shouldRevealCultControls(era as 1 | 2 | 3, belief, nextCultBeliefCost, cults);

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine Seeds</h2>
      <div className={`mt-3 grid gap-3 ${era >= 2 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-1"}`}>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Acolytes</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(acolytes)} active {" - "}next at {formatResource(nextAcolyteFollowers)} followers
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Ordination consumes followers and prepares future prophets.
          </p>
          {era >= 2 ? (
            <p className="mt-1 text-xs text-veil/65">
              {formatRate(acolyteFollowerGainRatePerSecond)}/s followers
            </p>
          ) : null}
          {era >= 2 ? (
            <p className="mt-1 text-xs text-veil/65">
              Whisper resonance: -{formatResource(whisperResonanceSurchargeReduction * 100)}% surcharge, -
              {formatResource(whisperResonanceCooldownReductionMs / 1000)}s cooldown
            </p>
          ) : null}
          <button
            type="button"
            disabled={!canOrdainAcolyte}
            onClick={onOrdainAcolyte}
            className="mt-2 rounded-lg border border-white/30 px-2 py-1 text-xs text-veil/85 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Ordain Acolyte
          </button>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(prophets)} active {" - "}
            {formatResource(nextProphetFollowers)} followers + {formatResource(nextProphetAcolytes)} acolytes to next
          </p>
          <p className="mt-1 text-xs text-veil/65">Requires {formatResource(nextProphetAcolytes)} acolytes (consumed).</p>
          {era >= 2 ? (
            <p className="mt-1 text-xs text-veil/65">
              {formatRate(prophetFollowerGainRatePerSecond)}/s followers
              {whisperFollowerRateSource
                ? ` - ${whisperFollowerRateSource} x${formatResource(whisperFollowerRateMultiplier, 2)}`
                : ""}
              {prophetResonanceBonus > 0
                ? ` - resonance +${formatResource(prophetResonanceBonus * 100)}%`
                : ""}
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
            <p className="mt-1 text-xs text-veil/65">
              Requires {formatResource(nextCultProphets)} prophets (consumed) {" - "}have {formatResource(prophets)}
            </p>
            <p className="mt-1 text-xs text-veil/65">
              {formatRate(cultFollowerGainRatePerSecond)}/s followers
              {whisperFollowerRateSource
                ? ` - ${whisperFollowerRateSource} x${formatResource(whisperFollowerRateMultiplier, 2)}`
                : ""}
              {cultResonanceBonus > 0
                ? ` - resonance +${formatResource(cultResonanceBonus * 100)}%`
                : ""}
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

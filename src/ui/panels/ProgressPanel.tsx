import { shouldRevealCultControls } from "../../core/engine/revealPolicy";
import { formatRate, formatResource } from "../../core/ui/numberFormat";

interface ProgressPanelProps {
  belief: number;
  era: number;
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

export function ProgressPanel({
  belief,
  era,
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
  const traitEntries = [
    { key: "skeptical", label: "Skeptical lineage", value: lineageTraits.skeptical },
    { key: "cautious", label: "Cautious lineage", value: lineageTraits.cautious },
    { key: "zealous", label: "Zealous lineage", value: lineageTraits.zealous }
  ];
  const dominantTraitValue = Math.max(...traitEntries.map((entry) => entry.value));
  const dominantTraits = traitEntries
    .filter((entry) => Math.abs(entry.value - dominantTraitValue) < 0.0001)
    .map((entry) => entry.label);

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine Seeds</h2>
      <div className={`mt-3 grid gap-3 ${era >= 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(prophets)} active · {formatResource(nextProphetFollowers)} followers to next
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

        {era >= 2 && showCultControls ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-1 text-sm text-white">
              {formatResource(cults)} formed · next costs {formatResource(nextCultBeliefCost)}
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
              The doctrine remains fractured. Greater Belief is required before a cult can be founded.
            </p>
          </article>
        ) : null}
      </div>

      {era >= 2 ? (
        <article className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Lineage Memory</p>
          <p className="mt-1 text-sm text-white">
            Generation {formatResource(lineageGeneration)} · x
            {formatRate(lineageConversionModifier)}
            {" "}conversion
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Trust {formatResource(lineageTrustDebt)} · Skepticism {formatResource(lineageSkepticism)} ·
            Scars {formatResource(lineageBetrayalScars)}
          </p>
          <p className="mt-1 text-xs text-veil/65">{dominantTraits.join(" · ")}</p>
          <p className="mt-1 text-xs text-veil/60">
            {lineageRecentMarker
              ? `Latest memory: ${lineageRecentMarker}`
              : "No lasting social memory has formed yet."}
          </p>
        </article>
      ) : null}
    </section>
  );
}

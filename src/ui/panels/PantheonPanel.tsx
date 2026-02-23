import { formatResource } from "../../core/ui/numberFormat";

interface PantheonAllyView {
  id: string;
  name: string;
  domainLabel: string;
  disposition: "neutral" | "allied" | "betrayed";
  poisonRunsRemaining: number;
  canAlliance: boolean;
  canBetray: boolean;
}

interface PantheonPanelProps {
  unlocked: boolean;
  allies: PantheonAllyView[];
  allianceTotalModifier: number;
  allianceSharePenalty: number;
  allianceDomainBonus: number;
  betrayalsLifetime: number;
  betrayedHookUnlocked: boolean;
  onFormAlliance: (allyId: string) => void;
  onBetray: (allyId: string) => void;
}

function formatDisposition(disposition: PantheonAllyView["disposition"]): string {
  if (disposition === "allied") return "Allied";
  if (disposition === "betrayed") return "Betrayed";
  return "Neutral";
}

export function PantheonPanel({
  unlocked,
  allies,
  allianceTotalModifier,
  allianceSharePenalty,
  allianceDomainBonus,
  betrayalsLifetime,
  betrayedHookUnlocked,
  onFormAlliance,
  onBetray
}: PantheonPanelProps) {
  if (!unlocked) return null;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Pantheon</h2>
      <p className="mt-2 text-sm text-veil/70">
        Other forgotten gods now answer your rise. Alliances share power and cost income; betrayal grants
        immediate Belief and poisons domains in future runs.
      </p>
      <p className="mt-1 text-xs text-veil/65">
        Alliance modifier x{formatResource(allianceTotalModifier, 2)} (share x
        {formatResource(allianceSharePenalty, 2)} and domain x{formatResource(allianceDomainBonus, 2)})
      </p>
      <p className="mt-1 text-xs text-veil/65">
        Betrayals lifetime: {formatResource(betrayalsLifetime)} · Name-letter betrayal hook:{" "}
        {betrayedHookUnlocked ? "recorded" : "not recorded"}
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {allies.map((ally) => (
          <article key={ally.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">{ally.domainLabel}</p>
            <p className="mt-1 text-sm text-white">{ally.name}</p>
            <p className="mt-1 text-xs text-veil/65">Disposition: {formatDisposition(ally.disposition)}</p>
            <p className="mt-1 text-xs text-veil/65">
              Poison window: {formatResource(ally.poisonRunsRemaining)} run(s) remaining
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!ally.canAlliance}
                onClick={() => onFormAlliance(ally.id)}
                className="rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
              >
                Form Alliance
              </button>
              <button
                type="button"
                disabled={!ally.canBetray}
                onClick={() => onBetray(ally.id)}
                className="rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
              >
                Betray
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

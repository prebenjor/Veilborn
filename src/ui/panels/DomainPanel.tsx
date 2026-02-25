import { useState } from "react";
import { DOMAIN_IDS, DOMAIN_LABELS, type DomainId, type DomainProgress } from "../../core/state/gameState";
import { simulateDomainInvestments, type DoctrineResonanceState } from "../../core/engine/formulas";
import { formatResource } from "../../core/ui/numberFormat";

type InvestMode = "one" | "p10" | "p25" | "p50" | "max";

const INVEST_MODE_OPTIONS: Array<{ id: InvestMode; label: string }> = [
  { id: "one", label: "+1" },
  { id: "p10", label: "+10%" },
  { id: "p25", label: "+25%" },
  { id: "p50", label: "+50%" },
  { id: "max", label: "Max" }
];

function resolveTargetInvestments(mode: InvestMode, maxAffordable: number): number {
  if (maxAffordable <= 0) return 0;
  if (mode === "one") return 1;
  if (mode === "max") return maxAffordable;
  if (mode === "p10") return Math.max(1, Math.floor(maxAffordable * 0.1));
  if (mode === "p25") return Math.max(1, Math.floor(maxAffordable * 0.25));
  return Math.max(1, Math.floor(maxAffordable * 0.5));
}

function createDefaultModeByDomain(): Record<DomainId, InvestMode> {
  return DOMAIN_IDS.reduce(
    (accumulator, domainId) => {
      accumulator[domainId] = "one";
      return accumulator;
    },
    {
      fire: "one",
      death: "one",
      harvest: "one",
      storm: "one",
      memory: "one",
      void: "one"
    } as Record<DomainId, InvestMode>
  );
}

interface DomainPanelProps {
  era: 1 | 2 | 3;
  belief: number;
  domains: DomainProgress[];
  matchingDomainPairs: number;
  domainSynergy: number;
  doctrineResonance: DoctrineResonanceState;
  getInvestCost: (domain: DomainProgress) => number;
  getXpNeeded: (domain: DomainProgress) => number;
  onInvest: (domainId: DomainId, investments: number) => void;
}

export function DomainPanel({
  era,
  belief,
  domains,
  matchingDomainPairs,
  domainSynergy,
  doctrineResonance,
  getInvestCost,
  getXpNeeded,
  onInvest
}: DomainPanelProps) {
  const [modeByDomain, setModeByDomain] = useState<Record<DomainId, InvestMode>>(createDefaultModeByDomain);
  const highlightedDomains = new Set(
    doctrineResonance.pairs
      .filter((pair) => pair.tier > 0)
      .flatMap((pair) => [pair.left, pair.right])
  );

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Domains</h2>
      <p className="mt-2 text-xs text-veil/65">
        Active synergy x{formatResource(domainSynergy, 2)} - {formatResource(matchingDomainPairs)} resonance pairs
      </p>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        {doctrineResonance.pairs.map((pair) => {
          const tierLabel = pair.tier <= 0 ? "Dormant" : `Tier ${pair.tier}`;
          const nextLabel =
            pair.nextTierLevel === null
              ? "Resonance complete."
              : `Next tier at level ${formatResource(pair.nextTierLevel)}.`;
          const effectLabel =
            pair.focus === "prophets"
              ? `Doctrine effect: +${formatResource(pair.prophetPassiveBonus * 100)}% prophet follower rate`
              : pair.focus === "whispers"
                ? `Doctrine effect: -${formatResource(pair.whisperSurchargeReduction * 100)}% whisper surcharge -${formatResource(pair.whisperCooldownReductionMs / 1000)}s cooldown`
                : `Doctrine effect: +${formatResource(pair.cultPassiveBonus * 100)}% cult follower rate`;

          return (
            <article key={pair.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-veil/70">
                {DOMAIN_LABELS[pair.left]} - {DOMAIN_LABELS[pair.right]}
              </p>
              <p className="mt-1 text-[11px] text-white">
                {tierLabel} - min level {formatResource(pair.minimumLevel)}
              </p>
              <p className="mt-1 text-[10px] text-veil/65">{effectLabel}</p>
              <p className="mt-1 text-[10px] text-veil/55">{nextLabel}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {domains.map((domain) => {
          const singleCost = getInvestCost(domain);
          const mode = modeByDomain[domain.id] ?? "one";
          const maxSimulation = simulateDomainInvestments(domain, belief, Number.POSITIVE_INFINITY, era);
          const maxAffordable = maxSimulation.investments;
          const targetInvestments = resolveTargetInvestments(mode, maxAffordable);
          const targetSimulation =
            targetInvestments === maxAffordable
              ? maxSimulation
              : simulateDomainInvestments(domain, belief, targetInvestments, era);
          const xpNeeded = getXpNeeded(domain);
          const projectedXpNeeded = getXpNeeded(targetSimulation.resultingDomain);
          const disabled = targetSimulation.investments <= 0;
          const highlighted = highlightedDomains.has(domain.id);

          return (
            <article
              key={domain.id}
              className={
                highlighted
                  ? "rounded-xl border border-omen/35 bg-black/25 p-3"
                  : "rounded-xl border border-white/10 bg-black/25 p-3"
              }
            >
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">{DOMAIN_LABELS[domain.id]}</p>
              <p className="mt-1 text-sm text-white">
                Level {formatResource(domain.level)} - XP {formatResource(domain.xp)}/{formatResource(xpNeeded)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {INVEST_MODE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setModeByDomain((previous) => ({
                        ...previous,
                        [domain.id]: option.id
                      }));
                    }}
                    className={`rounded border px-1.5 py-0.5 text-[11px] transition ${
                      mode === option.id
                        ? "border-omen/60 bg-omen/10 text-omen"
                        : "border-white/20 text-veil/70 hover:border-veil/60 hover:text-veil"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-veil/65">
                {targetSimulation.investments > 0 ? (
                  <>
                    {formatResource(targetSimulation.totalCost)} Belief to Lv
                    {formatResource(targetSimulation.resultingDomain.level)} - XP{" "}
                    {formatResource(targetSimulation.resultingDomain.xp)}/{formatResource(projectedXpNeeded)}
                    {targetSimulation.levelsGained > 0
                      ? ` (+${formatResource(targetSimulation.levelsGained)} level${
                          targetSimulation.levelsGained === 1 ? "" : "s"
                        })`
                      : ""}
                  </>
                ) : (
                  <>No affordable investments at current Belief.</>
                )}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onInvest(domain.id, targetSimulation.investments)}
                className="mt-2 rounded-lg border border-veil/50 px-2 py-1 text-xs text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
              >
                {mode === "one"
                  ? "Invest +1"
                  : `Invest ${INVEST_MODE_OPTIONS.find((entry) => entry.id === mode)?.label}`}
              </button>
              <p className="mt-1 text-[10px] text-veil/55">
                Single {formatResource(singleCost)} - Max {formatResource(maxAffordable)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

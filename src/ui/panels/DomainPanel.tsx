import { DOMAIN_LABELS, type DomainId, type DomainProgress } from "../../core/state/gameState";
import { formatResource } from "../../core/ui/numberFormat";

interface DomainPanelProps {
  belief: number;
  domains: DomainProgress[];
  matchingDomainPairs: number;
  domainSynergy: number;
  getInvestCost: (domain: DomainProgress) => number;
  getXpNeeded: (domain: DomainProgress) => number;
  onInvest: (domainId: DomainId) => void;
}

export function DomainPanel({
  belief,
  domains,
  matchingDomainPairs,
  domainSynergy,
  getInvestCost,
  getXpNeeded,
  onInvest
}: DomainPanelProps) {
  const activeDomains = [...domains]
    .filter((domain) => domain.level > 0)
    .sort((a, b) => b.level - a.level);
  const highlightedDomains = new Set(
    activeDomains.slice(0, matchingDomainPairs * 2).map((domain) => domain.id)
  );
  const pairNames = Array.from({ length: matchingDomainPairs }, (_, index) => {
    const first = activeDomains[index * 2];
    const second = activeDomains[index * 2 + 1];
    if (!first || !second) return null;
    return `${DOMAIN_LABELS[first.id]} + ${DOMAIN_LABELS[second.id]}`;
  }).filter((entry): entry is string => Boolean(entry));

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Domains</h2>
      <p className="mt-2 text-xs text-veil/65">
        Active synergy x{formatResource(domainSynergy, 2)} from {formatResource(matchingDomainPairs)} matching
        pair(s).
      </p>
      {pairNames.length > 0 ? (
        <details className="mt-2 rounded-lg border border-white/10 bg-black/20 p-2">
          <summary className="cursor-pointer text-xs text-veil/75">Matched domain pairs</summary>
          <p className="mt-1 text-[11px] text-veil/65">{pairNames.join(" | ")}</p>
        </details>
      ) : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {domains.map((domain) => {
          const cost = getInvestCost(domain);
          const xpNeeded = getXpNeeded(domain);
          const disabled = belief < cost;
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
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
                {DOMAIN_LABELS[domain.id]}
              </p>
              <p className="mt-1 text-sm text-white">
                Level {formatResource(domain.level)} - XP {formatResource(domain.xp)}/{formatResource(xpNeeded)}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onInvest(domain.id)}
                className="mt-2 rounded-lg border border-veil/50 px-2 py-1 text-xs text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
              >
                Invest ({formatResource(cost)} Belief)
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}



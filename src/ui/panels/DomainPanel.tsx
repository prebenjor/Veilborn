import { DOMAIN_LABELS, type DomainId, type DomainProgress } from "../../core/state/gameState";

interface DomainPanelProps {
  belief: number;
  domains: DomainProgress[];
  getInvestCost: (domain: DomainProgress) => number;
  getXpNeeded: (domain: DomainProgress) => number;
  onInvest: (domainId: DomainId) => void;
}

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function DomainPanel({ belief, domains, getInvestCost, getXpNeeded, onInvest }: DomainPanelProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Domains</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {domains.map((domain) => {
          const cost = getInvestCost(domain);
          const xpNeeded = getXpNeeded(domain);
          const disabled = belief < cost;

          return (
            <article
              key={domain.id}
              className="rounded-xl border border-white/10 bg-black/25 p-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
                {DOMAIN_LABELS[domain.id]}
              </p>
              <p className="mt-1 text-sm text-white">
                Level {domain.level} - XP {domain.xp}/{xpNeeded}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onInvest(domain.id)}
                className="mt-2 rounded-lg border border-veil/50 px-2 py-1 text-xs text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
              >
                Invest ({formatNumber(cost)} Belief)
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}



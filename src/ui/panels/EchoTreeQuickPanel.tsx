import {
  ECHO_TREE_MAX_RANK,
  type EchoTreeId
} from "../../core/state/gameState";
import { formatResource } from "../../core/ui/numberFormat";

interface EchoTreeView {
  id: EchoTreeId;
  label: string;
  rank: number;
  nextCost: number | null;
  canPurchase: boolean;
  nextBonus: string | null;
}

interface EchoTreeQuickPanelProps {
  echoes: number;
  treeViews: EchoTreeView[];
  onPurchaseTree: (treeId: EchoTreeId) => void;
}

export function EchoTreeQuickPanel({ echoes, treeViews, onPurchaseTree }: EchoTreeQuickPanelProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Legacy Echoes</h2>
      <p className="mt-2 text-xs text-veil/70">
        Echoes available: {formatResource(echoes)}. Invest now; full archive controls return in META once Era II opens.
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {treeViews.map((tree) => (
          <article key={tree.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">{tree.label}</p>
            <p className="mt-1 text-sm text-white">
              Rank {formatResource(tree.rank)} / {formatResource(ECHO_TREE_MAX_RANK)}
            </p>
            <p className="mt-1 text-xs text-veil/65">
              {tree.nextCost === null
                ? "Maxed"
                : `Next: ${formatResource(tree.nextCost)} ${tree.nextCost === 1 ? "Echo" : "Echoes"}`}
            </p>
            <p className="mt-1 text-xs text-veil/60">
              {tree.nextBonus ? `Unlocks: ${tree.nextBonus}` : "All unlocks active."}
            </p>
            <button
              type="button"
              disabled={!tree.canPurchase}
              onClick={() => onPurchaseTree(tree.id)}
              className="mt-2 rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Buy Rank
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

import {
  ECHO_TREE_MAX_RANK,
  type EchoTreeId
} from "../../core/state/gameState";

interface EchoTreeView {
  id: EchoTreeId;
  label: string;
  rank: number;
  nextCost: number | null;
  canPurchase: boolean;
  unlockedBonuses: string[];
}

interface AscensionPanelProps {
  era: number;
  echoes: number;
  lifetimeEchoes: number;
  completedRuns: number;
  ascensionEchoGain: number;
  canAscend: boolean;
  treeViews: EchoTreeView[];
  onPurchaseTree: (treeId: EchoTreeId) => void;
  onAscend: () => void;
}

function formatNumber(value: number, maxFractionDigits = 1): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: maxFractionDigits }).format(value);
}

export function AscensionPanel({
  era,
  echoes,
  lifetimeEchoes,
  completedRuns,
  ascensionEchoGain,
  canAscend,
  treeViews,
  onPurchaseTree,
  onAscend
}: AscensionPanelProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Echo Trees</h2>
      <p className="mt-2 text-sm text-veil/70">
        Echoes persist across ascensions and purchase permanent doctrine revisions.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Echoes</p>
          <p className="mt-1 text-sm text-white">{formatNumber(echoes)}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Lifetime Echoes</p>
          <p className="mt-1 text-sm text-white">{formatNumber(lifetimeEchoes)}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Completed Runs</p>
          <p className="mt-1 text-sm text-white">{formatNumber(completedRuns)}</p>
        </article>
      </div>

      {treeViews.length > 0 ? (
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {treeViews.map((tree) => (
            <article key={tree.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">{tree.label}</p>
              <p className="mt-1 text-sm text-white">
                Rank {tree.rank}/{ECHO_TREE_MAX_RANK}
              </p>
              <p className="mt-1 text-xs text-veil/65">
                {tree.nextCost === null
                  ? "Maxed"
                  : `Next rank costs ${formatNumber(tree.nextCost)} echoes`}
              </p>
              {tree.unlockedBonuses.length > 0 ? (
                <p className="mt-1 text-xs text-veil/60">
                  Unlocked: {tree.unlockedBonuses.join(", ")}
                </p>
              ) : (
                <p className="mt-1 text-xs text-veil/60">No bonuses unlocked yet.</p>
              )}
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
      ) : (
        <p className="mt-3 text-xs text-veil/65">
          The deeper branches remain veiled in this age.
        </p>
      )}

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Ascension</p>
        <p className="mt-1 text-sm text-white">
          Current run would yield {formatNumber(ascensionEchoGain)} echoes.
        </p>
        <p className="mt-1 text-xs text-veil/65">
          {era < 3
            ? "The final fracture remains sealed for now."
            : "Ascension resets the world state but preserves echoes and tree ranks."}
        </p>
        <button
          type="button"
          disabled={!canAscend}
          onClick={onAscend}
          className="mt-2 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Ascend
        </button>
      </div>
    </section>
  );
}

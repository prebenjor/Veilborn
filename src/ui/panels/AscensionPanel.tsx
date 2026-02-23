import { useRef } from "react";
import {
  ECHO_TREE_MAX_RANK,
  DOMAIN_LABELS,
  type DomainId,
  type EchoTreeId
} from "../../core/state/gameState";
import { formatResource } from "../../core/ui/numberFormat";

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
  ghostLocalCount: number;
  ghostImportedCount: number;
  ghostImportStatus: string | null;
  saveImportStatus: string | null;
  saveImportWarnings: string[];
  snapshotLabel: string | null;
  ghostInfluenceTotals: {
    domainSynergyDelta: number;
    rivalSpawnDelta: number;
    faithDecayDelta: number;
  };
  ghostInfluences: Array<{
    id: string;
    title: string;
    description: string;
    source: "local" | "imported";
    dominantDomain: DomainId;
  }>;
  onPurchaseTree: (treeId: EchoTreeId) => void;
  onAscend: () => void;
  onExportGhostSignatures: () => void;
  onImportGhostSignatures: (file: File) => void;
  onExportSave: () => void;
  onImportSave: (file: File) => void;
  onRestoreSnapshot: () => void;
}

export function AscensionPanel({
  era,
  echoes,
  lifetimeEchoes,
  completedRuns,
  ascensionEchoGain,
  canAscend,
  treeViews,
  ghostLocalCount,
  ghostImportedCount,
  ghostImportStatus,
  saveImportStatus,
  saveImportWarnings,
  snapshotLabel,
  ghostInfluenceTotals,
  ghostInfluences,
  onPurchaseTree,
  onAscend,
  onExportGhostSignatures,
  onImportGhostSignatures,
  onExportSave,
  onImportSave,
  onRestoreSnapshot
}: AscensionPanelProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const saveImportInputRef = useRef<HTMLInputElement | null>(null);

  const ghostSynergyPercent = Math.round(ghostInfluenceTotals.domainSynergyDelta * 100);
  const ghostRivalPercent = Math.round(Math.abs(ghostInfluenceTotals.rivalSpawnDelta) * 100);
  const ghostFaithPercent = Math.round(Math.abs(ghostInfluenceTotals.faithDecayDelta) * 100);
  const ghostInfluenceParts: string[] = [];
  if (ghostSynergyPercent !== 0) {
    ghostInfluenceParts.push(`Synergy ${ghostSynergyPercent > 0 ? "+" : ""}${ghostSynergyPercent}%`);
  }
  if (ghostInfluenceTotals.rivalSpawnDelta !== 0) {
    ghostInfluenceParts.push(
      `Rivals ${ghostInfluenceTotals.rivalSpawnDelta < 0 ? "accelerated" : "slowed"} (${ghostRivalPercent}%)`
    );
  }
  if (ghostInfluenceTotals.faithDecayDelta !== 0) {
    ghostInfluenceParts.push(
      `Faith decay ${ghostInfluenceTotals.faithDecayDelta > 0 ? "harsher" : "gentler"} (${ghostFaithPercent}%)`
    );
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Echo Trees</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Echoes</p>
          <p className="mt-1 text-sm text-white">{formatResource(echoes)}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Lifetime Echoes</p>
          <p className="mt-1 text-sm text-white">{formatResource(lifetimeEchoes)}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Completed Runs</p>
          <p className="mt-1 text-sm text-white">{formatResource(completedRuns)}</p>
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
                  : `Next rank · ${formatResource(tree.nextCost)} ${
                      tree.nextCost === 1 ? "Echo" : "Echoes"
                    }`}
              </p>
              {tree.unlockedBonuses.length > 0 ? (
                <p className="mt-1 text-xs text-veil/60">
                  Unlocked: {tree.unlockedBonuses.join(", ")}
                </p>
              ) : null}
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
        <p className="mt-1 text-sm text-white">This run yields {formatResource(ascensionEchoGain)} Echoes</p>
        <p className="mt-1 text-xs text-veil/65">
          {era < 3
            ? "The final fracture remains sealed for now."
            : "Resets the run. Echoes and ranks carry forward."}
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

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Ghost Echoes</p>
        <p className="mt-1 text-sm text-white">
          {formatResource(ghostLocalCount)} local · {formatResource(ghostImportedCount)} imported
        </p>
        {ghostInfluenceParts.length > 0 ? (
          <p className="mt-1 text-xs text-veil/65">{ghostInfluenceParts.join(" · ")}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportGhostSignatures}
            className="rounded-lg border border-veil/60 px-2 py-1 text-xs text-veil transition hover:bg-veil/10"
          >
            Export Signatures
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="rounded-lg border border-veil/60 px-2 py-1 text-xs text-veil transition hover:bg-veil/10"
          >
            Import Signatures
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportGhostSignatures(file);
              event.currentTarget.value = "";
            }}
          />
        </div>

        {ghostImportStatus ? (
          <p className="mt-2 text-xs text-veil/70">{ghostImportStatus}</p>
        ) : null}

        {ghostInfluences.length > 0 ? (
          <div className="mt-3 space-y-2">
            {ghostInfluences.map((influence) => (
              <article key={influence.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-xs text-white">
                  {influence.title} ({influence.source === "imported" ? "Imported" : "Local"},{" "}
                  {DOMAIN_LABELS[influence.dominantDomain]})
                </p>
                <p className="mt-1 text-[11px] text-veil/65">{influence.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-veil/60">No signatures active.</p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Save Archive</p>
        {snapshotLabel ? <p className="mt-1 text-[11px] text-veil/60">Snapshot: {snapshotLabel}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportSave}
            className="rounded-lg border border-veil/60 px-2 py-1 text-xs text-veil transition hover:bg-veil/10"
          >
            Export Save
          </button>
          <button
            type="button"
            onClick={() => saveImportInputRef.current?.click()}
            className="rounded-lg border border-veil/60 px-2 py-1 text-xs text-veil transition hover:bg-veil/10"
          >
            Import Save
          </button>
          <button
            type="button"
            onClick={onRestoreSnapshot}
            className="rounded-lg border border-veil/60 px-2 py-1 text-xs text-veil transition hover:bg-veil/10"
          >
            Restore Snapshot
          </button>
          <input
            ref={saveImportInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportSave(file);
              event.currentTarget.value = "";
            }}
          />
        </div>
        {saveImportStatus ? <p className="mt-2 text-xs text-veil/75">{saveImportStatus}</p> : null}
        {saveImportWarnings.length > 0 ? (
          <ul className="mt-2 space-y-1 text-[11px] text-ember/80">
            {saveImportWarnings.map((warning, index) => (
              <li key={`save-warning-${index}`}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

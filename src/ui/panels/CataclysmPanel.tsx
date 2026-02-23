import type { MiracleTier } from "../../core/state/gameState";

interface MiracleOption {
  tier: MiracleTier;
  influenceCost: number;
  beliefGain: number;
  veilCost: number;
  civDamage: number;
  canCast: boolean;
}

interface CataclysmPanelProps {
  era: number;
  influence: number;
  veil: number;
  veilBonus: number;
  veilRegenPerSecond: number;
  veilErosionPerSecond: number;
  veilCollapseThreshold: number;
  shrinesBuilt: number;
  civilizationHealth: number;
  civilizationCollapsed: boolean;
  civilizationRebuildInSeconds: number;
  miraclesThisRun: number;
  miracleOptions: MiracleOption[];
  onCastMiracle: (tier: MiracleTier) => void;
}

function formatNumber(value: number, maximumFractionDigits = 1): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

export function CataclysmPanel({
  era,
  influence,
  veil,
  veilBonus,
  veilRegenPerSecond,
  veilErosionPerSecond,
  veilCollapseThreshold,
  shrinesBuilt,
  civilizationHealth,
  civilizationCollapsed,
  civilizationRebuildInSeconds,
  miraclesThisRun,
  miracleOptions,
  onCastMiracle
}: CataclysmPanelProps) {
  if (era < 3) return null;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Cataclysm</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Veil Pressure</p>
          <p className="mt-1 text-sm text-white">
            Veil {formatNumber(veil)} (collapse at {formatNumber(veilCollapseThreshold)})
          </p>
          <p className="mt-1 text-xs text-veil/65">Belief bonus x{formatNumber(veilBonus, 2)}</p>
          <p className="mt-1 text-xs text-veil/65">
            Regen {formatNumber(veilRegenPerSecond, 3)}/s, erosion {formatNumber(veilErosionPerSecond, 3)}
            /s
          </p>
          <p className="mt-1 text-xs text-veil/65">Shrines built: {formatNumber(shrinesBuilt)}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Civilization</p>
          <p className="mt-1 text-sm text-white">Health {formatNumber(civilizationHealth)} / 100</p>
          {civilizationCollapsed ? (
            <p className="mt-1 text-xs text-ember">
              Civilization collapsed. Rebuild in ~{formatNumber(civilizationRebuildInSeconds)}s.
            </p>
          ) : (
            <p className="mt-1 text-xs text-veil/65">Stable enough to sustain miracle returns.</p>
          )}
          <p className="mt-1 text-xs text-veil/65">Miracles this run: {formatNumber(miraclesThisRun)}</p>
          <p className="mt-1 text-xs text-veil/65">Influence available: {formatNumber(influence)}</p>
        </article>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {miracleOptions.map((miracle) => (
          <article key={miracle.tier} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Miracle T{miracle.tier}</p>
            <p className="mt-1 text-xs text-veil/65">
              Cost {formatNumber(miracle.influenceCost)} Influence
            </p>
            <p className="mt-1 text-xs text-veil/65">Return {formatNumber(miracle.beliefGain)} Belief</p>
            <p className="mt-1 text-xs text-veil/65">
              Veil -{formatNumber(miracle.veilCost)}, Civ -{formatNumber(miracle.civDamage)}
            </p>
            <button
              type="button"
              disabled={!miracle.canCast}
              onClick={() => onCastMiracle(miracle.tier)}
              className="mt-2 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Invoke
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

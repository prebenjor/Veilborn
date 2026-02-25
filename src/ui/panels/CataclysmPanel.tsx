import { MIRACLE_NAMES, type MiracleTier } from "../../core/state/gameState";
import { formatResource } from "../../core/ui/numberFormat";
import { getVeilStabilityView } from "../../core/ui/veilPresentation";

interface MiracleOption {
  tier: MiracleTier;
  influenceCost: number;
  beliefGain: number;
  veilCost: number;
  canCast: boolean;
}

interface CataclysmPanelProps {
  era: number;
  influence: number;
  influenceCap: number;
  miracleReserve: number;
  miracleReserveCap: number;
  veil: number;
  veilBonus: number;
  veilRegenPerSecond: number;
  veilErosionPerSecond: number;
  veilCollapseThreshold: number;
  miraclesThisRun: number;
  riteVeilStrain: number;
  riteVeilStrainTarget: number;
  miracleOptions: MiracleOption[];
  onCastMiracle: (tier: MiracleTier) => void;
}

export function CataclysmPanel({
  era,
  influence,
  influenceCap,
  miracleReserve,
  miracleReserveCap,
  veil,
  veilBonus,
  veilRegenPerSecond,
  veilErosionPerSecond,
  veilCollapseThreshold,
  miraclesThisRun,
  riteVeilStrain,
  riteVeilStrainTarget,
  miracleOptions,
  onCastMiracle
}: CataclysmPanelProps) {
  if (era < 3) return null;
  const stability = getVeilStabilityView(veil, veilCollapseThreshold);
  const miraclePower = influence + miracleReserve;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Gate Rites</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Veil Stability</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(veil)} <span className="text-veil/55">&middot;</span>{" "}
            <span className={stability.cssClass}>{stability.label}</span>
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Collapses at {formatResource(veilCollapseThreshold)} &middot; Regen {formatResource(veilRegenPerSecond, 3)}/s
            &middot; Erosion {formatResource(veilErosionPerSecond, 3)}/s
          </p>
          <p className="mt-1 text-xs text-veil/65">Belief bonus x{formatResource(veilBonus, 2)}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Rite Pressure</p>
          <p className="mt-1 text-sm text-white">Rites this run: {formatResource(miraclesThisRun)}</p>
          <p className="mt-1 text-xs text-veil/65">
            Veil strain from rites: {formatResource(riteVeilStrain)} / {formatResource(riteVeilStrainTarget)}
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Rite power {formatResource(miraclePower)} (Influence {formatResource(influence)} /{" "}
            {formatResource(influenceCap)} + Reserve {formatResource(miracleReserve)} /{" "}
            {formatResource(miracleReserveCap)})
          </p>
        </article>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {miracleOptions.map((miracle) => (
          <article key={miracle.tier} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs tracking-[0.08em] text-veil/70">{MIRACLE_NAMES[miracle.tier]}</p>
            <p className="mt-1 text-xs text-veil/65">Cost {formatResource(miracle.influenceCost)} Power</p>
            <p className="mt-1 text-xs text-veil/65">
              Veil strain +{formatResource(miracle.veilCost)} &middot; Return {formatResource(miracle.beliefGain)} Belief
            </p>
            <button
              type="button"
              disabled={!miracle.canCast}
              onClick={() => onCastMiracle(miracle.tier)}
              className="mt-2 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Invoke Rite
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

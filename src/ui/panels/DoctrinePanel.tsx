import type { ActType } from "../../core/state/gameState";
import { formatResource } from "../../core/ui/numberFormat";
import { formatDurationCompact } from "../../core/ui/timeFormat";

interface ActiveActView {
  id: string;
  type: ActType;
  remainingSeconds: number;
}

interface DoctrinePanelProps {
  era: number;
  cults: number;
  influence: number;
  cultOutput: number;
  domainSynergy: number;
  matchingDomainPairs: number;
  actSlotCap: number;
  activeActs: ActiveActView[];
  actCosts: Record<ActType, number>;
  actDurations: Record<ActType, number>;
  actProjectedBelief: Record<ActType, number>;
  actResonantBonus: number;
  actFloorMultiplier: number;
  canStartAct: Record<ActType, boolean>;
  onStartAct: (type: ActType) => void;
  rivalsCount: number;
  rivalStrength: number;
  rivalDrainPerSecond: number;
  nextRivalInSeconds: number;
  canSuppressRival: boolean;
  suppressCost: number;
  onSuppressRival: () => void;
}

const ACT_CONFIG: Array<{ type: ActType; label: string; hint: string }> = [
  { type: "shrine", label: "Raise Shrine", hint: "Fast, steady belief return." },
  { type: "ritual", label: "Bind Ritual", hint: "Balanced duration and payout." },
  { type: "proclaim", label: "Great Proclamation", hint: "Longest act, largest return." }
];

export function DoctrinePanel({
  era,
  cults,
  influence,
  cultOutput,
  domainSynergy,
  matchingDomainPairs,
  actSlotCap,
  activeActs,
  actCosts,
  actDurations,
  actProjectedBelief,
  actResonantBonus,
  actFloorMultiplier,
  canStartAct,
  onStartAct,
  rivalsCount,
  rivalStrength,
  rivalDrainPerSecond,
  nextRivalInSeconds,
  canSuppressRival,
  suppressCost,
  onSuppressRival
}: DoctrinePanelProps) {
  if (era < 2) return null;

  const slotsUsed = activeActs.length;
  const sortedActs = [...ACT_CONFIG].sort(
    (left, right) => actProjectedBelief[right.type] - actProjectedBelief[left.type]
  );
  const strongestProjected = Math.max(...sortedActs.map((act) => actProjectedBelief[act.type]), 1);

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine</h2>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Acts</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(slotsUsed)}/{formatResource(actSlotCap)} active slots from {formatResource(cults)} cults
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Influence {formatResource(influence)} available
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Cult output {formatResource(cultOutput)}/s at synergy x{formatResource(domainSynergy, 2)} (
            {formatResource(matchingDomainPairs)} pair(s))
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Act floor x{formatResource(actFloorMultiplier, 2)}
            {actFloorMultiplier > 1 ? " (Echo uplift active)" : " (base floor)"}.
          </p>

          <div className="mt-2 space-y-2">
            {sortedActs.map((act) => {
              const projectedBelief = actProjectedBelief[act.type];
              const deEmphasized = projectedBelief < strongestProjected * 0.55;
              return (
              <div
                key={act.type}
                className={
                  deEmphasized
                    ? "rounded-lg border border-white/10 bg-black/20 p-2 opacity-70"
                    : "rounded-lg border border-white/10 bg-black/20 p-2"
                }
              >
                <p className="text-xs text-veil/80">{act.label}</p>
                <p className="text-[11px] text-veil/60">{act.hint}</p>
                <p className="mt-1 text-[11px] text-veil/60">
                  {formatResource(actCosts[act.type])} Influence, {formatDurationCompact(actDurations[act.type])}
                </p>
                <p className="mt-1 text-[11px] text-veil/60">
                  Projected return {formatResource(projectedBelief)} Belief
                  {actResonantBonus > 0 ? ` | resonant bonus +${formatResource(actResonantBonus, 2)}` : ""}
                </p>
                <button
                  type="button"
                  disabled={!canStartAct[act.type]}
                  onClick={() => onStartAct(act.type)}
                  className="mt-1 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
                >
                  Start
                </button>
              </div>
            )})}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Rivals</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(rivalsCount)} active, strength {formatResource(rivalStrength)}
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Follower drain: {formatResource(rivalDrainPerSecond)}/s
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Next spawn in ~{formatDurationCompact(nextRivalInSeconds)}
          </p>
          <button
            type="button"
            disabled={!canSuppressRival}
            onClick={onSuppressRival}
            className="mt-2 rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Suppress Rival ({formatResource(suppressCost)} Influence)
          </button>

          <div className="mt-2 space-y-1">
            {activeActs.length <= 0 ? (
              <p className="text-xs text-veil/65">No active acts.</p>
            ) : (
              activeActs.map((act) => (
                <p key={act.id} className="text-xs text-veil/70">
                  {ACT_CONFIG.find((entry) => entry.type === act.type)?.label ?? "Act"} ends in{" "}
                  {formatDurationCompact(act.remainingSeconds)}
                </p>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

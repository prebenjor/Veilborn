import type { ActType, FollowerRiteType } from "../../core/state/gameState";
import { formatProjected, formatResource } from "../../core/ui/numberFormat";
import { formatDurationCompact } from "../../core/ui/timeFormat";

interface ActiveActView {
  id: string;
  type: ActType;
  remainingSeconds: number;
}

interface FollowerRiteView {
  type: FollowerRiteType;
  label: string;
  hint: string;
  influenceCost: number;
  beliefCost: number;
  projectedFollowers: number;
  uses: number;
  canPerform: boolean;
}

interface DoctrinePanelProps {
  era: number;
  cultOutput: number;
  domainSynergy: number;
  actSlotCap: number;
  activeActs: ActiveActView[];
  actCosts: Record<ActType, number>;
  actDurations: Record<ActType, number>;
  actProjectedBelief: Record<ActType, number>;
  actResonantBonus: number;
  canStartAct: Record<ActType, boolean>;
  onStartAct: (type: ActType) => void;
  followerRites: FollowerRiteView[];
  onPerformFollowerRite: (type: FollowerRiteType) => void;
  rivalsCount: number;
  rivalStrength: number;
  rivalDrainPerSecond: number;
  nextRivalInSeconds: number;
  canSuppressRival: boolean;
  suppressCost: number;
  onSuppressRival: () => void;
  showActs?: boolean;
  showRivals?: boolean;
}

const ACT_CONFIG: Array<{ type: ActType; label: string; hint: string }> = [
  { type: "shrine", label: "Raise Shrine", hint: "Fast, steady Belief return." },
  { type: "ritual", label: "Bind Ritual", hint: "Balanced duration and payout." },
  { type: "proclaim", label: "Great Proclamation", hint: "Longest act, largest return." }
];

export function DoctrinePanel({
  era,
  cultOutput,
  domainSynergy,
  actSlotCap,
  activeActs,
  actCosts,
  actDurations,
  actProjectedBelief,
  actResonantBonus,
  canStartAct,
  onStartAct,
  followerRites,
  onPerformFollowerRite,
  rivalsCount,
  rivalStrength,
  rivalDrainPerSecond,
  nextRivalInSeconds,
  canSuppressRival,
  suppressCost,
  onSuppressRival,
  showActs = true,
  showRivals = true
}: DoctrinePanelProps) {
  if (era < 2) return null;

  if (!showActs && !showRivals) return null;

  const slotsUsed = activeActs.length;
  const sortedActs = [...ACT_CONFIG].sort(
    (left, right) => actProjectedBelief[right.type] - actProjectedBelief[left.type]
  );
  const strongestProjected = Math.max(...sortedActs.map((act) => actProjectedBelief[act.type]), 1);
  const hasRivals = rivalsCount > 0;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">
        {showActs && showRivals ? "Doctrine" : showRivals ? "Rivals" : "Doctrine"}
      </h2>

      <div
        className={`mt-3 grid gap-3 ${
          showActs && showRivals ? "md:grid-cols-2" : "md:grid-cols-1"
        }`}
      >
        {showActs ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Acts</p>
            <p className="mt-1 text-sm text-white">
              {formatResource(slotsUsed)} of {formatResource(actSlotCap)} slots active
            </p>
            <p className="mt-1 text-xs text-veil/65">
              Cult output {formatResource(cultOutput)}/s · synergy x{formatResource(domainSynergy, 2)}
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
                      {formatProjected(projectedBelief)} Belief
                      {actResonantBonus > 0 ? ` · resonant +${formatResource(actResonantBonus, 2)}` : ""}
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
                );
              })}
            </div>

            {era >= 3 && followerRites.length > 0 ? (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Follower Rites</p>
                {followerRites.map((rite) => (
                  <div key={rite.type} className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <p className="text-xs text-veil/80">{rite.label}</p>
                    <p className="text-[11px] text-veil/60">{rite.hint}</p>
                    <p className="mt-1 text-[11px] text-veil/60">
                      Cost {formatResource(rite.influenceCost)} Influence + {formatResource(rite.beliefCost)} Belief
                    </p>
                    <p className="mt-1 text-[11px] text-veil/60">
                      {formatProjected(rite.projectedFollowers)} followers · {formatResource(rite.uses)} uses
                    </p>
                    <button
                      type="button"
                      disabled={!rite.canPerform}
                      onClick={() => onPerformFollowerRite(rite.type)}
                      className="mt-1 rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
                    >
                      Invoke
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ) : null}

        {showRivals ? (
          <article className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Rivals</p>
            {hasRivals ? (
              <p className="mt-1 text-sm text-white">
                {formatResource(rivalsCount)} active, strength {formatResource(rivalStrength)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-white">No rivals present</p>
            )}
            {rivalDrainPerSecond > 0 ? (
              <p className="mt-1 text-xs text-veil/65">
                Follower drain: {formatResource(rivalDrainPerSecond)}/s
              </p>
            ) : null}
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
          </article>
        ) : null}
      </div>

    </section>
  );
}

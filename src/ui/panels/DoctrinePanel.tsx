import type { ActType } from "../../core/state/gameState";

interface ActiveActView {
  id: string;
  type: ActType;
  remainingSeconds: number;
}

interface DoctrinePanelProps {
  era: number;
  cults: number;
  influence: number;
  actSlotCap: number;
  activeActs: ActiveActView[];
  actCosts: Record<ActType, number>;
  actDurations: Record<ActType, number>;
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

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
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
  actSlotCap,
  activeActs,
  actCosts,
  actDurations,
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
  if (era < 2) {
    return (
      <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
        <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine</h2>
        <p className="mt-2 text-sm text-veil/70">
          Era II unlocks acts, rival pressure, and doctrine-level decisions.
        </p>
      </section>
    );
  }

  const slotsUsed = activeActs.length;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Doctrine</h2>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Acts</p>
          <p className="mt-1 text-sm text-white">
            {slotsUsed}/{actSlotCap} active slots from {formatNumber(cults)} cults
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Influence {formatNumber(influence)} available
          </p>

          <div className="mt-2 space-y-2">
            {ACT_CONFIG.map((act) => (
              <div key={act.type} className="rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-xs text-veil/80">{act.label}</p>
                <p className="text-[11px] text-veil/60">{act.hint}</p>
                <p className="mt-1 text-[11px] text-veil/60">
                  {formatNumber(actCosts[act.type])} Influence, {formatNumber(actDurations[act.type])}s
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
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Rivals</p>
          <p className="mt-1 text-sm text-white">
            {formatNumber(rivalsCount)} active, strength {formatNumber(rivalStrength)}
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Follower drain: {formatNumber(rivalDrainPerSecond)}/s
          </p>
          <p className="mt-1 text-xs text-veil/65">
            Next spawn in ~{formatNumber(nextRivalInSeconds)}s
          </p>
          <button
            type="button"
            disabled={!canSuppressRival}
            onClick={onSuppressRival}
            className="mt-2 rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Suppress Rival ({formatNumber(suppressCost)} Influence)
          </button>

          <div className="mt-2 space-y-1">
            {activeActs.length <= 0 ? (
              <p className="text-xs text-veil/65">No active acts.</p>
            ) : (
              activeActs.map((act) => (
                <p key={act.id} className="text-xs text-veil/70">
                  {ACT_CONFIG.find((entry) => entry.type === act.type)?.label ?? "Act"} ends in{" "}
                  {formatNumber(act.remainingSeconds)}s
                </p>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

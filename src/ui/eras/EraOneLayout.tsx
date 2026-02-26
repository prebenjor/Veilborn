import { CollapsibleContainer } from "../layout/CollapsibleContainer";
import { formatResource } from "../../core/ui/numberFormat";
import type { AcolyteOrder } from "../../core/state/gameState";

interface OmenEntry {
  id: string;
  text: string;
}

interface ActiveDoubtEventView {
  scene: string;
  choiceALabel: string;
  choiceBLabel: string;
  choiceBCost: number;
  canChooseB: boolean;
}

interface EraOneLayoutProps {
  whisperCost: number;
  whisperPreview: string;
  recruitPreview: string;
  devotionStacks: number;
  cadencePromptActive: boolean;
  canUseWhisper: boolean;
  canUseRecruit: boolean;
  acolytes: number;
  nextAcolyteFollowers: number;
  canCreateAcolyte: boolean;
  canUseAcolyteOrder: boolean;
  acolyteOrder: AcolyteOrder;
  acolyteOrderRemainingSeconds: number;
  acolyteOrderPotency: number;
  acolyteGatherPassivePerSecond: number;
  acolyteSteadyInfluencePerSecond: number;
  acolyteListenRecruitMultiplier: number;
  acolyteListenWhisperBeliefMultiplier: number;
  omenTitle: string;
  visibleOmens: OmenEntry[];
  activeDoubtEvent: ActiveDoubtEventView | null;
  onWhisper: () => void;
  onRecruit: () => void;
  onOrdainAcolyte: () => void;
  onIssueAcolyteOrder: (order: Exclude<AcolyteOrder, "none">) => void;
  onResolveDoubtChoice: (choice: "a" | "b") => void;
}

export function EraOneLayout({
  whisperCost,
  whisperPreview,
  recruitPreview,
  devotionStacks,
  cadencePromptActive,
  canUseWhisper,
  canUseRecruit,
  acolytes,
  nextAcolyteFollowers,
  canCreateAcolyte,
  canUseAcolyteOrder,
  acolyteOrder,
  acolyteOrderRemainingSeconds,
  acolyteOrderPotency,
  acolyteGatherPassivePerSecond,
  acolyteSteadyInfluencePerSecond,
  acolyteListenRecruitMultiplier,
  acolyteListenWhisperBeliefMultiplier,
  omenTitle,
  visibleOmens,
  activeDoubtEvent,
  onWhisper,
  onRecruit,
  onOrdainAcolyte,
  onIssueAcolyteOrder,
  onResolveDoubtChoice
}: EraOneLayoutProps) {
  const orderSummary =
    acolyteOrder === "none"
      ? "No order active"
      : `${acolyteOrder} · ${formatResource(acolyteOrderRemainingSeconds)}s left`;

  const whispersSummary =
    canUseWhisper || canUseRecruit
      ? `Whisper ${formatResource(whisperCost)} · Recruit`
      : "Influence is recovering";
  const acolyteSummary = `${formatResource(acolytes)} active · next at ${formatResource(nextAcolyteFollowers)} followers`;

  return (
    <>
      <div className="space-y-2">
        <CollapsibleContainer
          title="Whispers"
          summary={whispersSummary}
          storageKey="era1_active_whispers_collapsed"
        >
          <p className="text-sm text-veil/70">Words spread. Silence lets faith fade.</p>
          {cadencePromptActive ? (
            <p className="mt-2 rounded-lg border border-ember/40 bg-ember/10 px-2 py-1 text-xs text-ember">
              Silence is thickening. Act now for a cadence bonus.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              title={`Whisper: ${whisperPreview}`}
              disabled={!canUseWhisper}
              onClick={onWhisper}
              className="rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Whisper ({formatResource(whisperCost)} Influence)
            </button>
            <button
              type="button"
              title={`Recruit: ${recruitPreview}`}
              disabled={!canUseRecruit}
              onClick={onRecruit}
              className="w-full rounded-xl border border-omen/60 px-4 py-3 text-base font-semibold uppercase tracking-[0.16em] text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              RECRUIT
            </button>
          </div>
          {devotionStacks > 0 ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-veil/70">
              <span className="tracking-[0.2em]">
                {[0, 1, 2].map((index) => (
                  <span key={index} className={index < devotionStacks ? "text-omen" : "text-white/30"}>
                    *
                  </span>
                ))}
              </span>
              <span>Devotion</span>
            </p>
          ) : null}
        </CollapsibleContainer>

        <CollapsibleContainer
          title="Acolytes"
          summary={`${acolyteSummary} · ${orderSummary}`}
          storageKey="era1_active_acolytes_collapsed"
        >
          <p className="text-sm text-white">{acolyteSummary}</p>
          <p className="mt-1 text-xs text-veil/65">
            Active order: {orderSummary}
            {acolyteOrder !== "none" ? ` · potency ${formatResource(acolyteOrderPotency * 100, 0)}%` : ""}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={!canUseAcolyteOrder || acolyteOrder === "gather"}
              onClick={() => onIssueAcolyteOrder("gather")}
              className="rounded-lg border border-ember/50 px-2 py-2 text-left text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              <p className="text-sm text-ember">Gather</p>
              <p className="mt-1 text-veil/65">Passive +{formatResource(acolyteGatherPassivePerSecond, 2)} followers/s</p>
            </button>
            <button
              type="button"
              disabled={!canUseAcolyteOrder || acolyteOrder === "listen"}
              onClick={() => onIssueAcolyteOrder("listen")}
              className="rounded-lg border border-ember/50 px-2 py-2 text-left text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              <p className="text-sm text-ember">Listen</p>
              <p className="mt-1 text-veil/65">Recruit x{formatResource(acolyteListenRecruitMultiplier, 2)}</p>
              <p className="text-veil/65">Whisper belief x{formatResource(acolyteListenWhisperBeliefMultiplier, 2)}</p>
            </button>
            <button
              type="button"
              disabled={!canUseAcolyteOrder || acolyteOrder === "steady"}
              onClick={() => onIssueAcolyteOrder("steady")}
              className="rounded-lg border border-ember/50 px-2 py-2 text-left text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              <p className="text-sm text-ember">Steady</p>
              <p className="mt-1 text-veil/65">Influence +{formatResource(acolyteSteadyInfluencePerSecond, 2)}/s</p>
            </button>
          </div>
          <button
            type="button"
            disabled={!canCreateAcolyte}
            onClick={onOrdainAcolyte}
            className="mt-3 rounded-lg border border-white/30 px-2 py-1 text-xs text-veil/85 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Ordain Acolyte
          </button>
        </CollapsibleContainer>

      </div>

      <section className="veil-omen-compact rounded-2xl border border-white/10 bg-black/20 p-4 shadow-veil backdrop-blur-sm min-[800px]:hidden">
        <h2 className="text-xs uppercase tracking-[0.25em] text-veil/70">{omenTitle}</h2>
        {activeDoubtEvent ? (
          <>
            <div className="mt-2 rounded-lg border border-white/20 bg-black/30 p-3">
              <p className="text-sm text-veil/80">{activeDoubtEvent.scene}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onResolveDoubtChoice("a")}
                  className="rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10"
                >
                  {activeDoubtEvent.choiceALabel}
                </button>
                <button
                  type="button"
                  disabled={!activeDoubtEvent.canChooseB}
                  onClick={() => onResolveDoubtChoice("b")}
                  className="rounded-xl border border-omen/60 px-3 py-2 text-sm text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
                >
                  {activeDoubtEvent.choiceBLabel}
                  {activeDoubtEvent.choiceBCost > 0
                    ? ` (${formatResource(activeDoubtEvent.choiceBCost)} Influence)`
                    : ""}
                </button>
              </div>
            </div>
            <div className="mt-2 border-t border-white/10" />
          </>
        ) : null}
        <ul className="mt-2 space-y-2 text-sm text-veil/75">
          {visibleOmens.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

import { useState, type ReactNode } from "react";
import { formatResource } from "../../core/ui/numberFormat";

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
  prophets: number;
  nextProphetFollowers: number;
  canCreateProphet: boolean;
  omenTitle: string;
  visibleOmens: OmenEntry[];
  activeDoubtEvent: ActiveDoubtEventView | null;
  eraGatePanel: ReactNode;
  onWhisper: () => void;
  onRecruit: () => void;
  onAnointProphet: () => void;
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
  prophets,
  nextProphetFollowers,
  canCreateProphet,
  omenTitle,
  visibleOmens,
  activeDoubtEvent,
  eraGatePanel,
  onWhisper,
  onRecruit,
  onAnointProphet,
  onResolveDoubtChoice
}: EraOneLayoutProps) {
  const [hoveredAction, setHoveredAction] = useState<"whisper" | "recruit" | null>(null);

  return (
    <>
      <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
        <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Whispers</h2>
        <p className="mt-3 text-sm text-veil/70">Words spread. Silence lets faith fade.</p>
        {cadencePromptActive ? (
          <p className="mt-2 rounded-lg border border-ember/40 bg-ember/10 px-2 py-1 text-xs text-ember">
            Silence is thickening. Act now for a cadence bonus.
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canUseWhisper}
            onClick={onWhisper}
            onMouseEnter={() => setHoveredAction("whisper")}
            onMouseLeave={() => setHoveredAction((previous) => (previous === "whisper" ? null : previous))}
            onFocus={() => setHoveredAction("whisper")}
            onBlur={() => setHoveredAction((previous) => (previous === "whisper" ? null : previous))}
            className="rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Whisper ({formatResource(whisperCost)} Influence)
          </button>
          <button
            type="button"
            disabled={!canUseRecruit}
            onClick={onRecruit}
            onMouseEnter={() => setHoveredAction("recruit")}
            onMouseLeave={() => setHoveredAction((previous) => (previous === "recruit" ? null : previous))}
            onFocus={() => setHoveredAction("recruit")}
            onBlur={() => setHoveredAction((previous) => (previous === "recruit" ? null : previous))}
            className="w-full rounded-xl border border-omen/60 px-4 py-3 text-base font-semibold uppercase tracking-[0.16em] text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            RECRUIT
          </button>
        </div>
        {hoveredAction ? (
          <p className="mt-2 text-xs text-veil/65">
            {hoveredAction === "whisper" ? `Whisper: ${whisperPreview}` : `Recruit: ${recruitPreview}`}
          </p>
        ) : null}
        {devotionStacks > 0 ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-veil/70">
            <span className="tracking-[0.2em]">
              {[0, 1, 2].map((index) => (
                <span key={index} className={index < devotionStacks ? "text-omen" : "text-white/30"}>
                  ●
                </span>
              ))}
            </span>
            <span>Devotion</span>
          </p>
        ) : null}

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
          <p className="mt-1 text-sm text-white">
            {formatResource(prophets)} active {"\u00b7"} {formatResource(nextProphetFollowers)} followers to next
          </p>
          <button
            type="button"
            disabled={!canCreateProphet}
            onClick={onAnointProphet}
            className="mt-2 rounded-lg border border-omen/60 px-2 py-1 text-xs text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Anoint Prophet
          </button>
        </div>
      </section>
      {eraGatePanel}
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

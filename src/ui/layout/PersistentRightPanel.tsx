import type { ReactNode } from "react";
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

interface PersistentRightPanelProps {
  era: 1 | 2 | 3;
  omenTitle: string;
  omenEntries: OmenEntry[];
  activeDoubtEvent: ActiveDoubtEventView | null;
  onResolveDoubtChoice: (choice: "a" | "b") => void;
  statsContent: ReactNode;
}

export function PersistentRightPanel({
  era,
  omenTitle,
  omenEntries,
  activeDoubtEvent,
  onResolveDoubtChoice,
  statsContent
}: PersistentRightPanelProps) {
  return (
    <aside className="hidden w-[280px] rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-veil/80 shadow-veil backdrop-blur-sm lg:sticky lg:top-8 lg:flex lg:h-[calc(100vh-4rem)] lg:flex-col">
      <section className="flex min-h-0 flex-[3] flex-col">
        <h2 className="text-xs uppercase tracking-[0.25em] text-veil/80">{omenTitle}</h2>
        {era === 1 && activeDoubtEvent ? (
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
        ) : null}
        <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 text-[12px] text-veil/75">
          {omenEntries.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      </section>

      <div className="my-4 border-t border-white/10" />

      <section className="min-h-0 flex-[2] overflow-y-auto pr-1">{statsContent}</section>
    </aside>
  );
}


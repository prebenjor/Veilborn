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
}

export function PersistentRightPanel({
  era,
  omenTitle,
  omenEntries,
  activeDoubtEvent,
  onResolveDoubtChoice
}: PersistentRightPanelProps) {
  return (
    <aside className="hidden rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-veil/80 shadow-veil backdrop-blur-sm min-[800px]:sticky min-[800px]:top-8 min-[800px]:flex min-[800px]:w-[240px] min-[800px]:shrink-0 min-[800px]:flex-col lg:w-[300px]">
      <section className="flex flex-col">
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
        <ul className="mt-2 space-y-1 pr-1 text-[12px] text-veil/75">
          {omenEntries.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

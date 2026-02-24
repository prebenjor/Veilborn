import type { ReactNode } from "react";
import { CollapsibleContainer } from "../layout/CollapsibleContainer";

interface EraThreeActiveLayoutProps {
  cataclysmPanel: ReactNode;
  rivalsPanel: ReactNode;
  whisperPanel: ReactNode;
  cataclysmSummary: string;
  rivalsSummary: string;
  whisperSummary: string;
  hasActiveRivals: boolean;
}

export function EraThreeActiveLayout({
  cataclysmPanel,
  rivalsPanel,
  whisperPanel,
  cataclysmSummary,
  rivalsSummary,
  whisperSummary,
  hasActiveRivals
}: EraThreeActiveLayoutProps) {
  return (
    <div className="space-y-2">
      <CollapsibleContainer
        title="Cataclysm"
        summary={cataclysmSummary}
        storageKey="active_cataclysm_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {cataclysmPanel}
        </div>
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Rivals"
        summary={rivalsSummary}
        storageKey="active_rivals_collapsed"
        defaultCollapsed={!hasActiveRivals}
        forceExpanded={hasActiveRivals}
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {rivalsPanel}
        </div>
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Whispers"
        summary={whisperSummary}
        storageKey="active_whispers_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {whisperPanel}
        </div>
      </CollapsibleContainer>
    </div>
  );
}

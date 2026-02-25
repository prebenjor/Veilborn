import type { ReactNode } from "react";
import { CollapsibleContainer } from "../layout/CollapsibleContainer";

interface EraThreeActiveLayoutProps {
  whisperPanel: ReactNode;
  doctrinePanel: ReactNode;
  progressPanel: ReactNode;
  cataclysmPanel: ReactNode;
  whisperSummary: string;
  doctrineSummary: string;
  cataclysmSummary: string;
}

export function EraThreeActiveLayout({
  whisperPanel,
  doctrinePanel,
  progressPanel,
  cataclysmPanel,
  whisperSummary,
  doctrineSummary,
  cataclysmSummary,
}: EraThreeActiveLayoutProps) {
  return (
    <div className="space-y-2">
      <CollapsibleContainer
        title="Whispers"
        summary={whisperSummary}
        storageKey="active_whispers_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {whisperPanel}
        </div>
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Doctrine"
        summary={doctrineSummary}
        storageKey="active_doctrine_collapsed"
      >
        <div className="space-y-3 [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {progressPanel}
          {doctrinePanel}
        </div>
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Cataclysm"
        summary={cataclysmSummary}
        storageKey="active_cataclysm_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {cataclysmPanel}
        </div>
      </CollapsibleContainer>
    </div>
  );
}

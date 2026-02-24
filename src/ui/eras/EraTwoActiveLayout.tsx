import type { ReactNode } from "react";
import { CollapsibleContainer } from "../layout/CollapsibleContainer";

interface EraTwoActiveLayoutProps {
  whisperPanel: ReactNode;
  influenceMeter: ReactNode;
  doctrinePanel: ReactNode;
  progressPanel: ReactNode;
  whisperSummary: string;
  influenceSummary: string;
  doctrineSummary: string;
  progressSummary: string;
}

export function EraTwoActiveLayout({
  whisperPanel,
  influenceMeter,
  doctrinePanel,
  progressPanel,
  whisperSummary,
  influenceSummary,
  doctrineSummary,
  progressSummary
}: EraTwoActiveLayoutProps) {
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
        title="Influence"
        summary={influenceSummary}
        storageKey="active_influence_collapsed"
      >
        {influenceMeter}
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Doctrine"
        summary={doctrineSummary}
        storageKey="active_doctrine_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {doctrinePanel}
        </div>
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Doctrine Seeds"
        summary={progressSummary}
        storageKey="active_progress_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {progressPanel}
        </div>
      </CollapsibleContainer>
    </div>
  );
}

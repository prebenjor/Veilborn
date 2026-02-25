import type { ReactNode } from "react";
import { CollapsibleContainer } from "../layout/CollapsibleContainer";

interface EraTwoActiveLayoutProps {
  whisperPanel: ReactNode;
  doctrinePanel: ReactNode;
  progressPanel: ReactNode;
  whisperSummary: string;
  doctrineSummary: string;
}

export function EraTwoActiveLayout({
  whisperPanel,
  doctrinePanel,
  progressPanel,
  whisperSummary,
  doctrineSummary
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
        title="Doctrine"
        summary={doctrineSummary}
        storageKey="active_doctrine_collapsed"
      >
        <div className="space-y-3 [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {progressPanel}
          {doctrinePanel}
        </div>
      </CollapsibleContainer>
    </div>
  );
}

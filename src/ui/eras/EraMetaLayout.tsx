import type { ReactNode } from "react";
import { CollapsibleContainer } from "../layout/CollapsibleContainer";

interface EraMetaLayoutProps {
  overviewPanel: ReactNode;
  remembrancePanel: ReactNode;
  pantheonPanel: ReactNode | null;
  overviewSummary: string;
  remembranceSummary: string;
  pantheonSummary: string;
}

export function EraMetaLayout({
  overviewPanel,
  remembrancePanel,
  pantheonPanel,
  overviewSummary,
  remembranceSummary,
  pantheonSummary
}: EraMetaLayoutProps) {
  return (
    <div className="space-y-2">
      <CollapsibleContainer title="Overview" summary={overviewSummary} storageKey="meta_overview_collapsed">
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {overviewPanel}
        </div>
      </CollapsibleContainer>

      <CollapsibleContainer
        title="Remembrance"
        summary={remembranceSummary}
        storageKey="meta_remembrance_collapsed"
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {remembrancePanel}
        </div>
      </CollapsibleContainer>

      {pantheonPanel ? (
        <CollapsibleContainer
          title="Pantheon"
          summary={pantheonSummary}
          storageKey="meta_pantheon_collapsed"
        >
          <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
            {pantheonPanel}
          </div>
        </CollapsibleContainer>
      ) : null}
    </div>
  );
}

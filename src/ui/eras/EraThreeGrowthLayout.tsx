import type { ReactNode } from "react";

interface EraThreeGrowthLayoutProps {
  domainPanel: ReactNode;
  doctrinePanel: ReactNode;
  progressPanel: ReactNode;
}

export function EraThreeGrowthLayout({
  domainPanel,
  doctrinePanel,
  progressPanel
}: EraThreeGrowthLayoutProps) {
  return (
    <>
      {domainPanel}
      {doctrinePanel}
      {progressPanel}
    </>
  );
}

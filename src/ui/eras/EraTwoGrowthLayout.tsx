import type { ReactNode } from "react";

interface EraTwoGrowthLayoutProps {
  domainPanel: ReactNode;
  rivalsPanel: ReactNode;
  thresholdPanel: ReactNode;
}

export function EraTwoGrowthLayout({
  domainPanel,
  rivalsPanel,
  thresholdPanel
}: EraTwoGrowthLayoutProps) {
  return (
    <>
      {domainPanel}
      {rivalsPanel}
      {thresholdPanel}
    </>
  );
}

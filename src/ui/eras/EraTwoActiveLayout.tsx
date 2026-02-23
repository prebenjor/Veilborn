import type { ReactNode } from "react";

interface EraTwoActiveLayoutProps {
  whisperPanel: ReactNode;
  influenceMeter: ReactNode;
  doctrinePanel: ReactNode;
  progressPanel: ReactNode;
}

export function EraTwoActiveLayout({
  whisperPanel,
  influenceMeter,
  doctrinePanel,
  progressPanel
}: EraTwoActiveLayoutProps) {
  return (
    <>
      {whisperPanel}
      {influenceMeter}
      {doctrinePanel}
      {progressPanel}
    </>
  );
}

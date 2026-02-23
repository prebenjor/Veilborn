import type { ReactNode } from "react";

interface EraThreeActiveLayoutProps {
  cataclysmPanel: ReactNode;
  rivalsPanel: ReactNode;
  whisperPanel: ReactNode;
}

export function EraThreeActiveLayout({
  cataclysmPanel,
  rivalsPanel,
  whisperPanel
}: EraThreeActiveLayoutProps) {
  return (
    <>
      {cataclysmPanel}
      {rivalsPanel}
      {whisperPanel}
    </>
  );
}

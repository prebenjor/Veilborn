import { useEffect, useState, type ReactNode } from "react";

const GROWTH_DOMAINS_COLLAPSED_KEY = "growth_domains_collapsed";
const GROWTH_RIVALS_COLLAPSED_KEY = "growth_rivals_collapsed";
const GROWTH_THRESHOLD_COLLAPSED_KEY = "growth_threshold_collapsed";

interface EraTwoGrowthLayoutProps {
  domainPanel: ReactNode;
  rivalsPanel: ReactNode;
  thresholdPanel: ReactNode;
  domainsSummary: string;
  rivalsSummary: string;
  thresholdSummary: string;
  thresholdProgressRatio: number;
  hasActiveRivals: boolean;
}

function loadCollapsedState(storageKey: string, defaultCollapsed: boolean): boolean {
  if (typeof window === "undefined") return defaultCollapsed;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    // Ignore localStorage read failures.
  }
  return defaultCollapsed;
}

function persistCollapsedState(storageKey: string, collapsed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, collapsed ? "1" : "0");
  } catch {
    // Ignore localStorage write failures.
  }
}

interface GrowthContainerProps {
  title: string;
  summary: string;
  storageKey: string;
  defaultCollapsed: boolean;
  forceExpanded?: boolean;
  showMiniProgress?: boolean;
  miniProgressRatio?: number;
  children: ReactNode;
}

function GrowthContainer({
  title,
  summary,
  storageKey,
  defaultCollapsed,
  forceExpanded = false,
  showMiniProgress = false,
  miniProgressRatio = 0,
  children
}: GrowthContainerProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    loadCollapsedState(storageKey, defaultCollapsed)
  );

  useEffect(() => {
    if (!forceExpanded) return;
    setCollapsed((previous) => {
      if (!previous) return previous;
      persistCollapsedState(storageKey, false);
      return false;
    });
  }, [forceExpanded, storageKey]);

  const onToggle = () => {
    setCollapsed((previous) => {
      const next = !previous;
      persistCollapsedState(storageKey, next);
      return next;
    });
  };

  const clampedMiniRatio = Math.max(0, Math.min(1, miniProgressRatio));

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-lg text-left transition hover:text-veil"
      >
        <span className="text-sm uppercase tracking-[0.25em] text-veil/80">{title}</span>
        <span className="text-xs text-veil/75">{collapsed ? ">" : "v"}</span>
      </button>

      {collapsed ? (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-veil/70">{summary}</p>
          {showMiniProgress ? (
            <div className="h-1.5 overflow-hidden rounded-full border border-white/15 bg-black/40">
              <div className="h-full bg-veil/60" style={{ width: `${(clampedMiniRatio * 100).toFixed(2)}%` }} />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}

export function EraTwoGrowthLayout({
  domainPanel,
  rivalsPanel,
  thresholdPanel,
  domainsSummary,
  rivalsSummary,
  thresholdSummary,
  thresholdProgressRatio,
  hasActiveRivals
}: EraTwoGrowthLayoutProps) {
  return (
    <div className="space-y-2">
      <GrowthContainer
        title="Domains"
        summary={domainsSummary}
        storageKey={GROWTH_DOMAINS_COLLAPSED_KEY}
        defaultCollapsed={false}
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {domainPanel}
        </div>
      </GrowthContainer>

      <GrowthContainer
        title="Rivals"
        summary={rivalsSummary}
        storageKey={GROWTH_RIVALS_COLLAPSED_KEY}
        defaultCollapsed={!hasActiveRivals}
        forceExpanded={hasActiveRivals}
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {rivalsPanel}
        </div>
      </GrowthContainer>

      <GrowthContainer
        title="Threshold"
        summary={thresholdSummary}
        storageKey={GROWTH_THRESHOLD_COLLAPSED_KEY}
        defaultCollapsed
        showMiniProgress
        miniProgressRatio={thresholdProgressRatio}
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {thresholdPanel}
        </div>
      </GrowthContainer>
    </div>
  );
}

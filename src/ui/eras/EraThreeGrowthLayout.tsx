import { useEffect, useState, type ReactNode } from "react";

const GROWTH_DOMAINS_COLLAPSED_KEY = "growth_domains_collapsed";
const GROWTH_RIVALS_COLLAPSED_KEY = "growth_rivals_collapsed";

interface EraThreeGrowthLayoutProps {
  domainPanel: ReactNode;
  rivalsPanel: ReactNode;
  domainsSummary: string;
  rivalsSummary: string;
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
  children: ReactNode;
}

function GrowthContainer({
  title,
  summary,
  storageKey,
  defaultCollapsed,
  forceExpanded = false,
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
        <p className="mt-2 text-xs text-veil/70">{summary}</p>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}

export function EraThreeGrowthLayout({
  domainPanel,
  rivalsPanel,
  domainsSummary,
  rivalsSummary,
  hasActiveRivals
}: EraThreeGrowthLayoutProps) {
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
        defaultCollapsed={false}
        forceExpanded={hasActiveRivals}
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {rivalsPanel}
        </div>
      </GrowthContainer>
    </div>
  );
}

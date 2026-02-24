import { useEffect, useState, type ReactNode } from "react";

interface CollapsibleContainerProps {
  title: string;
  summary: string;
  storageKey: string;
  defaultCollapsed?: boolean;
  forceExpanded?: boolean;
  showMiniProgress?: boolean;
  miniProgressRatio?: number;
  children: ReactNode;
  sectionClassName?: string;
  contentClassName?: string;
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

export function CollapsibleContainer({
  title,
  summary,
  storageKey,
  defaultCollapsed = false,
  forceExpanded = false,
  showMiniProgress = false,
  miniProgressRatio = 0,
  children,
  sectionClassName,
  contentClassName
}: CollapsibleContainerProps) {
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
    <section
      className={
        sectionClassName ?? "rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm"
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
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
        <div className={contentClassName ?? "mt-3"}>{children}</div>
      )}
    </section>
  );
}

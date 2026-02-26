type UiTab = "active" | "growth" | "threshold" | "gate" | "legacy" | "meta";

interface TabDockProps {
  availableTabs: UiTab[];
  activeTab: UiTab;
  onSelectTab: (tab: UiTab) => void;
}

export function TabDock({ availableTabs, activeTab, onSelectTab }: TabDockProps) {
  return (
    <nav
      aria-label="Era tabs"
      className="veil-tab-dock sticky top-2 z-20 rounded-xl border border-white/15 bg-black/40 p-1 backdrop-blur-sm"
    >
      <div className="flex flex-wrap gap-1">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            aria-pressed={activeTab === tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
              tab === "gate"
                ? activeTab === tab
                  ? "border border-ember/60 bg-ember/15 text-ember"
                  : "border border-ember/25 text-ember/80 hover:bg-ember/10 hover:text-ember"
                : activeTab === tab
                  ? "bg-white/14 text-white"
                  : "text-veil/70 hover:bg-white/8 hover:text-veil"
            }`}
          >
            {tab === "active"
              ? "Active"
              : tab === "growth"
                ? "Growth"
                : tab === "threshold"
                  ? "Threshold"
                  : tab === "gate"
                    ? "Gate"
                    : tab === "legacy"
                      ? "Legacy"
                      : "Meta"}
          </button>
        ))}
      </div>
    </nav>
  );
}

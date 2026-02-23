type UiTab = "active" | "growth" | "meta";

interface TabDockProps {
  availableTabs: UiTab[];
  activeTab: UiTab;
  onSelectTab: (tab: UiTab) => void;
}

export function TabDock({ availableTabs, activeTab, onSelectTab }: TabDockProps) {
  return (
    <nav className="veil-tab-dock sticky top-2 z-20 rounded-xl border border-white/15 bg-black/40 p-1 backdrop-blur-sm">
      <div className="flex flex-wrap gap-1">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
              activeTab === tab
                ? "bg-white/14 text-white"
                : "text-veil/70 hover:bg-white/8 hover:text-veil"
            }`}
          >
            {tab === "active" ? "Active" : tab === "growth" ? "Growth" : "Meta"}
          </button>
        ))}
      </div>
    </nav>
  );
}

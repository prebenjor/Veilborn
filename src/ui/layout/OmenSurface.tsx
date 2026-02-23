interface OmenEntry {
  id: string;
  text: string;
}

interface OmenSurfaceProps {
  era: 1 | 2 | 3;
  title: string;
  previewEntries: OmenEntry[];
  expandedEntries: OmenEntry[];
}

export function OmenSurface({ era, title, previewEntries, expandedEntries }: OmenSurfaceProps) {
  return (
    <details
      className={`group veil-omen-surface ${
        era >= 3
          ? "fixed bottom-3 left-3 right-3 z-30 rounded-xl border border-white/15 bg-black/55 p-2 text-xs text-veil/85 backdrop-blur-sm md:bottom-auto md:left-auto md:right-4 md:top-24 md:w-80"
          : "fixed bottom-3 left-3 right-3 z-30 rounded-xl border border-white/15 bg-black/55 p-2 text-xs text-veil/85 backdrop-blur-sm md:right-[17.5rem]"
      }`}
    >
      <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.2em] text-veil/90">
        {title}
      </summary>
      <ul className="mt-2 space-y-1 text-[12px] text-veil/80">
        {previewEntries.map((entry) => (
          <li key={entry.id} className="veil-omen-preview-line">
            {entry.text}
          </li>
        ))}
      </ul>
      {expandedEntries.length > 0 ? (
        <ul className="mt-2 hidden space-y-1 border-t border-white/10 pt-2 text-[12px] text-veil/75 group-open:block">
          {expandedEntries.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}

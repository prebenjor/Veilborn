import { useState } from "react";
import { formatResource } from "../../core/ui/numberFormat";

interface WhisperPanelProps {
  era: number;
  influence: number;
  whisperCost: number;
  whisperPreview: string;
  recruitCost: number;
  recruitPreview: string;
  cadencePromptActive: boolean;
  rivalDrainWarning?: string | null;
  onWhisper: () => void;
  onRecruit: () => void;
}

export function WhisperPanel({
  era,
  influence,
  whisperCost,
  whisperPreview,
  recruitCost,
  recruitPreview,
  cadencePromptActive,
  rivalDrainWarning,
  onWhisper,
  onRecruit
}: WhisperPanelProps) {
  const [hoveredAction, setHoveredAction] = useState<"whisper" | "recruit" | null>(null);
  const whisperDisabled = influence < whisperCost;
  const recruitDisabled = influence < recruitCost;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Whispers</h2>
      {era <= 1 ? (
        <p className="mt-3 text-sm text-veil/70">Words spread. Silence lets faith fade.</p>
      ) : null}
      {cadencePromptActive ? (
        <p className="mt-2 rounded-lg border border-ember/40 bg-ember/10 px-2 py-1 text-xs text-ember">
          Silence is thickening. Act now for a cadence bonus.
        </p>
      ) : null}
      {rivalDrainWarning ? <p className="mt-2 text-xs text-ember/80">{rivalDrainWarning}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={whisperDisabled}
          onClick={onWhisper}
          onMouseEnter={() => setHoveredAction("whisper")}
          onMouseLeave={() => setHoveredAction((previous) => (previous === "whisper" ? null : previous))}
          onFocus={() => setHoveredAction("whisper")}
          onBlur={() => setHoveredAction((previous) => (previous === "whisper" ? null : previous))}
          className="rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Whisper ({formatResource(whisperCost)} Influence)
        </button>
        <button
          type="button"
          disabled={recruitDisabled}
          onClick={onRecruit}
          onMouseEnter={() => setHoveredAction("recruit")}
          onMouseLeave={() => setHoveredAction((previous) => (previous === "recruit" ? null : previous))}
          onFocus={() => setHoveredAction("recruit")}
          onBlur={() => setHoveredAction((previous) => (previous === "recruit" ? null : previous))}
          className="rounded-xl border border-omen/60 px-3 py-2 text-sm text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Recruit ({formatResource(recruitCost)} Influence)
        </button>
      </div>
      {hoveredAction ? (
        <p className="mt-2 text-xs text-veil/65">
          {hoveredAction === "whisper" ? `Whisper: ${whisperPreview}` : `Recruit: ${recruitPreview}`}
        </p>
      ) : null}
    </section>
  );
}

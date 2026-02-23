interface WhisperPanelProps {
  influence: number;
  whisperCost: number;
  recruitCost: number;
  recruitPreview: string;
  cadencePromptActive: boolean;
  onWhisper: () => void;
  onRecruit: () => void;
}

export function WhisperPanel({
  influence,
  whisperCost,
  recruitCost,
  recruitPreview,
  cadencePromptActive,
  onWhisper,
  onRecruit
}: WhisperPanelProps) {
  const whisperDisabled = influence < whisperCost;
  const recruitDisabled = influence < recruitCost;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Whispers</h2>
      <p className="mt-3 text-sm text-veil/70">
        Spend influence to keep mortal attention active and faith from fading.
      </p>
      {cadencePromptActive ? (
        <p className="mt-2 rounded-lg border border-ember/40 bg-ember/10 px-2 py-1 text-xs text-ember">
          Silence is thickening. Act now for a cadence bonus.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={whisperDisabled}
          onClick={onWhisper}
          className="rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Whisper ({whisperCost} Influence)
        </button>
        <button
          type="button"
          disabled={recruitDisabled}
          onClick={onRecruit}
          className="rounded-xl border border-omen/60 px-3 py-2 text-sm text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Recruit ({recruitCost} Influence)
        </button>
      </div>
      <p className="mt-2 text-xs text-veil/65">Recruit yield: {recruitPreview}</p>
    </section>
  );
}


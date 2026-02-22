interface WhisperPanelProps {
  influence: number;
  onWhisper: () => void;
}

export function WhisperPanel({ influence, onWhisper }: WhisperPanelProps) {
  const disabled = influence < 10;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Whispers</h2>
      <p className="mt-3 text-sm text-veil/70">
        Spend influence to keep one mortal listening.
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onWhisper}
        className="mt-4 rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
      >
        Whisper (10 Influence)
      </button>
    </section>
  );
}


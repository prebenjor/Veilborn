interface GateLineProps {
  label: string;
  value: string;
  ready: boolean;
}

interface EraGatePanelProps {
  era: number;
  beliefProgress: number;
  beliefTarget: number;
  prophetsProgress: number;
  prophetsTarget: number;
  domainProgress: number;
  domainTarget: number;
  ready: boolean;
  onAdvance: () => void;
}

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function GateLine({ label, value, ready }: GateLineProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-2 py-1">
      <span className="text-xs text-veil/70">{label}</span>
      <span className={ready ? "text-xs text-omen" : "text-xs text-veil/75"}>
        {ready ? "Ready" : value}
      </span>
    </div>
  );
}

export function EraGatePanel({
  era,
  beliefProgress,
  beliefTarget,
  prophetsProgress,
  prophetsTarget,
  domainProgress,
  domainTarget,
  ready,
  onAdvance
}: EraGatePanelProps) {
  if (era >= 2) {
    return (
      <section className="rounded-2xl border border-omen/40 bg-omen/10 p-4 shadow-veil backdrop-blur-sm">
        <h2 className="text-sm uppercase tracking-[0.25em] text-omen">Era II</h2>
        <p className="mt-2 text-sm text-veil/80">
          The whisper age has ended. Doctrine has begun.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Era I Gate</h2>
      <p className="mt-2 text-sm text-veil/70">Meet all conditions to open Era II.</p>
      <div className="mt-3 grid gap-2">
        <GateLine
          label="Total Belief Earned"
          value={`${formatNumber(beliefProgress)} / ${formatNumber(beliefTarget)}`}
          ready={beliefProgress >= beliefTarget}
        />
        <GateLine
          label="Prophets"
          value={`${formatNumber(prophetsProgress)} / ${formatNumber(prophetsTarget)}`}
          ready={prophetsProgress >= prophetsTarget}
        />
        <GateLine
          label="Highest Domain"
          value={`${formatNumber(domainProgress)} / ${formatNumber(domainTarget)}`}
          ready={domainProgress >= domainTarget}
        />
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={onAdvance}
        className="mt-3 rounded-xl border border-veil/60 px-3 py-2 text-sm text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
      >
        Enter Era II
      </button>
    </section>
  );
}


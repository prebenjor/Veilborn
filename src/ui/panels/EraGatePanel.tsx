import { formatDurationCompact } from "../../core/ui/timeFormat";

interface GateLineProps {
  label: string;
  value: string;
  ready: boolean;
}

interface EraGatePanelProps {
  era: number;
  eraOneBeliefProgress: number;
  eraOneBeliefTarget: number;
  prophetsProgress: number;
  prophetsTarget: number;
  domainProgress: number;
  domainTarget: number;
  eraOneReady: boolean;
  eraTwoBeliefProgress: number;
  eraTwoBeliefTarget: number;
  cultsProgress: number;
  cultsTarget: number;
  rivalEventReady: boolean;
  eraTwoReady: boolean;
  unravelingBeliefProgress: number;
  unravelingBeliefTarget: number;
  unravelingVeilProgress: number;
  unravelingVeilTarget: number;
  unravelingMiraclesProgress: number;
  unravelingMiraclesTarget: number;
  unravelingRunTimeProgressSeconds: number;
  unravelingRunTimeTargetSeconds: number;
  unravelingReady: boolean;
  onAdvanceEraOne: () => void;
  onAdvanceEraTwo: () => void;
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
  eraOneBeliefProgress,
  eraOneBeliefTarget,
  prophetsProgress,
  prophetsTarget,
  domainProgress,
  domainTarget,
  eraOneReady,
  eraTwoBeliefProgress,
  eraTwoBeliefTarget,
  cultsProgress,
  cultsTarget,
  rivalEventReady,
  eraTwoReady,
  unravelingBeliefProgress,
  unravelingBeliefTarget,
  unravelingVeilProgress,
  unravelingVeilTarget,
  unravelingMiraclesProgress,
  unravelingMiraclesTarget,
  unravelingRunTimeProgressSeconds,
  unravelingRunTimeTargetSeconds,
  unravelingReady,
  onAdvanceEraOne,
  onAdvanceEraTwo
}: EraGatePanelProps) {
  if (era === 3) {
    return (
      <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
        <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Unraveling Gate</h2>
        <p className="mt-2 text-sm text-veil/70">Meet all conditions to prepare ascension.</p>
        <div className="mt-3 grid gap-2">
          <GateLine
            label="Total Belief Earned"
            value={`${formatNumber(unravelingBeliefProgress)} / ${formatNumber(unravelingBeliefTarget)}`}
            ready={unravelingBeliefProgress >= unravelingBeliefTarget}
          />
          <GateLine
            label="Veil at or below"
            value={`${formatNumber(unravelingVeilProgress)} / ${formatNumber(unravelingVeilTarget)}`}
            ready={unravelingVeilProgress <= unravelingVeilTarget}
          />
          <GateLine
            label="Miracles This Run"
            value={`${formatNumber(unravelingMiraclesProgress)} / ${formatNumber(unravelingMiraclesTarget)}`}
            ready={unravelingMiraclesProgress >= unravelingMiraclesTarget}
          />
          <GateLine
            label="Run Time"
            value={`${formatDurationCompact(unravelingRunTimeProgressSeconds)} / ${formatDurationCompact(unravelingRunTimeTargetSeconds)}`}
            ready={unravelingRunTimeProgressSeconds >= unravelingRunTimeTargetSeconds}
          />
        </div>
        <p className="mt-2 text-xs text-veil/65">
          {unravelingReady
            ? "Gate conditions met. Ascend from the Echo Trees panel."
            : "Pressure the world through miracles and Veil risk to unlock the gate."}
        </p>
      </section>
    );
  }

  if (era === 2) {
    return (
      <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
        <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Era II Gate</h2>
        <p className="mt-2 text-sm text-veil/70">Meet all conditions to open Era III.</p>
        <div className="mt-3 grid gap-2">
          <GateLine
            label="Total Belief Earned"
            value={`${formatNumber(eraTwoBeliefProgress)} / ${formatNumber(eraTwoBeliefTarget)}`}
            ready={eraTwoBeliefProgress >= eraTwoBeliefTarget}
          />
          <GateLine
            label="Cults Formed"
            value={`${formatNumber(cultsProgress)} / ${formatNumber(cultsTarget)}`}
            ready={cultsProgress >= cultsTarget}
          />
          <GateLine
            label="Rival Event Survived"
            value="Awaiting first rival"
            ready={rivalEventReady}
          />
        </div>
        <button
          type="button"
          disabled={!eraTwoReady}
          onClick={onAdvanceEraTwo}
          className="mt-3 rounded-xl border border-veil/60 px-3 py-2 text-sm text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Enter Era III
        </button>
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
          value={`${formatNumber(eraOneBeliefProgress)} / ${formatNumber(eraOneBeliefTarget)}`}
          ready={eraOneBeliefProgress >= eraOneBeliefTarget}
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
        disabled={!eraOneReady}
        onClick={onAdvanceEraOne}
        className="mt-3 rounded-xl border border-veil/60 px-3 py-2 text-sm text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
      >
        Enter Era II
      </button>
    </section>
  );
}

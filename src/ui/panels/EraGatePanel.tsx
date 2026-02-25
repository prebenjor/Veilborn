import { useEffect, useMemo, useState } from "react";
import { formatDurationCompact } from "../../core/ui/timeFormat";
import { formatResource } from "../../core/ui/numberFormat";

type EraGatePresentation = "panel" | "strip";
type GateId = "era1" | "era2" | "unraveling";

interface EraGatePanelProps {
  era: number;
  presentation?: EraGatePresentation;
  eraOneBeliefProgress: number;
  eraOneBeliefTarget: number;
  prophetsProgress: number;
  prophetsTarget: number;
  followersProgress: number;
  followersTarget: number;
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

interface GateConditionView {
  id: string;
  label: string;
  progressText: string;
  ratio: number;
  ready: boolean;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function getGateId(era: number): GateId {
  if (era >= 3) return "unraveling";
  if (era === 2) return "era2";
  return "era1";
}

function getExpandedKey(gateId: GateId): string {
  return `veilborn.ui.gate.${gateId}.expanded.v1`;
}

function getSeenKey(gateId: GateId): string {
  return `veilborn.ui.gate.${gateId}.seen.v1`;
}

function loadGateExpandedState(gateId: GateId): boolean {
  if (typeof window === "undefined") return false;
  try {
    const expandedKey = getExpandedKey(gateId);
    const seenKey = getSeenKey(gateId);
    const storedExpanded = window.localStorage.getItem(expandedKey);
    if (storedExpanded === "1") return true;
    if (storedExpanded === "0") return false;

    const seen = window.localStorage.getItem(seenKey) === "1";
    if (gateId === "era2" && !seen) {
      window.localStorage.setItem(seenKey, "1");
      window.localStorage.setItem(expandedKey, "0");
      return false;
    }
    if (!seen) {
      window.localStorage.setItem(seenKey, "1");
      window.localStorage.setItem(expandedKey, "1");
      return true;
    }
    window.localStorage.setItem(expandedKey, "0");
    return false;
  } catch {
    return false;
  }
}

function persistGateExpandedState(gateId: GateId, expanded: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getSeenKey(gateId), "1");
    window.localStorage.setItem(getExpandedKey(gateId), expanded ? "1" : "0");
  } catch {
    // Ignore localStorage write failures.
  }
}

function buildGteCondition(id: string, label: string, current: number, target: number): GateConditionView {
  const ratio = target <= 0 ? 1 : clamp(current / target);
  return {
    id,
    label,
    progressText: `${formatResource(current)} / ${formatResource(target)}`,
    ratio,
    ready: current >= target
  };
}

function buildLteCondition(
  id: string,
  label: string,
  current: number,
  target: number,
  worstCase = 100
): GateConditionView {
  let ratio = 1;
  if (current > target) {
    ratio = worstCase <= target ? 0 : clamp((worstCase - current) / (worstCase - target));
  }
  return {
    id,
    label,
    progressText: `${formatResource(current)} / ${formatResource(target)}`,
    ratio,
    ready: current <= target
  };
}

function buildBooleanCondition(id: string, label: string, ready: boolean): GateConditionView {
  return {
    id,
    label,
    progressText: ready ? "1 / 1" : "0 / 1",
    ratio: ready ? 1 : 0,
    ready
  };
}

export function EraGatePanel({
  era,
  presentation = "panel",
  eraOneBeliefProgress,
  eraOneBeliefTarget,
  prophetsProgress,
  prophetsTarget,
  followersProgress,
  followersTarget,
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
  const gateId = getGateId(era);
  const [expanded, setExpanded] = useState<boolean>(() => loadGateExpandedState(gateId));

  useEffect(() => {
    setExpanded(loadGateExpandedState(gateId));
  }, [gateId]);

  const {
    title,
    thresholdLabel,
    conditions,
    ready,
    crossAction,
    crossLabel,
    readyHint
  } = useMemo(() => {
    if (era >= 3) {
      const conditionViews: GateConditionView[] = [
        buildGteCondition("belief", "Total Belief Earned", unravelingBeliefProgress, unravelingBeliefTarget),
        buildLteCondition("veil", "Veil at or below", unravelingVeilProgress, unravelingVeilTarget, 100),
        buildGteCondition("miracles", "Miracles This Run", unravelingMiraclesProgress, unravelingMiraclesTarget),
        {
          id: "runtime",
          label: "Run Time",
          progressText: `${formatDurationCompact(unravelingRunTimeProgressSeconds)} / ${formatDurationCompact(
            unravelingRunTimeTargetSeconds
          )}`,
          ratio:
            unravelingRunTimeTargetSeconds <= 0
              ? 1
              : clamp(unravelingRunTimeProgressSeconds / unravelingRunTimeTargetSeconds),
          ready: unravelingRunTimeProgressSeconds >= unravelingRunTimeTargetSeconds
        }
      ];
      return {
        title: "Gate",
        thresholdLabel: "GATE",
        conditions: conditionViews,
        ready: unravelingReady,
        crossAction: null as (() => void) | null,
        crossLabel: "",
        readyHint: unravelingReady
          ? "Gate conditions met. Ascend from the Echo Trees panel."
          : "Pressure the world through miracles and Veil risk to unlock the gate."
      };
    }

    if (era === 2) {
      const conditionViews: GateConditionView[] = [
        buildGteCondition("belief", "Total Belief Earned", eraTwoBeliefProgress, eraTwoBeliefTarget),
        buildGteCondition("cults", "Cults Formed", cultsProgress, cultsTarget),
        buildBooleanCondition("rival", "Rival Event Survived", rivalEventReady)
      ];
      return {
        title: "Threshold",
        thresholdLabel: "THRESHOLD",
        conditions: conditionViews,
        ready: eraTwoReady,
        crossAction: onAdvanceEraTwo,
        crossLabel: "Cross the Threshold",
        readyHint: ""
      };
    }

    const conditionViews: GateConditionView[] = [
      buildGteCondition("belief", "Total Belief Earned", eraOneBeliefProgress, eraOneBeliefTarget),
      buildGteCondition("prophets", "Prophets", prophetsProgress, prophetsTarget),
      buildGteCondition("followers", "Followers", followersProgress, followersTarget)
    ];
    return {
      title: "Threshold",
      thresholdLabel: "THRESHOLD",
      conditions: conditionViews,
      ready: eraOneReady,
      crossAction: onAdvanceEraOne,
      crossLabel: "Cross the Threshold",
      readyHint: ""
    };
  }, [
    era,
    eraOneBeliefProgress,
    eraOneBeliefTarget,
    prophetsProgress,
    prophetsTarget,
    followersProgress,
    followersTarget,
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
  ]);

  const metCount = conditions.filter((condition) => condition.ready).length;
  const totalCount = conditions.length;
  const completionRatio = totalCount <= 0 ? 0 : metCount / totalCount;

  const onToggleExpanded = () => {
    setExpanded((previous) => {
      const next = !previous;
      persistGateExpandedState(gateId, next);
      return next;
    });
  };

  const containerClass =
    presentation === "strip"
      ? "veil-gate-strip rounded-xl border border-white/15 bg-black/30 p-3"
      : "rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm";

  return (
    <section className={containerClass}>
      {presentation === "panel" ? (
        <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">{title}</h2>
      ) : (
        <p className="text-xs uppercase tracking-[0.22em] text-veil/70">{title}</p>
      )}

      <button
        type="button"
        onClick={onToggleExpanded}
        className="mt-2 flex w-full items-center justify-between rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-left transition hover:border-white/25"
      >
        <span className="text-xs uppercase tracking-[0.18em] text-veil/75">
          {ready ? "Ready to cross" : thresholdLabel}
        </span>
        <span className="text-xs text-veil/80">
          {formatResource(metCount)} / {formatResource(totalCount)} {expanded ? "v" : ">"}
        </span>
      </button>

      <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/15 bg-black/40">
        <div
          className={ready ? "h-full bg-ember/70" : "h-full bg-veil/60"}
          style={{ width: `${(completionRatio * 100).toFixed(2)}%` }}
        />
      </div>

      {expanded ? (
        <div className="mt-3 space-y-2">
          {conditions.map((condition) => (
            <article key={condition.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-veil/75">{condition.label}</span>
                <span className={condition.ready ? "text-omen" : "text-veil/70"}>
                  {condition.ready ? `Met ${condition.progressText}` : condition.progressText}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-white/10 bg-black/40">
                <div
                  className={condition.ready ? "h-full bg-omen/70" : "h-full bg-veil/55"}
                  style={{ width: `${(condition.ratio * 100).toFixed(2)}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {crossAction && ready ? (
        <button
          type="button"
          onClick={crossAction}
          className="mt-3 rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10"
        >
          {crossLabel}
        </button>
      ) : null}

      {era >= 3 && readyHint ? <p className="mt-2 text-xs text-veil/65">{readyHint}</p> : null}
    </section>
  );
}

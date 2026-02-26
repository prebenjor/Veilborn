import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  canAscend,
  canAdvanceEraOneToTwo,
  canAdvanceEraTwoToThree,
  canAnointProphet,
  canOrdainAcolyte,
  canBetrayPantheonAlly,
  canWhisper,
  canCastMiracle,
  canFormCult,
  canFormPantheonAlliance,
  canIssueAcolyteOrder,
  canInvokeFinalChoice,
  canPurchaseEchoTreeRank,
  canStartAct,
  canSuppressRival,
  ensurePantheonInitialized,
  ensureGhostInitialized,
  getActSlotCap,
  canRecruit,
  getRecruitPreview,
  getWhisperPreview,
  performAdvanceEraOneToTwo,
  performAdvanceEraTwoToThree,
  performAscension,
  performBetrayPantheonAlly,
  performCastMiracle,
  performCultFormation,
  performDomainInvestment,
  performFormPantheonAlliance,
  performDomainInvestments,
  performPurchaseEchoTreeRank,
  performProphetAnoint,
  performAcolyteOrdain,
  performIssueAcolyteOrder,
  performRecruit,
  performSetArchitectureBeliefRule,
  performSetArchitectureCivilizationRule,
  performSetArchitectureDomainRule,
  performStartAct,
  performSuppressRival,
  performInvokeFinalChoice,
  performWhisper
} from "./core/engine/actions";
import {
  getActBaseMultiplier,
  getActCost,
  getActResonantBonus,
  getAcolyteOrderRemainingSeconds,
  getActRewardBelief,
  getAscensionEchoGain,
  getActDurationSeconds,
  getBeliefGenerationBreakdown,
  getCultFormationCost,
  getCultOutput,
  getDoctrineResonanceState,
  getDomainSynergy,
  getDomainInvestCost,
  getDomainXpNeeded,
  getDevotionStacks,
  getDevotionPath,
  getDevotionPathLabel,
  getEraOneGateStatus,
  getEraTwoGateStatus,
  getEchoTreeNextCost,
  getFollowersForNextAcolyte,
  getFollowersForNextProphet,
  getAcolytesForNextProphet,
  getInfluenceCap,
  getInfluenceRegenBreakdown,
  getDomainPoisonRunsRemaining,
  getMiracleBeliefGain,
  getMiracleCivDamage,
  getMiracleInfluenceCost,
  getMiracleReserveCap,
  getMiracleVeilCost,
  getPassiveFollowerRateBreakdown,
  getWhisperFollowerRateMultiplierForTarget,
  getWhisperFollowerRateMultiplier,
  getRivalSpawnIntervalMs,
  getTotalRivalStrength,
  getUnravelingGateStatus,
  getPantheonAllianceFactors,
  hasPantheonBetrayalHook,
  isArchitectureUnlocked,
  isPantheonUnlocked,
  getVeilBonus,
  getVeilCollapseThreshold,
  getVeilErosionPerSecond,
  getVeilRegenPerSecond,
  getWhisperCostForProfile,
  getWhisperFailChance,
  getWhisperFollowerPreview,
  getWhisperTargetCooldownEndsAt,
  getProphetsForNextCult
} from "./core/engine/formulas";
import {
  getRemembranceConditionViews,
  getRemembranceLetterDefinitions,
  getUnlockedNameLetterCount
} from "./core/engine/remembrance";
import { advanceWorld } from "./core/engine/worldTick";
import {
  getUiRevealState,
  veilMaskText
} from "./core/engine/uiReveal";
import {
  clearDoubtSessionForEraTransition,
  createInitialDoubtSession,
  drainDuePendingDoubtOutcomes,
  fireNextDoubtEvent,
  getActiveDoubtEventView,
  hasActiveDoubtTimedOut,
  resolveActiveDoubtChoice,
  resolveActiveDoubtTimeout,
  type DoubtChoiceId,
  type DoubtEventView,
  type DoubtSessionState
} from "./core/engine/doubtEvents";
import {
  ACOLYTE_ORDER_GATHER_PASSIVE_PER_ACOLYTE,
  ACOLYTE_ORDER_LISTEN_RECRUIT_MULTIPLIER,
  ACOLYTE_ORDER_LISTEN_WHISPER_BELIEF_MULTIPLIER,
  ACOLYTE_ORDER_REPEAT_MAX_PENALTY,
  ACOLYTE_ORDER_REPEAT_STEP,
  ACOLYTE_ORDER_STEADY_INFLUENCE_CAP,
  ACOLYTE_ORDER_STEADY_INFLUENCE_PER_ACOLYTE,
  DOMAIN_LABELS,
  ECHO_CONVERSION_THRESHOLD_REDUCTION_MAX,
  ECHO_CONVERSION_THRESHOLD_REDUCTION_PER_RANK,
  ECHO_DOCTRINE_ACT_COST_REDUCTION_MAX,
  ECHO_DOCTRINE_ACT_COST_REDUCTION_PER_RANK,
  ECHO_FRACTURE_RITE_STRAIN_BONUS_MAX,
  ECHO_FRACTURE_RITE_STRAIN_BONUS_PER_RANK,
  ECHO_RESERVOIR_CAP_PER_RANK,
  ECHO_WHISPER_FAIL_REDUCTION_MAX,
  ECHO_WHISPER_FAIL_REDUCTION_PER_RANK,
  MIRACLE_TIERS,
  OMEN_LOG_MAX_ENTRIES,
  RIVAL_DRAIN_RATE,
  RIVAL_SUPPRESS_INFLUENCE_COST,
  RECRUIT_INFLUENCE_COST,
  WORLD_TICK_MS,
  type ActType,
  type ArchitectureBeliefRule,
  type ArchitectureCivilizationRule,
  type ArchitectureDomainRule,
  type AcolyteOrder,
  type DomainId,
  type EchoTreeId,
  type FinalChoice,
  type GameState,
  type MiracleTier,
  type WhisperMagnitude,
  type WhisperTarget
} from "./core/state/gameState";
import {
  createSaveExportPayload,
  getRecoverySnapshotMeta,
  importSavePayload,
  loadGameStateWithOffline,
  restoreRecoverySnapshot,
  saveGameState,
  saveRecoverySnapshot,
  type OfflineProgressSummary,
  type SnapshotMeta
} from "./core/state/persistence";
import {
  appendTelemetryEvent,
  appendTelemetryRunSummary,
  createTelemetryExportPayload,
  ensureTelemetryActionCadenceBuffer,
  loadTelemetryRunSummaries,
  recordTelemetryAction,
  readTelemetryForTests,
  updateTelemetryPeakBeliefPerSecond,
  type TelemetryRunSummary
} from "./core/state/telemetry";
import { GateRitesPanel } from "./ui/panels/GateRitesPanel";
import { AscensionPanel } from "./ui/panels/AscensionPanel";
import { DoctrinePanel } from "./ui/panels/DoctrinePanel";
import { DomainPanel } from "./ui/panels/DomainPanel";
import { EraGatePanel } from "./ui/panels/EraGatePanel";
import { OfflineSummaryPanel } from "./ui/panels/OfflineSummaryPanel";
import { PantheonPanel } from "./ui/panels/PantheonPanel";
import { ProgressPanel } from "./ui/panels/ProgressPanel";
import { StatsDrawer } from "./ui/panels/StatsDrawer";
import { WhisperPanel } from "./ui/panels/WhisperPanel";
import { RemembrancePanel } from "./ui/panels/RemembrancePanel";
import { EchoTreeQuickPanel } from "./ui/panels/EchoTreeQuickPanel";
import { EraOneLayout } from "./ui/eras/EraOneLayout";
import { EraTwoActiveLayout } from "./ui/eras/EraTwoActiveLayout";
import { EraTwoGrowthLayout } from "./ui/eras/EraTwoGrowthLayout";
import { EraThreeActiveLayout } from "./ui/eras/EraThreeActiveLayout";
import { EraThreeGrowthLayout } from "./ui/eras/EraThreeGrowthLayout";
import { EraMetaLayout } from "./ui/eras/EraMetaLayout";
import { StatBar } from "./ui/layout/StatBar";
import { TabDock } from "./ui/layout/TabDock";
import { OmenSurface } from "./ui/layout/OmenSurface";
import { PersistentRightPanel } from "./ui/layout/PersistentRightPanel";
import { CollapsibleContainer } from "./ui/layout/CollapsibleContainer";
import { formatResource } from "./core/ui/numberFormat";
import { formatDurationCompact } from "./core/ui/timeFormat";
import { getVeilStabilityView } from "./core/ui/veilPresentation";

const UI_TAB_KEY = "veilborn.ui.active_tab.v1";
const DOUBT_PENDING_KEY = "veilborn.session.doubt.pending.v1";
const DEV_TOOLS_KEY = "veilborn.ui.dev_tools.enabled.v1";
const BACKGROUND_TICK_MS = 1000;
const LOW_POWER_TICK_MS = 500;
const LOW_BATTERY_LEVEL = 0.2;

type UiTab = "active" | "growth" | "threshold" | "gate" | "legacy" | "meta";
type EraValue = 1 | 2 | 3;
type TransitionKind = "fade" | "vignette";
type UiToast = {
  id: number;
  message: string;
};

interface WhisperOptionView {
  target: WhisperTarget;
  magnitude: WhisperMagnitude;
  label: string;
  cost: number;
  passiveFollowerGainBonusPercent: number;
  canUse: boolean;
  cooldownSeconds: number;
  failChance: number;
  successFollowers: number;
  strainedFollowers: number;
}

interface BatteryStateLike {
  level: number;
  charging: boolean;
  addEventListener?: (type: "levelchange" | "chargingchange", listener: () => void) => void;
  removeEventListener?: (type: "levelchange" | "chargingchange", listener: () => void) => void;
}

interface NavigatorWithPowerHints extends Navigator {
  connection?: {
    saveData?: boolean;
  };
  getBattery?: () => Promise<BatteryStateLike>;
}

const ECHO_TREE_META: Array<{
  id: EchoTreeId;
  label: string;
  effectLabel: string;
}> = [
  {
    id: "whispers",
    label: "Whisper Roots",
    effectLabel: "Whisper strain reduction"
  },
  {
    id: "conversion",
    label: "Conversion Roots",
    effectLabel: "Conversion threshold reduction"
  },
  {
    id: "doctrine",
    label: "Doctrine Roots",
    effectLabel: "Doctrine act-cost reduction"
  },
  {
    id: "stability",
    label: "Fracture Roots",
    effectLabel: "Rite veil-strain bonus"
  },
  {
    id: "cataclysm",
    label: "Reservoir Roots",
    effectLabel: "Rite reserve cap bonus"
  }
];

function getEchoTreeEffectValue(treeId: EchoTreeId, rank: number): number {
  const clampedRank = Math.max(0, rank);
  switch (treeId) {
    case "whispers":
      return Math.min(ECHO_WHISPER_FAIL_REDUCTION_MAX, clampedRank * ECHO_WHISPER_FAIL_REDUCTION_PER_RANK);
    case "conversion":
      return Math.min(
        ECHO_CONVERSION_THRESHOLD_REDUCTION_MAX,
        clampedRank * ECHO_CONVERSION_THRESHOLD_REDUCTION_PER_RANK
      );
    case "doctrine":
      return Math.min(
        ECHO_DOCTRINE_ACT_COST_REDUCTION_MAX,
        clampedRank * ECHO_DOCTRINE_ACT_COST_REDUCTION_PER_RANK
      );
    case "stability":
      return Math.min(
        ECHO_FRACTURE_RITE_STRAIN_BONUS_MAX,
        clampedRank * ECHO_FRACTURE_RITE_STRAIN_BONUS_PER_RANK
      );
    case "cataclysm":
      return clampedRank * ECHO_RESERVOIR_CAP_PER_RANK;
    default:
      return 0;
  }
}

function formatEchoTreeEffect(treeId: EchoTreeId, rank: number): string {
  const value = getEchoTreeEffectValue(treeId, rank);
  if (treeId === "cataclysm") return `+${formatResource(value)} reserve cap`;
  if (treeId === "stability") return `+${formatResource(value * 100, 1)}% rite veil strain`;
  if (treeId === "whispers") return `-${formatResource(value * 100, 1)}% whisper strain chance`;
  if (treeId === "conversion") return `-${formatResource(value * 100, 1)}% conversion thresholds`;
  return `-${formatResource(value * 100, 2)}% act costs`;
}

const ERA_TWO_PLUS_WHISPER_PROFILES: Array<{
  target: WhisperTarget;
  magnitude: WhisperMagnitude;
  label: string;
}> = [
  { target: "prophets", magnitude: "base", label: "Prophets" },
  { target: "cults", magnitude: "base", label: "Cults" }
];

function getWhisperFollowerRateSourceLabel(
  target: WhisperTarget,
  magnitude: WhisperMagnitude,
  era: EraValue
): string | null {
  void magnitude;
  if (era < 2 || target === "crowd") return null;
  if (target === "prophets") return "Prophets";
  return "Cults";
}

function getAvailableTabs(era: EraValue): UiTab[] {
  if (era === 1) return ["active", "threshold", "legacy"];
  if (era === 2) return ["active", "growth", "legacy", "meta"];
  return ["active", "growth", "gate", "legacy", "meta"];
}

function loadUiTabPreference(): UiTab {
  if (typeof window === "undefined") return "active";
  try {
    const raw = window.localStorage.getItem(UI_TAB_KEY);
    if (
      raw === "active" ||
      raw === "growth" ||
      raw === "threshold" ||
      raw === "gate" ||
      raw === "legacy" ||
      raw === "meta"
    ) {
      return raw;
    }
  } catch {
    // Ignore localStorage read failures.
  }
  return "active";
}

function saveUiTabPreference(tab: UiTab): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UI_TAB_KEY, tab);
  } catch {
    // Ignore localStorage write failures.
  }
}

function getSafeTab(tab: UiTab, available: UiTab[]): UiTab {
  if (available.includes(tab)) return tab;
  return "active";
}

function formatSnapshotLabel(snapshotMeta: SnapshotMeta | null): string | null {
  if (!snapshotMeta) return null;
  const reasonLabel =
    snapshotMeta.reason === "ascension" ? "Pre-ascension snapshot" : "Pre-era transition snapshot";
  if (snapshotMeta.savedAt <= 0) return reasonLabel;
  return `${reasonLabel} at ${new Date(snapshotMeta.savedAt).toLocaleString()}`;
}

function toOmenFingerprint(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .trim();
  const sentenceParts = normalized
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return sentenceParts[sentenceParts.length - 1] ?? normalized;
}

function appendDoubtOutcomeOmen(state: GameState, nowMs: number, text: string): GameState {
  const recentEntries = state.omenLog.slice(0, 8);
  const recentTexts = new Set(recentEntries.map((entry) => entry.text));
  const recentFingerprints = new Set(recentEntries.map((entry) => toOmenFingerprint(entry.text)));
  const nextFingerprint = toOmenFingerprint(text);
  if (recentTexts.has(text) || recentFingerprints.has(nextFingerprint)) return state;

  return {
    ...state,
    omenLog: [
      {
        id: `evt-${state.nextEventId}`,
        at: nowMs,
        text
      },
      ...state.omenLog
    ].slice(0, OMEN_LOG_MAX_ENTRIES),
    nextEventId: state.nextEventId + 1
  };
}

function loadPendingDoubtResolution(runId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DOUBT_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { runId?: string; omenText?: string };
    if (parsed.runId !== runId) return null;
    return typeof parsed.omenText === "string" ? parsed.omenText : null;
  } catch {
    return null;
  }
}

function savePendingDoubtResolution(runId: string, omenText: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DOUBT_PENDING_KEY,
      JSON.stringify({
        runId,
        omenText
      })
    );
  } catch {
    // Ignore localStorage write failures.
  }
}

function clearPendingDoubtResolution(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DOUBT_PENDING_KEY);
  } catch {
    // Ignore localStorage write failures.
  }
}

function loadDevToolsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEV_TOOLS_KEY) === "1";
  } catch {
    return false;
  }
}

function saveDevToolsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEV_TOOLS_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore localStorage write failures.
  }
}

function withPreparedEraOneGate(state: GameState, nowMs: number): GameState {
  if (state.era !== 1) return state;
  const gate = getEraOneGateStatus(state);
  const nextBeliefTarget = Math.max(state.stats.totalBeliefEarned, gate.beliefTarget);
  const beliefDelta = nextBeliefTarget - state.stats.totalBeliefEarned;
  const nextFollowers = Math.max(state.resources.followers, gate.followersTarget);
  const nextAcolytes = Math.max(state.acolytes, gate.acolytesTarget);

  if (
    beliefDelta <= 0 &&
    nextFollowers === state.resources.followers &&
    nextAcolytes === state.acolytes
  ) {
    return state;
  }

  const prepared = {
    ...state,
    acolytes: nextAcolytes,
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefDelta,
      followers: nextFollowers
    },
    stats: {
      ...state.stats,
      totalBeliefEarned: nextBeliefTarget
    },
    cataclysm: {
      ...state.cataclysm,
      peakFollowers: Math.max(state.cataclysm.peakFollowers, nextFollowers)
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const nextInfluenceCap = getInfluenceCap(prepared);
  return {
    ...prepared,
    resources: {
      ...prepared.resources,
      influence: Math.max(prepared.resources.influence, nextInfluenceCap)
    }
  };
}

function withPreparedEraTwoGate(state: GameState, nowMs: number): GameState {
  if (state.era < 2) return state;
  const gate = getEraTwoGateStatus(state);
  const nextBeliefTarget = Math.max(state.stats.totalBeliefEarned, gate.beliefTarget);
  const beliefDelta = nextBeliefTarget - state.stats.totalBeliefEarned;
  const nextCults = Math.max(state.cults, gate.cultsTarget);
  const survivedRivalEvent = true;

  if (
    beliefDelta <= 0 &&
    nextCults === state.cults &&
    state.doctrine.survivedRivalEvent === survivedRivalEvent
  ) {
    return state;
  }

  const prepared = {
    ...state,
    cults: nextCults,
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefDelta
    },
    stats: {
      ...state.stats,
      totalBeliefEarned: nextBeliefTarget
    },
    doctrine: {
      ...state.doctrine,
      survivedRivalEvent
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const nextInfluenceCap = getInfluenceCap(prepared);
  return {
    ...prepared,
    resources: {
      ...prepared.resources,
      influence: Math.max(prepared.resources.influence, nextInfluenceCap)
    }
  };
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [initialLoad] = useState(() => loadGameStateWithOffline());
  const [gameState, setGameState] = useState<GameState>(initialLoad.state);
  const [offlineSummary, setOfflineSummary] = useState<OfflineProgressSummary | null>(
    initialLoad.offlineSummary
  );
  const [telemetryStatus, setTelemetryStatus] = useState<string | null>(null);
  const [telemetryRunSummaries, setTelemetryRunSummaries] = useState<TelemetryRunSummary[]>(() =>
    loadTelemetryRunSummaries()
  );
  const [saveImportStatus, setSaveImportStatus] = useState<string | null>(initialLoad.recoveryNotice);
  const [saveImportWarnings, setSaveImportWarnings] = useState<string[]>([]);
  const [snapshotMeta, setSnapshotMeta] = useState<SnapshotMeta | null>(() =>
    getRecoverySnapshotMeta()
  );
  const [activeTab, setActiveTab] = useState<UiTab>(() => loadUiTabPreference());
  const [desktopStatsExpanded, setDesktopStatsExpanded] = useState(false);
  const [devToolsEnabled, setDevToolsEnabled] = useState<boolean>(() => loadDevToolsEnabled());
  const [lowPowerHint, setLowPowerHint] = useState(false);
  const [tickIntervalMs, setTickIntervalMs] = useState<number>(WORLD_TICK_MS);
  const [devToolsStatus, setDevToolsStatus] = useState<string | null>(null);
  const doubtSessionRef = useRef<DoubtSessionState>(
    createInitialDoubtSession(initialLoad.state.meta.runId, initialLoad.state.meta.createdAt)
  );
  const [activeDoubtEvent, setActiveDoubtEvent] = useState<DoubtEventView | null>(() =>
    getActiveDoubtEventView(doubtSessionRef.current)
  );
  const [nextWhisperCostDelta, setNextWhisperCostDelta] = useState<number | null>(null);
  const nextWhisperCostDeltaRef = useRef<number | null>(nextWhisperCostDelta);
  const [transitionKind, setTransitionKind] = useState<TransitionKind | null>(null);
  const [transitionHint, setTransitionHint] = useState<string | null>(null);
  const [finalChoiceMaskVisible, setFinalChoiceMaskVisible] = useState(false);
  const [uiToast, setUiToast] = useState<UiToast | null>(null);
  const eraHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const gameStateRef = useRef(gameState);
  const previousEraRef = useRef<EraValue>(gameState.era);
  const previousVeilCollapseRef = useRef<{ runId: string; count: number }>({
    runId: gameState.meta.runId,
    count: gameState.cataclysm.totalVeilCollapses
  });
  const transitionTimerRef = useRef<number | null>(null);
  const finalChoiceMaskTimerRef = useRef<number | null>(null);
  const uiToastTimerRef = useRef<number | null>(null);
  const nowMs = gameState.meta.updatedAt;

  const showUiToast = (message: string) => {
    setUiToast({
      id: Date.now(),
      message
    });
    if (uiToastTimerRef.current !== null) {
      window.clearTimeout(uiToastTimerRef.current);
    }
    uiToastTimerRef.current = window.setTimeout(() => {
      setUiToast((current) => (current?.message === message ? null : current));
      uiToastTimerRef.current = null;
    }, 3600);
  };

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    nextWhisperCostDeltaRef.current = nextWhisperCostDelta;
  }, [nextWhisperCostDelta]);

  useEffect(() => {
    const tickTimer = window.setInterval(() => {
      setGameState((prev) => advanceWorld(prev, Date.now()));
    }, tickIntervalMs);

    return () => window.clearInterval(tickTimer);
  }, [tickIntervalMs]);

  useEffect(() => {
    const navigatorWithHints = navigator as NavigatorWithPowerHints;
    const saveDataEnabled = navigatorWithHints.connection?.saveData === true;
    let disposed = false;
    let battery: BatteryStateLike | null = null;

    const syncPowerHint = () => {
      const lowBattery = battery ? !battery.charging && battery.level <= LOW_BATTERY_LEVEL : false;
      const nextValue = saveDataEnabled || lowBattery;
      setLowPowerHint((previous) => (previous === nextValue ? previous : nextValue));
    };

    syncPowerHint();

    if (typeof navigatorWithHints.getBattery === "function") {
      void navigatorWithHints
        .getBattery()
        .then((resolvedBattery) => {
          if (disposed) return;
          battery = resolvedBattery;
          battery.addEventListener?.("levelchange", syncPowerHint);
          battery.addEventListener?.("chargingchange", syncPowerHint);
          syncPowerHint();
        })
        .catch(() => {
          syncPowerHint();
        });
    }

    return () => {
      disposed = true;
      battery?.removeEventListener?.("levelchange", syncPowerHint);
      battery?.removeEventListener?.("chargingchange", syncPowerHint);
    };
  }, []);

  useEffect(() => {
    const applyTickInterval = () => {
      const isHidden = document.visibilityState !== "visible";
      const nextInterval = isHidden
        ? BACKGROUND_TICK_MS
        : lowPowerHint
          ? LOW_POWER_TICK_MS
          : WORLD_TICK_MS;
      setTickIntervalMs((previous) => (previous === nextInterval ? previous : nextInterval));
    };

    applyTickInterval();
    document.addEventListener("visibilitychange", applyTickInterval);
    return () => {
      document.removeEventListener("visibilitychange", applyTickInterval);
    };
  }, [lowPowerHint]);

  useEffect(() => {
    const autosaveTimer = window.setInterval(() => {
      saveGameState(gameStateRef.current);
    }, 2000);

    return () => window.clearInterval(autosaveTimer);
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      saveGameState(gameStateRef.current);
      const timeoutResolution = resolveActiveDoubtTimeout(doubtSessionRef.current, Date.now());
      if (timeoutResolution) {
        savePendingDoubtResolution(gameStateRef.current.meta.runId, timeoutResolution.omenText);
      } else {
        clearPendingDoubtResolution();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    setGameState((prev) => ensurePantheonInitialized(prev, Date.now()));
  }, [gameState.prestige.completedRuns]);

  useEffect(() => {
    setGameState((prev) => ensureGhostInitialized(prev, Date.now()));
  }, [gameState.meta.runId, gameState.ghost.localSignatures.length, gameState.ghost.importedSignatures.length]);

  useEffect(() => {
    const nextSession = createInitialDoubtSession(gameState.meta.runId, gameState.meta.createdAt);
    doubtSessionRef.current = nextSession;
    setActiveDoubtEvent(getActiveDoubtEventView(nextSession));
    setNextWhisperCostDelta(null);
    setDevToolsStatus(null);
    nextWhisperCostDeltaRef.current = null;

    const pendingOmenText = loadPendingDoubtResolution(gameState.meta.runId);
    if (pendingOmenText) {
      const nowMs = Date.now();
      setGameState((prev) => appendDoubtOutcomeOmen(prev, nowMs, pendingOmenText));
    }
    clearPendingDoubtResolution();
  }, [gameState.meta.runId, gameState.meta.createdAt]);

  useEffect(() => {
    const now = gameState.meta.updatedAt;
    let session = doubtSessionRef.current;
    let sessionChanged = false;

    if (gameState.era !== 1) {
      const cleared = clearDoubtSessionForEraTransition(session);
      if (cleared !== session) {
        session = cleared;
        sessionChanged = true;
      }
      if (session.activeDoubtEvent.eventId) {
        clearPendingDoubtResolution();
      }
    } else {
      const drained = drainDuePendingDoubtOutcomes(session, now);
      if (drained.dueOutcomes.length > 0) {
        setGameState((prev) => {
          let next = prev;
          for (const outcome of drained.dueOutcomes) {
            next = {
              ...next,
              resources: {
                ...next.resources,
                followers: Math.max(0, next.resources.followers + outcome.followersDelta)
              }
            };
            next = appendDoubtOutcomeOmen(next, now, outcome.omenText);
          }
          return next;
        });
      }
      if (drained.nextSession !== session) {
        session = drained.nextSession;
        sessionChanged = true;
      }

      if (hasActiveDoubtTimedOut(session, now)) {
        const timeoutResolution = resolveActiveDoubtTimeout(session, now);
        if (timeoutResolution) {
          setGameState((prev) => appendDoubtOutcomeOmen(prev, now, timeoutResolution.omenText));
          session = timeoutResolution.nextSession;
          sessionChanged = true;
          clearPendingDoubtResolution();
        }
      }

      const fireResult = fireNextDoubtEvent(session, now, gameState.era, gameState.stats.totalBeliefEarned);
      if (fireResult.firedEvent) {
        session = fireResult.nextSession;
        sessionChanged = true;
      }
    }

    if (sessionChanged) {
      doubtSessionRef.current = session;
      setActiveDoubtEvent(getActiveDoubtEventView(session));
    }
  }, [gameState.era, gameState.meta.updatedAt, gameState.stats.totalBeliefEarned]);

  useEffect(() => {
    const available = getAvailableTabs(gameState.era);
    if (available.length <= 0) return;
    const safeTab = getSafeTab(activeTab, available);
    if (safeTab !== activeTab) {
      setActiveTab(safeTab);
    }
  }, [activeTab, gameState.era]);

  useEffect(() => {
    if (getAvailableTabs(gameState.era).length > 0) saveUiTabPreference(activeTab);
  }, [activeTab, gameState.era]);

  useEffect(() => {
    if (!offlineSummary) return;
    setActiveTab("active");
  }, [offlineSummary]);

  useEffect(() => {
    const previousEra = previousEraRef.current;
    if (previousEra === gameState.era) return;
    previousEraRef.current = gameState.era;
    const focusEraHeading = () => {
      window.requestAnimationFrame(() => {
        eraHeadingRef.current?.focus();
      });
    };

    setActiveTab("active");
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (previousEra === 1 && gameState.era === 2) {
      setTransitionKind("fade");
      setTransitionHint(null);
      transitionTimerRef.current = window.setTimeout(() => {
        setTransitionKind(null);
      }, 300);
      focusEraHeading();
      return;
    }

    if (previousEra === 2 && gameState.era === 3) {
      setTransitionKind("vignette");
      setTransitionHint("The Veil surfaced in mortal thought. Thin it carefully, or the world tears.");
      transitionTimerRef.current = window.setTimeout(() => {
        setTransitionKind(null);
      }, 900);
      focusEraHeading();
      return;
    }

    setTransitionKind(null);
    setTransitionHint(null);
    focusEraHeading();
  }, [gameState.era]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (finalChoiceMaskTimerRef.current !== null) {
        window.clearTimeout(finalChoiceMaskTimerRef.current);
      }
      if (uiToastTimerRef.current !== null) {
        window.clearTimeout(uiToastTimerRef.current);
      }
    };
  }, []);

  const veilOpacity = useMemo(() => {
    const normalized = Math.max(0.15, Math.min(1, gameState.resources.veil / 100));
    return normalized;
  }, [gameState.resources.veil]);

  const beliefBreakdown = getBeliefGenerationBreakdown(gameState, nowMs);
  const beliefPerSecond = beliefBreakdown.totalPerSecond;
  const influenceCap = getInfluenceCap(gameState);
  const influenceRegenBreakdown = getInfluenceRegenBreakdown(gameState);
  const passiveFollowerRateBreakdown = getPassiveFollowerRateBreakdown(gameState, nowMs);
  const passiveFollowerRate = passiveFollowerRateBreakdown.totalPerSecond;
  const whisperFollowerRateMultiplier = getWhisperFollowerRateMultiplier(gameState);
  const whisperFollowerRateSource =
    gameState.era >= 2
      ? getWhisperFollowerRateSourceLabel(
          gameState.activity.lastWhisperTarget,
          gameState.activity.lastWhisperMagnitude,
          gameState.era
        )
      : null;
  const whisperCostDelta = nextWhisperCostDelta ?? 0;
  const whisperCost = getWhisperCostForProfile(
    gameState,
    nowMs,
    {
      target: gameState.era >= 2 ? "prophets" : "crowd",
      magnitude: "base"
    },
    whisperCostDelta
  );
  const whisperProfiles = ERA_TWO_PLUS_WHISPER_PROFILES;
  const whisperOptions: WhisperOptionView[] =
    gameState.era >= 2
      ? whisperProfiles.map((profile) => {
          const cost = getWhisperCostForProfile(gameState, nowMs, profile, whisperCostDelta);
          const preview = getWhisperFollowerPreview(gameState, profile);
          const failChance = getWhisperFailChance(gameState, profile);
          const passiveRateMultiplier = getWhisperFollowerRateMultiplierForTarget(
            gameState,
            profile.target
          );
          const cooldownSeconds = Math.max(
            0,
            Math.ceil((getWhisperTargetCooldownEndsAt(gameState, profile.target) - nowMs) / 1000)
          );
          return {
            target: profile.target,
            magnitude: profile.magnitude,
            label: profile.label,
            cost,
            passiveFollowerGainBonusPercent: Math.max(
              0,
              Math.round((passiveRateMultiplier - 1) * 100)
            ),
            canUse: canWhisper(gameState, nowMs, {
              target: profile.target,
              magnitude: profile.magnitude,
              costOverride: cost
            }),
            cooldownSeconds,
            failChance,
            successFollowers: preview.successFollowers,
            strainedFollowers: preview.strainedFollowers
          };
        })
      : [];
  const whisperPreview = getWhisperPreview(gameState);
  const recruitPreview = getRecruitPreview(gameState);
  const devotionStacks = getDevotionStacks(gameState);
  const devotionPathLabel = getDevotionPathLabel(getDevotionPath(gameState));
  const nextAcolyteFollowers = getFollowersForNextAcolyte(gameState);
  const nextProphetFollowers = getFollowersForNextProphet(gameState);
  const nextProphetAcolytes = getAcolytesForNextProphet(gameState);
  const nextCultBeliefCost = getCultFormationCost(gameState);
  const nextCultProphets = getProphetsForNextCult(gameState);
  const eraOneGate = getEraOneGateStatus(gameState);
  const eraTwoGate = getEraTwoGateStatus(gameState);
  const unravelingGate = getUnravelingGateStatus(gameState);
  const ascensionEchoGain = getAscensionEchoGain(gameState.stats.totalBeliefEarned);
  const uiReveal = getUiRevealState(gameState);
  const pantheonUnlocked = isPantheonUnlocked(gameState);
  const pantheonAllianceFactors = getPantheonAllianceFactors(gameState);
  const betrayedHookUnlocked = hasPantheonBetrayalHook(gameState);
  const pantheonAllies = gameState.pantheon.allies.map((ally) => ({
    id: ally.id,
    name: ally.name,
    domainLabel: DOMAIN_LABELS[ally.domain],
    disposition: ally.disposition,
    poisonRunsRemaining: getDomainPoisonRunsRemaining(gameState, ally.domain),
    canAlliance: canFormPantheonAlliance(gameState, ally.id),
    canBetray: canBetrayPantheonAlly(gameState, ally.id)
  }));
  const canUseWhisper =
    gameState.era >= 2
      ? whisperOptions.some((option) => option.canUse)
      : canWhisper(gameState, nowMs, {
          target: "crowd",
          magnitude: "base",
          costOverride: whisperCost
        });
  const canUseRecruit = canRecruit(gameState);
  const canCreateAcolyte = canOrdainAcolyte(gameState);
  const canCreateProphet = canAnointProphet(gameState);
  const canCreateCult = canFormCult(gameState);
  const canAdvanceEraOne = canAdvanceEraOneToTwo(gameState);
  const canAdvanceEraTwo = canAdvanceEraTwoToThree(gameState);
  const canUseAscend = canAscend(gameState);
  const domainSynergy = getDomainSynergy(gameState);
  const doctrineResonance = getDoctrineResonanceState(gameState);

  const echoTreeViews = ECHO_TREE_META
    .filter((tree) => {
      if (tree.id === "whispers" || tree.id === "conversion") return true;
      if (tree.id === "doctrine") return gameState.era >= 2;
      return gameState.era >= 3;
    })
    .map((tree) => {
      const rank = gameState.prestige.treeRanks[tree.id];
      const nextCost = getEchoTreeNextCost(gameState, tree.id);
      return {
        id: tree.id,
        label: tree.label,
        rank,
        nextCost,
        canPurchase: canPurchaseEchoTreeRank(gameState, tree.id),
        effectLabel: tree.effectLabel,
        currentEffect: formatEchoTreeEffect(tree.id, rank),
        nextEffect: nextCost === null ? null : formatEchoTreeEffect(tree.id, rank + 1)
      };
    });

  const actSlotCap = getActSlotCap(gameState);
  const actCosts: Record<ActType, number> = {
    shrine: getActCost(gameState, "shrine"),
    ritual: getActCost(gameState, "ritual"),
    proclaim: getActCost(gameState, "proclaim")
  };
  const actDurations: Record<ActType, number> = {
    shrine: getActDurationSeconds("shrine"),
    ritual: getActDurationSeconds("ritual"),
    proclaim: getActDurationSeconds("proclaim")
  };
  const actProjectedBelief: Record<ActType, number> = {
    shrine: getActRewardBelief(
      gameState,
      beliefPerSecond,
      actDurations.shrine,
      getActBaseMultiplier("shrine")
    ),
    ritual: getActRewardBelief(
      gameState,
      beliefPerSecond,
      actDurations.ritual,
      getActBaseMultiplier("ritual")
    ),
    proclaim: getActRewardBelief(
      gameState,
      beliefPerSecond,
      actDurations.proclaim,
      getActBaseMultiplier("proclaim")
    )
  };
  const canStartActs: Record<ActType, boolean> = {
    shrine: canStartAct(gameState, "shrine"),
    ritual: canStartAct(gameState, "ritual"),
    proclaim: canStartAct(gameState, "proclaim")
  };
  const activeActs = gameState.doctrine.activeActs.map((act) => ({
    id: act.id,
    type: act.type,
    remainingSeconds: Math.max(0, (act.endsAt - nowMs) / 1000)
  }));

  const rivalStrength = getTotalRivalStrength(gameState);
  const cultOutput = getCultOutput(gameState);
  const rivalDrainPerSecond = rivalStrength > cultOutput * 0.5 ? rivalStrength * RIVAL_DRAIN_RATE : 0;
  const rivalSpawnIntervalMs = getRivalSpawnIntervalMs(gameState);
  const nextRivalInSeconds =
    gameState.era >= 2 && gameState.cults > 0
      ? Math.max(0, Math.ceil((gameState.doctrine.lastRivalSpawnAt + rivalSpawnIntervalMs - nowMs) / 1000))
      : 0;
  const hasActiveRivals = gameState.doctrine.rivals.length > 0;
  const canUseSuppressRival = canSuppressRival(gameState);
  const doctrineGrowthSummary =
    gameState.era >= 3
      ? `${formatResource(gameState.prophets)} prophets \u00b7 ${formatResource(gameState.cults)} cults \u00b7 ${formatResource(activeActs.length)} of ${formatResource(actSlotCap)} acts active`
      : `${formatResource(gameState.prophets)} prophets \u00b7 ${formatResource(gameState.cults)} cults`;
  const domainsGrowthSummary = `Synergy x${formatResource(domainSynergy, 2)} \u00b7 ${formatResource(doctrineResonance.activePairs)} resonance pairs`;
  const rivalsGrowthSummary = hasActiveRivals
    ? `${formatResource(gameState.doctrine.rivals.length)} active \u00b7 strength ${formatResource(rivalStrength)}`
    : gameState.cults <= 0
      ? "No rivals present"
      : nextRivalInSeconds <= 0
        ? "No rivals present \u00b7 next spawn imminent"
        : `No rivals present \u00b7 next in ~${formatDurationCompact(nextRivalInSeconds)}`;
  const elapsedSeconds = Math.floor(gameState.simulation.totalElapsedMs / 1000);
  const secondsSinceLastEvent = Math.max(0, (nowMs - gameState.activity.lastEventAt) / 1000);
  const era = gameState.era;
  const eraTwoThresholdMetCount =
    (gameState.stats.totalBeliefEarned >= eraTwoGate.beliefTarget ? 1 : 0) +
    (gameState.cults >= eraTwoGate.cultsTarget ? 1 : 0) +
    (eraTwoGate.rivalEventReady ? 1 : 0);
  const eraTwoThresholdTotalCount = 3;
  const eraTwoThresholdSummary = `${formatResource(eraTwoThresholdMetCount)} / ${formatResource(eraTwoThresholdTotalCount)} conditions met`;
  const eraTwoThresholdRatio =
    eraTwoThresholdTotalCount <= 0 ? 0 : eraTwoThresholdMetCount / eraTwoThresholdTotalCount;
  const eraOneThresholdMetCount =
    (eraOneGate.beliefReady ? 1 : 0) +
    (eraOneGate.acolytesReady ? 1 : 0) +
    (eraOneGate.followersReady ? 1 : 0);
  const eraOneThresholdTotalCount = 3;
  const eraOneThresholdSummary = `${formatResource(eraOneThresholdMetCount)} / ${formatResource(eraOneThresholdTotalCount)} conditions met`;
  const eraOneThresholdRatio =
    eraOneThresholdTotalCount <= 0 ? 0 : eraOneThresholdMetCount / eraOneThresholdTotalCount;
  const eraThreeGateMetCount =
    (unravelingGate.beliefReady ? 1 : 0) +
    (unravelingGate.veilReady ? 1 : 0) +
    (unravelingGate.miraclesReady ? 1 : 0) +
    (unravelingGate.riteVeilStrainReady ? 1 : 0) +
    (unravelingGate.runTimeReady ? 1 : 0);
  const eraThreeGateTotalCount = 5;
  const statsMilestoneCount =
    era === 1 ? eraOneThresholdMetCount : era === 2 ? eraTwoThresholdMetCount : eraThreeGateMetCount;
  const statsMilestoneTarget =
    era === 1 ? eraOneThresholdTotalCount : era === 2 ? eraTwoThresholdTotalCount : eraThreeGateTotalCount;
  const statsNextMilestoneLabel =
    era === 1
      ? !eraOneGate.beliefReady
        ? `Belief ${formatResource(gameState.stats.totalBeliefEarned)} / ${formatResource(eraOneGate.beliefTarget)}`
        : !eraOneGate.acolytesReady
          ? `Acolytes ${formatResource(gameState.acolytes)} / ${formatResource(eraOneGate.acolytesTarget)}`
          : !eraOneGate.followersReady
            ? `Followers ${formatResource(gameState.resources.followers)} / ${formatResource(eraOneGate.followersTarget)}`
            : "Ready to advance to Era II"
      : era === 2
        ? !eraTwoGate.beliefReady
          ? `Belief ${formatResource(gameState.stats.totalBeliefEarned)} / ${formatResource(eraTwoGate.beliefTarget)}`
          : !eraTwoGate.cultsReady
            ? `Cults ${formatResource(gameState.cults)} / ${formatResource(eraTwoGate.cultsTarget)}`
            : !eraTwoGate.rivalEventReady
              ? "Trigger one rival event"
              : "Ready to advance to Era III"
        : !unravelingGate.beliefReady
          ? `Belief ${formatResource(gameState.stats.totalBeliefEarned)} / ${formatResource(unravelingGate.beliefTarget)}`
          : !unravelingGate.veilReady
            ? `Veil ${formatResource(gameState.resources.veil)} / ${formatResource(unravelingGate.veilTarget)}`
            : !unravelingGate.miraclesReady
              ? `Rites ${formatResource(gameState.cataclysm.miraclesThisRun)} / ${formatResource(unravelingGate.miraclesTarget)}`
              : !unravelingGate.riteVeilStrainReady
                ? `Rite strain ${formatResource(gameState.cataclysm.gateRiteVeilSpent)} / ${formatResource(unravelingGate.riteVeilStrainTarget)}`
                : !unravelingGate.runTimeReady
                  ? `Runtime ${formatDurationCompact(elapsedSeconds)} / ${formatDurationCompact(unravelingGate.runTimeTargetSeconds)}`
                  : "Ready to cross the Gate";

  const veilBonus = getVeilBonus(gameState.resources.veil);
  const veilRegenPerSecond = getVeilRegenPerSecond(gameState);
  const veilErosionPerSecond = getVeilErosionPerSecond(gameState);
  const veilCollapseThreshold = getVeilCollapseThreshold(gameState);
  const miracleReserveCap = getMiracleReserveCap(gameState);
  const miracleOptions = MIRACLE_TIERS.map((tier) => ({
    tier,
    influenceCost: getMiracleInfluenceCost(tier),
    beliefGain: getMiracleBeliefGain(gameState, tier),
    veilCost: getMiracleVeilCost(gameState, tier),
    civDamage: getMiracleCivDamage(tier),
    canCast: canCastMiracle(gameState, tier)
  }));

  const availableTabs = getAvailableTabs(era);
  const safeActiveTab = getSafeTab(activeTab, availableTabs);
  const runStartTimestamp = gameState.meta.runStartTimestamp;
  const runScopedOmenLog = gameState.omenLog.filter((entry) => entry.at >= runStartTimestamp);
  const dedupedRunScopedOmenLog = runScopedOmenLog.reduce<typeof runScopedOmenLog>((accumulator, entry) => {
    const seenTexts = new Set(accumulator.map((item) => item.text));
    const seenFingerprints = new Set(accumulator.map((item) => toOmenFingerprint(item.text)));
    const fingerprint = toOmenFingerprint(entry.text);
    if (seenTexts.has(entry.text) || seenFingerprints.has(fingerprint)) {
      return accumulator;
    }
    accumulator.push(entry);
    return accumulator;
  }, []);
  const omenPreviewCount = era === 1 ? 3 : 2;
  const visibleOmens = dedupedRunScopedOmenLog.slice(0, omenPreviewCount);
  const activeDoubtEventCard =
    era === 1 && activeDoubtEvent
      ? {
          scene: activeDoubtEvent.scene,
          choiceALabel: activeDoubtEvent.choiceA.label,
          choiceBLabel: activeDoubtEvent.choiceB.label,
          choiceBCost: activeDoubtEvent.choiceB.influenceCost,
          canChooseB: gameState.resources.influence >= activeDoubtEvent.choiceB.influenceCost
        }
      : null;
  const showPersistentOmenSurface = era >= 2;
  const showStatsDrawer = true;
  const statusLine =
    era >= 3
      ? null
      : era === 2
        ? canUseWhisper || canUseRecruit
          ? "Spend Influence before it caps."
          : "Influence is recovering. Prepare the next intervention."
        : gameState.activity.cadencePromptActive
          ? "Silence gathers around your name."
          : "Someone is listening in the dark.";
  const veilStability = getVeilStabilityView(gameState.resources.veil, veilCollapseThreshold);
  const surfaceOmenPreviewCount = era >= 3 ? 2 : 1;
  const surfaceOmenPreview = dedupedRunScopedOmenLog.slice(0, surfaceOmenPreviewCount);
  const surfaceOmenExpanded = dedupedRunScopedOmenLog.slice(
    surfaceOmenPreviewCount,
    era >= 3 ? 6 : 4
  );
  const rightPanelOmens = dedupedRunScopedOmenLog.slice(0, OMEN_LOG_MAX_ENTRIES);
  const architectureUnlocked = isArchitectureUnlocked(gameState);
  const remembranceConditions = getRemembranceConditionViews(gameState);
  const totalNameLetters = getRemembranceLetterDefinitions().length;
  const unlockedNameLetters = getUnlockedNameLetterCount(gameState.prestige.remembrance.letters);
  const canUseFinalChoice = canInvokeFinalChoice(gameState);
  const cheapestWhisperCost =
    whisperOptions.length > 0
      ? whisperOptions.reduce(
          (lowest, option) => Math.min(lowest, option.cost),
          Number.POSITIVE_INFINITY
        )
      : whisperCost;
  const activeWhispersSummary =
    canUseWhisper || canUseRecruit
      ? `Whisper ${formatResource(cheapestWhisperCost)}+ \u00b7 Recruit`
      : "Influence is recovering.";
  const canUseAcolyteOrder = canIssueAcolyteOrder(gameState);
  const activeAcolyteOrder = gameState.activity.acolyteOrder;
  const activeAcolyteOrderRemainingSeconds = getAcolyteOrderRemainingSeconds(gameState, nowMs);
  const activeAcolyteOrderPotency =
    activeAcolyteOrder === "none"
      ? 1
      : Math.max(0, Math.min(1, gameState.activity.acolyteOrderPotency));
  const getNextAcolyteOrderPotency = (order: Exclude<AcolyteOrder, "none">): number => {
    const repeatCount =
      gameState.activity.lastAcolyteOrder === order ? gameState.activity.acolyteOrderRepeatCount + 1 : 0;
    const penalty = Math.min(ACOLYTE_ORDER_REPEAT_MAX_PENALTY, repeatCount * ACOLYTE_ORDER_REPEAT_STEP);
    return Math.max(0.1, 1 - penalty);
  };
  const acolyteGatherPassivePerSecond =
    gameState.acolytes * ACOLYTE_ORDER_GATHER_PASSIVE_PER_ACOLYTE * getNextAcolyteOrderPotency("gather");
  const acolyteSteadyInfluencePerSecond =
    Math.min(ACOLYTE_ORDER_STEADY_INFLUENCE_CAP, gameState.acolytes * ACOLYTE_ORDER_STEADY_INFLUENCE_PER_ACOLYTE) *
    getNextAcolyteOrderPotency("steady");
  const acolyteListenRecruitMultiplier =
    1 + ACOLYTE_ORDER_LISTEN_RECRUIT_MULTIPLIER * getNextAcolyteOrderPotency("listen");
  const acolyteListenWhisperBeliefMultiplier =
    1 + ACOLYTE_ORDER_LISTEN_WHISPER_BELIEF_MULTIPLIER * getNextAcolyteOrderPotency("listen");
  const metaOverviewSummary = `Era ${formatResource(era)} \u00b7 ${formatResource(gameState.prestige.completedRuns)} completed runs`;
  const metaAscensionSummary = uiReveal.showAscensionPanel
    ? `${formatResource(gameState.prestige.echoes)} Echoes \u00b7 +${formatResource(ascensionEchoGain)} this run`
    : "Echo structures dormant in this cycle.";
  const metaRemembranceSummary = `${formatResource(unlockedNameLetters)} / ${formatResource(totalNameLetters)} letters unlocked`;
  const metaPantheonSummary = pantheonUnlocked
    ? `${formatResource(pantheonAllies.filter((ally) => ally.disposition === "allied").length)} allied \u00b7 ${formatResource(gameState.prestige.pantheon.betrayalsLifetime)} betrayals`
    : "Pantheon remains out of reach.";

  useEffect(() => {
    ensureTelemetryActionCadenceBuffer(gameState.meta.runId, gameState.meta.createdAt);
  }, [gameState.meta.createdAt, gameState.meta.runId]);

  useEffect(() => {
    updateTelemetryPeakBeliefPerSecond(gameState.meta.runId, beliefPerSecond);
  }, [gameState.meta.runId, beliefPerSecond]);

  useEffect(() => {
    const previous = previousVeilCollapseRef.current;
    if (
      previous.runId === gameState.meta.runId &&
      gameState.cataclysm.totalVeilCollapses > previous.count
    ) {
      const delta = gameState.cataclysm.totalVeilCollapses - previous.count;
      for (let index = 0; index < delta; index += 1) {
        appendTelemetryEvent(gameState, "veil_collapse", gameState.meta.updatedAt, {
          collapseIndex: previous.count + index + 1
        });
      }
    }
    previousVeilCollapseRef.current = {
      runId: gameState.meta.runId,
      count: gameState.cataclysm.totalVeilCollapses
    };
  }, [gameState, gameState.cataclysm.totalVeilCollapses, gameState.meta.runId, gameState.meta.updatedAt]);

  const onWhisper = (
    target: WhisperTarget = "crowd",
    magnitude: WhisperMagnitude = "base"
  ) => {
    const actionAt = Date.now();
    let consumedCostModifier = false;
    setGameState((prev) => {
      const costModifier = nextWhisperCostDeltaRef.current ?? 0;
      const effectiveCost = getWhisperCostForProfile(
        prev,
        actionAt,
        {
          target,
          magnitude
        },
        costModifier
      );
      const next = performWhisper(prev, actionAt, {
        target,
        magnitude,
        costOverride: effectiveCost
      });
      if (next === prev) return prev;
      consumedCostModifier = costModifier !== 0;
      recordTelemetryAction(next, "whisper", actionAt);
      return next;
    });
    if (consumedCostModifier) {
      setNextWhisperCostDelta(null);
      nextWhisperCostDeltaRef.current = null;
    }
  };

  const onRecruit = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performRecruit(prev, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "recruit", actionAt);
      return next;
    });
  };

  const onResolveDoubtChoice = (choice: DoubtChoiceId) => {
    const actionAt = Date.now();
    const resolved = resolveActiveDoubtChoice(doubtSessionRef.current, choice, actionAt);
    if (!resolved) return;

    const influenceCost = resolved.resolution.influenceCost;
    if (influenceCost > 0 && gameStateRef.current.resources.influence < influenceCost) {
      return;
    }

    // Clear the active card immediately on successful resolution.
    doubtSessionRef.current = resolved.nextSession;
    setActiveDoubtEvent(getActiveDoubtEventView(resolved.nextSession));
    clearPendingDoubtResolution();

    if (resolved.resolution.nextWhisperCostDelta !== null) {
      setNextWhisperCostDelta(resolved.resolution.nextWhisperCostDelta);
      nextWhisperCostDeltaRef.current = resolved.resolution.nextWhisperCostDelta;
    }

    setGameState((prev) => {
      const nextFollowers = Math.max(
        0,
        prev.resources.followers + resolved.resolution.immediateFollowersDelta
      );
      const nextDevotion = Math.max(
        0,
        Math.min(3, Math.floor(prev.devotionStacks + resolved.resolution.devotionDelta))
      );

      let next: GameState = {
        ...prev,
        resources: {
          ...prev.resources,
          influence: Math.max(0, prev.resources.influence - influenceCost),
          followers: nextFollowers
        },
        devotionStacks: nextDevotion,
        meta: {
          ...prev.meta,
          updatedAt: actionAt
        }
      };

      if (resolved.resolution.immediateOmenText) {
        next = appendDoubtOutcomeOmen(next, actionAt, resolved.resolution.immediateOmenText);
      }

      return next;
    });
  };

  const onInvestDomain = (domainId: DomainId, investments: number) => {
    const actionAt = Date.now();
    if (investments <= 1) {
      setGameState((prev) => {
        const next = performDomainInvestment(prev, domainId, actionAt);
        if (next === prev) return prev;
        recordTelemetryAction(next, "invest_domain", actionAt);
        return next;
      });
      return;
    }
    setGameState((prev) => {
      const next = performDomainInvestments(prev, domainId, investments, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "invest_domain", actionAt);
      return next;
    });
  };

  const onAnointProphet = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performProphetAnoint(prev, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "anoint_prophet", actionAt);
      return next;
    });
  };

  const onOrdainAcolyte = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performAcolyteOrdain(prev, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "anoint_prophet", actionAt);
      return next;
    });
  };

  const onIssueAcolyteOrder = (order: Exclude<AcolyteOrder, "none">) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performIssueAcolyteOrder(prev, order, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "issue_acolyte_order", actionAt);
      return next;
    });
  };

  const onFormCult = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performCultFormation(prev, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "found_cult", actionAt);
      return next;
    });
  };

  const onStartAct = (type: ActType) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performStartAct(prev, type, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "start_act", actionAt);
      return next;
    });
  };

  const onSuppressRival = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performSuppressRival(prev, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "suppress_rival", actionAt);
      appendTelemetryEvent(next, "rival_suppressed", actionAt, {
        rivalsBefore: prev.doctrine.rivals.length,
        rivalsAfter: next.doctrine.rivals.length
      });
      return next;
    });
  };

  const onCastMiracle = (tier: MiracleTier) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performCastMiracle(prev, tier, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "cast_miracle", actionAt);

      appendTelemetryEvent(next, "miracle_use", actionAt, {
        tier,
        beliefGain: Math.max(0, next.resources.belief - prev.resources.belief),
        influenceSpent: Math.max(0, prev.resources.influence - next.resources.influence),
        veilDrop: Math.max(0, prev.resources.veil - next.resources.veil)
      });

      if (!prev.cataclysm.civilizationCollapsed && next.cataclysm.civilizationCollapsed) {
        appendTelemetryEvent(next, "civilization_collapse", actionAt, {
          source: "miracle",
          tier
        });
      }

      return next;
    });
  };

  const onPurchaseEchoTreeRank = (treeId: EchoTreeId) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performPurchaseEchoTreeRank(prev, treeId, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "buy_echo_rank", actionAt);
      return next;
    });
  };

  const onSetArchitectureBeliefRule = (rule: ArchitectureBeliefRule) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performSetArchitectureBeliefRule(prev, rule, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "set_architecture_rule", actionAt);
      return next;
    });
  };

  const onSetArchitectureCivilizationRule = (rule: ArchitectureCivilizationRule) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performSetArchitectureCivilizationRule(prev, rule, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "set_architecture_rule", actionAt);
      return next;
    });
  };

  const onSetArchitectureDomainRule = (rule: ArchitectureDomainRule) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performSetArchitectureDomainRule(prev, rule, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "set_architecture_rule", actionAt);
      return next;
    });
  };

  const onInvokeFinalChoice = (choice: Exclude<FinalChoice, "none">) => {
    if (!canUseFinalChoice) return;
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performInvokeFinalChoice(prev, choice, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "invoke_final_choice", actionAt);
      return next;
    });
    setFinalChoiceMaskVisible(true);
    if (finalChoiceMaskTimerRef.current !== null) {
      window.clearTimeout(finalChoiceMaskTimerRef.current);
    }
    finalChoiceMaskTimerRef.current = window.setTimeout(() => {
      setFinalChoiceMaskVisible(false);
      finalChoiceMaskTimerRef.current = null;
    }, 1800);
  };

  const onExportSave = () => {
    const payload = createSaveExportPayload(gameStateRef.current);
    const stamp = new Date().toISOString().replace(/[:]/g, "-");
    const fileName = `veilborn-save-${stamp}.json`;
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaveImportWarnings([]);
    setSaveImportStatus(`Exported save to ${fileName}.`);
  };

  const onImportSave = async (file: File) => {
    const rawText = await file.text();
    const result = importSavePayload(rawText, gameStateRef.current, Date.now());

    if (result.error || !result.state) {
      setSaveImportWarnings(result.warnings);
      setSaveImportStatus(result.error ?? "Save import failed.");
      return;
    }

    setGameState(result.state);
    saveGameState(result.state);
    setOfflineSummary(null);
    setSaveImportWarnings(result.warnings);
    setSaveImportStatus(`Imported save from ${file.name}.`);
  };

  const onRestoreSnapshot = () => {
    const result = restoreRecoverySnapshot(Date.now());
    if (result.error || !result.state) {
      setSaveImportWarnings(result.warnings);
      setSaveImportStatus(result.error ?? "Snapshot restore failed.");
      return;
    }

    setGameState(result.state);
    saveGameState(result.state);
    setOfflineSummary(null);
    setSaveImportWarnings(result.warnings);
    setSaveImportStatus("Restored from the last good snapshot.");
    setSnapshotMeta(getRecoverySnapshotMeta());
  };

  const onExportTelemetry = () => {
    const payload = createTelemetryExportPayload();
    const stamp = new Date().toISOString().replace(/[:]/g, "-");
    const fileName = `veilborn-telemetry-${stamp}.json`;
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setTelemetryStatus(`Exported telemetry to ${fileName}.`);
  };

  const onDumpTelemetryToConsole = () => {
    const snapshot = readTelemetryForTests();
    console.info("Veilborn telemetry snapshot", snapshot);
    setTelemetryStatus("Telemetry snapshot written to browser console.");
  };

  const onToggleDevTools = () => {
    setDevToolsEnabled((current) => {
      const next = !current;
      saveDevToolsEnabled(next);
      return next;
    });
    setDevToolsStatus(null);
  };

  const onDevBoostResources = () => {
    if (!devToolsEnabled) return;
    const actionAt = Date.now();
    const beliefBoost = 1_000_000;
    const followerBoost = 5_000;
    setGameState((prev) => {
      const nextFollowers = prev.resources.followers + followerBoost;
      const influenceCapForState = getInfluenceCap(prev);
      return {
        ...prev,
        resources: {
          ...prev.resources,
          belief: prev.resources.belief + beliefBoost,
          influence: Math.max(prev.resources.influence, influenceCapForState),
          followers: nextFollowers
        },
        stats: {
          ...prev.stats,
          totalBeliefEarned: prev.stats.totalBeliefEarned + beliefBoost
        },
        cataclysm: {
          ...prev.cataclysm,
          peakFollowers: Math.max(prev.cataclysm.peakFollowers, nextFollowers)
        },
        meta: {
          ...prev.meta,
          updatedAt: actionAt
        }
      };
    });
    setDevToolsStatus("Dev: boosted Belief, Followers, and Influence.");
  };

  const onDevPrimeEraOneGate = () => {
    if (!devToolsEnabled) return;
    const actionAt = Date.now();
    setGameState((prev) => withPreparedEraOneGate(prev, actionAt));
    setDevToolsStatus("Dev: Era I threshold primed.");
  };

  const onDevPrimeEraTwoGate = () => {
    if (!devToolsEnabled) return;
    const actionAt = Date.now();
    setGameState((prev) => withPreparedEraTwoGate(prev, actionAt));
    setDevToolsStatus("Dev: Era II threshold primed.");
  };

  const onDevJumpToEraTwo = () => {
    if (!devToolsEnabled) return;
    const actionAt = Date.now();
    setGameState((prev) => {
      let next = prev;
      if (next.era >= 2) return next;

      next = withPreparedEraOneGate(next, actionAt);
      if (!canAdvanceEraOneToTwo(next)) return next;

      saveRecoverySnapshot(next, "era_transition");
      const advanced = performAdvanceEraOneToTwo(next, actionAt);
      if (advanced !== next && advanced.era !== next.era) {
        recordTelemetryAction(advanced, "advance_era", actionAt);
        appendTelemetryEvent(advanced, "era_transition", actionAt, {
          fromEra: next.era,
          toEra: advanced.era
        });
      }
      return advanced;
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
    setDevToolsStatus("Dev: jump-to-Era-II applied.");
  };

  const onDevJumpToEraThree = () => {
    if (!devToolsEnabled) return;
    const actionAt = Date.now();
    setGameState((prev) => {
      let next = prev;

      if (next.era < 2) {
        next = withPreparedEraOneGate(next, actionAt);
        if (canAdvanceEraOneToTwo(next)) {
          saveRecoverySnapshot(next, "era_transition");
          const advancedToEraTwo = performAdvanceEraOneToTwo(next, actionAt);
          if (advancedToEraTwo !== next && advancedToEraTwo.era !== next.era) {
            recordTelemetryAction(advancedToEraTwo, "advance_era", actionAt);
            appendTelemetryEvent(advancedToEraTwo, "era_transition", actionAt, {
              fromEra: next.era,
              toEra: advancedToEraTwo.era
            });
          }
          next = advancedToEraTwo;
        }
      }

      if (next.era >= 3) return next;
      next = withPreparedEraTwoGate(next, actionAt);
      if (!canAdvanceEraTwoToThree(next)) return next;

      saveRecoverySnapshot(next, "era_transition");
      const advancedToEraThree = performAdvanceEraTwoToThree(next, actionAt);
      if (advancedToEraThree !== next && advancedToEraThree.era !== next.era) {
        recordTelemetryAction(advancedToEraThree, "advance_era", actionAt);
        appendTelemetryEvent(advancedToEraThree, "era_transition", actionAt, {
          fromEra: next.era,
          toEra: advancedToEraThree.era
        });
      }
      return advancedToEraThree;
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
    setDevToolsStatus("Dev: jump-to-Era-III applied.");
  };

  const onAscend = () => {
    const actionAt = Date.now();
    let ascensionEchoesGained: number | null = null;
    setGameState((prev) => {
      if (!canAscend(prev)) return prev;
      const echoesGained = getAscensionEchoGain(prev.stats.totalBeliefEarned);
      ascensionEchoesGained = echoesGained;
      recordTelemetryAction(prev, "ascend", actionAt);
      appendTelemetryEvent(prev, "ascension", actionAt, {
        echoesGained,
        completedRunsBefore: prev.prestige.completedRuns
      });
      appendTelemetryRunSummary(prev, actionAt, echoesGained);
      saveRecoverySnapshot(prev, "ascension");
      return performAscension(prev, actionAt);
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
    setTelemetryRunSummaries(loadTelemetryRunSummaries());
    if (ascensionEchoesGained !== null) {
      showUiToast(`Ascension complete · +${formatResource(ascensionEchoesGained)} Echoes`);
    }
  };

  const onFormPantheonAlliance = (allyId: string) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performFormPantheonAlliance(prev, allyId, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "form_pantheon_alliance", actionAt);
      return next;
    });
  };

  const onBetrayPantheonAlly = (allyId: string) => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performBetrayPantheonAlly(prev, allyId, actionAt);
      if (next === prev) return prev;
      recordTelemetryAction(next, "betray_pantheon_ally", actionAt);
      return next;
    });
  };

  const onAdvanceEraOne = () => {
    const actionAt = Date.now();
    let didAdvance = false;
    setGameState((prev) => {
      if (!canAdvanceEraOneToTwo(prev)) return prev;
      saveRecoverySnapshot(prev, "era_transition");
      const next = performAdvanceEraOneToTwo(prev, actionAt);
      if (next !== prev && next.era !== prev.era) {
        didAdvance = true;
        recordTelemetryAction(next, "advance_era", actionAt);
        appendTelemetryEvent(next, "era_transition", actionAt, {
          fromEra: prev.era,
          toEra: next.era
        });
      }
      return next;
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
    if (didAdvance) {
      showUiToast("Era II reached · Doctrine takes root.");
    }
  };

  const onAdvanceEraTwo = () => {
    const actionAt = Date.now();
    let didAdvance = false;
    setGameState((prev) => {
      if (!canAdvanceEraTwoToThree(prev)) return prev;
      saveRecoverySnapshot(prev, "era_transition");
      const next = performAdvanceEraTwoToThree(prev, actionAt);
      if (next !== prev && next.era !== prev.era) {
        didAdvance = true;
        recordTelemetryAction(next, "advance_era", actionAt);
        appendTelemetryEvent(next, "era_transition", actionAt, {
          fromEra: prev.era,
          toEra: next.era
        });
      }
      return next;
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
    if (didAdvance) {
      showUiToast("Era III reached · The Gate stands open.");
    }
  };

  const doctrineGrowthPanel = era >= 2 ? (
    <DoctrinePanel
      era={gameState.era}
      cultOutput={cultOutput}
      domainSynergy={domainSynergy}
      actSlotCap={actSlotCap}
      activeActs={activeActs}
      actCosts={actCosts}
      actDurations={actDurations}
      actProjectedBelief={actProjectedBelief}
      actResonantBonus={getActResonantBonus(gameState)}
      canStartAct={canStartActs}
      onStartAct={onStartAct}
      rivalsCount={gameState.doctrine.rivals.length}
      rivalStrength={rivalStrength}
      rivalDrainPerSecond={rivalDrainPerSecond}
      nextRivalInSeconds={nextRivalInSeconds}
      canSuppressRival={canUseSuppressRival}
      suppressCost={RIVAL_SUPPRESS_INFLUENCE_COST}
      onSuppressRival={onSuppressRival}
      showActs={gameState.era >= 3}
      showRivals={false}
    />
  ) : null;

  const doctrineRivalsPanel = era >= 2 ? (
    <DoctrinePanel
      era={gameState.era}
      cultOutput={cultOutput}
      domainSynergy={domainSynergy}
      actSlotCap={actSlotCap}
      activeActs={activeActs}
      actCosts={actCosts}
      actDurations={actDurations}
      actProjectedBelief={actProjectedBelief}
      actResonantBonus={getActResonantBonus(gameState)}
      canStartAct={canStartActs}
      onStartAct={onStartAct}
      rivalsCount={gameState.doctrine.rivals.length}
      rivalStrength={rivalStrength}
      rivalDrainPerSecond={rivalDrainPerSecond}
      nextRivalInSeconds={nextRivalInSeconds}
      canSuppressRival={canUseSuppressRival}
      suppressCost={RIVAL_SUPPRESS_INFLUENCE_COST}
      onSuppressRival={onSuppressRival}
      showActs={false}
      showRivals
    />
  ) : null;

  const whisperPanel = (
    <WhisperPanel
      era={gameState.era}
      influence={gameState.resources.influence}
      whisperCost={whisperCost}
      whisperPreview={whisperPreview}
      recruitCost={RECRUIT_INFLUENCE_COST}
      recruitPreview={recruitPreview}
      cadencePromptActive={gameState.activity.cadencePromptActive}
      rivalDrainWarning={era === 2 && rivalDrainPerSecond > 0 ? "A rival is drawing followers away." : null}
      whisperOptions={whisperOptions}
      onWhisper={onWhisper}
      onRecruit={onRecruit}
    />
  );

  const eraGatePanel = era <= 2 ? (
    <EraGatePanel
      era={gameState.era}
      presentation="panel"
      eraOneBeliefProgress={gameState.stats.totalBeliefEarned}
      eraOneBeliefTarget={eraOneGate.beliefTarget}
      acolytesProgress={gameState.acolytes}
      acolytesTarget={eraOneGate.acolytesTarget}
      followersProgress={gameState.resources.followers}
      followersTarget={eraOneGate.followersTarget}
      eraOneReady={canAdvanceEraOne}
      eraTwoBeliefProgress={gameState.stats.totalBeliefEarned}
      eraTwoBeliefTarget={eraTwoGate.beliefTarget}
      cultsProgress={gameState.cults}
      cultsTarget={eraTwoGate.cultsTarget}
      rivalEventReady={eraTwoGate.rivalEventReady}
      eraTwoReady={canAdvanceEraTwo}
      unravelingBeliefProgress={gameState.stats.totalBeliefEarned}
      unravelingBeliefTarget={unravelingGate.beliefTarget}
      unravelingVeilProgress={gameState.resources.veil}
      unravelingVeilTarget={unravelingGate.veilTarget}
      unravelingRitesProgress={gameState.cataclysm.miraclesThisRun}
      unravelingRitesTarget={unravelingGate.miraclesTarget}
      unravelingRiteVeilStrainProgress={gameState.cataclysm.gateRiteVeilSpent}
      unravelingRiteVeilStrainTarget={unravelingGate.riteVeilStrainTarget}
      unravelingRunTimeProgressSeconds={gameState.simulation.totalElapsedMs / 1000}
      unravelingRunTimeTargetSeconds={unravelingGate.runTimeTargetSeconds}
      unravelingReady={unravelingGate.ready}
      onAdvanceEraOne={onAdvanceEraOne}
      onAdvanceEraTwo={onAdvanceEraTwo}
    />
  ) : null;

  const eraThreeGatePanel = era >= 3 ? (
    <EraGatePanel
      era={gameState.era}
      presentation="panel"
      eraOneBeliefProgress={gameState.stats.totalBeliefEarned}
      eraOneBeliefTarget={eraOneGate.beliefTarget}
      acolytesProgress={gameState.acolytes}
      acolytesTarget={eraOneGate.acolytesTarget}
      followersProgress={gameState.resources.followers}
      followersTarget={eraOneGate.followersTarget}
      eraOneReady={canAdvanceEraOne}
      eraTwoBeliefProgress={gameState.stats.totalBeliefEarned}
      eraTwoBeliefTarget={eraTwoGate.beliefTarget}
      cultsProgress={gameState.cults}
      cultsTarget={eraTwoGate.cultsTarget}
      rivalEventReady={eraTwoGate.rivalEventReady}
      eraTwoReady={canAdvanceEraTwo}
      unravelingBeliefProgress={gameState.stats.totalBeliefEarned}
      unravelingBeliefTarget={unravelingGate.beliefTarget}
      unravelingVeilProgress={gameState.resources.veil}
      unravelingVeilTarget={unravelingGate.veilTarget}
      unravelingRitesProgress={gameState.cataclysm.miraclesThisRun}
      unravelingRitesTarget={unravelingGate.miraclesTarget}
      unravelingRiteVeilStrainProgress={gameState.cataclysm.gateRiteVeilSpent}
      unravelingRiteVeilStrainTarget={unravelingGate.riteVeilStrainTarget}
      unravelingRunTimeProgressSeconds={gameState.simulation.totalElapsedMs / 1000}
      unravelingRunTimeTargetSeconds={unravelingGate.runTimeTargetSeconds}
      unravelingReady={unravelingGate.ready}
      onAdvanceEraOne={onAdvanceEraOne}
      onAdvanceEraTwo={onAdvanceEraTwo}
    />
  ) : null;

  const domainPanel =
    era >= 2 ? (
      <DomainPanel
        era={gameState.era}
        belief={gameState.resources.belief}
        domains={gameState.domains}
        matchingDomainPairs={gameState.matchingDomainPairs}
        domainSynergy={domainSynergy}
        doctrineResonance={doctrineResonance}
        getInvestCost={(domain) => getDomainInvestCost(domain, gameState.era)}
        getXpNeeded={getDomainXpNeeded}
        onInvest={onInvestDomain}
      />
    ) : null;

  const progressPanel = (
    <ProgressPanel
      belief={gameState.resources.belief}
      era={gameState.era}
      acolytes={gameState.acolytes}
      prophets={gameState.prophets}
      cults={gameState.cults}
      acolyteFollowerGainRatePerSecond={passiveFollowerRateBreakdown.acolytePerSecond}
      prophetFollowerGainRatePerSecond={passiveFollowerRateBreakdown.prophetPerSecond}
      cultFollowerGainRatePerSecond={passiveFollowerRateBreakdown.cultPerSecond}
      prophetResonanceBonus={doctrineResonance.prophetPassiveBonus}
      cultResonanceBonus={doctrineResonance.cultPassiveBonus}
      whisperResonanceSurchargeReduction={doctrineResonance.whisperSurchargeReduction}
      whisperResonanceCooldownReductionMs={doctrineResonance.whisperCooldownReductionMs}
      whisperFollowerRateSource={whisperFollowerRateSource}
      whisperFollowerRateMultiplier={whisperFollowerRateMultiplier}
      nextAcolyteFollowers={nextAcolyteFollowers}
      nextProphetFollowers={nextProphetFollowers}
      nextProphetAcolytes={nextProphetAcolytes}
      nextCultBeliefCost={nextCultBeliefCost}
      nextCultProphets={nextCultProphets}
      canOrdainAcolyte={canCreateAcolyte}
      canAnointProphet={canCreateProphet}
      canFormCult={canCreateCult}
      onOrdainAcolyte={onOrdainAcolyte}
      onAnointProphet={onAnointProphet}
      onFormCult={onFormCult}
    />
  );

  const eraThreeGateRitesPanel =
    era >= 3 ? (
      <GateRitesPanel
        era={gameState.era}
        influence={gameState.resources.influence}
        influenceCap={influenceCap}
        miracleReserve={gameState.cataclysm.miracleReserve}
        miracleReserveCap={miracleReserveCap}
        veil={gameState.resources.veil}
        veilBonus={veilBonus}
        veilRegenPerSecond={veilRegenPerSecond}
        veilErosionPerSecond={veilErosionPerSecond}
        veilCollapseThreshold={veilCollapseThreshold}
        miraclesThisRun={gameState.cataclysm.miraclesThisRun}
        riteVeilStrain={gameState.cataclysm.gateRiteVeilSpent}
        riteVeilStrainTarget={unravelingGate.riteVeilStrainTarget}
        miracleOptions={miracleOptions}
        onCastMiracle={onCastMiracle}
      />
    ) : null;

  const eraTwoActiveContent = (
    <EraTwoActiveLayout
      whisperPanel={whisperPanel}
      doctrinePanel={doctrineGrowthPanel}
      progressPanel={progressPanel}
      whisperSummary={activeWhispersSummary}
      doctrineSummary={doctrineGrowthSummary}
    />
  );

  const eraTwoGrowthContent = (
    <EraTwoGrowthLayout
      domainPanel={domainPanel}
      rivalsPanel={doctrineRivalsPanel}
      thresholdPanel={eraGatePanel}
      domainsSummary={domainsGrowthSummary}
      rivalsSummary={rivalsGrowthSummary}
      thresholdSummary={eraTwoThresholdSummary}
      thresholdProgressRatio={eraTwoThresholdRatio}
      hasActiveRivals={hasActiveRivals}
    />
  );

  const eraThreeActiveContent = (
    <EraThreeActiveLayout
      whisperPanel={whisperPanel}
      doctrinePanel={era >= 3 ? doctrineGrowthPanel : null}
      progressPanel={era >= 3 ? progressPanel : null}
      whisperSummary={activeWhispersSummary}
      doctrineSummary={doctrineGrowthSummary}
    />
  );

  const eraThreeGrowthContent = (
    <EraThreeGrowthLayout
      domainPanel={domainPanel}
      rivalsPanel={era >= 3 ? doctrineRivalsPanel : null}
      domainsSummary={domainsGrowthSummary}
      rivalsSummary={rivalsGrowthSummary}
      hasActiveRivals={hasActiveRivals}
    />
  );

  const eraOneContent = (
    <EraOneLayout
      whisperCost={whisperCost}
      whisperPreview={whisperPreview}
      recruitPreview={recruitPreview}
      devotionStacks={devotionStacks}
      cadencePromptActive={gameState.activity.cadencePromptActive}
      canUseWhisper={canUseWhisper}
      canUseRecruit={canUseRecruit}
      acolytes={gameState.acolytes}
      nextAcolyteFollowers={nextAcolyteFollowers}
      canCreateAcolyte={canCreateAcolyte}
      canUseAcolyteOrder={canUseAcolyteOrder}
      acolyteOrder={activeAcolyteOrder}
      acolyteOrderRemainingSeconds={activeAcolyteOrderRemainingSeconds}
      acolyteOrderPotency={activeAcolyteOrderPotency}
      acolyteGatherPassivePerSecond={acolyteGatherPassivePerSecond}
      acolyteSteadyInfluencePerSecond={acolyteSteadyInfluencePerSecond}
      acolyteListenRecruitMultiplier={acolyteListenRecruitMultiplier}
      acolyteListenWhisperBeliefMultiplier={acolyteListenWhisperBeliefMultiplier}
      omenTitle={uiReveal.omenTitle}
      visibleOmens={visibleOmens}
      activeDoubtEvent={activeDoubtEventCard}
      onWhisper={onWhisper}
      onRecruit={onRecruit}
      onOrdainAcolyte={onOrdainAcolyte}
      onIssueAcolyteOrder={onIssueAcolyteOrder}
      onResolveDoubtChoice={onResolveDoubtChoice}
    />
  );
  const eraOneEchoQuickPanel =
    era === 1 && gameState.prestige.completedRuns > 0 ? (
      <EchoTreeQuickPanel
        echoes={gameState.prestige.echoes}
        treeViews={echoTreeViews}
        onPurchaseTree={onPurchaseEchoTreeRank}
        showHeading={false}
      />
    ) : null;

  const activeTabContent = era === 2 ? eraTwoActiveContent : eraThreeActiveContent;
  const growthTabContent = era === 2 ? eraTwoGrowthContent : eraThreeGrowthContent;
  const gateTabContent =
    era >= 3 ? (
      <div className="space-y-2">
        {eraThreeGateRitesPanel}
        {eraThreeGatePanel}
      </div>
    ) : null;
  const eraOneThresholdContent = (
    <div className="space-y-2">
      <CollapsibleContainer
        title="Threshold"
        summary={eraOneThresholdSummary}
        storageKey="era1_threshold_collapsed"
        showMiniProgress
        miniProgressRatio={eraOneThresholdRatio}
      >
        <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
          {eraGatePanel}
        </div>
      </CollapsibleContainer>
    </div>
  );
  const metaOverviewPanel = (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-veil/75 shadow-veil backdrop-blur-sm">
      <p>
        Cycle overview: Era {formatResource(era)} &middot; Completed runs{" "}
        {formatResource(gameState.prestige.completedRuns)}.
      </p>
    </section>
  );

  const metaAscensionPanel = uiReveal.showAscensionPanel ? (
    <AscensionPanel
      era={gameState.era}
      echoes={gameState.prestige.echoes}
      lifetimeEchoes={gameState.prestige.lifetimeEchoes}
      completedRuns={gameState.prestige.completedRuns}
      totalBeliefEarned={gameState.stats.totalBeliefEarned}
      ascensionEchoGain={ascensionEchoGain}
      canAscend={canUseAscend}
      treeViews={echoTreeViews}
      onPurchaseTree={onPurchaseEchoTreeRank}
      onAscend={onAscend}
    />
  ) : (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-veil/75 shadow-veil backdrop-blur-sm">
      Echo structures remain dormant in this cycle.
    </section>
  );
  const legacyTabContent =
    era === 1 ? (
      <div className="space-y-2">
        <CollapsibleContainer
          title="Legacy Echoes"
          summary={
            gameState.prestige.completedRuns > 0
              ? `${formatResource(gameState.prestige.echoes)} Echoes available`
              : "Legacy echoes awaken after your first ascension."
          }
          storageKey="era1_legacy_collapsed"
        >
          {eraOneEchoQuickPanel ?? (
            <section className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-veil/75 shadow-veil backdrop-blur-sm">
              Echo roots remain dormant in this first cycle.
            </section>
          )}
        </CollapsibleContainer>
      </div>
    ) : (
      <div className="space-y-2">
        <CollapsibleContainer
          title="Legacy Echoes"
          summary={metaAscensionSummary}
          storageKey="legacy_ascension_collapsed"
        >
          <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section]:shadow-none [&>section]:backdrop-blur-none [&>section>h2]:hidden">
            {metaAscensionPanel}
          </div>
        </CollapsibleContainer>
      </div>
    );

  const metaRemembrancePanel = (
    <RemembrancePanel
      architectureUnlocked={architectureUnlocked}
      beliefRule={gameState.prestige.architecture.beliefRule}
      civilizationRule={gameState.prestige.architecture.civilizationRule}
      domainRule={gameState.prestige.architecture.domainRule}
      unlockedLetters={unlockedNameLetters}
      totalLetters={totalNameLetters}
      conditions={remembranceConditions}
      finalChoice={gameState.prestige.remembrance.finalChoice}
      canInvokeFinalChoice={canUseFinalChoice}
      onSetBeliefRule={onSetArchitectureBeliefRule}
      onSetCivilizationRule={onSetArchitectureCivilizationRule}
      onSetDomainRule={onSetArchitectureDomainRule}
      onInvokeFinalChoice={onInvokeFinalChoice}
    />
  );

  const metaPantheonPanel = uiReveal.showPantheonPanel ? (
    <PantheonPanel
      unlocked={pantheonUnlocked}
      allies={pantheonAllies}
      allianceTotalModifier={pantheonAllianceFactors.totalModifier}
      allianceSharePenalty={pantheonAllianceFactors.sharePenalty}
      allianceDomainBonus={pantheonAllianceFactors.domainBonus}
      betrayalsLifetime={gameState.prestige.pantheon.betrayalsLifetime}
      betrayedHookUnlocked={betrayedHookUnlocked}
      onFormAlliance={onFormPantheonAlliance}
      onBetray={onBetrayPantheonAlly}
    />
  ) : null;

  const metaTabContent = (
    <EraMetaLayout
      overviewPanel={metaOverviewPanel}
      remembrancePanel={metaRemembrancePanel}
      pantheonPanel={metaPantheonPanel}
      overviewSummary={metaOverviewSummary}
      remembranceSummary={metaRemembranceSummary}
      pantheonSummary={metaPantheonSummary}
    />
  );
  const statsDrawerProps = {
    era: gameState.era,
    completedRuns: gameState.prestige.completedRuns,
    lifetimeEchoes: gameState.prestige.lifetimeEchoes,
    runSeconds: elapsedSeconds,
    totalTicks: gameState.simulation.totalTicks,
    totalBeliefEarned: gameState.stats.totalBeliefEarned,
    milestoneCount: statsMilestoneCount,
    milestoneTarget: statsMilestoneTarget,
    nextMilestoneLabel: statsNextMilestoneLabel,
    secondsSinceLastEvent,
    beliefBreakdown,
    influenceBreakdown: influenceRegenBreakdown,
    shrinesBuilt: gameState.doctrine.shrinesBuilt,
    miracleReserve: gameState.cataclysm.miracleReserve,
    miracleReserveCap,
    currentInfluence: gameState.resources.influence,
    currentFollowers: gameState.resources.followers,
    currentAcolytes: gameState.acolytes,
    devotionStacks,
    devotionPathLabel,
    passiveFollowerRate,
    rivalFollowerDrainPerSecond: rivalDrainPerSecond,
    runHistory: telemetryRunSummaries,
    snapshotLabel: formatSnapshotLabel(snapshotMeta),
    saveImportStatus,
    saveImportWarnings,
    telemetryStatus,
    onExportSave,
    onImportSave,
    onRestoreSnapshot,
    onExportTelemetry,
    onDumpTelemetryToConsole,
    devToolsEnabled,
    devToolsStatus,
    onToggleDevTools,
    onDevBoostResources,
    onDevPrimeEraOneGate,
    onDevPrimeEraTwoGate,
    onDevJumpToEraTwo,
    onDevJumpToEraThree
  };

  return (
    <main
      data-era={gameState.era}
      className={`veil-shell relative min-h-screen overflow-hidden text-slate-100 ${
        gameState.era >= 3 ? `veil-zone-${veilStability.backgroundZone}` : ""
      } ${
        gameState.era >= 3 && (veilStability.id === "critical" || veilStability.id === "unraveling")
          ? "veil-zone-critical"
          : ""
      }`}
    >
      <div className="veil-backdrop pointer-events-none absolute inset-0" style={{ opacity: veilOpacity }} />
      {transitionKind ? (
        <div className={`veil-transition-overlay ${transitionKind === "fade" ? "veil-transition-fade" : "veil-transition-vignette"}`}>
          {transitionHint ? <p className="veil-transition-hint">{transitionHint}</p> : null}
        </div>
      ) : null}
      {finalChoiceMaskVisible ? <div className="veil-final-choice-mask" aria-hidden="true" /> : null}
      {uiToast ? (
        <div className="fixed left-4 top-4 z-50 max-w-[340px] rounded-xl border border-white/20 bg-black/70 px-3 py-2 text-xs text-veil/90 shadow-veil backdrop-blur-sm">
          {uiToast.message}
        </div>
      ) : null}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.45 }}
        className="veil-content relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-24 pt-8 lg:px-8"
      >
        <header className="veil-header space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-veil/70">Veilborn</p>
          <h1
            ref={eraHeadingRef}
            tabIndex={-1}
            className="text-2xl font-semibold text-veil outline-none md:text-4xl"
          >
            {veilMaskText("Someone is listening.", uiReveal.legibility)}
          </h1>
          {uiReveal.showHeaderSubtext ? (
            <p className="text-xs uppercase tracking-[0.22em] text-veil/60">
              {era === 1
                ? "Only one mortal keeps listening."
                : era === 2
                  ? "Doctrine has found shape in the world."
                  : "The Veil bends, and reality remembers."}
            </p>
          ) : null}
        </header>
        {offlineSummary ? (
          <OfflineSummaryPanel summary={offlineSummary} onDismiss={() => setOfflineSummary(null)} />
        ) : null}
        <StatBar
          era={era}
          belief={gameState.resources.belief}
          beliefPerSecond={beliefPerSecond}
          influence={gameState.resources.influence}
          influenceCap={influenceCap}
          influencePerSecond={influenceRegenBreakdown.totalPerSecond}
          followers={gameState.resources.followers}
          followerPerSecond={passiveFollowerRate}
          veil={gameState.resources.veil}
          veilStability={veilStability}
        />
        <div className="flex flex-col gap-4 min-[800px]:flex-row min-[800px]:items-start min-[800px]:gap-6">
          <div className="min-w-0 space-y-4 min-[800px]:min-w-[500px] min-[800px]:w-[calc(100%-240px)] lg:w-[calc(100%-300px)]">
            <TabDock availableTabs={availableTabs} activeTab={safeActiveTab} onSelectTab={setActiveTab} />
            {era === 1 ? (
              safeActiveTab === "active" ? (
                <>{eraOneContent}</>
              ) : safeActiveTab === "threshold" ? (
                <>{eraOneThresholdContent}</>
              ) : (
                <>{legacyTabContent}</>
              )
            ) : safeActiveTab === "active" ? (
              <>{activeTabContent}</>
            ) : safeActiveTab === "growth" ? (
              <>{growthTabContent}</>
            ) : safeActiveTab === "gate" ? (
              <>{gateTabContent}</>
            ) : safeActiveTab === "legacy" ? (
              <>{legacyTabContent}</>
            ) : (
              <>{metaTabContent}</>
            )}
            {statusLine ? <p className="text-xs text-veil/60">{statusLine}</p> : null}
          </div>
          <PersistentRightPanel
            era={era}
            omenTitle={uiReveal.omenTitle}
            omenEntries={rightPanelOmens}
            activeDoubtEvent={activeDoubtEventCard}
            onResolveDoubtChoice={onResolveDoubtChoice}
          />
        </div>
        {showStatsDrawer ? (
          <div className="min-[800px]:hidden">
            <StatsDrawer presentation="floating" {...statsDrawerProps} />
          </div>
        ) : null}
      </motion.div>
      <div className="fixed right-4 top-4 z-40 hidden min-[800px]:block">
        {desktopStatsExpanded ? (
          <div className="w-[280px] rounded-2xl border border-white/20 bg-black/65 p-3 shadow-veil backdrop-blur-sm lg:w-[320px]">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDesktopStatsExpanded(false)}
                className="rounded border border-white/20 px-2 py-0.5 text-[10px] tracking-[0.16em] text-veil/75 transition hover:border-veil/70 hover:text-white"
              >
                HIDE STATS
              </button>
            </div>
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
              <StatsDrawer presentation="embedded" {...statsDrawerProps} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDesktopStatsExpanded(true)}
            className="rounded border border-white/20 bg-black/65 px-3 py-1 text-[10px] tracking-[0.16em] text-veil/75 backdrop-blur-sm transition hover:border-veil/70 hover:text-white"
          >
            STATS
          </button>
        )}
      </div>
      {showPersistentOmenSurface ? (
        <div className="min-[800px]:hidden">
          <OmenSurface
            era={era}
            title={uiReveal.omenTitle}
            previewEntries={surfaceOmenPreview}
            expandedEntries={surfaceOmenExpanded}
          />
        </div>
      ) : null}
    </main>
  );
}


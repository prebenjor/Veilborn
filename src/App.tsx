import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  canAscend,
  canAdvanceEraOneToTwo,
  canAdvanceEraTwoToThree,
  canAnointProphet,
  canBetrayPantheonAlly,
  canCastMiracle,
  canFormCult,
  canPerformFollowerRite,
  canFormPantheonAlliance,
  canInvokeFinalChoice,
  canPurchaseEchoTreeRank,
  canStartAct,
  canSuppressRival,
  ensurePantheonInitialized,
  ensureGhostInitialized,
  exportGhostSignatures,
  getActSlotCap,
  canWhisper,
  canRecruit,
  getRecruitPreview,
  performAdvanceEraOneToTwo,
  performAdvanceEraTwoToThree,
  performAscension,
  performBetrayPantheonAlly,
  performCastMiracle,
  performCultFormation,
  performDomainInvestment,
  performFormPantheonAlliance,
  performFollowerRite,
  performImportGhostSignatures,
  performDomainInvestments,
  performPurchaseEchoTreeRank,
  performProphetAnoint,
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
  getActRewardBelief,
  getAscensionEchoGain,
  getActDurationSeconds,
  getBeliefPerSecond,
  getCultFormationCost,
  getCultOutput,
  getDomainSynergy,
  getDomainInvestCost,
  getDomainXpNeeded,
  getEraOneGateStatus,
  getEraTwoGateStatus,
  getEchoTreeNextCost,
  getFollowerRiteCost,
  getFollowerRiteFollowerGain,
  getFollowersForNextProphet,
  getHighestDomainLevel,
  getInfluenceCap,
  getInfluenceRegenBreakdown,
  getGhostInfluenceTotals,
  getDomainPoisonRunsRemaining,
  getLineageConversionFactors,
  getLineageTraitDistribution,
  getMiracleBeliefGain,
  getMiracleCivDamage,
  getMiracleInfluenceCost,
  getMiracleVeilCost,
  getPassiveFollowerRate,
  getRivalSpawnIntervalMs,
  getTotalRivalStrength,
  getTotalDomainLevel,
  getUnravelingGateStatus,
  getPantheonAllianceFactors,
  hasPantheonBetrayalHook,
  isArchitectureUnlocked,
  isPantheonUnlocked,
  getVeilBonus,
  getVeilCollapseThreshold,
  getVeilErosionPerSecond,
  getVeilRegenPerSecond,
  getWhisperCost
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
import { useVeilAudio } from "./core/audio/useVeilAudio";
import {
  DOMAIN_LABELS,
  MIRACLE_TIERS,
  RIVAL_DRAIN_RATE,
  RIVAL_SUPPRESS_INFLUENCE_COST,
  RECRUIT_INFLUENCE_COST,
  WHISPER_WINDOW_MS,
  WORLD_TICK_MS,
  type ActType,
  type ArchitectureBeliefRule,
  type ArchitectureCivilizationRule,
  type ArchitectureDomainRule,
  type DomainId,
  type EchoTreeId,
  type FinalChoice,
  type FollowerRiteType,
  type GameState,
  type MiracleTier
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
  loadTelemetryRunSummaries,
  readTelemetryForTests,
  updateTelemetryPeakBeliefPerSecond,
  type TelemetryRunSummary
} from "./core/state/telemetry";
import { CataclysmPanel } from "./ui/panels/CataclysmPanel";
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
import { formatRate, formatResource } from "./core/ui/numberFormat";
import { getVeilStabilityView } from "./core/ui/veilPresentation";

const UI_TAB_KEY = "veilborn.ui.active_tab.v1";

type UiTab = "active" | "growth" | "meta";
type EraValue = 1 | 2 | 3;
type TransitionKind = "fade" | "vignette";

const ECHO_TREE_META: Array<{
  id: EchoTreeId;
  label: string;
  unlocks: string[];
}> = [
  {
    id: "whispers",
    label: "Whisper Roots",
    unlocks: [
      "Start Influence",
      "Prophet Threshold",
      "Faith Floor + Resonant Word",
      "Era I Gate Ease",
      "Rival Weaken"
    ]
  },
  {
    id: "doctrine",
    label: "Doctrine Roots",
    unlocks: [
      "Cult Cost Base",
      "Rival Delay",
      "Act Floor",
      "Act Discount",
      "Era II Gate Ease"
    ]
  },
  {
    id: "cataclysm",
    label: "Cataclysm Roots",
    unlocks: [
      "Veil Regen",
      "Miracle Veil Discount",
      "Collapse Threshold",
      "Collapse Immunity",
      "Civilization Rebuild"
    ]
  }
];

const FOLLOWER_RITE_META: Record<
  FollowerRiteType,
  {
    label: string;
    hint: string;
  }
> = {
  procession: {
    label: "Pilgrim Procession",
    hint: "Draws followers along shrine paths."
  },
  convergence: {
    label: "Convergence March",
    hint: "A great movement, difficult to sustain."
  }
};

function getAvailableTabs(era: EraValue): UiTab[] {
  if (era <= 1) return [];
  return ["active", "growth", "meta"];
}

function loadUiTabPreference(): UiTab {
  if (typeof window === "undefined") return "active";
  try {
    const raw = window.localStorage.getItem(UI_TAB_KEY);
    if (raw === "active" || raw === "growth" || raw === "meta") {
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

function renderGateChip(label: string, ready: boolean): JSX.Element {
  return (
    <span
      className={
        ready
          ? "rounded-full border border-omen/40 bg-omen/10 px-2 py-0.5 text-[11px] text-omen"
          : "rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[11px] text-veil/70"
      }
    >
      {label}: {ready ? "Met" : "Pending"}
    </span>
  );
}

export default function App() {
  const [initialLoad] = useState(() => loadGameStateWithOffline());
  const [gameState, setGameState] = useState<GameState>(initialLoad.state);
  const [offlineSummary, setOfflineSummary] = useState<OfflineProgressSummary | null>(
    initialLoad.offlineSummary
  );
  const [ghostImportStatus, setGhostImportStatus] = useState<string | null>(null);
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
  const [transitionKind, setTransitionKind] = useState<TransitionKind | null>(null);
  const [transitionHint, setTransitionHint] = useState<string | null>(null);
  const [finalChoiceMaskVisible, setFinalChoiceMaskVisible] = useState(false);
  const gameStateRef = useRef(gameState);
  const previousEraRef = useRef<EraValue>(gameState.era);
  const previousVeilCollapseRef = useRef<{ runId: string; count: number }>({
    runId: gameState.meta.runId,
    count: gameState.cataclysm.totalVeilCollapses
  });
  const transitionTimerRef = useRef<number | null>(null);
  const finalChoiceMaskTimerRef = useRef<number | null>(null);
  const nowMs = gameState.meta.updatedAt;

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const tickTimer = window.setInterval(() => {
      setGameState((prev) => advanceWorld(prev, Date.now()));
    }, WORLD_TICK_MS);

    return () => window.clearInterval(tickTimer);
  }, []);

  useEffect(() => {
    const autosaveTimer = window.setInterval(() => {
      saveGameState(gameStateRef.current);
    }, 2000);

    return () => window.clearInterval(autosaveTimer);
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      saveGameState(gameStateRef.current);
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
    const available = getAvailableTabs(gameState.era);
    if (available.length <= 0) return;
    const safeTab = getSafeTab(activeTab, available);
    if (safeTab !== activeTab) {
      setActiveTab(safeTab);
    }
  }, [activeTab, gameState.era]);

  useEffect(() => {
    if (gameState.era >= 2) {
      saveUiTabPreference(activeTab);
    }
  }, [activeTab, gameState.era]);

  useEffect(() => {
    if (!offlineSummary) return;
    setActiveTab("active");
  }, [offlineSummary]);

  useEffect(() => {
    const previousEra = previousEraRef.current;
    if (previousEra === gameState.era) return;
    previousEraRef.current = gameState.era;

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
      return;
    }

    if (previousEra === 2 && gameState.era === 3) {
      setTransitionKind("vignette");
      setTransitionHint("The Veil surfaced in mortal thought. Thin it carefully, or the world tears.");
      transitionTimerRef.current = window.setTimeout(() => {
        setTransitionKind(null);
      }, 900);
      return;
    }

    setTransitionKind(null);
    setTransitionHint(null);
  }, [gameState.era]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (finalChoiceMaskTimerRef.current !== null) {
        window.clearTimeout(finalChoiceMaskTimerRef.current);
      }
    };
  }, []);

  const veilOpacity = useMemo(() => {
    const normalized = Math.max(0.15, Math.min(1, gameState.resources.veil / 100));
    return normalized;
  }, [gameState.resources.veil]);

  const beliefPerSecond = getBeliefPerSecond(gameState, nowMs);
  const influenceCap = getInfluenceCap(gameState);
  const influenceRegenBreakdown = getInfluenceRegenBreakdown(gameState);
  const passiveFollowerRate = getPassiveFollowerRate(gameState, nowMs);
  const whisperCost = getWhisperCost(gameState, nowMs);
  const recruitPreview = getRecruitPreview(gameState);
  const nextProphetFollowers = getFollowersForNextProphet(gameState);
  const nextCultBeliefCost = getCultFormationCost(gameState);
  const eraOneGate = getEraOneGateStatus(gameState);
  const eraTwoGate = getEraTwoGateStatus(gameState);
  const unravelingGate = getUnravelingGateStatus(gameState);
  const ascensionEchoGain = getAscensionEchoGain(gameState.stats.totalBeliefEarned);
  const lineageConversionFactors = getLineageConversionFactors(gameState);
  const lineageTraits = getLineageTraitDistribution(gameState);
  const lineageRecentMarker = gameState.lineage.history[0]?.text ?? null;
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
  const ghostInfluenceTotals = getGhostInfluenceTotals(gameState);

  const canUseWhisper = canWhisper(gameState, nowMs);
  const canUseRecruit = canRecruit(gameState);
  const canCreateProphet = canAnointProphet(gameState);
  const canCreateCult = canFormCult(gameState);
  const canAdvanceEraOne = canAdvanceEraOneToTwo(gameState);
  const canAdvanceEraTwo = canAdvanceEraTwoToThree(gameState);
  const canUseAscend = canAscend(gameState);
  const totalDomainLevel = getTotalDomainLevel(gameState);
  const domainSynergy = getDomainSynergy(gameState);

  const { controls: audioControls, enableAudio, disableAudio, toggleMute, useSilentFallback } =
    useVeilAudio({
      era: gameState.era,
      veil: gameState.resources.veil,
      civilizationHealth: gameState.cataclysm.civilizationHealth,
      civilizationCollapsed: gameState.cataclysm.civilizationCollapsed,
      rivalCount: gameState.doctrine.rivals.length,
      totalDomainLevel,
      domains: gameState.domains.reduce(
        (accumulator, domain) => {
          accumulator[domain.id] = domain.level;
          return accumulator;
        },
        {
          fire: 0,
          death: 0,
          harvest: 0,
          storm: 0,
          memory: 0,
          void: 0
        } satisfies Record<DomainId, number>
      )
    });

  const echoTreeViews = ECHO_TREE_META
    .filter((tree) => {
      if (tree.id === "whispers") return true;
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
        unlockedBonuses: tree.unlocks.slice(0, rank)
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
  const followerRiteOptions = (Object.keys(FOLLOWER_RITE_META) as FollowerRiteType[]).map((type) => {
    const costs = getFollowerRiteCost(gameState, type);
    return {
      type,
      label: FOLLOWER_RITE_META[type].label,
      hint: FOLLOWER_RITE_META[type].hint,
      influenceCost: costs.influenceCost,
      beliefCost: costs.beliefCost,
      projectedFollowers: getFollowerRiteFollowerGain(gameState, type, nowMs),
      uses: costs.uses,
      canPerform: canPerformFollowerRite(gameState, type)
    };
  });
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
  const canUseSuppressRival = canSuppressRival(gameState);

  const veilBonus = getVeilBonus(gameState.resources.veil);
  const veilRegenPerSecond = getVeilRegenPerSecond(gameState);
  const veilErosionPerSecond = getVeilErosionPerSecond(gameState);
  const veilCollapseThreshold = getVeilCollapseThreshold(gameState);
  const civilizationRebuildSeconds = gameState.cataclysm.civilizationCollapsed
    ? Math.max(0, Math.ceil((gameState.cataclysm.civilizationRebuildEndsAt - nowMs) / 1000))
    : 0;
  const miracleOptions = MIRACLE_TIERS.map((tier) => ({
    tier,
    influenceCost: getMiracleInfluenceCost(tier),
    beliefGain: getMiracleBeliefGain(gameState, tier),
    veilCost: getMiracleVeilCost(gameState, tier),
    civDamage: getMiracleCivDamage(tier),
    canCast: canCastMiracle(gameState, tier)
  }));

  const elapsedSeconds = Math.floor(gameState.simulation.totalElapsedMs / 1000);
  const secondsSinceLastEvent = Math.max(0, (nowMs - gameState.activity.lastEventAt) / 1000);
  const whisperCycleElapsed = Math.max(0, nowMs - gameState.activity.whisperWindowStartedAt);
  const whisperResetInSeconds = Math.max(
    0,
    Math.ceil((WHISPER_WINDOW_MS - (whisperCycleElapsed % WHISPER_WINDOW_MS)) / 1000)
  );
  const era = gameState.era;
  const availableTabs = getAvailableTabs(era);
  const safeActiveTab = getSafeTab(activeTab, availableTabs);
  const omenPreviewCount = era === 1 ? 3 : 2;
  const visibleOmens = gameState.omenLog.slice(0, omenPreviewCount);
  const showPersistentOmenSurface = era >= 2;
  const showStatsDrawer = uiReveal.showStatsDrawer && era >= 2;
  const veilStability = getVeilStabilityView(gameState.resources.veil, veilCollapseThreshold);
  const surfaceOmenPreviewCount = era >= 3 ? 2 : 1;
  const surfaceOmenPreview = gameState.omenLog.slice(0, surfaceOmenPreviewCount);
  const surfaceOmenExpanded = gameState.omenLog.slice(surfaceOmenPreviewCount, era >= 3 ? 6 : 4);
  const architectureUnlocked = isArchitectureUnlocked(gameState);
  const remembranceConditions = getRemembranceConditionViews(gameState);
  const totalNameLetters = getRemembranceLetterDefinitions().length;
  const unlockedNameLetters = getUnlockedNameLetterCount(gameState.prestige.remembrance.letters);
  const canUseFinalChoice = canInvokeFinalChoice(gameState);

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

  const onWhisper = () => {
    setGameState((prev) => performWhisper(prev, Date.now()));
  };

  const onRecruit = () => {
    setGameState((prev) => performRecruit(prev, Date.now()));
  };

  const onInvestDomain = (domainId: DomainId, investments: number) => {
    if (investments <= 1) {
      setGameState((prev) => performDomainInvestment(prev, domainId, Date.now()));
      return;
    }
    setGameState((prev) => performDomainInvestments(prev, domainId, investments, Date.now()));
  };

  const onAnointProphet = () => {
    setGameState((prev) => performProphetAnoint(prev, Date.now()));
  };

  const onFormCult = () => {
    setGameState((prev) => performCultFormation(prev, Date.now()));
  };

  const onStartAct = (type: ActType) => {
    setGameState((prev) => performStartAct(prev, type, Date.now()));
  };

  const onPerformFollowerRite = (type: FollowerRiteType) => {
    setGameState((prev) => performFollowerRite(prev, type, Date.now()));
  };

  const onSuppressRival = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      const next = performSuppressRival(prev, actionAt);
      if (next === prev) return prev;
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
    setGameState((prev) => performPurchaseEchoTreeRank(prev, treeId, Date.now()));
  };

  const onSetArchitectureBeliefRule = (rule: ArchitectureBeliefRule) => {
    setGameState((prev) => performSetArchitectureBeliefRule(prev, rule, Date.now()));
  };

  const onSetArchitectureCivilizationRule = (rule: ArchitectureCivilizationRule) => {
    setGameState((prev) => performSetArchitectureCivilizationRule(prev, rule, Date.now()));
  };

  const onSetArchitectureDomainRule = (rule: ArchitectureDomainRule) => {
    setGameState((prev) => performSetArchitectureDomainRule(prev, rule, Date.now()));
  };

  const onInvokeFinalChoice = (choice: Exclude<FinalChoice, "none">) => {
    if (!canUseFinalChoice) return;
    setGameState((prev) => performInvokeFinalChoice(prev, choice, Date.now()));
    setFinalChoiceMaskVisible(true);
    if (finalChoiceMaskTimerRef.current !== null) {
      window.clearTimeout(finalChoiceMaskTimerRef.current);
    }
    finalChoiceMaskTimerRef.current = window.setTimeout(() => {
      setFinalChoiceMaskVisible(false);
      finalChoiceMaskTimerRef.current = null;
    }, 1800);
  };

  const onExportGhostSignatures = () => {
    const payload = exportGhostSignatures(gameStateRef.current);
    const stamp = new Date().toISOString().replace(/[:]/g, "-");
    const fileName = `veilborn-signatures-${stamp}.json`;
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setGhostImportStatus(`Exported signatures to ${fileName}.`);
  };

  const onImportGhostSignatures = async (file: File) => {
    const rawText = await file.text();
    const nowMs = Date.now();
    let importedCount = 0;
    let error: string | null = null;

    setGameState((prev) => {
      const result = performImportGhostSignatures(prev, rawText, nowMs);
      importedCount = result.importedCount;
      error = result.error;
      return result.state;
    });

    if (error) {
      setGhostImportStatus(error);
      return;
    }

    setGhostImportStatus(`Imported ${formatResource(importedCount)} signatures from ${file.name}.`);
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

  const onAscend = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      if (!canAscend(prev)) return prev;
      const echoesGained = getAscensionEchoGain(prev.stats.totalBeliefEarned);
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
  };

  const onFormPantheonAlliance = (allyId: string) => {
    setGameState((prev) => performFormPantheonAlliance(prev, allyId, Date.now()));
  };

  const onBetrayPantheonAlly = (allyId: string) => {
    setGameState((prev) => performBetrayPantheonAlly(prev, allyId, Date.now()));
  };

  const onAdvanceEraOne = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      if (!canAdvanceEraOneToTwo(prev)) return prev;
      saveRecoverySnapshot(prev, "era_transition");
      const next = performAdvanceEraOneToTwo(prev, actionAt);
      if (next !== prev && next.era !== prev.era) {
        appendTelemetryEvent(next, "era_transition", actionAt, {
          fromEra: prev.era,
          toEra: next.era
        });
      }
      return next;
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
  };

  const onAdvanceEraTwo = () => {
    const actionAt = Date.now();
    setGameState((prev) => {
      if (!canAdvanceEraTwoToThree(prev)) return prev;
      saveRecoverySnapshot(prev, "era_transition");
      const next = performAdvanceEraTwoToThree(prev, actionAt);
      if (next !== prev && next.era !== prev.era) {
        appendTelemetryEvent(next, "era_transition", actionAt, {
          fromEra: prev.era,
          toEra: next.era
        });
      }
      return next;
    });
    setSnapshotMeta(getRecoverySnapshotMeta());
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
      actResonantBonus={gameState.matchingDomainPairs * 0.2}
      canStartAct={canStartActs}
      onStartAct={onStartAct}
      followerRites={followerRiteOptions}
      onPerformFollowerRite={onPerformFollowerRite}
      rivalsCount={gameState.doctrine.rivals.length}
      rivalStrength={rivalStrength}
      rivalDrainPerSecond={rivalDrainPerSecond}
      nextRivalInSeconds={nextRivalInSeconds}
      canSuppressRival={canUseSuppressRival}
      suppressCost={RIVAL_SUPPRESS_INFLUENCE_COST}
      onSuppressRival={onSuppressRival}
      showActs
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
      actResonantBonus={gameState.matchingDomainPairs * 0.2}
      canStartAct={canStartActs}
      onStartAct={onStartAct}
      followerRites={followerRiteOptions}
      onPerformFollowerRite={onPerformFollowerRite}
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
      recruitCost={RECRUIT_INFLUENCE_COST}
      recruitPreview={recruitPreview}
      cadencePromptActive={gameState.activity.cadencePromptActive}
      onWhisper={onWhisper}
      onRecruit={onRecruit}
    />
  );

  const eraGatePanel = era <= 2 ? (
    <EraGatePanel
      era={gameState.era}
      eraOneBeliefProgress={gameState.stats.totalBeliefEarned}
      eraOneBeliefTarget={eraOneGate.beliefTarget}
      prophetsProgress={gameState.prophets}
      prophetsTarget={eraOneGate.prophetsTarget}
      domainProgress={getHighestDomainLevel(gameState)}
      domainTarget={eraOneGate.domainTarget}
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
      unravelingMiraclesProgress={gameState.cataclysm.miraclesThisRun}
      unravelingMiraclesTarget={unravelingGate.miraclesTarget}
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
        belief={gameState.resources.belief}
        domains={gameState.domains}
        matchingDomainPairs={gameState.matchingDomainPairs}
        domainSynergy={domainSynergy}
        getInvestCost={getDomainInvestCost}
        getXpNeeded={getDomainXpNeeded}
        onInvest={onInvestDomain}
      />
    ) : null;

  const progressPanel = (
    <ProgressPanel
      belief={gameState.resources.belief}
      era={gameState.era}
      prophets={gameState.prophets}
      cults={gameState.cults}
      nextProphetFollowers={nextProphetFollowers}
      nextCultBeliefCost={nextCultBeliefCost}
      lineageGeneration={gameState.lineage.generation}
      lineageTrustDebt={gameState.lineage.trustDebt}
      lineageSkepticism={gameState.lineage.skepticism}
      lineageBetrayalScars={gameState.lineage.betrayalScars}
      lineageConversionModifier={lineageConversionFactors.totalModifier}
      lineageRecentMarker={lineageRecentMarker}
      lineageTraits={lineageTraits}
      canAnointProphet={canCreateProphet}
      canFormCult={canCreateCult}
      onAnointProphet={onAnointProphet}
      onFormCult={onFormCult}
    />
  );

  const activeTabContent = (
    <>
      {era >= 3 ? (
        <CataclysmPanel
          era={gameState.era}
          veil={gameState.resources.veil}
          veilBonus={veilBonus}
          veilRegenPerSecond={veilRegenPerSecond}
          veilErosionPerSecond={veilErosionPerSecond}
          veilCollapseThreshold={veilCollapseThreshold}
          civilizationHealth={gameState.cataclysm.civilizationHealth}
          civilizationCollapsed={gameState.cataclysm.civilizationCollapsed}
          civilizationRebuildInSeconds={civilizationRebuildSeconds}
          miraclesThisRun={gameState.cataclysm.miraclesThisRun}
          miracleOptions={miracleOptions}
          onCastMiracle={onCastMiracle}
        />
      ) : null}
      {doctrineRivalsPanel}
      {whisperPanel}
      {era === 2 ? eraGatePanel : null}
    </>
  );

  const growthTabContent = (
    <>
      {domainPanel}
      {doctrineGrowthPanel}
      {progressPanel}
    </>
  );

  const eraOneContent = (
    <>
      {whisperPanel}
      {progressPanel}
      {eraGatePanel}
      <section className="veil-omen-compact rounded-2xl border border-white/10 bg-black/20 p-4 shadow-veil backdrop-blur-sm">
        <h2 className="text-xs uppercase tracking-[0.25em] text-veil/70">Murmurs</h2>
        <ul className="mt-2 space-y-2 text-sm text-veil/75">
          {visibleOmens.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      </section>
    </>
  );

  const metaTabContent = (
    <>
      <section className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-veil/75 shadow-veil backdrop-blur-sm">
        <p>
          Cycle overview: Era {formatResource(era)} · Completed runs{" "}
          {formatResource(gameState.prestige.completedRuns)}.
        </p>
      </section>
      {uiReveal.showAscensionPanel ? (
        <AscensionPanel
          era={gameState.era}
          echoes={gameState.prestige.echoes}
          lifetimeEchoes={gameState.prestige.lifetimeEchoes}
          completedRuns={gameState.prestige.completedRuns}
          ascensionEchoGain={ascensionEchoGain}
          canAscend={canUseAscend}
          treeViews={echoTreeViews}
          ghostLocalCount={gameState.ghost.localSignatures.length}
          ghostImportedCount={gameState.ghost.importedSignatures.length}
          ghostImportStatus={ghostImportStatus}
          saveImportStatus={saveImportStatus}
          saveImportWarnings={saveImportWarnings}
          snapshotLabel={formatSnapshotLabel(snapshotMeta)}
          ghostInfluenceTotals={ghostInfluenceTotals}
          ghostInfluences={gameState.ghost.activeInfluences}
          onPurchaseTree={onPurchaseEchoTreeRank}
          onAscend={onAscend}
          onExportGhostSignatures={onExportGhostSignatures}
          onImportGhostSignatures={onImportGhostSignatures}
          onExportSave={onExportSave}
          onImportSave={onImportSave}
          onRestoreSnapshot={onRestoreSnapshot}
        />
      ) : (
        <section className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-veil/75 shadow-veil backdrop-blur-sm">
          Echo structures remain dormant in this cycle.
        </section>
      )}
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
      {uiReveal.showPantheonPanel ? (
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
      ) : null}
    </>
  );

  return (
    <main
      data-era={gameState.era}
      className={`veil-shell relative min-h-screen overflow-hidden text-slate-100 ${
        gameState.era >= 3 ? "md:pr-[21.5rem]" : ""
      } ${gameState.era >= 3 ? `veil-zone-${veilStability.backgroundZone}` : ""} ${
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="veil-content relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-24 pt-8 md:px-8"
      >
        <header className="veil-header space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-veil/70">Veilborn</p>
          <h1 className="text-2xl font-semibold text-veil md:text-4xl">
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
        <section
          className={`veil-statbar grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 ${
            era === 1 ? "md:grid-cols-2" : era === 2 ? "md:grid-cols-3" : "md:grid-cols-4"
          }`}
        >
          <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Belief</p>
            <p className="mt-2 text-xl text-white">{formatResource(gameState.resources.belief)}</p>
            <p className="mt-1 text-xs text-veil/65">{formatRate(beliefPerSecond)} / sec</p>
          </article>
          <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Influence</p>
            <p className="mt-2 text-xl text-white">
              {formatResource(gameState.resources.influence)} / {formatResource(influenceCap)}
            </p>
          </article>
          {era >= 2 ? (
            <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Followers</p>
              <p className="mt-2 text-xl text-white">{formatResource(gameState.resources.followers)}</p>
            </article>
          ) : null}
          {era >= 3 ? (
            <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Veil Stability</p>
              <p className="mt-2 text-xl text-white">
                {formatResource(gameState.resources.veil)} <span className="text-veil/55">·</span>{" "}
                <span className={`${veilStability.cssClass} text-base`}>{veilStability.label}</span>
              </p>
            </article>
          ) : null}
        </section>
        {era >= 3 ? (
          <section className="veil-gate-strip rounded-xl border border-white/15 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-veil/70">Unraveling Gate</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {renderGateChip("Belief", unravelingGate.beliefReady)}
              {renderGateChip("Veil", unravelingGate.veilReady)}
              {renderGateChip("Miracles", unravelingGate.miraclesReady)}
              {renderGateChip("Run Time", unravelingGate.runTimeReady)}
              <span
                className={
                  unravelingGate.ready
                    ? "rounded-full border border-ember/50 bg-ember/15 px-2 py-0.5 text-[11px] text-ember"
                    : "rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[11px] text-veil/70"
                }
              >
                {unravelingGate.ready ? "Ascension Available" : "Still Sealed"}
              </span>
            </div>
          </section>
        ) : null}
        {era >= 2 ? (
          <nav className="veil-tab-dock sticky top-2 z-20 rounded-xl border border-white/15 bg-black/40 p-1 backdrop-blur-sm">
            <div className="flex flex-wrap gap-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
                    safeActiveTab === tab
                      ? "bg-white/14 text-white"
                      : "text-veil/70 hover:bg-white/8 hover:text-veil"
                  }`}
                >
                  {tab === "active" ? "Active" : tab === "growth" ? "Growth" : era === 2 ? "Meta (Lite)" : "Meta"}
                </button>
              ))}
            </div>
          </nav>
        ) : null}
        {era === 1 ? (
          <>{eraOneContent}</>
        ) : safeActiveTab === "active" ? (
          <>{activeTabContent}</>
        ) : safeActiveTab === "growth" ? (
          <>{growthTabContent}</>
        ) : (
          <>{metaTabContent}</>
        )}
        <p className="text-xs text-veil/60">
          {gameState.activity.cadencePromptActive
            ? "Silence is building. Taking an action now grants a cadence bonus."
            : "Act every 30-60 seconds to keep momentum and avoid faith drift."}
          {!canUseWhisper && !canUseRecruit
            ? " Influence is recovering; choose your next intervention when it peaks."
            : " Whisper and recruit both satisfy cadence pressure."}
        </p>
        {showStatsDrawer ? (
          <StatsDrawer
            era={gameState.era}
            runSeconds={elapsedSeconds}
            totalTicks={gameState.simulation.totalTicks}
            totalBeliefEarned={gameState.stats.totalBeliefEarned}
            secondsSinceLastEvent={secondsSinceLastEvent}
            whispersInWindow={gameState.activity.whispersInWindow}
            whisperResetInSeconds={whisperResetInSeconds}
            influenceBreakdown={influenceRegenBreakdown}
            shrinesBuilt={gameState.doctrine.shrinesBuilt}
            currentFollowers={gameState.resources.followers}
            passiveFollowerRate={passiveFollowerRate}
            rivalFollowerDrainPerSecond={rivalDrainPerSecond}
            runHistory={telemetryRunSummaries}
            telemetryStatus={telemetryStatus}
            audioControls={audioControls}
            onEnableAudio={enableAudio}
            onDisableAudio={disableAudio}
            onToggleAudioMute={toggleMute}
            onUseAudioFallback={useSilentFallback}
            onExportTelemetry={onExportTelemetry}
            onDumpTelemetryToConsole={onDumpTelemetryToConsole}
          />
        ) : null}
      </motion.div>
      {showPersistentOmenSurface ? (
        <details
          className={`group veil-omen-surface ${
            era >= 3
              ? "fixed bottom-3 left-3 right-3 z-30 rounded-xl border border-white/15 bg-black/55 p-2 text-xs text-veil/85 backdrop-blur-sm md:bottom-auto md:left-auto md:right-4 md:top-24 md:w-80"
              : "fixed bottom-3 left-3 right-3 z-30 rounded-xl border border-white/15 bg-black/55 p-2 text-xs text-veil/85 backdrop-blur-sm"
          }`}
        >
          <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.2em] text-veil/90">
            {uiReveal.omenTitle}
          </summary>
          <ul className="mt-2 space-y-1 text-[12px] text-veil/80">
            {surfaceOmenPreview.map((entry) => (
              <li key={entry.id} className="veil-omen-preview-line">
                {entry.text}
              </li>
            ))}
          </ul>
          {surfaceOmenExpanded.length > 0 ? (
            <ul className="mt-2 hidden space-y-1 border-t border-white/10 pt-2 text-[12px] text-veil/75 group-open:block">
              {surfaceOmenExpanded.map((entry) => (
                <li key={entry.id}>{entry.text}</li>
              ))}
            </ul>
          ) : null}
        </details>
      ) : null}
    </main>
  );
}

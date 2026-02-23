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
  canFormPantheonAlliance,
  canPurchaseEchoTreeRank,
  canStartAct,
  canSuppressRival,
  ensurePantheonInitialized,
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
  performPurchaseEchoTreeRank,
  performProphetAnoint,
  performRecruit,
  performStartAct,
  performSuppressRival,
  performWhisper
} from "./core/engine/actions";
import {
  getActCost,
  getAscensionEchoGain,
  getActDurationSeconds,
  getBeliefPerSecond,
  getCultFormationCost,
  getCultOutput,
  getDomainInvestCost,
  getDomainXpNeeded,
  getEraOneGateStatus,
  getEraTwoGateStatus,
  getEchoTreeNextCost,
  getFollowersForNextProphet,
  getHighestDomainLevel,
  getInfluenceCap,
  getDomainPoisonRunsRemaining,
  getLineageConversionFactors,
  getLineageTraitDistribution,
  getMiracleBeliefGain,
  getMiracleCivDamage,
  getMiracleInfluenceCost,
  getMiracleVeilCost,
  getRivalSpawnIntervalMs,
  getTotalRivalStrength,
  getTotalDomainLevel,
  getUnravelingGateStatus,
  getPantheonAllianceFactors,
  hasPantheonBetrayalHook,
  isPantheonUnlocked,
  getVeilBonus,
  getVeilCollapseThreshold,
  getVeilErosionPerSecond,
  getVeilRegenPerSecond,
  getWhisperCost
} from "./core/engine/formulas";
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
  type DomainId,
  type EchoTreeId,
  type GameState,
  type MiracleTier
} from "./core/state/gameState";
import {
  loadGameStateWithOffline,
  saveGameState,
  type OfflineProgressSummary
} from "./core/state/persistence";
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

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

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
      "Faith Floor",
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

export default function App() {
  const [initialLoad] = useState(() => loadGameStateWithOffline());
  const [gameState, setGameState] = useState<GameState>(initialLoad.state);
  const [offlineSummary, setOfflineSummary] = useState<OfflineProgressSummary | null>(
    initialLoad.offlineSummary
  );
  const gameStateRef = useRef(gameState);
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

  const veilOpacity = useMemo(() => {
    const normalized = Math.max(0.15, Math.min(1, gameState.resources.veil / 100));
    return normalized;
  }, [gameState.resources.veil]);

  const beliefPerSecond = getBeliefPerSecond(gameState, nowMs);
  const influenceCap = getInfluenceCap(gameState);
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
  const veilBlurPx = Math.max(0, (0.35 - uiReveal.legibility) * 3.5);
  const secondaryOpacity = 0.55 + uiReveal.legibility * 0.45;
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

  const canUseWhisper = canWhisper(gameState, nowMs);
  const canUseRecruit = canRecruit(gameState);
  const canCreateProphet = canAnointProphet(gameState);
  const canCreateCult = canFormCult(gameState);
  const canAdvanceEraOne = canAdvanceEraOneToTwo(gameState);
  const canAdvanceEraTwo = canAdvanceEraTwoToThree(gameState);
  const canUseAscend = canAscend(gameState);
  const eraLabel = gameState.era === 1 ? "I" : gameState.era === 2 ? "II" : "III";
  const totalDomainLevel = getTotalDomainLevel(gameState);

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
  const visibleOmens = gameState.omenLog.slice(0, uiReveal.omenVisibleCount);

  const onWhisper = () => {
    setGameState((prev) => performWhisper(prev, Date.now()));
  };

  const onRecruit = () => {
    setGameState((prev) => performRecruit(prev, Date.now()));
  };

  const onInvestDomain = (domainId: DomainId) => {
    setGameState((prev) => performDomainInvestment(prev, domainId, Date.now()));
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

  const onSuppressRival = () => {
    setGameState((prev) => performSuppressRival(prev, Date.now()));
  };

  const onCastMiracle = (tier: MiracleTier) => {
    setGameState((prev) => performCastMiracle(prev, tier, Date.now()));
  };

  const onPurchaseEchoTreeRank = (treeId: EchoTreeId) => {
    setGameState((prev) => performPurchaseEchoTreeRank(prev, treeId, Date.now()));
  };

  const onAscend = () => {
    setGameState((prev) => performAscension(prev, Date.now()));
  };

  const onFormPantheonAlliance = (allyId: string) => {
    setGameState((prev) => performFormPantheonAlliance(prev, allyId, Date.now()));
  };

  const onBetrayPantheonAlly = (allyId: string) => {
    setGameState((prev) => performBetrayPantheonAlly(prev, allyId, Date.now()));
  };

  const onAdvanceEraOne = () => {
    setGameState((prev) => performAdvanceEraOneToTwo(prev, Date.now()));
  };

  const onAdvanceEraTwo = () => {
    setGameState((prev) => performAdvanceEraTwoToThree(prev, Date.now()));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-slate-950/20 to-black"
        style={{ opacity: veilOpacity }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8"
      >
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-veil/70">Veilborn</p>
          <h1 className="text-2xl font-semibold text-veil md:text-4xl">
            {veilMaskText("Someone is listening.", uiReveal.legibility)}
          </h1>
          {uiReveal.showHeaderSubtext ? (
            <p className="max-w-3xl text-sm text-veil/70">
              M10 veil UI active: clarity now unfolds with power and risk.
            </p>
          ) : null}
        </header>

        {offlineSummary ? (
          <OfflineSummaryPanel summary={offlineSummary} onDismiss={() => setOfflineSummary(null)} />
        ) : null}

        <section
          className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-4"
          style={{ opacity: secondaryOpacity }}
        >
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
              {veilMaskText("Era", uiReveal.legibility)}
            </p>
            <p className="mt-2 text-xl text-white">{eraLabel}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
              {veilMaskText("Belief", uiReveal.legibility)}
            </p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.resources.belief)}</p>
            <p className="mt-1 text-xs text-veil/65">{formatNumber(beliefPerSecond)} / sec</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
              {veilMaskText("Influence", uiReveal.legibility)}
            </p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.resources.influence)} / {formatNumber(influenceCap)}
            </p>
            <p className="mt-1 text-xs text-veil/65">Whisper: {formatNumber(whisperCost)}</p>
          </article>
          {uiReveal.showVeilHud ? (
            <article className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Veil Thickness</p>
              <p className="mt-2 text-xl text-white">{formatNumber(gameState.resources.veil)}</p>
              <p className="mt-1 text-xs text-veil/65">Thinner Veil boosts belief, but collapse risk rises.</p>
            </article>
          ) : null}
        </section>

        {uiReveal.showFollowersHud ? (
          <section
            className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-4"
            style={{ opacity: secondaryOpacity, filter: `blur(${veilBlurPx}px)` }}
          >
            <article className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Followers</p>
              <p className="mt-2 text-xl text-white">{formatNumber(gameState.resources.followers)}</p>
            </article>
            {uiReveal.showProphetsHud ? (
              <article className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
                <p className="mt-2 text-xl text-white">{formatNumber(gameState.prophets)}</p>
              </article>
            ) : null}
            {uiReveal.showCultsHud ? (
              <article className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
                <p className="mt-2 text-xl text-white">{formatNumber(gameState.cults)}</p>
              </article>
            ) : null}
            {uiReveal.showDomainSumHud ? (
              <article className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Domain Level Sum</p>
                <p className="mt-2 text-xl text-white">{formatNumber(totalDomainLevel)}</p>
                <p className="mt-1 text-xs text-veil/65">
                  Domain mastery amplifies prophet output and cult resonance.
                </p>
              </article>
            ) : null}
          </section>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
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
          <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
            <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">
              {veilMaskText(uiReveal.omenTitle, uiReveal.legibility)}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-veil/75">
              {visibleOmens.map((entry) => (
                <li key={entry.id}>{entry.text}</li>
              ))}
            </ul>
          </section>
        </div>

        {uiReveal.showEraGatePanel ? (
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
        ) : null}

        {uiReveal.showAscensionPanel ? (
          <AscensionPanel
            era={gameState.era}
            echoes={gameState.prestige.echoes}
            lifetimeEchoes={gameState.prestige.lifetimeEchoes}
            completedRuns={gameState.prestige.completedRuns}
            ascensionEchoGain={ascensionEchoGain}
            canAscend={canUseAscend}
            treeViews={echoTreeViews}
            onPurchaseTree={onPurchaseEchoTreeRank}
            onAscend={onAscend}
          />
        ) : null}

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

        {uiReveal.showProgressPanel ? (
          <ProgressPanel
            belief={gameState.resources.belief}
            era={gameState.era}
            followers={gameState.resources.followers}
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
        ) : null}

        {uiReveal.showDoctrinePanel ? (
          <DoctrinePanel
            era={gameState.era}
            cults={gameState.cults}
            influence={gameState.resources.influence}
            actSlotCap={actSlotCap}
            activeActs={activeActs}
            actCosts={actCosts}
            actDurations={actDurations}
            canStartAct={canStartActs}
            onStartAct={onStartAct}
            rivalsCount={gameState.doctrine.rivals.length}
            rivalStrength={rivalStrength}
            rivalDrainPerSecond={rivalDrainPerSecond}
            nextRivalInSeconds={nextRivalInSeconds}
            canSuppressRival={canUseSuppressRival}
            suppressCost={RIVAL_SUPPRESS_INFLUENCE_COST}
            onSuppressRival={onSuppressRival}
          />
        ) : null}

        {uiReveal.showCataclysmPanel ? (
          <CataclysmPanel
            era={gameState.era}
            influence={gameState.resources.influence}
            veil={gameState.resources.veil}
            veilBonus={veilBonus}
            veilRegenPerSecond={veilRegenPerSecond}
            veilErosionPerSecond={veilErosionPerSecond}
            veilCollapseThreshold={veilCollapseThreshold}
            shrinesBuilt={gameState.doctrine.shrinesBuilt}
            civilizationHealth={gameState.cataclysm.civilizationHealth}
            civilizationCollapsed={gameState.cataclysm.civilizationCollapsed}
            civilizationRebuildInSeconds={civilizationRebuildSeconds}
            miraclesThisRun={gameState.cataclysm.miraclesThisRun}
            miracleOptions={miracleOptions}
            onCastMiracle={onCastMiracle}
          />
        ) : null}

        {uiReveal.showDomainPanel ? (
          <DomainPanel
            belief={gameState.resources.belief}
            domains={gameState.domains}
            getInvestCost={getDomainInvestCost}
            getXpNeeded={getDomainXpNeeded}
            onInvest={onInvestDomain}
          />
        ) : null}

        <p className="text-xs text-veil/60">
          {gameState.activity.cadencePromptActive
            ? "Silence is building. Taking an action now grants a cadence bonus."
            : "Act every 30-60 seconds to keep momentum and avoid faith drift."}
          {!canUseWhisper && !canUseRecruit
            ? " Influence is recovering; choose your next intervention when it peaks."
            : " Whisper and recruit both satisfy cadence pressure."}
        </p>

        {uiReveal.showStatsDrawer ? (
          <StatsDrawer
            runSeconds={elapsedSeconds}
            totalTicks={gameState.simulation.totalTicks}
            totalBeliefEarned={gameState.stats.totalBeliefEarned}
            secondsSinceLastEvent={secondsSinceLastEvent}
            whispersInWindow={gameState.activity.whispersInWindow}
            whisperResetInSeconds={whisperResetInSeconds}
            audioControls={audioControls}
            onEnableAudio={enableAudio}
            onDisableAudio={disableAudio}
            onToggleAudioMute={toggleMute}
            onUseAudioFallback={useSilentFallback}
          />
        ) : null}
      </motion.div>
    </main>
  );
}

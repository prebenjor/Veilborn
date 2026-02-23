import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  canAdvanceEraOneToTwo,
  canAdvanceEraTwoToThree,
  canAnointProphet,
  canFormCult,
  canStartAct,
  canSuppressRival,
  getActSlotCap,
  canWhisper,
  canRecruit,
  getRecruitPreview,
  performAdvanceEraOneToTwo,
  performAdvanceEraTwoToThree,
  performCultFormation,
  performDomainInvestment,
  performProphetAnoint,
  performRecruit,
  performStartAct,
  performSuppressRival,
  performWhisper
} from "./core/engine/actions";
import {
  getActCost,
  getActDurationSeconds,
  getBeliefPerSecond,
  getCultFormationCost,
  getCultOutput,
  getDomainInvestCost,
  getDomainXpNeeded,
  getEraOneGateStatus,
  getEraTwoGateStatus,
  getFollowersForNextProphet,
  getHighestDomainLevel,
  getInfluenceCap,
  getRivalSpawnIntervalMs,
  getTotalRivalStrength,
  getTotalDomainLevel,
  getWhisperCost
} from "./core/engine/formulas";
import { advanceWorld } from "./core/engine/worldTick";
import {
  RIVAL_DRAIN_RATE,
  RIVAL_SUPPRESS_INFLUENCE_COST,
  RECRUIT_INFLUENCE_COST,
  WHISPER_WINDOW_MS,
  WORLD_TICK_MS,
  type ActType,
  type DomainId,
  type GameState
} from "./core/state/gameState";
import { loadGameState, saveGameState } from "./core/state/persistence";
import { DoctrinePanel } from "./ui/panels/DoctrinePanel";
import { DomainPanel } from "./ui/panels/DomainPanel";
import { EraGatePanel } from "./ui/panels/EraGatePanel";
import { ProgressPanel } from "./ui/panels/ProgressPanel";
import { StatsDrawer } from "./ui/panels/StatsDrawer";
import { WhisperPanel } from "./ui/panels/WhisperPanel";

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
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

  const canUseWhisper = canWhisper(gameState, nowMs);
  const canUseRecruit = canRecruit(gameState);
  const canCreateProphet = canAnointProphet(gameState);
  const canCreateCult = canFormCult(gameState);
  const canAdvanceEraOne = canAdvanceEraOneToTwo(gameState);
  const canAdvanceEraTwo = canAdvanceEraTwoToThree(gameState);
  const eraLabel = gameState.era === 1 ? "I" : gameState.era === 2 ? "II" : "III";

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

  const elapsedSeconds = Math.floor(gameState.simulation.totalElapsedMs / 1000);
  const secondsSinceLastEvent = Math.max(0, (nowMs - gameState.activity.lastEventAt) / 1000);
  const whisperCycleElapsed = Math.max(0, nowMs - gameState.activity.whisperWindowStartedAt);
  const whisperResetInSeconds = Math.max(
    0,
    Math.ceil((WHISPER_WINDOW_MS - (whisperCycleElapsed % WHISPER_WINDOW_MS)) / 1000)
  );

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
          <h1 className="text-2xl font-semibold text-veil md:text-4xl">Someone is listening.</h1>
          <p className="max-w-3xl text-sm text-veil/70">
            M4 loop active: cult doctrine, timed acts, rival pressure, and Era II progression into
            miracle-tier play.
          </p>
        </header>

        <section className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Era</p>
            <p className="mt-2 text-xl text-white">{eraLabel}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Belief</p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.resources.belief)}</p>
            <p className="mt-1 text-xs text-veil/65">{formatNumber(beliefPerSecond)} / sec</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Influence</p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.resources.influence)} / {formatNumber(influenceCap)}
            </p>
            <p className="mt-1 text-xs text-veil/65">Whisper: {formatNumber(whisperCost)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Veil Thickness</p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.resources.veil)}</p>
          </article>
        </section>

        <section className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Followers</p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.resources.followers)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.prophets)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Cults</p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.cults)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Domain Level Sum</p>
            <p className="mt-2 text-xl text-white">{formatNumber(getTotalDomainLevel(gameState))}</p>
          </article>
        </section>

        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <WhisperPanel
            influence={gameState.resources.influence}
            whisperCost={whisperCost}
            recruitCost={RECRUIT_INFLUENCE_COST}
            recruitPreview={recruitPreview}
            cadencePromptActive={gameState.activity.cadencePromptActive}
            onWhisper={onWhisper}
            onRecruit={onRecruit}
          />
          <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
            <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Omens</h2>
            <ul className="mt-3 space-y-2 text-sm text-veil/75">
              {gameState.omenLog.slice(0, 8).map((entry) => (
                <li key={entry.id}>{entry.text}</li>
              ))}
            </ul>
          </section>
        </div>

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
          onAdvanceEraOne={onAdvanceEraOne}
          onAdvanceEraTwo={onAdvanceEraTwo}
        />

        <ProgressPanel
          belief={gameState.resources.belief}
          era={gameState.era}
          followers={gameState.resources.followers}
          prophets={gameState.prophets}
          cults={gameState.cults}
          nextProphetFollowers={nextProphetFollowers}
          nextCultBeliefCost={nextCultBeliefCost}
          canAnointProphet={canCreateProphet}
          canFormCult={canCreateCult}
          onAnointProphet={onAnointProphet}
          onFormCult={onFormCult}
        />

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

        <DomainPanel
          belief={gameState.resources.belief}
          domains={gameState.domains}
          getInvestCost={getDomainInvestCost}
          getXpNeeded={getDomainXpNeeded}
          onInvest={onInvestDomain}
        />

        <p className="text-xs text-veil/60">
          {gameState.activity.cadencePromptActive
            ? "Silence is building. Taking an action now grants a cadence bonus."
            : "Act every 30-60 seconds to keep momentum and avoid faith drift."}
          {!canUseWhisper && !canUseRecruit
            ? " Influence is recovering; choose your next intervention when it peaks."
            : " Whisper and recruit both satisfy cadence pressure."}
        </p>

        <StatsDrawer
          runSeconds={elapsedSeconds}
          totalTicks={gameState.simulation.totalTicks}
          totalBeliefEarned={gameState.stats.totalBeliefEarned}
          secondsSinceLastEvent={secondsSinceLastEvent}
          whispersInWindow={gameState.activity.whispersInWindow}
          whisperResetInSeconds={whisperResetInSeconds}
        />
      </motion.div>
    </main>
  );
}

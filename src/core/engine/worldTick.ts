import {
  CADENCE_PROMPT_INTERVAL_MS,
  CIV_HEALTH_MAX,
  LINEAGE_CIV_RECOVERY_SKEPTICISM_RECOVERY,
  LINEAGE_CIV_RECOVERY_TRUST_RECOVERY,
  LINEAGE_HISTORY_LIMIT,
  LINEAGE_SKEPTICISM_MAX,
  LINEAGE_TRUST_DEBT_MAX,
  LINEAGE_VEIL_COLLAPSE_SKEPTICISM,
  LINEAGE_VEIL_COLLAPSE_TRUST_DEBT,
  VEIL_COLLAPSE_FOLLOWER_RETENTION,
  VEIL_COLLAPSE_IMMUNITY_SECONDS,
  VEIL_COLLAPSE_PROPHET_LOSS,
  VEIL_MAX,
  VEIL_MIN,
  RIVAL_DRAIN_RATE,
  RIVAL_EVENT_DURATION_MS,
  RIVAL_MAX_ACTIVE,
  type ActivityState,
  type GameState,
  type HistoryMarkerKind,
  type RivalState
} from "../state/gameState";
import {
  getActRewardBelief,
  getBeliefPerSecond,
  getCivilizationRegenPerSecond,
  getCultOutput,
  getInfluenceCap,
  getInfluenceRegenPerSecond,
  getMatchingDomainPairs,
  getRivalSpawnIntervalMs,
  getRivalStrength,
  getTotalRivalStrength,
  getVeilCollapseThreshold,
  getVeilErosionPerSecond,
  getVeilRegenPerSecond,
  normalizeWhisperCycle
} from "./formulas";
import { syncRemembranceState } from "./remembrance";

function applyCadencePrompt(activity: ActivityState, nowMs: number): ActivityState {
  if (activity.cadencePromptActive) return activity;

  const inactiveMs = nowMs - activity.lastEventAt;
  if (inactiveMs < CADENCE_PROMPT_INTERVAL_MS) return activity;

  const sinceLastPrompt = nowMs - activity.lastCadencePromptAt;
  if (sinceLastPrompt < CADENCE_PROMPT_INTERVAL_MS) return activity;

  return {
    ...activity,
    cadencePromptActive: true,
    lastCadencePromptAt: nowMs
  };
}

function cleanupRivals(rivals: RivalState[], nowMs: number): {
  active: RivalState[];
  removedCount: number;
} {
  const active = rivals.filter((rival) => nowMs - rival.spawnedAt < RIVAL_EVENT_DURATION_MS);
  return {
    active,
    removedCount: rivals.length - active.length
  };
}

function appendSystemOmen(state: GameState, nowMs: number, text: string): GameState {
  return {
    ...state,
    omenLog: [
      {
        id: `evt-${state.nextEventId}`,
        at: nowMs,
        text
      },
      ...state.omenLog
    ].slice(0, 140),
    nextEventId: state.nextEventId + 1
  };
}

function clampLineageMetric(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function appendLineageMarker(
  state: GameState,
  nowMs: number,
  kind: HistoryMarkerKind,
  text: string,
  trustDebtDelta: number,
  skepticismDelta: number,
  betrayalScarsDelta: number
): GameState {
  const trustDebt = clampLineageMetric(state.lineage.trustDebt + trustDebtDelta, LINEAGE_TRUST_DEBT_MAX);
  const skepticism = clampLineageMetric(
    state.lineage.skepticism + skepticismDelta,
    LINEAGE_SKEPTICISM_MAX
  );
  const betrayalScars = Math.max(0, state.lineage.betrayalScars + betrayalScarsDelta);

  return {
    ...state,
    lineage: {
      ...state.lineage,
      trustDebt,
      skepticism,
      betrayalScars,
      history: [
        {
          id: `hist-${state.lineage.nextMarkerId}`,
          at: nowMs,
          runId: state.meta.runId,
          kind,
          text,
          trustDebtDelta,
          skepticismDelta
        },
        ...state.lineage.history
      ].slice(0, LINEAGE_HISTORY_LIMIT),
      nextMarkerId: state.lineage.nextMarkerId + 1
    }
  };
}

export function advanceWorld(state: GameState, nowMs: number): GameState {
  const elapsedSinceLastTick = nowMs - state.simulation.lastTickAt;
  if (elapsedSinceLastTick <= 0) return state;

  const totalMs = state.simulation.accumulatedMs + elapsedSinceLastTick;
  const tickMs = state.simulation.tickMs;
  const ticks = Math.floor(totalMs / tickMs);
  const accumulatedMs = totalMs - ticks * tickMs;
  const matchingDomainPairs = getMatchingDomainPairs(state);

  if (ticks <= 0) {
    const whisperCycle = normalizeWhisperCycle(state.activity, nowMs);
    const updatedActivity = applyCadencePrompt(
      {
        ...state.activity,
        whisperWindowStartedAt: whisperCycle.whisperWindowStartedAt,
        whispersInWindow: whisperCycle.whispersInWindow
      },
      nowMs
    );

    return {
      ...state,
      matchingDomainPairs,
      activity: updatedActivity,
      simulation: {
        ...state.simulation,
        lastTickAt: nowMs,
        accumulatedMs
      },
      meta: {
        ...state.meta,
        updatedAt: nowMs
      }
    };
  }

  const simulatedMs = ticks * tickMs;
  const simulatedSeconds = simulatedMs / 1000;
  const preTickState: GameState = {
    ...state,
    matchingDomainPairs
  };

  const beliefPerSecond = getBeliefPerSecond(preTickState, nowMs);
  const baseBeliefGain = beliefPerSecond * simulatedSeconds;
  const influenceCap = getInfluenceCap(preTickState);
  const influenceGain = getInfluenceRegenPerSecond(preTickState) * simulatedSeconds;
  const whisperCycle = normalizeWhisperCycle(preTickState.activity, nowMs);
  const updatedActivity = applyCadencePrompt(
    {
      ...preTickState.activity,
      whisperWindowStartedAt: whisperCycle.whisperWindowStartedAt,
      whispersInWindow: whisperCycle.whispersInWindow
    },
    nowMs
  );

  const completedActs = preTickState.doctrine.activeActs.filter((act) => act.endsAt <= nowMs);
  const remainingActs = preTickState.doctrine.activeActs.filter((act) => act.endsAt > nowMs);
  const actBeliefGain = completedActs.reduce((sum, act) => {
    return sum + getActRewardBelief(preTickState, beliefPerSecond, act.durationSeconds, act.baseMultiplier);
  }, 0);
  const actFollowerGain = completedActs.length * Math.max(1, preTickState.cults);
  const shrineGain = completedActs.filter((act) => act.type === "shrine").length;

  const cleanedRivals = cleanupRivals(preTickState.doctrine.rivals, nowMs);
  let rivals = cleanedRivals.active;
  let nextRivalId = preTickState.doctrine.nextRivalId;
  let lastRivalSpawnAt = preTickState.doctrine.lastRivalSpawnAt;

  const canSpawnRival =
    preTickState.era >= 2 &&
    preTickState.cults > 0 &&
    rivals.length < RIVAL_MAX_ACTIVE &&
    nowMs - preTickState.doctrine.lastRivalSpawnAt >= getRivalSpawnIntervalMs(preTickState);

  if (canSpawnRival) {
    rivals = [
      ...rivals,
      {
        id: `rival-${nextRivalId}`,
        strength: getRivalStrength(preTickState, beliefPerSecond),
        spawnedAt: nowMs
      }
    ];
    nextRivalId += 1;
    lastRivalSpawnAt = nowMs;
  }

  const rivalStrength = getTotalRivalStrength({
    ...preTickState,
    doctrine: {
      ...preTickState.doctrine,
      rivals
    }
  });
  const cultOutput = getCultOutput(preTickState);
  const followerDrain =
    rivalStrength > cultOutput * 0.5 ? rivalStrength * RIVAL_DRAIN_RATE * simulatedSeconds : 0;

  const followersAfterActs = preTickState.resources.followers + actFollowerGain;
  const followersAfterRivals = Math.max(0, followersAfterActs - followerDrain);
  const peakFollowers = Math.max(preTickState.cataclysm.peakFollowers, followersAfterRivals);

  const veilRegen = getVeilRegenPerSecond(preTickState);
  const veilErosion = getVeilErosionPerSecond(preTickState);
  const rawVeil = preTickState.resources.veil + (veilRegen - veilErosion) * simulatedSeconds;
  const veilAfterTick = Math.max(VEIL_MIN, Math.min(VEIL_MAX, rawVeil));
  const collapseThreshold = getVeilCollapseThreshold(preTickState);
  const belowThreshold = veilAfterTick <= collapseThreshold;
  const collapseImmunityActive = nowMs < preTickState.cataclysm.veilCollapseImmunityUntil;
  const shouldVeilCollapse =
    preTickState.era >= 3 &&
    belowThreshold &&
    !preTickState.cataclysm.wasBelowVeilCollapseThreshold &&
    !collapseImmunityActive;

  const followersAfterVeilCollapse = shouldVeilCollapse
    ? Math.floor(followersAfterRivals * VEIL_COLLAPSE_FOLLOWER_RETENTION)
    : followersAfterRivals;
  const prophetsAfterVeilCollapse = shouldVeilCollapse
    ? Math.max(0, preTickState.prophets - VEIL_COLLAPSE_PROPHET_LOSS)
    : preTickState.prophets;
  const veilZeroStreakMs = veilAfterTick <= VEIL_MIN ? preTickState.cataclysm.veilZeroStreakMs + simulatedMs : 0;
  const veilCollapseImmunityUntil = shouldVeilCollapse && preTickState.echoBonuses.collapseImmunity
    ? nowMs + VEIL_COLLAPSE_IMMUNITY_SECONDS * 1000
    : preTickState.cataclysm.veilCollapseImmunityUntil;

  let civilizationHealth = preTickState.cataclysm.civilizationHealth;
  let civilizationCollapsed = preTickState.cataclysm.civilizationCollapsed;
  let civilizationRebuildEndsAt = preTickState.cataclysm.civilizationRebuildEndsAt;
  let civilizationRecovered = false;

  if (civilizationCollapsed) {
    if (nowMs >= civilizationRebuildEndsAt) {
      civilizationCollapsed = false;
      civilizationHealth = CIV_HEALTH_MAX;
      civilizationRebuildEndsAt = 0;
      civilizationRecovered = true;
    } else {
      civilizationHealth = 0;
    }
  } else {
    const civilizationRegen = getCivilizationRegenPerSecond(preTickState) * simulatedSeconds;
    civilizationHealth = Math.min(CIV_HEALTH_MAX, civilizationHealth + civilizationRegen);
  }

  let nextState: GameState = {
    ...preTickState,
    prophets: prophetsAfterVeilCollapse,
    resources: {
      ...preTickState.resources,
      belief: preTickState.resources.belief + baseBeliefGain + actBeliefGain,
      influence: Math.min(influenceCap, preTickState.resources.influence + influenceGain),
      followers: followersAfterVeilCollapse,
      veil: veilAfterTick
    },
    activity: updatedActivity,
    stats: {
      ...preTickState.stats,
      totalBeliefEarned: preTickState.stats.totalBeliefEarned + baseBeliefGain + actBeliefGain
    },
    doctrine: {
      ...preTickState.doctrine,
      activeActs: remainingActs,
      actsCompleted: preTickState.doctrine.actsCompleted + completedActs.length,
      shrinesBuilt: preTickState.doctrine.shrinesBuilt + shrineGain,
      rivals,
      lastRivalSpawnAt,
      survivedRivalEvent:
        preTickState.doctrine.survivedRivalEvent || cleanedRivals.removedCount > 0,
      nextRivalId
    },
    cataclysm: {
      ...preTickState.cataclysm,
      civilizationHealth,
      civilizationCollapsed,
      civilizationRebuildEndsAt,
      peakFollowers: Math.max(peakFollowers, followersAfterVeilCollapse),
      veilZeroStreakMs,
      wasBelowVeilCollapseThreshold: belowThreshold,
      totalVeilCollapses: preTickState.cataclysm.totalVeilCollapses + (shouldVeilCollapse ? 1 : 0),
      veilCollapseImmunityUntil
    },
    simulation: {
      ...preTickState.simulation,
      lastTickAt: nowMs,
      accumulatedMs,
      totalTicks: preTickState.simulation.totalTicks + ticks,
      totalElapsedMs: preTickState.simulation.totalElapsedMs + simulatedMs
    },
    meta: {
      ...preTickState.meta,
      updatedAt: nowMs
    }
  };

  if (canSpawnRival) {
    nextState = appendSystemOmen(
      nextState,
      nowMs,
      "At the edge of the city, another altar lit itself and your faithful began to waver."
    );
  }

  if (shouldVeilCollapse) {
    nextState = appendLineageMarker(
      nextState,
      nowMs,
      "veil_collapse",
      "The Veil collapse entered family memory as proof the gods can betray their own faithful.",
      LINEAGE_VEIL_COLLAPSE_TRUST_DEBT,
      LINEAGE_VEIL_COLLAPSE_SKEPTICISM,
      1
    );
    nextState = appendSystemOmen(
      nextState,
      nowMs,
      "The Veil screamed open. Crowds scattered, and two prophetic voices went dark."
    );
  }

  if (civilizationRecovered) {
    nextState = appendLineageMarker(
      nextState,
      nowMs,
      "civ_rebuild",
      "A rebuilt civilization softened old fear, though the scar remained in its stories.",
      -LINEAGE_CIV_RECOVERY_TRUST_RECOVERY,
      -LINEAGE_CIV_RECOVERY_SKEPTICISM_RECOVERY,
      0
    );
    nextState = appendSystemOmen(
      nextState,
      nowMs,
      "From ash and hunger, a new city raised its first bell and dared to remember."
    );
  }

  const remembranceSync = syncRemembranceState(nextState);
  nextState = remembranceSync.state;
  if (remembranceSync.newlyUnlockedIds.length > 0) {
    const letters = remembranceSync.newlyUnlockedIds.join(", ");
    nextState = appendSystemOmen(
      nextState,
      nowMs,
      `A forgotten letter surfaced in your true name: ${letters}.`
    );
  }

  return nextState;
}

import {
  CADENCE_PROMPT_INTERVAL_MS,
  RIVAL_DRAIN_RATE,
  RIVAL_EVENT_DURATION_MS,
  RIVAL_MAX_ACTIVE,
  type ActivityState,
  type GameState,
  type RivalState
} from "../state/gameState";
import {
  getActRewardBelief,
  getBeliefPerSecond,
  getCultOutput,
  getInfluenceCap,
  getInfluenceRegenPerSecond,
  getMatchingDomainPairs,
  getRivalSpawnIntervalMs,
  getRivalStrength,
  getTotalRivalStrength,
  normalizeWhisperCycle
} from "./formulas";

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

  return {
    ...preTickState,
    resources: {
      ...preTickState.resources,
      belief: preTickState.resources.belief + baseBeliefGain + actBeliefGain,
      influence: Math.min(influenceCap, preTickState.resources.influence + influenceGain),
      followers: followersAfterRivals
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
      rivals,
      lastRivalSpawnAt,
      survivedRivalEvent:
        preTickState.doctrine.survivedRivalEvent || cleanedRivals.removedCount > 0,
      nextRivalId
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
}


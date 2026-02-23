import { CADENCE_PROMPT_INTERVAL_MS, type ActivityState, type GameState } from "../state/gameState";
import { getBeliefPerSecond, getInfluenceCap, getInfluenceRegenPerSecond, normalizeWhisperCycle } from "./formulas";

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

export function advanceWorld(state: GameState, nowMs: number): GameState {
  const elapsedSinceLastTick = nowMs - state.simulation.lastTickAt;
  if (elapsedSinceLastTick <= 0) return state;

  const totalMs = state.simulation.accumulatedMs + elapsedSinceLastTick;
  const tickMs = state.simulation.tickMs;
  const ticks = Math.floor(totalMs / tickMs);
  const accumulatedMs = totalMs - ticks * tickMs;

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
  const beliefPerSecond = getBeliefPerSecond(state, nowMs);
  const beliefGain = beliefPerSecond * simulatedSeconds;
  const influenceCap = getInfluenceCap(state);
  const influenceGain = getInfluenceRegenPerSecond(state) * simulatedSeconds;
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
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefGain,
      influence: Math.min(influenceCap, state.resources.influence + influenceGain)
    },
    activity: updatedActivity,
    stats: {
      ...state.stats,
      totalBeliefEarned: state.stats.totalBeliefEarned + beliefGain
    },
    simulation: {
      ...state.simulation,
      lastTickAt: nowMs,
      accumulatedMs,
      totalTicks: state.simulation.totalTicks + ticks,
      totalElapsedMs: state.simulation.totalElapsedMs + simulatedMs
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };
}

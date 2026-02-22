import { getBeliefPerSecond, getInfluenceCap, getInfluenceRegenPerSecond, normalizeWhisperCycle } from "./formulas";
import type { GameState } from "../state/gameState";

export function advanceWorld(state: GameState, nowMs: number): GameState {
  const elapsedSinceLastTick = nowMs - state.simulation.lastTickAt;
  if (elapsedSinceLastTick <= 0) return state;

  const totalMs = state.simulation.accumulatedMs + elapsedSinceLastTick;
  const tickMs = state.simulation.tickMs;
  const ticks = Math.floor(totalMs / tickMs);
  const accumulatedMs = totalMs - ticks * tickMs;

  if (ticks <= 0) {
    const whisperCycle = normalizeWhisperCycle(state.activity, nowMs);
    return {
      ...state,
      activity: {
        ...state.activity,
        whisperWindowStartedAt: whisperCycle.whisperWindowStartedAt,
        whispersInWindow: whisperCycle.whispersInWindow
      },
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

  return {
    ...state,
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefGain,
      influence: Math.min(influenceCap, state.resources.influence + influenceGain)
    },
    activity: {
      ...state.activity,
      whisperWindowStartedAt: whisperCycle.whisperWindowStartedAt,
      whispersInWindow: whisperCycle.whispersInWindow
    },
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

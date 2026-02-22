import {
  BELIEF_PER_PROPHET_PER_SECOND,
  INFLUENCE_BASE_CAP,
  INFLUENCE_BASE_REGEN_PER_SECOND,
  INFLUENCE_CAP_PER_PROPHET,
  INFLUENCE_REGEN_PER_PROPHET_PER_SECOND,
  type GameState
} from "../state/gameState";

export function getInfluenceCap(prophets: number): number {
  return INFLUENCE_BASE_CAP + prophets * INFLUENCE_CAP_PER_PROPHET;
}

function getInfluenceRegenPerSecond(prophets: number): number {
  return INFLUENCE_BASE_REGEN_PER_SECOND + prophets * INFLUENCE_REGEN_PER_PROPHET_PER_SECOND;
}

export function advanceWorld(state: GameState, nowMs: number): GameState {
  const elapsedSinceLastTick = nowMs - state.simulation.lastTickAt;
  if (elapsedSinceLastTick <= 0) return state;

  const totalMs = state.simulation.accumulatedMs + elapsedSinceLastTick;
  const tickMs = state.simulation.tickMs;
  const ticks = Math.floor(totalMs / tickMs);
  const accumulatedMs = totalMs - ticks * tickMs;

  if (ticks <= 0) {
    return {
      ...state,
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
  const prophets = state.prophets;

  const beliefGain = prophets * BELIEF_PER_PROPHET_PER_SECOND * simulatedSeconds;
  const influenceCap = getInfluenceCap(prophets);
  const influenceGain = getInfluenceRegenPerSecond(prophets) * simulatedSeconds;

  return {
    ...state,
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefGain,
      influence: Math.min(influenceCap, state.resources.influence + influenceGain)
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

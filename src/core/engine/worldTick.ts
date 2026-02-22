import type { GameState } from "../state/gameState";

const TICK_SECONDS = 1;

export function worldTick(state: GameState): GameState {
  const prophetOutput = state.prophets * 2;
  const beliefGain = prophetOutput * TICK_SECONDS;
  const influenceGain = Math.min(100, state.resources.influence + 1);

  return {
    ...state,
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefGain,
      influence: influenceGain
    }
  };
}


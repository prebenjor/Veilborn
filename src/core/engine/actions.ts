import {
  WHISPER_BELIEF_GAIN,
  WHISPER_FOLLOWER_GAIN,
  WHISPER_INFLUENCE_COST,
  type GameState
} from "../state/gameState";

const WHISPER_OMENS = [
  "A woman from the eastern valley heard your breath in her sleep.",
  "An old skeptic left bread at the standing stones before dawn.",
  "Three names were spoken around a cold fire, and one was almost yours.",
  "A child watched the stormline and called it an omen."
];

export function canWhisper(state: GameState): boolean {
  return state.resources.influence >= WHISPER_INFLUENCE_COST;
}

export function performWhisper(state: GameState, nowMs: number): GameState {
  if (!canWhisper(state)) return state;

  const omenText = WHISPER_OMENS[state.nextEventId % WHISPER_OMENS.length];
  const nextEventId = state.nextEventId + 1;

  return {
    ...state,
    resources: {
      ...state.resources,
      influence: state.resources.influence - WHISPER_INFLUENCE_COST,
      belief: state.resources.belief + WHISPER_BELIEF_GAIN,
      followers: state.resources.followers + WHISPER_FOLLOWER_GAIN
    },
    omenLog: [
      {
        id: `evt-${state.nextEventId}`,
        at: nowMs,
        text: omenText
      },
      ...state.omenLog
    ].slice(0, 120),
    nextEventId,
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };
}


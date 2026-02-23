import type { GameState, RemembranceLetters } from "../state/gameState";
import { getHighestDomainLevel } from "./formulas";

export interface RemembranceLetterDefinition {
  id: number;
  key: keyof RemembranceLetters;
  fragment: string;
  targetLabel: string;
}

export interface RemembranceConditionView extends RemembranceLetterDefinition {
  unlocked: boolean;
  progressText: string;
}

const LETTER_DEFINITIONS: RemembranceLetterDefinition[] = [
  {
    id: 1,
    key: "domainLevelTen",
    fragment: "A domain remembered beyond forgetting.",
    targetLabel: "One domain level 10"
  },
  {
    id: 2,
    key: "lifetimeEchoesFiftyThousand",
    fragment: "Echoes gathered into a permanent choir.",
    targetLabel: "50,000 lifetime echoes"
  },
  {
    id: 3,
    key: "veilZeroSixtySeconds",
    fragment: "You stood at Veil zero and did not break.",
    targetLabel: "60s at Veil 0"
  },
  {
    id: 4,
    key: "betrayedPantheonAlly",
    fragment: "A divine oath was broken by your hand.",
    targetLabel: "Betray one Pantheon ally"
  },
  {
    id: 5,
    key: "civilizationsRebuiltThree",
    fragment: "Three civilizations rose after ruin.",
    targetLabel: "3 civilization rebuilds"
  },
  {
    id: 6,
    key: "allDomainsEight",
    fragment: "Every domain recalled its deeper shape.",
    targetLabel: "All 6 domains level 8+"
  },
  {
    id: 7,
    key: "followersMillion",
    fragment: "A million voices held your name at once.",
    targetLabel: "1,000,000 simultaneous followers"
  },
  {
    id: 8,
    key: "beliefBillion",
    fragment: "Belief crossed the billion-mark threshold.",
    targetLabel: "1,000,000,000 lifetime belief"
  }
];

function formatCompact(value: number): string {
  if (value >= 10000) {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 2
    }).format(value);
  }
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function getRemembranceLetterDefinitions(): RemembranceLetterDefinition[] {
  return LETTER_DEFINITIONS;
}

export function getObservedPeakFollowers(state: GameState): number {
  return Math.max(
    state.prestige.remembrance.peakFollowersEver,
    state.cataclysm.peakFollowers,
    state.resources.followers
  );
}

export function getLifetimeBeliefObserved(state: GameState): number {
  return state.prestige.remembrance.lifetimeBeliefEarned + state.stats.totalBeliefEarned;
}

export function getLifetimeCivilizationRebuildsObserved(state: GameState): number {
  return state.prestige.remembrance.lifetimeCivilizationRebuilds + state.cataclysm.civilizationRebuilds;
}

export function evaluateRemembranceLetters(state: GameState): RemembranceLetters {
  const highestDomain = getHighestDomainLevel(state);
  const allDomainsEight = state.domains.every((domain) => domain.level >= 8);
  const veilZeroSeconds = state.cataclysm.veilZeroStreakMs / 1000;
  const lifetimeBelief = getLifetimeBeliefObserved(state);
  const peakFollowers = getObservedPeakFollowers(state);
  const lifetimeRebuilds = getLifetimeCivilizationRebuildsObserved(state);

  return {
    domainLevelTen: highestDomain >= 10,
    lifetimeEchoesFiftyThousand: state.prestige.lifetimeEchoes >= 50000,
    veilZeroSixtySeconds: veilZeroSeconds >= 60,
    betrayedPantheonAlly:
      state.prestige.pantheon.betrayedAllyEver || state.pantheon.betrayalsThisRun > 0,
    civilizationsRebuiltThree: lifetimeRebuilds >= 3,
    allDomainsEight,
    followersMillion: peakFollowers >= 1_000_000,
    beliefBillion: lifetimeBelief > 1_000_000_000
  };
}

export function mergeRemembranceLetters(
  current: RemembranceLetters,
  evaluated: RemembranceLetters
): {
  letters: RemembranceLetters;
  newlyUnlockedIds: number[];
} {
  const next: RemembranceLetters = {
    ...current,
    domainLevelTen: current.domainLevelTen || evaluated.domainLevelTen,
    lifetimeEchoesFiftyThousand:
      current.lifetimeEchoesFiftyThousand || evaluated.lifetimeEchoesFiftyThousand,
    veilZeroSixtySeconds: current.veilZeroSixtySeconds || evaluated.veilZeroSixtySeconds,
    betrayedPantheonAlly: current.betrayedPantheonAlly || evaluated.betrayedPantheonAlly,
    civilizationsRebuiltThree:
      current.civilizationsRebuiltThree || evaluated.civilizationsRebuiltThree,
    allDomainsEight: current.allDomainsEight || evaluated.allDomainsEight,
    followersMillion: current.followersMillion || evaluated.followersMillion,
    beliefBillion: current.beliefBillion || evaluated.beliefBillion
  };

  const newlyUnlockedIds = LETTER_DEFINITIONS.filter((definition) => {
    return !current[definition.key] && next[definition.key];
  }).map((definition) => definition.id);

  return {
    letters: next,
    newlyUnlockedIds
  };
}

export function syncRemembranceState(state: GameState): {
  state: GameState;
  newlyUnlockedIds: number[];
} {
  const evaluated = evaluateRemembranceLetters(state);
  const merged = mergeRemembranceLetters(state.prestige.remembrance.letters, evaluated);
  const peakFollowersEver = getObservedPeakFollowers(state);
  const bestVeilZeroStreakMs = Math.max(
    state.prestige.remembrance.bestVeilZeroStreakMs,
    state.cataclysm.veilZeroStreakMs
  );

  const hasLettersChanged = merged.newlyUnlockedIds.length > 0;
  const hasPeakChanged = peakFollowersEver !== state.prestige.remembrance.peakFollowersEver;
  const hasBestStreakChanged = bestVeilZeroStreakMs !== state.prestige.remembrance.bestVeilZeroStreakMs;

  if (!hasLettersChanged && !hasPeakChanged && !hasBestStreakChanged) {
    return {
      state,
      newlyUnlockedIds: []
    };
  }

  return {
    state: {
      ...state,
      prestige: {
        ...state.prestige,
        remembrance: {
          ...state.prestige.remembrance,
          letters: merged.letters,
          peakFollowersEver,
          bestVeilZeroStreakMs
        }
      }
    },
    newlyUnlockedIds: merged.newlyUnlockedIds
  };
}

export function getUnlockedNameLetterCount(letters: RemembranceLetters): number {
  return LETTER_DEFINITIONS.reduce((sum, definition) => sum + (letters[definition.key] ? 1 : 0), 0);
}

export function areAllNameLettersUnlocked(letters: RemembranceLetters): boolean {
  return getUnlockedNameLetterCount(letters) >= LETTER_DEFINITIONS.length;
}

export function getRemembranceConditionViews(
  state: GameState,
  letters: RemembranceLetters = state.prestige.remembrance.letters
): RemembranceConditionView[] {
  const highestDomain = getHighestDomainLevel(state);
  const veilZeroSeconds = state.cataclysm.veilZeroStreakMs / 1000;
  const lifetimeRebuilds = getLifetimeCivilizationRebuildsObserved(state);
  const highDomains = state.domains.filter((domain) => domain.level >= 8).length;
  const peakFollowers = getObservedPeakFollowers(state);
  const lifetimeBelief = getLifetimeBeliefObserved(state);

  const progressByKey: Record<keyof RemembranceLetters, string> = {
    domainLevelTen: `${formatCompact(highestDomain)} / 10`,
    lifetimeEchoesFiftyThousand: `${formatCompact(state.prestige.lifetimeEchoes)} / 50K`,
    veilZeroSixtySeconds: `${formatCompact(veilZeroSeconds)}s / 60s`,
    betrayedPantheonAlly: letters.betrayedPantheonAlly ? "Complete" : "Awaiting betrayal",
    civilizationsRebuiltThree: `${formatCompact(lifetimeRebuilds)} / 3`,
    allDomainsEight: `${formatCompact(highDomains)} / 6`,
    followersMillion: `${formatCompact(peakFollowers)} / 1M`,
    beliefBillion: `${formatCompact(lifetimeBelief)} / 1B`
  };

  return LETTER_DEFINITIONS.map((definition) => ({
    ...definition,
    unlocked: letters[definition.key],
    progressText: letters[definition.key] ? "Complete" : progressByKey[definition.key]
  }));
}

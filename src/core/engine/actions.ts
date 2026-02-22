import { DOMAIN_LABELS, WHISPER_BELIEF_GAIN, WHISPER_FOLLOWER_GAIN, type DomainId, type GameState } from "../state/gameState";
import {
  getCultFormationCost,
  getDomainInvestCost,
  getDomainXpNeeded,
  getFollowersForNextProphet,
  getWhisperCost,
  normalizeWhisperCycle
} from "./formulas";

type OmenKind = "whisper" | "domain" | "prophet" | "cult";

interface RandomPick<T> {
  rngState: number;
  value: T;
}

function nextRandom(rngState: number): RandomPick<number> {
  let x = rngState >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const next = x >>> 0 || 0x6d2b79f5;
  return {
    rngState: next,
    value: next / 4294967296
  };
}

function pickOne<T>(rngState: number, options: readonly T[]): RandomPick<T> {
  const roll = nextRandom(rngState);
  const index = Math.min(options.length - 1, Math.floor(roll.value * options.length));
  return {
    rngState: roll.rngState,
    value: options[index]
  };
}

function getFollowerDescriptor(followers: number): string {
  if (followers >= 500) return "whole districts repeated the dream aloud";
  if (followers >= 150) return "small neighborhoods kept lamps lit for your sign";
  if (followers >= 40) return "families passed the story under closed doors";
  return "a few households listened and did not mock the silence";
}

function createOmen(state: GameState, kind: OmenKind, nowMs: number, detail?: string): { text: string; rngState: number } {
  const mortal = state.mortals[state.nextEventId % state.mortals.length];
  const anchor = nowMs % 2 === 0 ? "before dawn" : "at moonrise";

  const whisperStarts = [
    `${mortal.name} woke ${anchor} with ash on their palms.`,
    `A bell in the east rang once, though no hand touched it.`,
    `In the river quarter, dogs knelt and would not bark.`,
    `A wind crossed the fields without bending the grain.`
  ] as const;

  const whisperMiddles = [
    "They spoke softly of a name they could not hold.",
    "Three candles burned blue and no one dared breathe.",
    "An elder swore the night carried a second heartbeat.",
    "The shrine stones warmed as if morning had arrived early."
  ] as const;

  const domainStarts = [
    `The constellation of ${detail} shifted by a single star.`,
    `Scribes in the lower ward redrew the sign of ${detail}.`,
    `A traveler claimed ${detail} answered from inside the fog.`,
    `${detail} flared over the old ridge in a color no one named.`
  ] as const;

  const prophetStarts = [
    `${mortal.name} refused sleep and spoke until sunrise.`,
    `A listener in torn linen stood on a roof and did not tremble.`,
    "The market square fell quiet when one voice refused to break.",
    "At the drowned gate, a witness repeated your omen without faltering."
  ] as const;

  const cultStarts = [
    "Stone by stone, a hidden circle was raised outside the city line.",
    "Seven families tied threads to the same iron tree.",
    "Torches gathered on a hill where maps show nothing.",
    "A cellar of strangers agreed on one forbidden prayer."
  ] as const;

  if (kind === "whisper") {
    const a = pickOne(state.rngState, whisperStarts);
    const b = pickOne(a.rngState, whisperMiddles);
    return {
      rngState: b.rngState,
      text: `${a.value} ${b.value} By morning, ${getFollowerDescriptor(state.resources.followers + WHISPER_FOLLOWER_GAIN)}.`
    };
  }

  if (kind === "domain") {
    const a = pickOne(state.rngState, domainStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} The faithful marked this change in charcoal and bone.`
    };
  }

  if (kind === "prophet") {
    const a = pickOne(state.rngState, prophetStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} A prophet was named, and the crowd answered in one breath.`
    };
  }

  const a = pickOne(state.rngState, cultStarts);
  return {
    rngState: a.rngState,
    text: `${a.value} A cult took shape where no law could reach.`
  };
}

function appendOmen(state: GameState, nowMs: number, kind: OmenKind, detail?: string): GameState {
  const omen = createOmen(state, kind, nowMs, detail);
  return {
    ...state,
    rngState: omen.rngState,
    omenLog: [
      {
        id: `evt-${state.nextEventId}`,
        at: nowMs,
        text: omen.text
      },
      ...state.omenLog
    ].slice(0, 140),
    nextEventId: state.nextEventId + 1
  };
}

export function canWhisper(state: GameState, nowMs: number): boolean {
  return state.resources.influence >= getWhisperCost(state, nowMs);
}

export function performWhisper(state: GameState, nowMs: number): GameState {
  const normalizedCycle = normalizeWhisperCycle(state.activity, nowMs);
  const cost = getWhisperCost(state, nowMs);
  if (state.resources.influence < cost) return state;

  const withWhisper = {
    ...state,
    resources: {
      ...state.resources,
      influence: state.resources.influence - cost,
      belief: state.resources.belief + WHISPER_BELIEF_GAIN,
      followers: state.resources.followers + WHISPER_FOLLOWER_GAIN
    },
    activity: {
      ...state.activity,
      whisperWindowStartedAt: normalizedCycle.whisperWindowStartedAt,
      whispersInWindow: normalizedCycle.whispersInWindow + 1,
      lastEventAt: nowMs
    },
    stats: {
      ...state.stats,
      totalBeliefEarned: state.stats.totalBeliefEarned + WHISPER_BELIEF_GAIN
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(withWhisper, nowMs, "whisper");
}

export function canInvestDomain(state: GameState, domainId: DomainId): boolean {
  const domain = state.domains.find((item) => item.id === domainId);
  return Boolean(domain && state.resources.belief >= getDomainInvestCost(domain));
}

export function performDomainInvestment(state: GameState, domainId: DomainId, nowMs: number): GameState {
  const domainIndex = state.domains.findIndex((item) => item.id === domainId);
  if (domainIndex < 0) return state;

  const domain = state.domains[domainIndex];
  const cost = getDomainInvestCost(domain);
  if (state.resources.belief < cost) return state;

  const xpNeeded = getDomainXpNeeded(domain);
  let nextLevel = domain.level;
  let nextXp = domain.xp + 1;
  if (nextXp >= xpNeeded) {
    nextXp -= xpNeeded;
    nextLevel += 1;
  }

  const nextDomains = [...state.domains];
  nextDomains[domainIndex] = {
    ...domain,
    level: nextLevel,
    xp: nextXp
  };

  const withInvestment = {
    ...state,
    domains: nextDomains,
    resources: {
      ...state.resources,
      belief: state.resources.belief - cost
    },
    activity: {
      ...state.activity,
      lastEventAt: nowMs
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(withInvestment, nowMs, "domain", DOMAIN_LABELS[domainId]);
}

export function canAnointProphet(state: GameState): boolean {
  return state.resources.followers >= getFollowersForNextProphet(state);
}

export function performProphetAnoint(state: GameState, nowMs: number): GameState {
  const threshold = getFollowersForNextProphet(state);
  if (state.resources.followers < threshold) return state;

  const withProphet = {
    ...state,
    prophets: state.prophets + 1,
    resources: {
      ...state.resources,
      followers: state.resources.followers - threshold
    },
    activity: {
      ...state.activity,
      lastEventAt: nowMs
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(withProphet, nowMs, "prophet");
}

export function canFormCult(state: GameState): boolean {
  return state.resources.belief >= getCultFormationCost(state);
}

export function performCultFormation(state: GameState, nowMs: number): GameState {
  const cost = getCultFormationCost(state);
  if (state.resources.belief < cost) return state;

  const withCult = {
    ...state,
    cults: state.cults + 1,
    resources: {
      ...state.resources,
      belief: state.resources.belief - cost
    },
    activity: {
      ...state.activity,
      lastEventAt: nowMs
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(withCult, nowMs, "cult");
}


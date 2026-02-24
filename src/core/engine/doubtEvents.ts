export type DoubtEventId =
  | "elder_question"
  | "family_arrives"
  | "words_misquoted"
  | "direct_voice_claim"
  | "curious_merchant"
  | "followers_disagree"
  | "child_repeats"
  | "night_offerings";

export type DoubtChoiceId = "a" | "b";

interface DoubtChoiceDefinition {
  label: string;
  influenceCost: number;
}

interface DoubtEventDefinition {
  id: DoubtEventId;
  scene: string;
  choiceA: DoubtChoiceDefinition;
  choiceB: DoubtChoiceDefinition;
  timeoutOmen: string;
}

export interface ActiveDoubtEventState {
  eventId: DoubtEventId | null;
  firedAt: number | null;
  resolved: boolean;
}

export interface PendingDoubtOutcome {
  id: string;
  dueAt: number;
  followersDelta: number;
  omenText: string;
}

export interface DoubtSessionState {
  activeDoubtEvent: ActiveDoubtEventState;
  lastDoubtEventId: DoubtEventId | null;
  lastDoubtResolutionTime: number | null;
  nextDoubtEventAt: number;
  pendingOutcomes: PendingDoubtOutcome[];
  rngState: number;
  nextPendingOutcomeId: number;
}

export interface DoubtEventView {
  id: DoubtEventId;
  scene: string;
  choiceA: DoubtChoiceDefinition;
  choiceB: DoubtChoiceDefinition;
}

export interface DoubtResolution {
  influenceCost: number;
  immediateFollowersDelta: number;
  devotionDelta: number;
  nextWhisperCostDelta: number | null;
  immediateOmenText: string | null;
  delayedOutcome: Omit<PendingDoubtOutcome, "id"> | null;
}

export interface ResolveDoubtChoiceResult {
  nextSession: DoubtSessionState;
  eventId: DoubtEventId;
  resolution: DoubtResolution;
}

export interface ResolveDoubtTimeoutResult {
  nextSession: DoubtSessionState;
  eventId: DoubtEventId;
  omenText: string;
}

export interface FireDoubtEventResult {
  nextSession: DoubtSessionState;
  firedEvent: DoubtEventView | null;
}

export interface DrainPendingDoubtOutcomesResult {
  nextSession: DoubtSessionState;
  dueOutcomes: PendingDoubtOutcome[];
}

const FIRST_EVENT_MIN_DELAY_MS = 3 * 60 * 1000;
const FIRST_EVENT_MAX_DELAY_MS = 5 * 60 * 1000;
const NEXT_EVENT_MIN_DELAY_MS = 4 * 60 * 1000;
const NEXT_EVENT_MAX_DELAY_MS = 7 * 60 * 1000;
const ACTIVE_EVENT_TIMEOUT_MS = 3 * 60 * 1000;

const DOUBT_EVENT_DEFINITIONS: readonly DoubtEventDefinition[] = [
  {
    id: "elder_question",
    scene: "An elder questions the prophet's words publicly. The crowd waits.",
    choiceA: {
      label: "Let it pass",
      influenceCost: 0
    },
    choiceB: {
      label: "Have the prophet respond",
      influenceCost: 15
    },
    timeoutOmen: "The elder walked away. No one followed him, but no one answered either."
  },
  {
    id: "family_arrives",
    scene:
      "A family arrives at the edge of the settlement. They have heard something, but are not sure what.",
    choiceA: {
      label: "Leave them to find their own way",
      influenceCost: 0
    },
    choiceB: {
      label: "Send a prophet to meet them",
      influenceCost: 20
    },
    timeoutOmen: "They were gone before the next bell."
  },
  {
    id: "words_misquoted",
    scene:
      "Someone has been repeating the prophet's words incorrectly. The version spreading is simpler, but wrong.",
    choiceA: {
      label: "Let it spread",
      influenceCost: 0
    },
    choiceB: {
      label: "Correct it directly",
      influenceCost: 25
    },
    timeoutOmen:
      "The wrong words spread faster. More listened, but what they heard was not what was said."
  },
  {
    id: "direct_voice_claim",
    scene:
      "A follower claims to have heard the voice directly, without a prophet present. Others are watching to see how this is received.",
    choiceA: {
      label: "Acknowledge it",
      influenceCost: 0
    },
    choiceB: {
      label: "Redirect quietly",
      influenceCost: 15
    },
    timeoutOmen: "The claim passed without judgment. The crowd remembered the uncertainty."
  },
  {
    id: "curious_merchant",
    scene:
      "A merchant passing through asks what is happening here. They seem genuinely curious.",
    choiceA: {
      label: "Say nothing",
      influenceCost: 0
    },
    choiceB: {
      label: "Let a follower speak to them",
      influenceCost: 0
    },
    timeoutOmen: "The merchant moved on. Perhaps they will return. Perhaps not."
  },
  {
    id: "followers_disagree",
    scene:
      "Two followers disagree openly about what the prophet meant by something said last week.",
    choiceA: {
      label: "Let them resolve it themselves",
      influenceCost: 0
    },
    choiceB: {
      label: "Have the prophet clarify",
      influenceCost: 20
    },
    timeoutOmen: "They argued through the night and emerged quieter. Neither left."
  },
  {
    id: "child_repeats",
    scene:
      "A child has begun repeating phrases from the gatherings. Their parents are uncertain how to feel about this.",
    choiceA: {
      label: "Leave it to the family",
      influenceCost: 0
    },
    choiceB: {
      label: "Acknowledge the child gently",
      influenceCost: 10
    },
    timeoutOmen: "The parents said nothing at the next gathering. The child came with them."
  },
  {
    id: "night_offerings",
    scene:
      "Someone has begun leaving small offerings at the edge of the settlement at night. No one knows who.",
    choiceA: {
      label: "Leave them undisturbed",
      influenceCost: 0
    },
    choiceB: {
      label: "Try to find out who",
      influenceCost: 0
    },
    timeoutOmen: "The offerings continued. No one asked who left them."
  }
] as const;

function getEventDefinition(eventId: DoubtEventId): DoubtEventDefinition {
  const found = DOUBT_EVENT_DEFINITIONS.find((entry) => entry.id === eventId);
  if (!found) {
    return DOUBT_EVENT_DEFINITIONS[0];
  }
  return found;
}

function hashRunId(runId: string): number {
  let hash = 2166136261 >>> 0;
  for (let index = 0; index < runId.length; index += 1) {
    hash ^= runId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = hash >>> 0;
  return normalized === 0 ? 0x6d2b79f5 : normalized;
}

function nextRandom(rngState: number): { rngState: number; value: number } {
  let x = rngState >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const nextState = x >>> 0 || 0x6d2b79f5;
  return {
    rngState: nextState,
    value: nextState / 4294967296
  };
}

function rollChance(rngState: number, chance: number): { rngState: number; success: boolean } {
  const roll = nextRandom(rngState);
  return {
    rngState: roll.rngState,
    success: roll.value < chance
  };
}

function rollDelay(
  rngState: number,
  minDelayMs: number,
  maxDelayMs: number
): { rngState: number; delayMs: number } {
  const roll = nextRandom(rngState);
  const span = Math.max(0, maxDelayMs - minDelayMs);
  return {
    rngState: roll.rngState,
    delayMs: minDelayMs + Math.floor(roll.value * (span + 1))
  };
}

function scheduleFirstDoubtAt(
  rngState: number,
  runCreatedAt: number
): { rngState: number; nextAt: number } {
  const roll = rollDelay(rngState, FIRST_EVENT_MIN_DELAY_MS, FIRST_EVENT_MAX_DELAY_MS);
  return {
    rngState: roll.rngState,
    nextAt: runCreatedAt + roll.delayMs
  };
}

function scheduleNextDoubtAt(
  rngState: number,
  resolvedAt: number
): { rngState: number; nextAt: number } {
  const roll = rollDelay(rngState, NEXT_EVENT_MIN_DELAY_MS, NEXT_EVENT_MAX_DELAY_MS);
  return {
    rngState: roll.rngState,
    nextAt: resolvedAt + roll.delayMs
  };
}

function pickNextDoubtEventId(
  rngState: number,
  lastEventId: DoubtEventId | null
): { rngState: number; eventId: DoubtEventId } {
  const options =
    lastEventId === null
      ? DOUBT_EVENT_DEFINITIONS
      : DOUBT_EVENT_DEFINITIONS.filter((entry) => entry.id !== lastEventId);
  const roll = nextRandom(rngState);
  const index = Math.min(options.length - 1, Math.floor(roll.value * options.length));
  return {
    rngState: roll.rngState,
    eventId: options[index].id
  };
}

function withEventResolved(
  session: DoubtSessionState,
  eventId: DoubtEventId,
  resolvedAt: number
): DoubtSessionState {
  const schedule = scheduleNextDoubtAt(session.rngState, resolvedAt);
  return {
    ...session,
    activeDoubtEvent: {
      eventId: null,
      firedAt: null,
      resolved: true
    },
    lastDoubtEventId: eventId,
    lastDoubtResolutionTime: resolvedAt,
    nextDoubtEventAt: schedule.nextAt,
    rngState: schedule.rngState
  };
}

function resolveEventChoice(
  eventId: DoubtEventId,
  choice: DoubtChoiceId,
  nowMs: number,
  rngState: number
): { rngState: number; resolution: DoubtResolution } {
  if (eventId === "elder_question") {
    if (choice === "a") {
      return {
        rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: 0,
          devotionDelta: 0,
          nextWhisperCostDelta: null,
          immediateOmenText:
            "The elder walked away. No one followed him, but no one answered either.",
          delayedOutcome: null
        }
      };
    }
    return {
      rngState,
      resolution: {
        influenceCost: 15,
        immediateFollowersDelta: 4,
        devotionDelta: 0,
        nextWhisperCostDelta: null,
        immediateOmenText: "The prophet spoke plainly. Three more stayed to listen.",
        delayedOutcome: null
      }
    };
  }

  if (eventId === "family_arrives") {
    if (choice === "a") {
      const roll = rollChance(rngState, 0.5);
      return {
        rngState: roll.rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: 0,
          devotionDelta: 0,
          nextWhisperCostDelta: null,
          immediateOmenText: null,
          delayedOutcome: {
            dueAt: nowMs + 60 * 1000,
            followersDelta: roll.success ? 2 : 0,
            omenText: roll.success
              ? "By morning they had joined the outer circle."
              : "They were gone before the next bell."
          }
        }
      };
    }
    return {
      rngState,
      resolution: {
        influenceCost: 20,
        immediateFollowersDelta: 6,
        devotionDelta: 0,
        nextWhisperCostDelta: null,
        immediateOmenText:
          "The prophet went out before dawn. The family did not leave.",
        delayedOutcome: null
      }
    };
  }

  if (eventId === "words_misquoted") {
    if (choice === "a") {
      return {
        rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: 3,
          devotionDelta: 0,
          nextWhisperCostDelta: 8,
          immediateOmenText:
            "The wrong words spread faster. More listened, but what they heard was not what was said.",
          delayedOutcome: null
        }
      };
    }
    return {
      rngState,
      resolution: {
        influenceCost: 25,
        immediateFollowersDelta: 0,
        devotionDelta: 0,
        nextWhisperCostDelta: -5,
        immediateOmenText:
          "The prophet corrected the error quietly. The original words held.",
        delayedOutcome: null
      }
    };
  }

  if (eventId === "direct_voice_claim") {
    if (choice === "a") {
      return {
        rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: 5,
          devotionDelta: 0,
          nextWhisperCostDelta: null,
          immediateOmenText:
            "Word spread that the voice had been heard by ordinary ears. The curious came.",
          delayedOutcome: null
        }
      };
    }
    return {
      rngState,
      resolution: {
        influenceCost: 15,
        immediateFollowersDelta: 2,
        devotionDelta: 1,
        nextWhisperCostDelta: null,
        immediateOmenText:
          "The prophet redirected the claim without dismissing it. The faithful understood.",
        delayedOutcome: null
      }
    };
  }

  if (eventId === "curious_merchant") {
    if (choice === "a") {
      return {
        rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: 0,
          devotionDelta: 0,
          nextWhisperCostDelta: null,
          immediateOmenText: "The merchant moved on. Perhaps they will return. Perhaps not.",
          delayedOutcome: null
        }
      };
    }
    const roll = rollChance(rngState, 0.6);
    return {
      rngState: roll.rngState,
      resolution: {
        influenceCost: 0,
        immediateFollowersDelta: 0,
        devotionDelta: 0,
        nextWhisperCostDelta: null,
        immediateOmenText: null,
        delayedOutcome: {
          dueAt: nowMs + 90 * 1000,
          followersDelta: roll.success ? 3 : 0,
          omenText: roll.success
            ? "The merchant spoke of it at the next settlement. Three arrived two days later."
            : "The merchant listened politely and continued on their road."
        }
      }
    };
  }

  if (eventId === "followers_disagree") {
    if (choice === "a") {
      const roll = rollChance(rngState, 0.1);
      return {
        rngState: roll.rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: roll.success ? -1 : 0,
          devotionDelta: 0,
          nextWhisperCostDelta: null,
          immediateOmenText: roll.success
            ? "By morning one of them was gone. The other did not speak of it."
            : "They argued through the night and emerged quieter. Neither left.",
          delayedOutcome: null
        }
      };
    }
    return {
      rngState,
      resolution: {
        influenceCost: 20,
        immediateFollowersDelta: 1,
        devotionDelta: 0,
        nextWhisperCostDelta: null,
        immediateOmenText:
          "The prophet spoke once and both fell quiet. A third had been listening from the doorway.",
        delayedOutcome: null
      }
    };
  }

  if (eventId === "child_repeats") {
    if (choice === "a") {
      return {
        rngState,
        resolution: {
          influenceCost: 0,
          immediateFollowersDelta: 0,
          devotionDelta: 0,
          nextWhisperCostDelta: null,
          immediateOmenText:
            "The parents said nothing at the next gathering. The child came with them.",
          delayedOutcome: null
        }
      };
    }
    return {
      rngState,
      resolution: {
        influenceCost: 10,
        immediateFollowersDelta: 2,
        devotionDelta: 1,
        nextWhisperCostDelta: null,
        immediateOmenText: "The prophet greeted the child by name. The family stayed.",
        delayedOutcome: null
      }
    };
  }

  if (choice === "a") {
    return {
      rngState,
      resolution: {
        influenceCost: 0,
        immediateFollowersDelta: 0,
        devotionDelta: 1,
        nextWhisperCostDelta: null,
        immediateOmenText: "The offerings continued. No one asked who left them.",
        delayedOutcome: null
      }
    };
  }

  const roll = rollChance(rngState, 0.5);
  return {
    rngState: roll.rngState,
    resolution: {
      influenceCost: 0,
      immediateFollowersDelta: 0,
      devotionDelta: 0,
      nextWhisperCostDelta: null,
      immediateOmenText: roll.success
        ? "It was a child from the outer street. They seemed embarrassed to be found."
        : "Whoever it was did not come forward. The offerings stopped.",
      delayedOutcome: null
    }
  };
}

export function createInitialDoubtSession(
  runId: string,
  runCreatedAt: number
): DoubtSessionState {
  const seeded = hashRunId(runId);
  const firstSchedule = scheduleFirstDoubtAt(seeded, runCreatedAt);
  return {
    activeDoubtEvent: {
      eventId: null,
      firedAt: null,
      resolved: false
    },
    lastDoubtEventId: null,
    lastDoubtResolutionTime: null,
    nextDoubtEventAt: firstSchedule.nextAt,
    pendingOutcomes: [],
    rngState: firstSchedule.rngState,
    nextPendingOutcomeId: 1
  };
}

export function getActiveDoubtEventView(session: DoubtSessionState): DoubtEventView | null {
  if (!session.activeDoubtEvent.eventId) return null;
  const definition = getEventDefinition(session.activeDoubtEvent.eventId);
  return {
    id: definition.id,
    scene: definition.scene,
    choiceA: definition.choiceA,
    choiceB: definition.choiceB
  };
}

export function fireNextDoubtEvent(
  session: DoubtSessionState,
  nowMs: number,
  era: 1 | 2 | 3,
  totalBelief: number
): FireDoubtEventResult {
  if (era !== 1) {
    return {
      nextSession: session,
      firedEvent: null
    };
  }
  if (totalBelief < 50) {
    return {
      nextSession: session,
      firedEvent: null
    };
  }
  if (session.activeDoubtEvent.eventId) {
    return {
      nextSession: session,
      firedEvent: null
    };
  }
  if (nowMs < session.nextDoubtEventAt) {
    return {
      nextSession: session,
      firedEvent: null
    };
  }

  const picked = pickNextDoubtEventId(session.rngState, session.lastDoubtEventId);
  const nextSession: DoubtSessionState = {
    ...session,
    activeDoubtEvent: {
      eventId: picked.eventId,
      firedAt: nowMs,
      resolved: false
    },
    rngState: picked.rngState
  };

  return {
    nextSession,
    firedEvent: getActiveDoubtEventView(nextSession)
  };
}

export function hasActiveDoubtTimedOut(session: DoubtSessionState, nowMs: number): boolean {
  if (!session.activeDoubtEvent.eventId) return false;
  if (session.activeDoubtEvent.resolved) return false;
  if (session.activeDoubtEvent.firedAt === null) return false;
  return nowMs - session.activeDoubtEvent.firedAt >= ACTIVE_EVENT_TIMEOUT_MS;
}

export function resolveActiveDoubtTimeout(
  session: DoubtSessionState,
  nowMs: number
): ResolveDoubtTimeoutResult | null {
  const eventId = session.activeDoubtEvent.eventId;
  if (!eventId) return null;
  const definition = getEventDefinition(eventId);
  const nextSession = withEventResolved(session, eventId, nowMs);
  return {
    nextSession,
    eventId,
    omenText: definition.timeoutOmen
  };
}

export function resolveActiveDoubtChoice(
  session: DoubtSessionState,
  choice: DoubtChoiceId,
  nowMs: number
): ResolveDoubtChoiceResult | null {
  const eventId = session.activeDoubtEvent.eventId;
  if (!eventId) return null;

  const resolved = resolveEventChoice(eventId, choice, nowMs, session.rngState);
  const nextSessionBase = withEventResolved(
    {
      ...session,
      rngState: resolved.rngState
    },
    eventId,
    nowMs
  );

  let nextSession = nextSessionBase;
  if (resolved.resolution.delayedOutcome) {
    const pendingOutcome: PendingDoubtOutcome = {
      id: `doubt-outcome-${nextSessionBase.nextPendingOutcomeId}`,
      dueAt: resolved.resolution.delayedOutcome.dueAt,
      followersDelta: resolved.resolution.delayedOutcome.followersDelta,
      omenText: resolved.resolution.delayedOutcome.omenText
    };
    nextSession = {
      ...nextSessionBase,
      pendingOutcomes: [...nextSessionBase.pendingOutcomes, pendingOutcome],
      nextPendingOutcomeId: nextSessionBase.nextPendingOutcomeId + 1
    };
  }

  return {
    nextSession,
    eventId,
    resolution: resolved.resolution
  };
}

export function drainDuePendingDoubtOutcomes(
  session: DoubtSessionState,
  nowMs: number
): DrainPendingDoubtOutcomesResult {
  if (session.pendingOutcomes.length <= 0) {
    return {
      nextSession: session,
      dueOutcomes: []
    };
  }
  const dueOutcomes = session.pendingOutcomes.filter((outcome) => outcome.dueAt <= nowMs);
  if (dueOutcomes.length <= 0) {
    return {
      nextSession: session,
      dueOutcomes: []
    };
  }
  return {
    nextSession: {
      ...session,
      pendingOutcomes: session.pendingOutcomes.filter((outcome) => outcome.dueAt > nowMs)
    },
    dueOutcomes
  };
}

export function clearDoubtSessionForEraTransition(session: DoubtSessionState): DoubtSessionState {
  if (!session.activeDoubtEvent.eventId && session.pendingOutcomes.length <= 0) {
    return session;
  }
  return {
    ...session,
    activeDoubtEvent: {
      eventId: null,
      firedAt: null,
      resolved: true
    },
    pendingOutcomes: []
  };
}


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
  OMEN_LOG_MAX_ENTRIES,
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
  getMiracleReserveCap,
  getPassiveFollowerRate,
  getRivalSpawnIntervalMs,
  getRivalStrength,
  getTotalRivalStrength,
  getVeilCollapseThreshold,
  getVeilErosionPerSecond,
  getVeilRegenPerSecond,
  normalizeWhisperCycle
} from "./formulas";
import { syncRemembranceState } from "./remembrance";

const PASSIVE_OMEN_COOLDOWN_MS = 45 * 1000;
const PASSIVE_OMEN_NORMAL: readonly string[] = [
  "Three more came to the shrine without being called.",
  "A family arrived at the edge of the settlement before dawn.",
  "Word had moved ahead of the prophets. The faithful were already waiting.",
  "They came in pairs. No one sent for them."
];
const PASSIVE_OMEN_DANGER: readonly string[] = [
  "Something is drawing them closer. They feel it in their sleep.",
  "More arrived tonight than the cults could name.",
  "The thin places are visible now. They walk toward them.",
  "She said she heard the sound for three nights before she came."
];
const PASSIVE_OMEN_LOW_CIV: readonly string[] = [
  "Even now, with the city faltering, they come.",
  "The collapse brought them. Ruin and faith have always shared a road."
];
const RIVAL_SPAWN_OMENS: readonly string[] = [
  "At the edge of the city, another altar lit itself and your faithful began to waver.",
  "A new creed took root in the outer districts before your prophets could answer it.",
  "Another rival voice rose from the city fringe and drew uncertain eyes.",
  "The market quarter murmured a fresh doctrine into being."
];
const VEIL_COLLAPSE_OMENS: readonly string[] = [
  "The Veil screamed open. Crowds scattered, and two prophetic voices went dark.",
  "Reality tore at the seam. Followers fled and your circle thinned at once.",
  "The boundary failed in plain sight; panic spread faster than prayer."
];
const CIV_RECOVERY_OMENS: readonly string[] = [
  "From ash and hunger, a new city raised its first bell and dared to remember.",
  "The shattered streets steadied, and people returned to the shrines by dusk.",
  "A rebuilt quarter lit its lamps again, and order returned in cautious steps."
];

interface PassiveOmenSessionState {
  lastAt: number;
  lastText: string | null;
}

const passiveOmenSessionByRun = new Map<string, PassiveOmenSessionState>();

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
  const recentEntries = state.omenLog.slice(0, 8);
  const recentTexts = new Set(recentEntries.map((entry) => entry.text));
  const recentFingerprints = new Set(recentEntries.map((entry) => toOmenFingerprint(entry.text)));
  const nextFingerprint = toOmenFingerprint(text);
  if (recentTexts.has(text) || recentFingerprints.has(nextFingerprint)) {
    return state;
  }

  return {
    ...state,
    omenLog: [
      {
        id: `evt-${state.nextEventId}`,
        at: nowMs,
        text
      },
      ...state.omenLog
    ].slice(0, OMEN_LOG_MAX_ENTRIES),
    nextEventId: state.nextEventId + 1
  };
}

function toOmenFingerprint(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .trim();
  const sentenceParts = normalized
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return sentenceParts[sentenceParts.length - 1] ?? normalized;
}

function pickSystemOmenVariant(
  state: GameState,
  nowMs: number,
  options: readonly string[],
  fallback: string
): string {
  if (options.length <= 0) return fallback;

  const recentEntries = state.omenLog.slice(0, 8);
  const recentTexts = new Set(recentEntries.map((entry) => entry.text));
  const recentFingerprints = new Set(recentEntries.map((entry) => toOmenFingerprint(entry.text)));
  const baseIndex = Math.abs(Math.floor(nowMs / 1000) + state.nextEventId) % options.length;

  for (let offset = 0; offset < options.length; offset += 1) {
    const candidate = options[(baseIndex + offset) % options.length];
    const fingerprint = toOmenFingerprint(candidate);
    if (!recentTexts.has(candidate) && !recentFingerprints.has(fingerprint)) {
      return candidate;
    }
  }

  return fallback;
}

function choosePassiveOmenLine(
  state: GameState,
  nowMs: number,
  passiveFollowerRate: number
): string | null {
  if (state.era < 3) return null;
  if (passiveFollowerRate <= 0) return null;

  const runId = state.meta.runId;
  const session = passiveOmenSessionByRun.get(runId) ?? {
    lastAt: 0,
    lastText: null
  };

  if (nowMs - session.lastAt < PASSIVE_OMEN_COOLDOWN_MS) return null;

  let pool = PASSIVE_OMEN_NORMAL;
  if (state.cataclysm.civilizationHealth < 40) {
    pool = PASSIVE_OMEN_LOW_CIV;
  } else if (state.resources.veil < 30) {
    pool = PASSIVE_OMEN_DANGER;
  }

  const baseIndex = Math.floor(nowMs / 1000) % pool.length;
  let nextLine = pool[baseIndex];
  if (pool.length > 1 && nextLine === session.lastText) {
    nextLine = pool[(baseIndex + 1) % pool.length];
  }

  passiveOmenSessionByRun.set(runId, {
    lastAt: nowMs,
    lastText: nextLine
  });

  if (passiveOmenSessionByRun.size > 3) {
    for (const key of passiveOmenSessionByRun.keys()) {
      if (key !== runId) {
        passiveOmenSessionByRun.delete(key);
      }
    }
  }

  return nextLine;
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
  const miracleReserveCap = getMiracleReserveCap(preTickState);
  const currentMiracleReserve = Math.max(
    0,
    Math.min(miracleReserveCap, preTickState.cataclysm.miracleReserve)
  );
  const influenceGain = getInfluenceRegenPerSecond(preTickState) * simulatedSeconds;
  const influenceAfterGain = preTickState.resources.influence + influenceGain;
  const influenceAfterCap = Math.min(influenceCap, influenceAfterGain);
  const overflowInfluence = Math.max(0, influenceAfterGain - influenceCap);
  const miracleReserveAfterTick = Math.min(miracleReserveCap, currentMiracleReserve + overflowInfluence);
  const passiveFollowerRate = getPassiveFollowerRate(preTickState, nowMs);
  const passiveFollowerGain = passiveFollowerRate * simulatedSeconds;
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

  const followersAfterActs = preTickState.resources.followers + actFollowerGain + passiveFollowerGain;
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
      influence: influenceAfterCap,
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
      miracleReserve: miracleReserveAfterTick,
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
    const rivalSpawnOmen = pickSystemOmenVariant(
      nextState,
      nowMs,
      RIVAL_SPAWN_OMENS,
      RIVAL_SPAWN_OMENS[0]
    );
    nextState = appendSystemOmen(
      nextState,
      nowMs,
      rivalSpawnOmen
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
      pickSystemOmenVariant(nextState, nowMs, VEIL_COLLAPSE_OMENS, VEIL_COLLAPSE_OMENS[0])
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
      pickSystemOmenVariant(nextState, nowMs, CIV_RECOVERY_OMENS, CIV_RECOVERY_OMENS[0])
    );
  }

  const passiveOmenLine = choosePassiveOmenLine(nextState, nowMs, passiveFollowerRate);
  if (passiveOmenLine) {
    nextState = appendSystemOmen(nextState, nowMs, passiveOmenLine);
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

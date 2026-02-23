import {
  ACT_BASE_COST,
  ACT_BASE_MULTIPLIER,
  ACT_COST_DISCOUNT,
  ACT_DURATION_SECONDS,
  ACT_FLOOR_BASE,
  ACT_FLOOR_ECHO,
  ACT_RETURN_FACTOR,
  CULT_COST_BASE,
  CULT_COST_ECHO_BASE,
  CULT_COST_SCALAR,
  CULT_OUTPUT_SCALE,
  DOMAIN_INVEST_BASE_COST,
  DOMAIN_INVEST_COST_SCALAR,
  DOMAIN_MULTIPLIER_SCALE,
  DOMAIN_SYNERGY_SCALE,
  DOMAIN_XP_BASE,
  DOMAIN_XP_SCALAR,
  ERA_ONE_BELIEF_GATE_BASE,
  ERA_ONE_DOMAIN_LEVEL_GATE,
  ERA_ONE_GATE_ECHO_MULTIPLIER,
  ERA_ONE_PROPHET_GATE,
  ERA_TWO_BELIEF_GATE_BASE,
  ERA_TWO_CULT_GATE,
  ERA_TWO_GATE_ECHO_MULTIPLIER,
  FAITH_DECAY_BASE,
  FAITH_DECAY_ECHO_FLOOR,
  FAITH_DECAY_FLOOR,
  GHOST_BONUS_BASE,
  INFLUENCE_BASE_CAP,
  INFLUENCE_BASE_REGEN_PER_SECOND,
  INFLUENCE_CAP_PER_PROPHET,
  INFLUENCE_REGEN_PER_PROPHET_PER_SECOND,
  INFLUENCE_START_BONUS,
  PROPHET_DOMAIN_OUTPUT_SCALE,
  PROPHET_OUTPUT_BASE,
  PROPHET_THRESHOLD_BASE,
  PROPHET_THRESHOLD_ECHO_BASE,
  PROPHET_THRESHOLD_SCALAR,
  RECRUIT_BASE_FOLLOWERS,
  RECRUIT_DOMAIN_FOLLOWER_DIVISOR,
  RECRUIT_PROPHET_FOLLOWER_BONUS,
  RIVAL_SPAWN_BASE_MS,
  RIVAL_SPAWN_ECHO_DELAY_MS,
  RIVAL_STRENGTH_SCALE,
  RIVAL_WEAKENED_MULTIPLIER,
  VEIL_BONUS_SCALE,
  WHISPER_BASE_COST,
  WHISPER_COST_SCALAR,
  WHISPER_WINDOW_MS,
  type ActType,
  type ActivityState,
  type DomainProgress,
  type GameState
} from "../state/gameState";

interface NormalizedWhisperCycle {
  whisperWindowStartedAt: number;
  whispersInWindow: number;
}

export interface EraOneGateStatus {
  beliefTarget: number;
  beliefReady: boolean;
  prophetsTarget: number;
  prophetsReady: boolean;
  domainTarget: number;
  domainReady: boolean;
  ready: boolean;
}

export interface EraTwoGateStatus {
  beliefTarget: number;
  beliefReady: boolean;
  cultsTarget: number;
  cultsReady: boolean;
  rivalEventReady: boolean;
  ready: boolean;
}

export function getTotalDomainLevel(state: GameState): number {
  return state.domains.reduce((sum, domain) => sum + domain.level, 0);
}

export function getHighestDomainLevel(state: GameState): number {
  return state.domains.reduce((max, domain) => Math.max(max, domain.level), 0);
}

export function getMatchingDomainPairs(state: GameState): number {
  const activeDomains = state.domains.filter((domain) => domain.level > 0).length;
  return Math.floor(activeDomains / 2);
}

export function getProphetOutput(totalDomainLevel: number): number {
  return PROPHET_OUTPUT_BASE + totalDomainLevel * PROPHET_DOMAIN_OUTPUT_SCALE;
}

export function getDomainMultiplier(totalDomainLevel: number): number {
  return 1 + DOMAIN_MULTIPLIER_SCALE * totalDomainLevel;
}

export function getFaithDecay(state: GameState, nowMs: number): number {
  const minutesSinceLastEvent = Math.max(0, (nowMs - state.activity.lastEventAt) / 60000);
  const baseDecay = Math.pow(FAITH_DECAY_BASE, minutesSinceLastEvent);
  const floor = state.echoBonuses.faithFloor ? FAITH_DECAY_ECHO_FLOOR : FAITH_DECAY_FLOOR;
  return Math.max(floor, baseDecay);
}

export function getDomainSynergy(state: GameState): number {
  return 1 + DOMAIN_SYNERGY_SCALE * state.matchingDomainPairs;
}

export function getVeilBonus(veil: number): number {
  return 1 + (100 - veil) * VEIL_BONUS_SCALE;
}

export function getCultOutput(state: GameState): number {
  if (state.cults <= 0 || state.prophets <= 0 || state.resources.followers <= 0) return 0;
  return state.prophets * state.resources.followers * CULT_OUTPUT_SCALE * getDomainSynergy(state);
}

export function getBeliefPerSecond(state: GameState, nowMs: number): number {
  const totalDomainLevel = getTotalDomainLevel(state);
  const prophetOutput = getProphetOutput(totalDomainLevel);
  const domainMultiplier = getDomainMultiplier(totalDomainLevel);
  const faithDecay = getFaithDecay(state, nowMs);
  const domainSynergy = getDomainSynergy(state);

  const prophetStack = state.prophets * prophetOutput * domainMultiplier * faithDecay;
  const cultStack = getCultOutput(state) * domainSynergy;

  return Math.max(
    0,
    (prophetStack + cultStack) * getVeilBonus(state.resources.veil) * GHOST_BONUS_BASE
  );
}

export function getInfluenceCap(state: GameState): number {
  const startBonus = state.echoBonuses.startInf ? INFLUENCE_START_BONUS : 0;
  return INFLUENCE_BASE_CAP + state.prophets * INFLUENCE_CAP_PER_PROPHET + startBonus;
}

export function getInfluenceRegenPerSecond(state: GameState): number {
  return INFLUENCE_BASE_REGEN_PER_SECOND + state.prophets * INFLUENCE_REGEN_PER_PROPHET_PER_SECOND;
}

export function normalizeWhisperCycle(activity: ActivityState, nowMs: number): NormalizedWhisperCycle {
  const elapsed = nowMs - activity.whisperWindowStartedAt;
  if (elapsed < WHISPER_WINDOW_MS) {
    return {
      whisperWindowStartedAt: activity.whisperWindowStartedAt,
      whispersInWindow: activity.whispersInWindow
    };
  }

  const windowsElapsed = Math.floor(elapsed / WHISPER_WINDOW_MS);
  return {
    whisperWindowStartedAt: activity.whisperWindowStartedAt + windowsElapsed * WHISPER_WINDOW_MS,
    whispersInWindow: 0
  };
}

function getWhisperCostFromCount(whispersInWindow: number): number {
  return Math.ceil(WHISPER_BASE_COST * Math.pow(WHISPER_COST_SCALAR, whispersInWindow));
}

export function getWhisperCost(state: GameState, nowMs: number): number {
  const normalized = normalizeWhisperCycle(state.activity, nowMs);
  return getWhisperCostFromCount(normalized.whispersInWindow);
}

export function getFollowersForNextProphet(state: GameState): number {
  const base = state.echoBonuses.prophetThreshold ? PROPHET_THRESHOLD_ECHO_BASE : PROPHET_THRESHOLD_BASE;
  return Math.ceil(base * Math.pow(PROPHET_THRESHOLD_SCALAR, state.prophets));
}

export function getCultFormationCost(state: GameState): number {
  const base = state.echoBonuses.cultCostBase ? CULT_COST_ECHO_BASE : CULT_COST_BASE;
  return Math.ceil(base * Math.pow(CULT_COST_SCALAR, state.cults));
}

export function getRecruitFollowerGainBase(state: GameState): number {
  return (
    RECRUIT_BASE_FOLLOWERS +
    state.prophets * RECRUIT_PROPHET_FOLLOWER_BONUS +
    Math.floor(getTotalDomainLevel(state) / RECRUIT_DOMAIN_FOLLOWER_DIVISOR)
  );
}

export function getDomainInvestCost(domain: DomainProgress): number {
  return Math.ceil(DOMAIN_INVEST_BASE_COST * Math.pow(DOMAIN_INVEST_COST_SCALAR, domain.level));
}

export function getDomainXpNeeded(domain: DomainProgress): number {
  return Math.ceil(DOMAIN_XP_BASE * Math.pow(DOMAIN_XP_SCALAR, domain.level));
}

export function getActCost(state: GameState, type: ActType): number {
  const discount = state.echoBonuses.actDiscount ? ACT_COST_DISCOUNT : 1;
  return Math.ceil(ACT_BASE_COST[type] * discount);
}

export function getActDurationSeconds(type: ActType): number {
  return ACT_DURATION_SECONDS[type];
}

export function getActBaseMultiplier(type: ActType): number {
  return ACT_BASE_MULTIPLIER[type];
}

export function getActBeliefMultiplier(state: GameState, baseMultiplier: number): number {
  const floor = state.echoBonuses.actFloor ? ACT_FLOOR_ECHO : ACT_FLOOR_BASE;
  return Math.max(floor, baseMultiplier + state.matchingDomainPairs * 0.2);
}

export function getActRewardBelief(
  state: GameState,
  beliefPerSecond: number,
  durationSeconds: number,
  baseMultiplier: number
): number {
  const beliefMultiplier = getActBeliefMultiplier(state, baseMultiplier);
  return beliefPerSecond * durationSeconds * beliefMultiplier * ACT_RETURN_FACTOR;
}

export function getRivalSpawnIntervalMs(state: GameState): number {
  return RIVAL_SPAWN_BASE_MS + (state.echoBonuses.rivalDelay ? RIVAL_SPAWN_ECHO_DELAY_MS : 0);
}

export function getRivalStrength(state: GameState, beliefPerSecond: number): number {
  const weakened = state.echoBonuses.rivalWeaken ? RIVAL_WEAKENED_MULTIPLIER : 1;
  return Math.max(1, beliefPerSecond * RIVAL_STRENGTH_SCALE) * weakened;
}

export function getTotalRivalStrength(state: GameState): number {
  return state.doctrine.rivals.reduce((sum, rival) => sum + rival.strength, 0);
}

export function getEraOneBeliefGateTarget(state: GameState): number {
  const multiplier = state.echoBonuses.era1Gate ? ERA_ONE_GATE_ECHO_MULTIPLIER : 1;
  return Math.ceil(ERA_ONE_BELIEF_GATE_BASE * multiplier);
}

export function getEraOneGateStatus(state: GameState): EraOneGateStatus {
  const beliefTarget = getEraOneBeliefGateTarget(state);
  const prophetsTarget = ERA_ONE_PROPHET_GATE;
  const domainTarget = ERA_ONE_DOMAIN_LEVEL_GATE;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const prophetsReady = state.prophets >= prophetsTarget;
  const domainReady = getHighestDomainLevel(state) >= domainTarget;

  return {
    beliefTarget,
    beliefReady,
    prophetsTarget,
    prophetsReady,
    domainTarget,
    domainReady,
    ready: beliefReady && prophetsReady && domainReady
  };
}

export function getEraTwoBeliefGateTarget(state: GameState): number {
  const multiplier = state.echoBonuses.era2Gate ? ERA_TWO_GATE_ECHO_MULTIPLIER : 1;
  return Math.ceil(ERA_TWO_BELIEF_GATE_BASE * multiplier);
}

export function getEraTwoGateStatus(state: GameState): EraTwoGateStatus {
  const beliefTarget = getEraTwoBeliefGateTarget(state);
  const cultsTarget = ERA_TWO_CULT_GATE;
  const beliefReady = state.stats.totalBeliefEarned >= beliefTarget;
  const cultsReady = state.cults >= cultsTarget;
  const rivalEventReady = state.doctrine.survivedRivalEvent;

  return {
    beliefTarget,
    beliefReady,
    cultsTarget,
    cultsReady,
    rivalEventReady,
    ready: beliefReady && cultsReady && rivalEventReady
  };
}


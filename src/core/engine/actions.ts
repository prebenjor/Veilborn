import {
  ECHO_TREE_MAX_RANK,
  CIV_COLLAPSE_FOLLOWER_RETENTION,
  LINEAGE_ACTION_RECOVERY_ACT,
  LINEAGE_ACTION_RECOVERY_RECRUIT,
  LINEAGE_ACTION_RECOVERY_WHISPER,
  LINEAGE_ASCENSION_SKEPTICISM_DECAY,
  LINEAGE_ASCENSION_TRUST_DECAY,
  LINEAGE_CIV_COLLAPSE_SKEPTICISM,
  LINEAGE_CIV_COLLAPSE_TRUST_DEBT,
  LINEAGE_HISTORY_LIMIT,
  LINEAGE_PANTHEON_BETRAYAL_SKEPTICISM,
  LINEAGE_PANTHEON_BETRAYAL_TRUST_DEBT,
  LINEAGE_SKEPTICISM_MAX,
  LINEAGE_SUPPRESS_SKEPTICISM,
  LINEAGE_SUPPRESS_TRUST_DEBT,
  LINEAGE_TRUST_DEBT_MAX,
  PANTHEON_ALLY_COUNT,
  PANTHEON_BETRAYAL_BELIEF_MIN,
  PANTHEON_BETRAYAL_BELIEF_SECONDS,
  PANTHEON_DOMAIN_POISON_RUNS,
  PANTHEON_UNLOCK_COMPLETED_RUNS,
  type HistoryMarkerKind,
  type PantheonAlly,
  RIVAL_SUPPRESS_INFLUENCE_COST,
  CADENCE_ACTION_BELIEF_BONUS,
  CADENCE_ACTION_FOLLOWER_BONUS,
  DOMAIN_LABELS,
  MIRACLE_NAMES,
  RECRUIT_BASE_FOLLOWERS,
  RECRUIT_DOMAIN_FOLLOWER_DIVISOR,
  RECRUIT_INFLUENCE_COST,
  RECRUIT_PROPHET_FOLLOWER_BONUS,
  RECRUIT_RANDOM_FOLLOWER_MAX,
  createDefaultDevotionMomentum,
  DEVOTION_STACK_MAX,
  VEIL_MIN,
  WHISPER_BELIEF_GAIN,
  WHISPER_FOLLOWER_GAIN,
  type ArchitectureBeliefRule,
  type ArchitectureCivilizationRule,
  type ArchitectureDomainRule,
  createInitialGameState,
  type ActType,
  type ActivityState,
  type DomainId,
  type DevotionMomentum,
  type DevotionPath,
  type EchoTreeId,
  type FinalChoice,
  type FollowerRiteType,
  type GameState,
  type MiracleTier
} from "../state/gameState";
import {
  appendLocalGhostSignature,
  createGhostRunSignature,
  createGhostSignatureBundle,
  initializeGhostForRun,
  mergeImportedGhostSignatures,
  parseGhostSignatureBundle
} from "../ghost/ghostEchoes";
import {
  areAllNameLettersUnlocked,
  evaluateRemembranceLetters,
  mergeRemembranceLetters,
  syncRemembranceState
} from "./remembrance";
import {
  getActBaseMultiplier,
  getBeliefPerSecond,
  getAscensionEchoGain,
  getActCost,
  getActDurationSeconds,
  getCivilizationRebuildSeconds,
  getEchoBonusesFromTreeRanks,
  getEchoTreeNextCost,
  getCultFormationCost,
  getDomainInvestCost,
  getDomainXpNeeded,
  getEraOneGateStatus,
  getEraTwoGateStatus,
  getFollowersForNextProphet,
  getLineageConversionFactors,
  getLineageConversionModifier,
  getLineageInheritanceWeights,
  getMatchingDomainPairs,
  getDomainSynergy,
  getFollowerRiteCost,
  getFollowerRiteFollowerGain,
  simulateDomainInvestments,
  isPantheonUnlocked,
  getMiracleBeliefGain,
  getMiracleCivDamage,
  getMiracleInfluenceCost,
  getMiracleReserveCap,
  getMiracleVeilCost,
  getDevotionStacks,
  getDevotionRecruitMultiplier,
  getDevotionPathLabel,
  getRecruitFollowerGainBase,
  getTotalDomainLevel,
  getInfluenceCap,
  getUnravelingGateStatus,
  getWhisperCost,
  normalizeWhisperCycle
} from "./formulas";

type OmenKind =
  | "whisper"
  | "recruit"
  | "domain"
  | "domainLevel"
  | "prophet"
  | "cult"
  | "act"
  | "followerRite"
  | "suppress"
  | "miracle"
  | "civCollapse"
  | "veilCollapse"
  | "pantheonArrival"
  | "pantheonAlliance"
  | "pantheonBetrayal"
  | "ghostEcho"
  | "echoTree"
  | "ascension"
  | "devotion"
  | "eraOneToTwo"
  | "eraTwoToThree";

interface RandomPick<T> {
  rngState: number;
  value: T;
}

interface CadenceBonus {
  beliefBonus: number;
  followerBonus: number;
}

interface LineageDelta {
  trustDebt: number;
  skepticism: number;
  betrayalScars: number;
}

export interface ImportGhostSignaturesResult {
  state: GameState;
  importedCount: number;
  error: string | null;
}

const DESCENDANT_NAME_PREFIXES = [
  "Aren",
  "Bel",
  "Cael",
  "Drae",
  "Ery",
  "Fane",
  "Galen",
  "Ivor",
  "Kael",
  "Lysa",
  "Miren",
  "Neral"
] as const;

const DESCENDANT_NAME_SUFFIXES = [
  "of the Hollow",
  "of Ashwater",
  "of the Eastern Vale",
  "of Broken Bells",
  "of the Salt Road",
  "of the Lantern Step",
  "of Pale Reeds",
  "of the Black Ford"
] as const;

const PANTHEON_NAME_PREFIXES = [
  "Aster",
  "Vel",
  "Mourn",
  "Thane",
  "Oris",
  "Nyx",
  "Khar",
  "Sable",
  "Ith",
  "Ruin"
] as const;

const PANTHEON_NAME_SUFFIXES = [
  "Who Waits Below",
  "Keeper of Knotted Suns",
  "Bearer of Quiet Thunder",
  "The Patient Flame",
  "Warden of Broken Oaths",
  "Mistress of Hollow Fields",
  "He Who Drinks Dawn",
  "Singer in Black Rivers"
] as const;

const ACT_LABELS: Record<ActType, string> = {
  shrine: "Shrine",
  ritual: "Ritual",
  proclaim: "Proclamation"
};

const FOLLOWER_RITE_LABELS: Record<FollowerRiteType, string> = {
  procession: "Pilgrim Procession",
  convergence: "Convergence March"
};

const DEVOTION_OMEN_FIRST_STACK = "Something stirs at the edge of attention.";
const DEVOTION_OMEN_MAX_STACK = "The devotion of your followers has taken root.";
const DEVOTION_OMEN_AFTER_ASCENSION = "The stillness returns. Begin again.";
const DEVOTION_PATH_EMERGE_THRESHOLD = 4;
const DEVOTION_PATH_SWITCH_THRESHOLD = 7;
const DEVOTION_PATH_SWITCH_LEAD = 3;
const DEVOTION_MOMENTUM_CAP = 9999;

const MAJOR_OMEN_KINDS: OmenKind[] = [
  "domainLevel",
  "prophet",
  "cult",
  "followerRite",
  "suppress",
  "miracle",
  "civCollapse",
  "veilCollapse",
  "pantheonArrival",
  "pantheonAlliance",
  "pantheonBetrayal",
  "ghostEcho",
  "echoTree",
  "ascension",
  "devotion",
  "eraOneToTwo",
  "eraTwoToThree"
];

function isMajorOmenKind(kind: OmenKind): boolean {
  return MAJOR_OMEN_KINDS.includes(kind);
}

function getMinorOmenCooldownMs(kind: OmenKind): number {
  if (kind === "whisper") return 18000;
  if (kind === "recruit") return 18000;
  if (kind === "act") return 22000;
  if (kind === "domain") return 26000;
  return 20000;
}

function getMinorOmenChance(kind: OmenKind): number {
  if (kind === "whisper") return 0.32;
  if (kind === "recruit") return 0.38;
  if (kind === "act") return 0.45;
  if (kind === "domain") return 0.3;
  return 0.4;
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

function rollChance(rngState: number, chance: number): RandomPick<boolean> {
  const roll = nextRandom(rngState);
  return {
    rngState: roll.rngState,
    value: roll.value < chance
  };
}

function getFollowerDescriptor(followers: number): string {
  if (followers >= 500) return "whole districts repeated the dream aloud";
  if (followers >= 150) return "small neighborhoods kept lamps lit for your sign";
  if (followers >= 40) return "families passed the story under closed doors";
  return "a few households listened and did not mock the silence";
}

function getCadenceBonus(state: GameState): CadenceBonus {
  if (!state.activity.cadencePromptActive) {
    return { beliefBonus: 0, followerBonus: 0 };
  }

  return {
    beliefBonus: CADENCE_ACTION_BELIEF_BONUS,
    followerBonus: CADENCE_ACTION_FOLLOWER_BONUS
  };
}

function hasRunOmenLine(state: GameState, text: string): boolean {
  return state.omenLog.some((entry) => entry.text === text);
}

function withDevotionIncrementFromQualifyingAction(state: GameState): {
  state: GameState;
  previousStacks: number;
  nextStacks: number;
} {
  const previousStacks = getDevotionStacks(state);
  if (state.era !== 1 || previousStacks >= DEVOTION_STACK_MAX) {
    return {
      state,
      previousStacks,
      nextStacks: previousStacks
    };
  }

  const nextStacks = Math.min(DEVOTION_STACK_MAX, previousStacks + 1);
  return {
    state: {
      ...state,
      devotionStacks: nextStacks
    },
    previousStacks,
    nextStacks
  };
}

function appendDevotionMilestoneOmens(
  state: GameState,
  nowMs: number,
  previousStacks: number,
  nextStacks: number
): GameState {
  if (nextStacks <= previousStacks) return state;

  let nextState = state;

  if (previousStacks === 0 && nextStacks >= 1) {
    if (
      nextState.prestige.completedRuns > 0 &&
      !hasRunOmenLine(nextState, DEVOTION_OMEN_AFTER_ASCENSION)
    ) {
      nextState = appendOmen(nextState, nowMs, "devotion", DEVOTION_OMEN_AFTER_ASCENSION);
    }

    if (!hasRunOmenLine(nextState, DEVOTION_OMEN_FIRST_STACK)) {
      nextState = appendOmen(nextState, nowMs, "devotion", DEVOTION_OMEN_FIRST_STACK);
    }
  }

  if (previousStacks < DEVOTION_STACK_MAX && nextStacks >= DEVOTION_STACK_MAX) {
    if (!hasRunOmenLine(nextState, DEVOTION_OMEN_MAX_STACK)) {
      nextState = appendOmen(nextState, nowMs, "devotion", DEVOTION_OMEN_MAX_STACK);
    }
  }

  return nextState;
}

function getDevotionCandidatePathsForEra(era: GameState["era"]): DevotionPath[] {
  if (era >= 3) return ["fervour", "accord", "reverence", "ardour"];
  if (era >= 2) return ["fervour", "accord"];
  return [];
}

function getDevotionMomentumValue(momentum: DevotionMomentum, path: DevotionPath): number {
  if (path === "none") return 0;
  return momentum[path];
}

function resolveDevotionPathFromMomentum(
  momentum: DevotionMomentum,
  currentPath: DevotionPath,
  era: GameState["era"]
): DevotionPath {
  if (era < 2) return "none";

  const candidates = getDevotionCandidatePathsForEra(era);
  if (candidates.length <= 0) return "none";

  const ranked = [...candidates].sort((a, b) => {
    const delta = getDevotionMomentumValue(momentum, b) - getDevotionMomentumValue(momentum, a);
    if (delta !== 0) return delta;
    return a.localeCompare(b);
  });

  const topPath = ranked[0];
  const topScore = getDevotionMomentumValue(momentum, topPath);
  const runnerScore = ranked.length > 1 ? getDevotionMomentumValue(momentum, ranked[1]) : 0;

  const activePath = candidates.includes(currentPath) ? currentPath : "none";
  if (activePath === "none") {
    if (topScore >= DEVOTION_PATH_EMERGE_THRESHOLD && topScore - runnerScore >= 1) {
      return topPath;
    }
    return "none";
  }

  if (topPath === activePath) return activePath;

  const activeScore = getDevotionMomentumValue(momentum, activePath);
  if (
    topScore >= DEVOTION_PATH_SWITCH_THRESHOLD &&
    topScore - activeScore >= DEVOTION_PATH_SWITCH_LEAD
  ) {
    return topPath;
  }

  return activePath;
}

function buildDevotionPathShiftOmen(nextPath: DevotionPath, previousPath: DevotionPath): string {
  const nextLabel = getDevotionPathLabel(nextPath);
  if (previousPath === "none") {
    return `Devotion found a shape: ${nextLabel}.`;
  }
  const previousLabel = getDevotionPathLabel(previousPath);
  return `Devotion shifted from ${previousLabel} to ${nextLabel}.`;
}

function withDevotionMomentumDelta(
  state: GameState,
  nowMs: number,
  delta: Partial<Record<Exclude<DevotionPath, "none">, number>>
): GameState {
  if (state.era < 2) return state;

  const nextMomentum: DevotionMomentum = {
    fervour: Math.max(
      0,
      Math.min(
        DEVOTION_MOMENTUM_CAP,
        state.devotionMomentum.fervour + Math.floor(delta.fervour ?? 0)
      )
    ),
    accord: Math.max(
      0,
      Math.min(
        DEVOTION_MOMENTUM_CAP,
        state.devotionMomentum.accord + Math.floor(delta.accord ?? 0)
      )
    ),
    reverence: Math.max(
      0,
      Math.min(
        DEVOTION_MOMENTUM_CAP,
        state.devotionMomentum.reverence + Math.floor(delta.reverence ?? 0)
      )
    ),
    ardour: Math.max(
      0,
      Math.min(
        DEVOTION_MOMENTUM_CAP,
        state.devotionMomentum.ardour + Math.floor(delta.ardour ?? 0)
      )
    )
  };

  const previousPath = state.devotionPath;
  const nextPath = resolveDevotionPathFromMomentum(nextMomentum, previousPath, state.era);

  const withMomentum = {
    ...state,
    devotionMomentum: nextMomentum,
    devotionPath: nextPath
  };

  if (nextPath === previousPath || nextPath === "none") return withMomentum;
  return appendOmen(withMomentum, nowMs, "devotion", buildDevotionPathShiftOmen(nextPath, previousPath));
}

function getDominantDevotionPathForMemory(state: GameState): DevotionPath {
  const candidates: DevotionPath[] = ["fervour", "accord", "reverence", "ardour"];
  const ranked = [...candidates].sort((a, b) => {
    const delta = getDevotionMomentumValue(state.devotionMomentum, b) - getDevotionMomentumValue(state.devotionMomentum, a);
    if (delta !== 0) return delta;
    return a.localeCompare(b);
  });
  const topPath = ranked[0];
  const topScore = getDevotionMomentumValue(state.devotionMomentum, topPath);
  return topScore >= DEVOTION_PATH_EMERGE_THRESHOLD ? topPath : "none";
}

function clampLineageMetric(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

function applyLineageDelta(state: GameState, delta: Partial<LineageDelta>): GameState {
  const trustDebt = clampLineageMetric(
    state.lineage.trustDebt + (delta.trustDebt ?? 0),
    LINEAGE_TRUST_DEBT_MAX
  );
  const skepticism = clampLineageMetric(
    state.lineage.skepticism + (delta.skepticism ?? 0),
    LINEAGE_SKEPTICISM_MAX
  );
  const betrayalScars = Math.max(0, state.lineage.betrayalScars + (delta.betrayalScars ?? 0));

  if (
    trustDebt === state.lineage.trustDebt &&
    skepticism === state.lineage.skepticism &&
    betrayalScars === state.lineage.betrayalScars
  ) {
    return state;
  }

  return {
    ...state,
    lineage: {
      ...state.lineage,
      trustDebt,
      skepticism,
      betrayalScars
    }
  };
}

function appendHistoryMarker(
  state: GameState,
  nowMs: number,
  kind: HistoryMarkerKind,
  text: string,
  deltas: Partial<LineageDelta> = {}
): GameState {
  const withDelta = applyLineageDelta(state, deltas);
  const marker = {
    id: `hist-${withDelta.lineage.nextMarkerId}`,
    at: nowMs,
    runId: withDelta.meta.runId,
    kind,
    text,
    trustDebtDelta: deltas.trustDebt ?? 0,
    skepticismDelta: deltas.skepticism ?? 0
  };

  return {
    ...withDelta,
    lineage: {
      ...withDelta.lineage,
      history: [marker, ...withDelta.lineage.history].slice(0, LINEAGE_HISTORY_LIMIT),
      nextMarkerId: withDelta.lineage.nextMarkerId + 1
    }
  };
}

function getConversionFlavorText(state: GameState, modifier: number): string | undefined {
  const recent = state.lineage.history[0];
  if (modifier >= 1.05) {
    return "Inherited zeal carried the omen farther than expected.";
  }

  if (modifier < 0.85) {
    if (recent?.kind === "civ_collapse" || recent?.kind === "veil_collapse") {
      return "Descendants still recount the collapse and hesitate at the threshold.";
    }
    if (state.lineage.betrayalScars > 0) {
      return "Old betrayals linger, and listeners test every word for falsehood.";
    }
    return "Ancestral doubt slowed the spread of your sign.";
  }

  return undefined;
}

function pickInheritedTrait(state: GameState, rngState: number): RandomPick<GameState["mortals"][number]["trait"]> {
  const weights = getLineageInheritanceWeights(state);
  const roll = nextRandom(rngState);
  const thresholdSkeptical = weights.skeptical;
  const thresholdCautious = weights.skeptical + weights.cautious;

  if (roll.value < thresholdSkeptical) {
    return { rngState: roll.rngState, value: "skeptical" };
  }

  if (roll.value < thresholdCautious) {
    return { rngState: roll.rngState, value: "cautious" };
  }

  return { rngState: roll.rngState, value: "zealous" };
}

function createDescendantName(rngState: number, generation: number): RandomPick<string> {
  const a = pickOne(rngState, DESCENDANT_NAME_PREFIXES);
  const b = pickOne(a.rngState, DESCENDANT_NAME_SUFFIXES);
  return {
    rngState: b.rngState,
    value: `${a.value} ${b.value} (Gen ${generation})`
  };
}

function addLineageDescendant(state: GameState, nowMs: number): GameState {
  const parent = state.mortals[state.nextEventId % state.mortals.length];
  const nextGeneration = state.lineage.generation + 1;
  const traitRoll = pickInheritedTrait(state, state.rngState);
  const nameRoll = createDescendantName(traitRoll.rngState, nextGeneration);
  const descendant = {
    id: `mortal-${state.nextEventId}`,
    name: nameRoll.value,
    trait: traitRoll.value,
    generation: nextGeneration,
    parentId: parent?.id ?? null
  };

  const withDescendant = {
    ...state,
    rngState: nameRoll.rngState,
    mortals: [descendant, ...state.mortals].slice(0, 24),
    lineage: {
      ...state.lineage,
      generation: nextGeneration
    }
  };

  return appendHistoryMarker(
    withDescendant,
    nowMs,
    "prophet_lineage",
    `${descendant.name} inherited a ${descendant.trait} temperament from older bloodlines.`,
    {}
  );
}

function createPantheonName(rngState: number): RandomPick<string> {
  const a = pickOne(rngState, PANTHEON_NAME_PREFIXES);
  const b = pickOne(a.rngState, PANTHEON_NAME_SUFFIXES);
  return {
    rngState: b.rngState,
    value: `${a.value}, ${b.value}`
  };
}

function pickPantheonDomains(state: GameState, rngState: number): RandomPick<DomainId[]> {
  const domains = state.domains.map((domain) => domain.id);
  const picked: DomainId[] = [];
  let nextState = rngState;

  while (picked.length < PANTHEON_ALLY_COUNT && domains.length > 0) {
    const roll = nextRandom(nextState);
    nextState = roll.rngState;
    const index = Math.min(domains.length - 1, Math.floor(roll.value * domains.length));
    const [chosen] = domains.splice(index, 1);
    if (chosen) picked.push(chosen);
  }

  return {
    rngState: nextState,
    value: picked
  };
}

function withPoisonWindowsAdvanced(state: GameState): GameState {
  const nextPoisonRuns = {
    ...state.prestige.pantheon.domainPoisonRuns
  };

  for (const domain of state.domains) {
    const current = nextPoisonRuns[domain.id] ?? 0;
    nextPoisonRuns[domain.id] = Math.max(0, current - 1);
  }

  return {
    ...state,
    prestige: {
      ...state.prestige,
      pantheon: {
        ...state.prestige.pantheon,
        domainPoisonRuns: nextPoisonRuns
      }
    }
  };
}

function withPendingPoisonApplied(state: GameState): GameState {
  if (state.pantheon.pendingPoisonDomains.length <= 0) return state;

  const nextPoisonRuns = {
    ...state.prestige.pantheon.domainPoisonRuns
  };
  for (const domainId of state.pantheon.pendingPoisonDomains) {
    nextPoisonRuns[domainId] = Math.max(nextPoisonRuns[domainId] ?? 0, PANTHEON_DOMAIN_POISON_RUNS);
  }

  return {
    ...state,
    prestige: {
      ...state.prestige,
      pantheon: {
        ...state.prestige.pantheon,
        domainPoisonRuns: nextPoisonRuns
      }
    }
  };
}

export function shouldInitializePantheon(state: GameState): boolean {
  if (!isPantheonUnlocked(state)) return false;
  return state.pantheon.allies.length <= 0;
}

export function ensurePantheonInitialized(state: GameState, nowMs: number): GameState {
  if (!shouldInitializePantheon(state)) return state;

  const domainPick = pickPantheonDomains(state, state.rngState);
  let rngState = domainPick.rngState;
  const allies: PantheonAlly[] = [];
  let nextAllyId = state.pantheon.nextAllyId;

  for (const domain of domainPick.value) {
    const nameRoll = createPantheonName(rngState);
    rngState = nameRoll.rngState;
    allies.push({
      id: `ally-${nextAllyId}`,
      name: nameRoll.value,
      domain,
      disposition: "neutral",
      joinedAt: nowMs,
      betrayedAt: null
    });
    nextAllyId += 1;
  }

  const initialized = {
    ...state,
    rngState,
    pantheon: {
      ...state.pantheon,
      unlocked: true,
      allies,
      activeAllyId: null,
      nextAllyId
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(
    initialized,
    nowMs,
    "pantheonArrival",
    "Other forgotten gods have crossed into your silence."
  );
}

export function ensureGhostInitialized(state: GameState, nowMs: number): GameState {
  const initializedGhost = initializeGhostForRun(state.ghost, state.meta.runId, state.rngState);
  if (initializedGhost === state.ghost) return state;

  const withGhost = {
    ...state,
    ghost: initializedGhost,
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  if (initializedGhost.activeInfluences.length <= 0) {
    return withGhost;
  }

  const lead = initializedGhost.activeInfluences[0];
  return appendOmen(
    withGhost,
    nowMs,
    "ghostEcho",
    `${lead.title} now presses against this run's doctrine.`
  );
}

export function exportGhostSignatures(state: GameState): string {
  return createGhostSignatureBundle(state.ghost);
}

export function performImportGhostSignatures(
  state: GameState,
  rawText: string,
  nowMs: number
): ImportGhostSignaturesResult {
  const parsed = parseGhostSignatureBundle(rawText);
  if (parsed.length <= 0) {
    return {
      state,
      importedCount: 0,
      error: "No valid signatures found in file."
    };
  }

  const merged = mergeImportedGhostSignatures(state.ghost, parsed);
  if (merged.importedCount <= 0) {
    return {
      state,
      importedCount: 0,
      error: "All provided signatures were already known."
    };
  }

  const refreshedGhost = initializeGhostForRun(
    {
      ...merged.ghost,
      lastRunIdInitialized: null
    },
    state.meta.runId,
    state.rngState
  );

  const withImport = {
    ...state,
    ghost: refreshedGhost,
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const withOmen = appendOmen(
    withImport,
    nowMs,
    "ghostEcho",
    `${merged.importedCount} foreign signatures now bleed into this world.`
  );

  return {
    state: withOmen,
    importedCount: merged.importedCount,
    error: null
  };
}

function resolveActivityAfterAction(activity: ActivityState, nowMs: number): ActivityState {
  return {
    ...activity,
    lastEventAt: nowMs,
    cadencePromptActive: false,
    lastCadencePromptAt: activity.cadencePromptActive ? nowMs : activity.lastCadencePromptAt
  };
}

function withPeakFollowers(state: GameState, followers: number): GameState {
  const peakFollowers = Math.max(state.cataclysm.peakFollowers, followers);
  const peakFollowersEver = Math.max(state.prestige.remembrance.peakFollowersEver, peakFollowers);
  if (
    peakFollowers === state.cataclysm.peakFollowers &&
    peakFollowersEver === state.prestige.remembrance.peakFollowersEver
  ) {
    return state;
  }
  return {
    ...state,
    cataclysm: {
      ...state.cataclysm,
      peakFollowers
    },
    prestige: {
      ...state.prestige,
      remembrance: {
        ...state.prestige.remembrance,
        peakFollowersEver
      }
    }
  };
}

function createOmen(
  state: GameState,
  kind: OmenKind,
  nowMs: number,
  detail: string | undefined,
  rngSeed: number
): { text: string; rngState: number } {
  const mortal = state.mortals[state.nextEventId % state.mortals.length];
  const anchor = nowMs % 2 === 0 ? "before dawn" : "at moonrise";

  const whisperStarts = [
    `${mortal.name} woke ${anchor} with ash on their palms.`,
    "A bell in the east rang once, though no hand touched it.",
    "In the river quarter, dogs knelt and would not bark.",
    "A wind crossed the fields without bending the grain.",
    "A shrine keeper found the altar warm long before sunrise.",
    "Fishermen on the blackwater heard chanting under the tide.",
    "A widow in the hill district whispered to an empty doorway.",
    "Two travelers argued over a dream they both remembered."
  ] as const;

  const whisperMiddles = [
    "They spoke softly of a name they could not hold.",
    "Three candles burned blue and no one dared breathe.",
    "An elder swore the night carried a second heartbeat.",
    "The shrine stones warmed as if morning had arrived early.",
    "No priest claimed credit for the sign.",
    "The children stopped laughing and listened to the rafters.",
    "Old doubters looked away and called it weather.",
    "No one agreed what was heard, only that it was real."
  ] as const;

  const recruitStarts = [
    "You nudged a crowd at the edge of the market and they lingered.",
    "A rumor crossed the district faster than the watch could deny it.",
    "At dusk, one testimony became many.",
    "A quiet procession formed where no banners flew.",
    "In the southern quarter, strangers repeated the same forbidden phrase."
  ] as const;

  const recruitEndings = [
    "More listeners stepped forward before the hourglass emptied.",
    "A cluster of families offered names without being asked.",
    "The skeptical did not convert, but they stopped interrupting.",
    "By nightfall, the circle around your sign had widened.",
    "No decree stopped the murmurs from multiplying."
  ] as const;

  const domainStarts = [
    `The constellation of ${detail} shifted by a single star.`,
    `Scribes in the lower ward redrew the sign of ${detail}.`,
    `A traveler claimed ${detail} answered from inside the fog.`,
    `${detail} flared over the old ridge in a color no one named.`,
    `A brazier split its own flame into the pattern of ${detail}.`,
    `Priests of rival houses argued over the omen of ${detail}.`,
    `A mural cracked in the exact shape of ${detail}.`,
    `At dusk, the square fell silent beneath the mark of ${detail}.`
  ] as const;

  const domainEndings = [
    "The faithful marked this change in charcoal and bone.",
    "No clerk could explain why the symbol refused to fade.",
    "By dawn, even skeptics kept their windows closed.",
    "The temples counted this among signs too costly to ignore.",
    "Old prayers were rewritten before the wax had cooled.",
    "No witness told the same story twice.",
    "The city called it coincidence and kept looking upward."
  ] as const;

  const domainLevelStarts = [
    `${detail} settled deeper into mortal thought.`,
    `The sign of ${detail} was spoken with a steadier voice.`,
    `${detail} ceased to feel like rumor and felt like law.`,
    `The rite of ${detail} returned with sharper edges.`
  ] as const;

  const domainLevelEndings = [
    "This was no passing omen; it changed what people expected of tomorrow.",
    "From that night on, the faithful answered faster and doubted less.",
    "Those who had laughed before now brought offerings in silence.",
    "The change held through morning, then through another."
  ] as const;

  const prophetStarts = [
    `${mortal.name} refused sleep and spoke until sunrise.`,
    "A listener in torn linen stood on a roof and did not tremble.",
    "The market square fell quiet when one voice refused to break.",
    "At the drowned gate, a witness repeated your omen without faltering.",
    "A former skeptic lit a lantern and called the crowd by name.",
    "At the eastern bridge, one voice carried farther than bells.",
    "A mason laid down his tools and began to preach.",
    "A caravan halted to hear a stranger recite forbidden lines."
  ] as const;

  const cultStarts = [
    "Stone by stone, a hidden circle was raised outside the city line.",
    "Seven families tied threads to the same iron tree.",
    "Torches gathered on a hill where maps show nothing.",
    "A cellar of strangers agreed on one forbidden prayer.",
    "In the old quarter, masks were traded for names of devotion.",
    "A shrine appeared between sunset and curfew without witnesses.",
    "Farmers left grain at a ruin no tax collector records.",
    "At riverbend, initiates traced your sign into wet clay."
  ] as const;

  const actStarts = [
    `A ${detail?.toLowerCase() ?? "rite"} began in secret chambers below the city.`,
    `Under shuttered roofs, the faithful prepared a ${detail?.toLowerCase() ?? "rite"} by candlelight.`,
    `Before dawn, wardens opened the stones for a ${detail?.toLowerCase() ?? "rite"}.`,
    `At the edge of the market, priests marked circles for a ${detail?.toLowerCase() ?? "rite"}.`,
    `In the salt quarter, a ${detail?.toLowerCase() ?? "rite"} started without proclamation.`
  ] as const;

  const followerRiteStarts = [
    "Caravans turned toward your shrines without summons.",
    "Processions crossed district lines by torchlight and did not turn back.",
    "Door by door, your sign was offered and taken.",
    "The old roads filled with pilgrims who spoke your silence aloud.",
    "At first bell, the squares were already crowded with listeners."
  ] as const;

  const suppressStarts = [
    "You bent rival doctrine until it cracked.",
    "A splinter faith was silenced before it found a second voice.",
    "Their emissaries vanished from the square before midnight.",
    "The rival sign dimmed and the crowd turned away.",
    "Their shrine smoke thinned, then failed."
  ] as const;

  const eraOneToTwoStarts = [
    "The first veil gave way, and mortals named your silence a doctrine.",
    "A line was crossed in the minds of the faithful; whispers became law.",
    "Your shadow lengthened over the settlements and no one called it rumor anymore."
  ] as const;

  const eraTwoToThreeStarts = [
    "Doctrine hardened into force, and the world began to answer with consequence.",
    "The second veil split; prayer became intervention.",
    "Rites became miracles in waiting, and even kings spoke softly at dusk."
  ] as const;

  const miracleStarts = [
    "A sky of iron opened and the faithful fell to their knees.",
    "The river ran backward for a breath and every witness remembered your mark.",
    "A storm arrived without clouds and spoke in your cadence.",
    "Fields blazed with unnatural light, then yielded in silence.",
    "The old temples shuddered as your will crossed the veil."
  ] as const;

  const civCollapseStarts = [
    "The cities broke under the strain of your intervention.",
    "Civil order gave way to hunger and ash in a single week.",
    "Markets emptied, bells failed, and the roads went dark.",
    "The chronicles call this season The Breaking.",
    "No decree held; the civilization collapsed into scattered camps."
  ] as const;

  const veilCollapseStarts = [
    "The Veil split and mortal minds recoiled from your nearness.",
    "Too much of you touched the world at once, and it cracked.",
    "Prophets went silent as the Veil tore around them.",
    "Reality trembled; your name nearly bled through in full.",
    "The boundary failed for a heartbeat, and faith paid the cost."
  ] as const;

  const echoTreeStarts = [
    "An old memory hardened into a permanent law of your faith.",
    "Echoes arranged themselves into a pattern the faithful could keep.",
    "A previous cycle whispered instructions into this one.",
    "The architecture of belief accepted your revision.",
    "Fragments of forgotten runs fused into doctrine."
  ] as const;

  const ascensionStarts = [
    "The world unraveled and your name survived as an echo.",
    "You stepped beyond the broken age and returned to darkness reborn.",
    "Reality reset around you, but memory did not fully fade.",
    "The cycle closed and opened again under a changed sky.",
    "You relinquished the world and carried only distilled remembrance."
  ] as const;

  const pantheonArrivalStarts = [
    "A second silence answered yours from beyond the Veil.",
    "Forgotten names stirred at the edge of your domain.",
    "Other abandoned gods noticed your return and stepped closer.",
    "Three alien constellations appeared where none belonged."
  ] as const;

  const pantheonAllianceStarts = [
    "A pact was etched in dream-ink between your altar and another.",
    "Two forgotten wills aligned and the faithful felt the strain.",
    "Your doctrine braided with a rival divinity for shared reach.",
    "An alliance formed in secret and mortals paid its tithe."
  ] as const;

  const pantheonBetrayalStarts = [
    "You broke faith with an allied god and drank the fallout.",
    "A divine oath snapped, and the world heard it like thunder.",
    "You chose betrayal over balance and power rushed in.",
    "Their name curdled in the hymns the moment you turned."
  ] as const;

  const ghostEchoStarts = [
    "A foreign memory crossed your Veil and settled in the margins.",
    "A doctrine not born in this world surfaced in your omens.",
    "Another god's forgotten cadence stained your current age.",
    "An imported echo altered the rhythm of belief."
  ] as const;

  if (kind === "whisper") {
    const a = pickOne(rngSeed, whisperStarts);
    const b = pickOne(a.rngState, whisperMiddles);
    const suffix = detail ? ` ${detail}` : "";
    return {
      rngState: b.rngState,
      text: `${a.value} ${b.value} By morning, ${getFollowerDescriptor(state.resources.followers + WHISPER_FOLLOWER_GAIN)}.${suffix}`
    };
  }

  if (kind === "recruit") {
    const a = pickOne(rngSeed, recruitStarts);
    const b = pickOne(a.rngState, recruitEndings);
    const suffix = detail ? ` ${detail}` : "";
    return {
      rngState: b.rngState,
      text: `${a.value} ${b.value}${suffix}`
    };
  }

  if (kind === "domain") {
    const a = pickOne(rngSeed, domainStarts);
    const b = pickOne(a.rngState, domainEndings);
    return {
      rngState: b.rngState,
      text: `${a.value} ${b.value}`
    };
  }

  if (kind === "domainLevel") {
    const a = pickOne(rngSeed, domainLevelStarts);
    const b = pickOne(a.rngState, domainLevelEndings);
    return {
      rngState: b.rngState,
      text: `${a.value} ${b.value}`
    };
  }

  if (kind === "prophet") {
    const a = pickOne(rngSeed, prophetStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} A prophet was named, and the crowd answered in one breath.`
    };
  }

  if (kind === "act") {
    const a = pickOne(rngSeed, actStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} The doctrine tightened around a single intention.`
    };
  }

  if (kind === "followerRite") {
    const a = pickOne(rngSeed, followerRiteStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? "The faithful arrived in numbers that no clerk could count twice."}`
    };
  }

  if (kind === "suppress") {
    const a = pickOne(rngSeed, suppressStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} Followers kept their places and did not scatter.`
    };
  }

  if (kind === "miracle") {
    const a = pickOne(rngSeed, miracleStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? "The mortal world was altered."}`
    };
  }

  if (kind === "civCollapse") {
    const a = pickOne(rngSeed, civCollapseStarts);
    return {
      rngState: a.rngState,
      text: `${a.value}`
    };
  }

  if (kind === "veilCollapse") {
    const a = pickOne(rngSeed, veilCollapseStarts);
    return {
      rngState: a.rngState,
      text: `${a.value}`
    };
  }

  if (kind === "echoTree") {
    const a = pickOne(rngSeed, echoTreeStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? ""}`.trim()
    };
  }

  if (kind === "ascension") {
    const a = pickOne(rngSeed, ascensionStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? ""}`.trim()
    };
  }

  if (kind === "pantheonArrival") {
    const a = pickOne(rngSeed, pantheonArrivalStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? ""}`.trim()
    };
  }

  if (kind === "pantheonAlliance") {
    const a = pickOne(rngSeed, pantheonAllianceStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? ""}`.trim()
    };
  }

  if (kind === "pantheonBetrayal") {
    const a = pickOne(rngSeed, pantheonBetrayalStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? ""}`.trim()
    };
  }

  if (kind === "ghostEcho") {
    const a = pickOne(rngSeed, ghostEchoStarts);
    return {
      rngState: a.rngState,
      text: `${a.value} ${detail ?? ""}`.trim()
    };
  }

  if (kind === "devotion") {
    return {
      rngState: rngSeed,
      text: (detail ?? DEVOTION_OMEN_FIRST_STACK).trim()
    };
  }

  if (kind === "eraOneToTwo") {
    const a = pickOne(rngSeed, eraOneToTwoStarts);
    return {
      rngState: a.rngState,
      text: `${a.value}`
    };
  }

  if (kind === "eraTwoToThree") {
    const a = pickOne(rngSeed, eraTwoToThreeStarts);
    return {
      rngState: a.rngState,
      text: `${a.value}`
    };
  }

  const a = pickOne(rngSeed, cultStarts);
  return {
    rngState: a.rngState,
    text: `${a.value} A cult took shape where no law could reach.`
  };
}

function appendOmen(state: GameState, nowMs: number, kind: OmenKind, detail?: string): GameState {
  const lastOmenAt = state.omenLog[0]?.at ?? 0;
  const msSinceLastOmen = Math.max(0, nowMs - lastOmenAt);
  let rngState = state.rngState;

  if (!isMajorOmenKind(kind)) {
    const cooldownMs = getMinorOmenCooldownMs(kind);
    if (msSinceLastOmen < cooldownMs) {
      return state;
    }
    const roll = nextRandom(rngState);
    rngState = roll.rngState;
    if (roll.value > getMinorOmenChance(kind)) {
      return {
        ...state,
        rngState
      };
    }
  }

  const recentTexts = new Set(state.omenLog.slice(0, 8).map((entry) => entry.text));
  const recentFingerprints = new Set(
    state.omenLog.slice(0, 8).map((entry) => toOmenFingerprint(entry.text))
  );
  let chosen = createOmen(state, kind, nowMs, detail, rngState);
  rngState = chosen.rngState;
  let chosenFingerprint = toOmenFingerprint(chosen.text);

  for (let i = 0; i < 8; i += 1) {
    if (!recentTexts.has(chosen.text) && !recentFingerprints.has(chosenFingerprint)) break;
    const retry = createOmen(state, kind, nowMs, detail, rngState);
    rngState = retry.rngState;
    chosen = retry;
    chosenFingerprint = toOmenFingerprint(chosen.text);
  }

  if (recentTexts.has(chosen.text) || recentFingerprints.has(chosenFingerprint)) {
    return {
      ...state,
      rngState
    };
  }

  return {
    ...state,
    rngState,
    omenLog: [
      {
        id: `evt-${state.nextEventId}`,
        at: nowMs,
        text: chosen.text
      },
      ...state.omenLog
    ].slice(0, 140),
    nextEventId: state.nextEventId + 1
  };
}

export function canWhisper(state: GameState, nowMs: number, costOverride?: number): boolean {
  const targetCost = costOverride ?? getWhisperCost(state, nowMs);
  return state.resources.influence >= targetCost;
}

export function performWhisper(state: GameState, nowMs: number, costOverride?: number): GameState {
  const normalizedCycle = normalizeWhisperCycle(state.activity, nowMs);
  const cost = costOverride ?? getWhisperCost(state, nowMs);
  if (state.resources.influence < cost) return state;

  const cadence = getCadenceBonus(state);
  const lineageFactors = getLineageConversionFactors(state);
  const baseFollowerGain = WHISPER_FOLLOWER_GAIN + cadence.followerBonus;
  const followerGain = Math.max(1, Math.floor(baseFollowerGain * lineageFactors.totalModifier));
  const beliefGain = WHISPER_BELIEF_GAIN + cadence.beliefBonus;
  const withWhisper = {
    ...state,
    resources: {
      ...state.resources,
      influence: state.resources.influence - cost,
      belief: state.resources.belief + beliefGain,
      followers: state.resources.followers + followerGain
    },
    activity: resolveActivityAfterAction(
      {
        ...state.activity,
        whisperWindowStartedAt: normalizedCycle.whisperWindowStartedAt,
        whispersInWindow: normalizedCycle.whispersInWindow + 1
      },
      nowMs
    ),
    stats: {
      ...state.stats,
      totalBeliefEarned: state.stats.totalBeliefEarned + beliefGain
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const devotionUpdate = withDevotionIncrementFromQualifyingAction(withWhisper);
  const withRecoveredLineage = applyLineageDelta(devotionUpdate.state, {
    trustDebt: -LINEAGE_ACTION_RECOVERY_WHISPER,
    skepticism: -LINEAGE_ACTION_RECOVERY_WHISPER * 0.25
  });
  const withDevotionMilestones = appendDevotionMilestoneOmens(
    withRecoveredLineage,
    nowMs,
    devotionUpdate.previousStacks,
    devotionUpdate.nextStacks
  );
  const withDevotionPath = withDevotionMomentumDelta(
    withDevotionMilestones,
    nowMs,
    withDevotionMilestones.era >= 3 ? { ardour: 1 } : {}
  );
  const flavor = getConversionFlavorText(state, lineageFactors.totalModifier);
  const detail = [
    `${followerGain} new listeners held the whisper through the next bell.`,
    flavor
  ]
    .filter((entry): entry is string => Boolean(entry))
    .join(" ");
  return appendOmen(
    withPeakFollowers(withDevotionPath, withDevotionPath.resources.followers),
    nowMs,
    "whisper",
    detail
  );
}

export function canRecruit(state: GameState): boolean {
  return state.resources.influence >= RECRUIT_INFLUENCE_COST;
}

export function performRecruit(state: GameState, nowMs: number): GameState {
  if (!canRecruit(state)) return state;

  const recruitBase = getRecruitFollowerGainBase(state);
  const devotionMultiplier = getDevotionRecruitMultiplier(state);
  const recruitRandom = nextRandom(state.rngState);
  const randomFollowerBonus = Math.floor(recruitRandom.value * (RECRUIT_RANDOM_FOLLOWER_MAX + 1));
  const cadence = getCadenceBonus(state);
  const lineageFactors = getLineageConversionFactors(state);
  const rawFollowerGain =
    (recruitBase + randomFollowerBonus + cadence.followerBonus) * devotionMultiplier;
  const followerGain = Math.max(1, Math.floor(rawFollowerGain * lineageFactors.totalModifier));
  const beliefGain = cadence.beliefBonus;

  const withRecruit = {
    ...state,
    rngState: recruitRandom.rngState,
    resources: {
      ...state.resources,
      influence: state.resources.influence - RECRUIT_INFLUENCE_COST,
      followers: state.resources.followers + followerGain,
      belief: state.resources.belief + beliefGain
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    stats: {
      ...state.stats,
      totalBeliefEarned: state.stats.totalBeliefEarned + beliefGain
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const devotionUpdate = withDevotionIncrementFromQualifyingAction(withRecruit);
  const withRecoveredLineage = applyLineageDelta(devotionUpdate.state, {
    trustDebt: -LINEAGE_ACTION_RECOVERY_RECRUIT,
    skepticism: -LINEAGE_ACTION_RECOVERY_RECRUIT * 0.35
  });
  const withDevotionMilestones = appendDevotionMilestoneOmens(
    withRecoveredLineage,
    nowMs,
    devotionUpdate.previousStacks,
    devotionUpdate.nextStacks
  );
  const withDevotionPath = withDevotionMomentumDelta(
    withDevotionMilestones,
    nowMs,
    withDevotionMilestones.era >= 3 ? { ardour: 1 } : {}
  );
  const flavor = getConversionFlavorText(state, lineageFactors.totalModifier);
  const detail = [
    `${followerGain} followers answered before the watch changed shifts.`,
    flavor
  ]
    .filter((entry): entry is string => Boolean(entry))
    .join(" ");
  return appendOmen(
    withPeakFollowers(withDevotionPath, withDevotionPath.resources.followers),
    nowMs,
    "recruit",
    detail
  );
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
  const leveledUp = nextXp >= xpNeeded;
  if (leveledUp) {
    nextXp -= xpNeeded;
    nextLevel += 1;
  }

  const nextDomains = [...state.domains];
  nextDomains[domainIndex] = {
    ...domain,
    level: nextLevel,
    xp: nextXp
  };
  const nextMatchingPairs = getMatchingDomainPairs({
    ...state,
    domains: nextDomains
  });
  const previousSynergy = getDomainSynergy(state);
  const nextSynergy = getDomainSynergy({
    ...state,
    domains: nextDomains,
    matchingDomainPairs: nextMatchingPairs
  });

  const withInvestment = {
    ...state,
    domains: nextDomains,
    matchingDomainPairs: nextMatchingPairs,
    resources: {
      ...state.resources,
      belief: state.resources.belief - cost
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  if (nextMatchingPairs !== state.matchingDomainPairs) {
    return appendOmen(
      withInvestment,
      nowMs,
      "domainLevel",
      `Synergy shifted from x${previousSynergy.toFixed(2)} to x${nextSynergy.toFixed(2)}.`
    );
  }

  if (leveledUp) {
    return appendOmen(withInvestment, nowMs, "domainLevel", DOMAIN_LABELS[domainId]);
  }

  const ambientRoll = rollChance(withInvestment.rngState, 0.35);
  const withRolledRng = {
    ...withInvestment,
    rngState: ambientRoll.rngState
  };

  if (ambientRoll.value) {
    return appendOmen(withRolledRng, nowMs, "domain", DOMAIN_LABELS[domainId]);
  }

  return withRolledRng;
}

export function performDomainInvestments(
  state: GameState,
  domainId: DomainId,
  requestedInvestments: number,
  nowMs: number
): GameState {
  const domainIndex = state.domains.findIndex((item) => item.id === domainId);
  if (domainIndex < 0) return state;

  const normalizedTarget = Number.isFinite(requestedInvestments)
    ? Math.max(0, Math.floor(requestedInvestments))
    : Number.POSITIVE_INFINITY;
  if (normalizedTarget <= 0) return state;
  if (normalizedTarget === 1) return performDomainInvestment(state, domainId, nowMs);

  const domain = state.domains[domainIndex];
  const simulation = simulateDomainInvestments(domain, state.resources.belief, normalizedTarget);
  if (simulation.investments <= 0) return state;

  const nextDomains = [...state.domains];
  nextDomains[domainIndex] = simulation.resultingDomain;

  const nextMatchingPairs = getMatchingDomainPairs({
    ...state,
    domains: nextDomains
  });
  const previousSynergy = getDomainSynergy(state);
  const nextSynergy = getDomainSynergy({
    ...state,
    domains: nextDomains,
    matchingDomainPairs: nextMatchingPairs
  });

  const withInvestment = {
    ...state,
    domains: nextDomains,
    matchingDomainPairs: nextMatchingPairs,
    resources: {
      ...state.resources,
      belief: state.resources.belief - simulation.totalCost
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  if (nextMatchingPairs !== state.matchingDomainPairs) {
    return appendOmen(
      withInvestment,
      nowMs,
      "domainLevel",
      `Synergy shifted from x${previousSynergy.toFixed(2)} to x${nextSynergy.toFixed(2)}.`
    );
  }

  if (simulation.levelsGained > 0) {
    return appendOmen(
      withInvestment,
      nowMs,
      "domainLevel",
      `${DOMAIN_LABELS[domainId]} deepened by ${simulation.levelsGained} tier(s) across ${simulation.investments} investments.`
    );
  }

  return appendOmen(
    withInvestment,
    nowMs,
    "domain",
    `${simulation.investments} investments settled into ${DOMAIN_LABELS[domainId]}.`
  );
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
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const devotionUpdate = withDevotionIncrementFromQualifyingAction(withProphet);
  const withDevotionMilestones = appendDevotionMilestoneOmens(
    devotionUpdate.state,
    nowMs,
    devotionUpdate.previousStacks,
    devotionUpdate.nextStacks
  );
  const withDevotionPath = withDevotionMomentumDelta(
    withDevotionMilestones,
    nowMs,
    withDevotionMilestones.era >= 3 ? { ardour: 1 } : {}
  );
  const withDescendant = addLineageDescendant(withDevotionPath, nowMs);
  return appendOmen(withDescendant, nowMs, "prophet");
}

export function canFormCult(state: GameState): boolean {
  if (state.era < 2) return false;
  return state.resources.belief >= getCultFormationCost(state);
}

export function performCultFormation(state: GameState, nowMs: number): GameState {
  if (state.era < 2) return state;
  const cost = getCultFormationCost(state);
  if (state.resources.belief < cost) return state;
  const synergy = getDomainSynergy(state);

  const withCult = {
    ...state,
    cults: state.cults + 1,
    resources: {
      ...state.resources,
      belief: state.resources.belief - cost
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };
  const withDevotionPath = withDevotionMomentumDelta(withCult, nowMs, { accord: 2 });

  return appendOmen(withDevotionPath, nowMs, "cult", `Current domain synergy rests at x${synergy.toFixed(2)}.`);
}

export function getActSlotCap(state: GameState): number {
  return Math.max(1, state.cults);
}

export function canStartAct(state: GameState, type: ActType): boolean {
  if (state.era < 2) return false;
  if (state.cults <= 0) return false;
  if (state.doctrine.activeActs.length >= getActSlotCap(state)) return false;
  return state.resources.influence >= getActCost(state, type);
}

export function performStartAct(state: GameState, type: ActType, nowMs: number): GameState {
  if (!canStartAct(state, type)) return state;

  const cost = getActCost(state, type);
  const durationSeconds = getActDurationSeconds(type);
  const baseMultiplier = getActBaseMultiplier(type);

  const withAct = {
    ...state,
    resources: {
      ...state.resources,
      influence: state.resources.influence - cost
    },
    doctrine: {
      ...state.doctrine,
      activeActs: [
        ...state.doctrine.activeActs,
        {
          id: `act-${state.doctrine.nextActId}`,
          type,
          startedAt: nowMs,
          endsAt: nowMs + durationSeconds * 1000,
          durationSeconds,
          baseMultiplier,
          cost
        }
      ],
      nextActId: state.doctrine.nextActId + 1
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const withLineageRecovery = applyLineageDelta(withAct, {
    trustDebt: -LINEAGE_ACTION_RECOVERY_ACT,
    skepticism: -LINEAGE_ACTION_RECOVERY_ACT * 0.25
  });
  const withDevotionPath = withDevotionMomentumDelta(withLineageRecovery, nowMs, { fervour: 2 });
  return appendOmen(withDevotionPath, nowMs, "act", ACT_LABELS[type]);
}

export function canPerformFollowerRite(state: GameState, type: FollowerRiteType): boolean {
  if (state.era < 3) return false;
  if (state.cults <= 0) return false;
  if (state.cataclysm.civilizationCollapsed) return false;
  const cost = getFollowerRiteCost(state, type);
  return (
    state.resources.influence >= cost.influenceCost && state.resources.belief >= cost.beliefCost
  );
}

export function performFollowerRite(
  state: GameState,
  type: FollowerRiteType,
  nowMs: number
): GameState {
  if (!canPerformFollowerRite(state, type)) return state;

  const cost = getFollowerRiteCost(state, type);
  const followerGain = getFollowerRiteFollowerGain(state, type, nowMs);
  const nextUses = Math.max(0, state.doctrine.followerRitesUsed?.[type] ?? 0) + 1;

  const withRite = {
    ...state,
    resources: {
      ...state.resources,
      influence: state.resources.influence - cost.influenceCost,
      belief: state.resources.belief - cost.beliefCost,
      followers: state.resources.followers + followerGain
    },
    doctrine: {
      ...state.doctrine,
      followerRitesUsed: {
        ...(state.doctrine.followerRitesUsed ?? { procession: 0, convergence: 0 }),
        [type]: nextUses
      }
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const withLineageRecovery = applyLineageDelta(withRite, {
    trustDebt: -LINEAGE_ACTION_RECOVERY_ACT * 1.4,
    skepticism: -LINEAGE_ACTION_RECOVERY_ACT * 0.4
  });
  const withDevotionPath = withDevotionMomentumDelta(withLineageRecovery, nowMs, { accord: 1 });

  const detail = `${FOLLOWER_RITE_LABELS[type]} gathered ${followerGain} followers. Uses this run: ${nextUses}.`;
  return appendOmen(
    withPeakFollowers(withDevotionPath, withDevotionPath.resources.followers),
    nowMs,
    "followerRite",
    detail
  );
}

export function canSuppressRival(state: GameState): boolean {
  if (state.era < 2) return false;
  if (state.doctrine.rivals.length <= 0) return false;
  return state.resources.influence >= RIVAL_SUPPRESS_INFLUENCE_COST;
}

export function performSuppressRival(state: GameState, nowMs: number): GameState {
  if (!canSuppressRival(state)) return state;

  let strongestIndex = 0;
  for (let i = 1; i < state.doctrine.rivals.length; i += 1) {
    if (state.doctrine.rivals[i].strength > state.doctrine.rivals[strongestIndex].strength) {
      strongestIndex = i;
    }
  }

  const nextRivals = state.doctrine.rivals.filter((_, index) => index !== strongestIndex);

  const withSuppressedRival = {
    ...state,
    resources: {
      ...state.resources,
      influence: state.resources.influence - RIVAL_SUPPRESS_INFLUENCE_COST
    },
    doctrine: {
      ...state.doctrine,
      rivals: nextRivals,
      survivedRivalEvent: true
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const withLineageMarker = appendHistoryMarker(
    withSuppressedRival,
    nowMs,
    "rival_suppressed",
    "Word spread that you silenced a rival creed; old trust did not return unchanged.",
    {
      trustDebt: LINEAGE_SUPPRESS_TRUST_DEBT,
      skepticism: LINEAGE_SUPPRESS_SKEPTICISM,
      betrayalScars: 1
    }
  );

  const withDevotionPath = withDevotionMomentumDelta(
    withLineageMarker,
    nowMs,
    withLineageMarker.era >= 3 ? { reverence: 2 } : {}
  );
  return appendOmen(withDevotionPath, nowMs, "suppress");
}

export function canCastMiracle(state: GameState, tier: MiracleTier): boolean {
  if (state.era < 3) return false;
  if (tier < 1 || tier > 4) return false;
  if (state.cataclysm.civilizationCollapsed) return false;
  return state.resources.influence + state.cataclysm.miracleReserve >= getMiracleInfluenceCost(tier);
}

export function performCastMiracle(state: GameState, tier: MiracleTier, nowMs: number): GameState {
  if (!canCastMiracle(state, tier)) return state;

  const influenceCost = getMiracleInfluenceCost(tier);
  const availablePower = state.resources.influence + state.cataclysm.miracleReserve;
  if (availablePower < influenceCost) return state;

  let remainingCost = influenceCost;
  const influenceSpent = Math.min(state.resources.influence, remainingCost);
  remainingCost -= influenceSpent;
  const reserveSpent = Math.min(state.cataclysm.miracleReserve, remainingCost);
  remainingCost -= reserveSpent;
  if (remainingCost > 0) return state;

  const miracleReserveCap = getMiracleReserveCap(state);
  const beliefGain = getMiracleBeliefGain(state, tier);
  const veilCost = getMiracleVeilCost(state, tier);
  const civDamage = getMiracleCivDamage(tier);
  const nextCivHealth = Math.max(0, state.cataclysm.civilizationHealth - civDamage);
  const peakBefore = Math.max(state.cataclysm.peakFollowers, state.resources.followers);
  const civilizationCollapsed = nextCivHealth <= 0;
  const rebuildSeconds = civilizationCollapsed ? getCivilizationRebuildSeconds(state) : 0;
  const followersAfterCiv = civilizationCollapsed
    ? Math.floor(peakBefore * CIV_COLLAPSE_FOLLOWER_RETENTION)
    : state.resources.followers;

  const withMiracle = {
    ...state,
    resources: {
      ...state.resources,
      belief: state.resources.belief + beliefGain,
      influence: state.resources.influence - influenceSpent,
      veil: Math.max(VEIL_MIN, state.resources.veil - veilCost),
      followers: followersAfterCiv
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    stats: {
      ...state.stats,
      totalBeliefEarned: state.stats.totalBeliefEarned + beliefGain
    },
    cataclysm: {
      ...state.cataclysm,
      miraclesThisRun: state.cataclysm.miraclesThisRun + 1,
      miracleReserve: Math.max(
        0,
        Math.min(miracleReserveCap, state.cataclysm.miracleReserve - reserveSpent)
      ),
      civilizationHealth: nextCivHealth,
      civilizationCollapsed,
      civilizationRebuildEndsAt: civilizationCollapsed
        ? nowMs + rebuildSeconds * 1000
        : state.cataclysm.civilizationRebuildEndsAt,
      civilizationRebuilds: civilizationCollapsed
        ? state.cataclysm.civilizationRebuilds + 1
        : state.cataclysm.civilizationRebuilds,
      peakFollowers: peakBefore
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const withLineageImpact = civilizationCollapsed
    ? appendHistoryMarker(
        withMiracle,
        nowMs,
        "civ_collapse",
        "The civilization broke under your hand, and descendants learned to doubt divine mercy.",
        {
          trustDebt: LINEAGE_CIV_COLLAPSE_TRUST_DEBT,
          skepticism: LINEAGE_CIV_COLLAPSE_SKEPTICISM,
          betrayalScars: 1
        }
      )
    : withMiracle;

  const miracleDetailByTier: Record<MiracleTier, string> = {
    1: `${MIRACLE_NAMES[1]} touched a small district before dawn.`,
    2: `${MIRACLE_NAMES[2]} reordered merchants and magistrates alike.`,
    3: `${MIRACLE_NAMES[3]} forced whole provinces to rewrite their calendars.`,
    4: `${MIRACLE_NAMES[4]} opened an age-defining wound in history.`
  };
  const miracleDetail = miracleDetailByTier[tier];
  const withDevotionPath = withDevotionMomentumDelta(withLineageImpact, nowMs, { fervour: 2 });
  const withMiracleOmen = appendOmen(withDevotionPath, nowMs, "miracle", miracleDetail);
  if (!civilizationCollapsed) return withMiracleOmen;
  return appendOmen(withMiracleOmen, nowMs, "civCollapse");
}

export function canFormPantheonAlliance(state: GameState, allyId: string): boolean {
  if (!isPantheonUnlocked(state)) return false;
  const ally = state.pantheon.allies.find((entry) => entry.id === allyId);
  if (!ally) return false;
  if (ally.disposition === "betrayed") return false;
  if (state.pantheon.activeAllyId === allyId && ally.disposition === "allied") return false;
  return true;
}

export function performFormPantheonAlliance(
  state: GameState,
  allyId: string,
  nowMs: number
): GameState {
  if (!canFormPantheonAlliance(state, allyId)) return state;

  const ally = state.pantheon.allies.find((entry) => entry.id === allyId);
  if (!ally) return state;

  const nextAllies = state.pantheon.allies.map((entry) => {
    if (entry.id === allyId) {
      return {
        ...entry,
        disposition: "allied" as const
      };
    }
    if (entry.disposition === "allied") {
      return {
        ...entry,
        disposition: "neutral" as const
      };
    }
    return entry;
  });

  const withAlliance = {
    ...state,
    pantheon: {
      ...state.pantheon,
      unlocked: true,
      allies: nextAllies,
      activeAllyId: allyId
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(
    withAlliance,
    nowMs,
    "pantheonAlliance",
    `You now share doctrine with ${ally.name} (${DOMAIN_LABELS[ally.domain]}).`
  );
}

export function canBetrayPantheonAlly(state: GameState, allyId?: string): boolean {
  if (!isPantheonUnlocked(state)) return false;
  const targetId = allyId ?? state.pantheon.activeAllyId;
  if (!targetId) return false;
  const ally = state.pantheon.allies.find((entry) => entry.id === targetId);
  if (!ally) return false;
  return ally.disposition === "allied";
}

export function performBetrayPantheonAlly(state: GameState, allyId: string, nowMs: number): GameState {
  if (!canBetrayPantheonAlly(state, allyId)) return state;

  const ally = state.pantheon.allies.find((entry) => entry.id === allyId);
  if (!ally) return state;

  const beliefPerSecond = getBeliefPerSecond(state, nowMs);
  const betrayalBeliefGain = Math.max(
    PANTHEON_BETRAYAL_BELIEF_MIN,
    beliefPerSecond * PANTHEON_BETRAYAL_BELIEF_SECONDS
  );

  const nextAllies = state.pantheon.allies.map((entry) => {
    if (entry.id !== allyId) return entry;
    return {
      ...entry,
      disposition: "betrayed" as const,
      betrayedAt: nowMs
    };
  });

  const pendingPoisonDomains = state.pantheon.pendingPoisonDomains.includes(ally.domain)
    ? state.pantheon.pendingPoisonDomains
    : [...state.pantheon.pendingPoisonDomains, ally.domain];

  const withBetrayal = {
    ...state,
    resources: {
      ...state.resources,
      belief: state.resources.belief + betrayalBeliefGain
    },
    stats: {
      ...state.stats,
      totalBeliefEarned: state.stats.totalBeliefEarned + betrayalBeliefGain
    },
    pantheon: {
      ...state.pantheon,
      unlocked: true,
      allies: nextAllies,
      activeAllyId: state.pantheon.activeAllyId === allyId ? null : state.pantheon.activeAllyId,
      pendingPoisonDomains,
      betrayalsThisRun: state.pantheon.betrayalsThisRun + 1
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const withLineageMarker = appendHistoryMarker(
    withBetrayal,
    nowMs,
    "pantheon_betrayal",
    `You betrayed ${ally.name}; mortals now fear your pacts as temporary bargains.`,
    {
      trustDebt: LINEAGE_PANTHEON_BETRAYAL_TRUST_DEBT,
      skepticism: LINEAGE_PANTHEON_BETRAYAL_SKEPTICISM,
      betrayalScars: 2
    }
  );

  return appendOmen(
    withLineageMarker,
    nowMs,
    "pantheonBetrayal",
    `${ally.name} was cast down, and ${DOMAIN_LABELS[ally.domain]} turned bitter across future cycles.`
  );
}

export function canPurchaseEchoTreeRank(state: GameState, treeId: EchoTreeId): boolean {
  const nextCost = getEchoTreeNextCost(state, treeId);
  if (nextCost === null) return false;
  return state.prestige.echoes >= nextCost;
}

function canEditArchitecture(state: GameState): boolean {
  return state.prestige.completedRuns >= 2;
}

function withArchitectureRevisionOmen(state: GameState, nowMs: number, detail: string): GameState {
  const synced = syncRemembranceState(state).state;
  return appendOmen(synced, nowMs, "echoTree", detail);
}

export function performSetArchitectureBeliefRule(
  state: GameState,
  rule: ArchitectureBeliefRule,
  nowMs: number
): GameState {
  if (!canEditArchitecture(state)) return state;
  if (state.prestige.architecture.beliefRule === rule) return state;

  const revised: GameState = {
    ...state,
    prestige: {
      ...state.prestige,
      architecture: {
        ...state.prestige.architecture,
        beliefRule: rule
      }
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return withArchitectureRevisionOmen(
    revised,
    nowMs,
    "The architecture of belief accepted your revision."
  );
}

export function performSetArchitectureCivilizationRule(
  state: GameState,
  rule: ArchitectureCivilizationRule,
  nowMs: number
): GameState {
  if (!canEditArchitecture(state)) return state;
  if (state.prestige.architecture.civilizationRule === rule) return state;

  const revised: GameState = {
    ...state,
    prestige: {
      ...state.prestige,
      architecture: {
        ...state.prestige.architecture,
        civilizationRule: rule
      }
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return withArchitectureRevisionOmen(
    revised,
    nowMs,
    "Civilization growth now follows your edited law."
  );
}

export function performSetArchitectureDomainRule(
  state: GameState,
  rule: ArchitectureDomainRule,
  nowMs: number
): GameState {
  if (!canEditArchitecture(state)) return state;
  if (state.prestige.architecture.domainRule === rule) return state;

  const revised: GameState = {
    ...state,
    prestige: {
      ...state.prestige,
      architecture: {
        ...state.prestige.architecture,
        domainRule: rule
      }
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return withArchitectureRevisionOmen(
    revised,
    nowMs,
    "Domain semantics bent into a new alignment."
  );
}

export function performPurchaseEchoTreeRank(
  state: GameState,
  treeId: EchoTreeId,
  nowMs: number
): GameState {
  const nextCost = getEchoTreeNextCost(state, treeId);
  if (nextCost === null) return state;
  if (state.prestige.echoes < nextCost) return state;

  const nextRank = Math.min(ECHO_TREE_MAX_RANK, state.prestige.treeRanks[treeId] + 1);
  const nextTreeRanks = {
    ...state.prestige.treeRanks,
    [treeId]: nextRank
  };
  const nextEchoBonuses = getEchoBonusesFromTreeRanks(nextTreeRanks);

  const withUpgrade = {
    ...state,
    prestige: {
      ...state.prestige,
      echoes: state.prestige.echoes - nextCost,
      treeRanks: nextTreeRanks
    },
    echoBonuses: nextEchoBonuses,
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(
    withUpgrade,
    nowMs,
    "echoTree",
    `The ${treeId} branch rooted deeper into this cycle.`
  );
}

export function canAscend(state: GameState): boolean {
  if (state.era !== 3) return false;
  return getUnravelingGateStatus(state).ready;
}

export function canInvokeFinalChoice(state: GameState): boolean {
  if (state.era < 3) return false;
  if (state.prestige.remembrance.finalChoice !== "none") return false;

  const evaluated = evaluateRemembranceLetters(state);
  const merged = mergeRemembranceLetters(state.prestige.remembrance.letters, evaluated);
  return areAllNameLettersUnlocked(merged.letters);
}

export function performInvokeFinalChoice(
  state: GameState,
  choice: Exclude<FinalChoice, "none">,
  nowMs: number
): GameState {
  if (!canInvokeFinalChoice(state)) return state;

  const evaluated = evaluateRemembranceLetters(state);
  const merged = mergeRemembranceLetters(state.prestige.remembrance.letters, evaluated);

  const withChoice: GameState = {
    ...state,
    prestige: {
      ...state.prestige,
      remembrance: {
        ...state.prestige.remembrance,
        letters: merged.letters,
        finalChoice: choice,
        finalChoiceAt: nowMs
      }
    },
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  const synced = syncRemembranceState(withChoice).state;
  return appendOmen(
    synced,
    nowMs,
    "ascension",
    choice === "remember"
      ? "You spoke the full name and the old seal shifted in the dark."
      : "You chose silence again and the world exhaled around the wound."
  );
}

export function performAscension(state: GameState, nowMs: number): GameState {
  if (!canAscend(state)) return state;

  const gainedEchoes = getAscensionEchoGain(state.stats.totalBeliefEarned);
  const dominantDevotionPath = getDominantDevotionPathForMemory(state);
  const capturedSignature = createGhostRunSignature(state, nowMs);
  const ghostWithCapturedRun = appendLocalGhostSignature(state.ghost, capturedSignature);
  const poisonAdvanced = withPoisonWindowsAdvanced(state);
  const poisonApplied = withPendingPoisonApplied(poisonAdvanced);
  const pantheonUnlocksOnNextRun =
    poisonApplied.prestige.completedRuns + 1 >= PANTHEON_UNLOCK_COMPLETED_RUNS;
  const carriedLineage = {
    ...state.lineage,
    trustDebt: clampLineageMetric(
      state.lineage.trustDebt * LINEAGE_ASCENSION_TRUST_DECAY,
      LINEAGE_TRUST_DEBT_MAX
    ),
    skepticism: clampLineageMetric(
      state.lineage.skepticism * LINEAGE_ASCENSION_SKEPTICISM_DECAY,
      LINEAGE_SKEPTICISM_MAX
    ),
    history: state.lineage.history.slice(0, LINEAGE_HISTORY_LIMIT)
  };
  const remembranceBefore = poisonApplied.prestige.remembrance;
  const nextLifetimeBeliefEarned =
    remembranceBefore.lifetimeBeliefEarned + poisonApplied.stats.totalBeliefEarned;
  const nextLifetimeCivilizationRebuilds =
    remembranceBefore.lifetimeCivilizationRebuilds + poisonApplied.cataclysm.civilizationRebuilds;
  const nextPeakFollowersEver = Math.max(
    remembranceBefore.peakFollowersEver,
    poisonApplied.cataclysm.peakFollowers,
    poisonApplied.resources.followers
  );
  const nextBestVeilZeroStreakMs = Math.max(
    remembranceBefore.bestVeilZeroStreakMs,
    poisonApplied.cataclysm.veilZeroStreakMs
  );
  const remembranceCandidateState: GameState = {
    ...poisonApplied,
    prestige: {
      ...poisonApplied.prestige,
      remembrance: {
        ...remembranceBefore,
        lifetimeBeliefEarned: nextLifetimeBeliefEarned,
        lifetimeCivilizationRebuilds: nextLifetimeCivilizationRebuilds,
        peakFollowersEver: nextPeakFollowersEver,
        bestVeilZeroStreakMs: nextBestVeilZeroStreakMs
      }
    }
  };
  const evaluatedLetters = evaluateRemembranceLetters(remembranceCandidateState);
  const mergedLetters = mergeRemembranceLetters(remembranceBefore.letters, evaluatedLetters).letters;
  const nextPrestige = {
    ...poisonApplied.prestige,
    echoes: poisonApplied.prestige.echoes + gainedEchoes,
    lifetimeEchoes: poisonApplied.prestige.lifetimeEchoes + gainedEchoes,
    completedRuns: poisonApplied.prestige.completedRuns + 1,
    dominantDevotionPath,
    pantheon: {
      ...poisonApplied.prestige.pantheon,
      betrayalsLifetime:
        poisonApplied.prestige.pantheon.betrayalsLifetime + poisonApplied.pantheon.betrayalsThisRun,
      betrayedAllyEver:
        poisonApplied.prestige.pantheon.betrayedAllyEver || poisonApplied.pantheon.betrayalsThisRun > 0
    },
    remembrance: {
      ...remembranceBefore,
      letters: mergedLetters,
      lifetimeBeliefEarned: nextLifetimeBeliefEarned,
      lifetimeCivilizationRebuilds: nextLifetimeCivilizationRebuilds,
      peakFollowersEver: nextPeakFollowersEver,
      bestVeilZeroStreakMs: nextBestVeilZeroStreakMs
    }
  };
  const nextEchoBonuses = getEchoBonusesFromTreeRanks(nextPrestige.treeRanks);

  const resetState = createInitialGameState(nowMs);
  const inheritedDevotionMomentum = createDefaultDevotionMomentum();
  if (nextPrestige.dominantDevotionPath !== "none") {
    inheritedDevotionMomentum[nextPrestige.dominantDevotionPath] = 1;
  }
  const initializedGhost = initializeGhostForRun(
    ghostWithCapturedRun,
    resetState.meta.runId,
    resetState.rngState
  );
  let ascendedState: GameState = {
    ...resetState,
    prestige: nextPrestige,
    lineage: carriedLineage,
    pantheon: {
      ...resetState.pantheon,
      unlocked: pantheonUnlocksOnNextRun
    },
    ghost: initializedGhost,
    echoBonuses: nextEchoBonuses,
    devotionPath: "none",
    devotionMomentum: inheritedDevotionMomentum
  };

  const influenceCap = getInfluenceCap(ascendedState);
  ascendedState = {
    ...ascendedState,
    resources: {
      ...ascendedState.resources,
      influence: influenceCap
    }
  };

  const withAscensionMemory = appendHistoryMarker(
    ascendedState,
    nowMs,
    "ascension",
    `The cycle reset, but bloodline memory carried ${Math.floor(carriedLineage.trustDebt)} trust-debt into the next age.`,
    {}
  );

  // Fresh runs should start with a clean active omen log surface.
  return ensurePantheonInitialized(withAscensionMemory, nowMs);
}

export function canAdvanceEraOneToTwo(state: GameState): boolean {
  if (state.era !== 1) return false;
  return getEraOneGateStatus(state).ready;
}

export function performAdvanceEraOneToTwo(state: GameState, nowMs: number): GameState {
  if (!canAdvanceEraOneToTwo(state)) return state;

  const withEraShift = {
    ...state,
    era: 2 as const,
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(withEraShift, nowMs, "eraOneToTwo");
}

export function canAdvanceEraTwoToThree(state: GameState): boolean {
  if (state.era !== 2) return false;
  return getEraTwoGateStatus(state).ready;
}

export function performAdvanceEraTwoToThree(state: GameState, nowMs: number): GameState {
  if (!canAdvanceEraTwoToThree(state)) return state;

  const withEraShift = {
    ...state,
    era: 3 as const,
    activity: resolveActivityAfterAction(state.activity, nowMs),
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };

  return appendOmen(withEraShift, nowMs, "eraTwoToThree");
}

export function getRecruitPreview(state: GameState): string {
  const formatPreviewValue = (value: number): string => {
    if (value >= 10000) {
      return Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 2
      }).format(value);
    }
    return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
  };

  const floor = RECRUIT_BASE_FOLLOWERS + state.prophets * RECRUIT_PROPHET_FOLLOWER_BONUS;
  const domainBonus = Math.floor(getTotalDomainLevel(state) / RECRUIT_DOMAIN_FOLLOWER_DIVISOR);
  const devotionMultiplier = getDevotionRecruitMultiplier(state);
  const lineageModifier = getLineageConversionModifier(state);
  const low = Math.max(1, Math.floor((floor + domainBonus) * devotionMultiplier * lineageModifier));
  const high = Math.max(
    low,
    Math.floor((floor + domainBonus + RECRUIT_RANDOM_FOLLOWER_MAX) * devotionMultiplier * lineageModifier)
  );
  return `${formatPreviewValue(low)}-${formatPreviewValue(high)} followers`;
}

export function getWhisperPreview(state: GameState): string {
  const formatPreviewValue = (value: number): string => {
    if (value >= 10000) {
      return Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 2
      }).format(value);
    }
    return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
  };

  const cadence = getCadenceBonus(state);
  const baseFollowerGain = WHISPER_FOLLOWER_GAIN + cadence.followerBonus;
  const lineageModifier = getLineageConversionModifier(state);
  const gain = Math.max(1, Math.floor(baseFollowerGain * lineageModifier));
  return `${formatPreviewValue(gain)} followers`;
}

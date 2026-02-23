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
  LINEAGE_SKEPTICISM_MAX,
  LINEAGE_SUPPRESS_SKEPTICISM,
  LINEAGE_SUPPRESS_TRUST_DEBT,
  LINEAGE_TRUST_DEBT_MAX,
  type HistoryMarkerKind,
  RIVAL_SUPPRESS_INFLUENCE_COST,
  CADENCE_ACTION_BELIEF_BONUS,
  CADENCE_ACTION_FOLLOWER_BONUS,
  DOMAIN_LABELS,
  RECRUIT_BASE_FOLLOWERS,
  RECRUIT_DOMAIN_FOLLOWER_DIVISOR,
  RECRUIT_INFLUENCE_COST,
  RECRUIT_PROPHET_FOLLOWER_BONUS,
  RECRUIT_RANDOM_FOLLOWER_MAX,
  VEIL_MIN,
  WHISPER_BELIEF_GAIN,
  WHISPER_FOLLOWER_GAIN,
  createInitialGameState,
  type ActType,
  type ActivityState,
  type DomainId,
  type EchoTreeId,
  type GameState,
  type MiracleTier
} from "../state/gameState";
import {
  getActBaseMultiplier,
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
  getMiracleBeliefGain,
  getMiracleCivDamage,
  getMiracleInfluenceCost,
  getMiracleVeilCost,
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
  | "suppress"
  | "miracle"
  | "civCollapse"
  | "veilCollapse"
  | "echoTree"
  | "ascension"
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

const ACT_LABELS: Record<ActType, string> = {
  shrine: "Shrine",
  ritual: "Ritual",
  proclaim: "Proclamation"
};

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
  if (peakFollowers === state.cataclysm.peakFollowers) return state;
  return {
    ...state,
    cataclysm: {
      ...state.cataclysm,
      peakFollowers
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
  const recentTexts = new Set(state.omenLog.slice(0, 4).map((entry) => entry.text));
  let rngState = state.rngState;
  let chosen = createOmen(state, kind, nowMs, detail, rngState);
  rngState = chosen.rngState;

  for (let i = 0; i < 3; i += 1) {
    if (!recentTexts.has(chosen.text)) break;
    const retry = createOmen(state, kind, nowMs, detail, rngState);
    rngState = retry.rngState;
    chosen = retry;
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

export function canWhisper(state: GameState, nowMs: number): boolean {
  return state.resources.influence >= getWhisperCost(state, nowMs);
}

export function performWhisper(state: GameState, nowMs: number): GameState {
  const normalizedCycle = normalizeWhisperCycle(state.activity, nowMs);
  const cost = getWhisperCost(state, nowMs);
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

  const withRecoveredLineage = applyLineageDelta(withWhisper, {
    trustDebt: -LINEAGE_ACTION_RECOVERY_WHISPER,
    skepticism: -LINEAGE_ACTION_RECOVERY_WHISPER * 0.25
  });
  const flavor = getConversionFlavorText(state, lineageFactors.totalModifier);
  return appendOmen(
    withPeakFollowers(withRecoveredLineage, withRecoveredLineage.resources.followers),
    nowMs,
    "whisper",
    flavor
  );
}

export function canRecruit(state: GameState): boolean {
  return state.resources.influence >= RECRUIT_INFLUENCE_COST;
}

export function performRecruit(state: GameState, nowMs: number): GameState {
  if (!canRecruit(state)) return state;

  const recruitBase = getRecruitFollowerGainBase(state);
  const recruitRandom = nextRandom(state.rngState);
  const randomFollowerBonus = Math.floor(recruitRandom.value * (RECRUIT_RANDOM_FOLLOWER_MAX + 1));
  const cadence = getCadenceBonus(state);
  const lineageFactors = getLineageConversionFactors(state);
  const rawFollowerGain = recruitBase + randomFollowerBonus + cadence.followerBonus;
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

  const withRecoveredLineage = applyLineageDelta(withRecruit, {
    trustDebt: -LINEAGE_ACTION_RECOVERY_RECRUIT,
    skepticism: -LINEAGE_ACTION_RECOVERY_RECRUIT * 0.35
  });
  const flavor = getConversionFlavorText(state, lineageFactors.totalModifier);
  return appendOmen(
    withPeakFollowers(withRecoveredLineage, withRecoveredLineage.resources.followers),
    nowMs,
    "recruit",
    flavor
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

  const withInvestment = {
    ...state,
    domains: nextDomains,
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

  const withDescendant = addLineageDescendant(withProphet, nowMs);
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

  return appendOmen(withCult, nowMs, "cult");
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
  return appendOmen(withLineageRecovery, nowMs, "act", ACT_LABELS[type]);
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

  return appendOmen(withLineageMarker, nowMs, "suppress");
}

export function canCastMiracle(state: GameState, tier: MiracleTier): boolean {
  if (state.era < 3) return false;
  if (tier < 1 || tier > 4) return false;
  if (state.cataclysm.civilizationCollapsed) return false;
  return state.resources.influence >= getMiracleInfluenceCost(tier);
}

export function performCastMiracle(state: GameState, tier: MiracleTier, nowMs: number): GameState {
  if (!canCastMiracle(state, tier)) return state;

  const influenceCost = getMiracleInfluenceCost(tier);
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
      influence: state.resources.influence - influenceCost,
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

  const miracleDetail = `Tier ${tier} miracle returned ${Math.floor(beliefGain)} belief.`;
  const withMiracleOmen = appendOmen(withLineageImpact, nowMs, "miracle", miracleDetail);
  if (!civilizationCollapsed) return withMiracleOmen;
  return appendOmen(withMiracleOmen, nowMs, "civCollapse");
}

export function canPurchaseEchoTreeRank(state: GameState, treeId: EchoTreeId): boolean {
  const nextCost = getEchoTreeNextCost(state, treeId);
  if (nextCost === null) return false;
  return state.prestige.echoes >= nextCost;
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
    `${treeId} tree reached rank ${nextRank}.`
  );
}

export function canAscend(state: GameState): boolean {
  if (state.era !== 3) return false;
  return getUnravelingGateStatus(state).ready;
}

export function performAscension(state: GameState, nowMs: number): GameState {
  if (!canAscend(state)) return state;

  const gainedEchoes = getAscensionEchoGain(state.stats.totalBeliefEarned);
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
  const nextPrestige = {
    ...state.prestige,
    echoes: state.prestige.echoes + gainedEchoes,
    lifetimeEchoes: state.prestige.lifetimeEchoes + gainedEchoes,
    completedRuns: state.prestige.completedRuns + 1
  };
  const nextEchoBonuses = getEchoBonusesFromTreeRanks(nextPrestige.treeRanks);

  const resetState = createInitialGameState(nowMs);
  let ascendedState: GameState = {
    ...resetState,
    prestige: nextPrestige,
    lineage: carriedLineage,
    echoBonuses: nextEchoBonuses
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

  return appendOmen(
    withAscensionMemory,
    nowMs,
    "ascension",
    `You carried ${gainedEchoes} echoes into the next cycle.`
  );
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
  const floor = RECRUIT_BASE_FOLLOWERS + state.prophets * RECRUIT_PROPHET_FOLLOWER_BONUS;
  const domainBonus = Math.floor(getTotalDomainLevel(state) / RECRUIT_DOMAIN_FOLLOWER_DIVISOR);
  const lineageModifier = getLineageConversionModifier(state);
  const low = Math.max(1, Math.floor((floor + domainBonus) * lineageModifier));
  const high = Math.max(low, Math.floor((floor + domainBonus + RECRUIT_RANDOM_FOLLOWER_MAX) * lineageModifier));
  return `${low}-${high} followers`;
}

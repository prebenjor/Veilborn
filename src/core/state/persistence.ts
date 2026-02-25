import {
  CIV_HEALTH_MAX,
  ECHO_TREE_MAX_RANK,
  GAME_STATE_SCHEMA_VERSION,
  LINEAGE_HISTORY_LIMIT,
  LINEAGE_SKEPTICISM_MAX,
  LINEAGE_TRUST_DEBT_MAX,
  PANTHEON_UNLOCK_COMPLETED_RUNS,
  OFFLINE_BELIEF_EFFICIENCY,
  OFFLINE_INFLUENCE_RETURN_RATIO,
  OFFLINE_MAX_SECONDS,
  OFFLINE_RIVAL_DRAIN_MULTIPLIER,
  OFFLINE_VEIL_FLOOR,
  RIVAL_DRAIN_RATE,
  RIVAL_EVENT_DURATION_MS,
  DEVOTION_STACK_MAX,
  DEVOTION_PATH_IDS,
  VEIL_MAX,
  createDefaultDevotionMomentum,
  createInitialGameState,
  type ActiveAct,
  type ArchitectureBeliefRule,
  type ArchitectureCivilizationRule,
  type ArchitectureDomainRule,
  type ArchitectureState,
  type CataclysmState,
  type DoctrineState,
  type DomainId,
  type DomainPoisonRuns,
  type DomainProgress,
  type DevotionMomentum,
  type DevotionPath,
  type EchoTreeId,
  type EchoBonuses,
  type GameState,
  type HistoryMarker,
  type HistoryMarkerKind,
  type LineageState,
  type Mortal,
  type MortalTrait,
  type OmenEntry,
  type FinalChoice,
  type FollowerRiteType,
  type PantheonAlly,
  type PantheonLegacyState,
  type PantheonState,
  type PrestigeState,
  type RemembranceLetters,
  type RemembranceState,
  type RivalState,
  type GhostState,
  type GhostRunSignature,
  type GhostInfluence
} from "./gameState";
import {
  getBeliefPerSecond,
  getCivilizationRegenPerSecond,
  getCultOutput,
  getEchoBonusesFromTreeRanks,
  getFaithDecay,
  getInfluenceCap,
  getMiracleReserveCap,
  getPassiveFollowerRate,
  getVeilErosionPerSecond,
  getVeilRegenPerSecond
} from "../engine/formulas";

const SAVE_KEY = "veilborn.save";
const SNAPSHOT_KEY = "veilborn.save.snapshot";

interface SaveEnvelope {
  schemaVersion: number;
  savedAt: number;
  state: unknown;
}

interface SnapshotEnvelope extends SaveEnvelope {
  reason: "ascension" | "era_transition";
}

export interface OfflineProgressSummary {
  elapsedSeconds: number;
  wasCapped: boolean;
  beliefGained: number;
  veilDelta: number;
  followersDelta: number;
  influenceAfter: number;
  faithDecayMultiplier: number;
  veilFloorHit: boolean;
}

export interface LoadGameStateResult {
  state: GameState;
  offlineSummary: OfflineProgressSummary | null;
  recoveryNotice: string | null;
  recoveredFromSnapshot: boolean;
}

export interface SaveImportResult {
  state: GameState | null;
  warnings: string[];
  error: string | null;
}

export interface SnapshotMeta {
  savedAt: number;
  reason: "ascension" | "era_transition";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readNullableString(value: unknown, fallback: string | null): string | null {
  if (typeof value === "string") return value;
  if (value === null) return null;
  return fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readTrait(value: unknown, fallback: MortalTrait): MortalTrait {
  if (value === "skeptical" || value === "zealous" || value === "cautious") return value;
  return fallback;
}

function readDomainId(value: unknown): DomainId | null {
  if (
    value === "fire" ||
    value === "death" ||
    value === "harvest" ||
    value === "storm" ||
    value === "memory" ||
    value === "void"
  ) {
    return value;
  }
  return null;
}

function readActType(value: unknown): ActiveAct["type"] | null {
  if (value === "shrine" || value === "ritual" || value === "proclaim") return value;
  return null;
}

function readEchoTreeId(value: unknown): EchoTreeId | null {
  if (value === "whispers" || value === "doctrine" || value === "cataclysm") return value;
  return null;
}

function readArchitectureBeliefRule(
  value: unknown,
  fallback: ArchitectureBeliefRule
): ArchitectureBeliefRule {
  if (value === "orthodox" || value === "fervor" || value === "litany") return value;
  return fallback;
}

function readArchitectureCivilizationRule(
  value: unknown,
  fallback: ArchitectureCivilizationRule
): ArchitectureCivilizationRule {
  if (value === "steady" || value === "expansion" || value === "fracture") return value;
  return fallback;
}

function readArchitectureDomainRule(
  value: unknown,
  fallback: ArchitectureDomainRule
): ArchitectureDomainRule {
  if (value === "constellation" || value === "focused" || value === "chaotic") return value;
  return fallback;
}

function readFinalChoice(value: unknown, fallback: FinalChoice): FinalChoice {
  if (value === "none" || value === "remember" || value === "forget") return value;
  return fallback;
}

function readHistoryMarkerKind(value: unknown): HistoryMarkerKind | null {
  if (
    value === "origin" ||
    value === "prophet_lineage" ||
    value === "rival_suppressed" ||
    value === "pantheon_betrayal" ||
    value === "civ_collapse" ||
    value === "veil_collapse" ||
    value === "civ_rebuild" ||
    value === "ascension"
  ) {
    return value;
  }
  return null;
}

function readPantheonDisposition(value: unknown): PantheonAlly["disposition"] | null {
  if (value === "neutral" || value === "allied" || value === "betrayed") return value;
  return null;
}

function sanitizeMortals(value: unknown, fallback: Mortal[]): Mortal[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: readString(entry.id, `mortal-${index + 1}`),
        name: readString(entry.name, "Unnamed Listener"),
        trait: readTrait(entry.trait, "cautious"),
        generation: Math.max(1, Math.floor(readNumber(entry.generation, 1))),
        parentId: readNullableString(entry.parentId, null)
      } satisfies Mortal;
    })
    .filter((entry): entry is Mortal => Boolean(entry));

  return sanitized.length > 0 ? sanitized : fallback;
}

function sanitizeDomains(value: unknown, fallback: DomainProgress[]): DomainProgress[] {
  if (!Array.isArray(value)) return fallback;

  const byId = new Map<DomainId, DomainProgress>();

  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const domainId = readDomainId(entry.id);
    if (!domainId) continue;
    byId.set(domainId, {
      id: domainId,
      level: Math.max(0, Math.floor(readNumber(entry.level, 0))),
      xp: Math.max(0, Math.floor(readNumber(entry.xp, 0)))
    });
  }

  return fallback.map((domain) => byId.get(domain.id) ?? domain);
}

function sanitizeOmenLog(value: unknown, fallback: OmenEntry[]): OmenEntry[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: readString(entry.id, `evt-${index}`),
        at: readNumber(entry.at, Date.now()),
        text: readString(entry.text, "The silence held.")
      } satisfies OmenEntry;
    })
    .filter((entry): entry is OmenEntry => Boolean(entry));

  return sanitized.length > 0 ? sanitized.slice(0, 200) : fallback;
}

function sanitizeLineageHistory(value: unknown, fallback: HistoryMarker[]): HistoryMarker[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const kind = readHistoryMarkerKind(entry.kind);
      if (!kind) return null;
      return {
        id: readString(entry.id, `hist-${index}`),
        at: Math.max(0, readNumber(entry.at, Date.now())),
        runId: readString(entry.runId, "run-unknown"),
        kind,
        text: readString(entry.text, "Memory held."),
        trustDebtDelta: readNumber(entry.trustDebtDelta, 0),
        skepticismDelta: readNumber(entry.skepticismDelta, 0)
      } satisfies HistoryMarker;
    })
    .filter((entry): entry is HistoryMarker => Boolean(entry));

  return sanitized.length > 0 ? sanitized.slice(0, LINEAGE_HISTORY_LIMIT) : fallback;
}

function sanitizeLineage(value: unknown, fallback: LineageState): LineageState {
  if (!isRecord(value)) return fallback;
  return {
    generation: Math.max(1, Math.floor(readNumber(value.generation, fallback.generation))),
    trustDebt: Math.max(0, Math.min(LINEAGE_TRUST_DEBT_MAX, readNumber(value.trustDebt, fallback.trustDebt))),
    skepticism: Math.max(
      0,
      Math.min(LINEAGE_SKEPTICISM_MAX, readNumber(value.skepticism, fallback.skepticism))
    ),
    betrayalScars: Math.max(0, Math.floor(readNumber(value.betrayalScars, fallback.betrayalScars))),
    history: sanitizeLineageHistory(value.history, fallback.history),
    nextMarkerId: Math.max(1, Math.floor(readNumber(value.nextMarkerId, fallback.nextMarkerId)))
  };
}

function sanitizeActiveActs(value: unknown, fallback: ActiveAct[]): ActiveAct[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const type = readActType(entry.type);
      if (!type) return null;
      const startedAt = Math.max(0, readNumber(entry.startedAt, 0));
      const endsAt = Math.max(startedAt, readNumber(entry.endsAt, startedAt));
      return {
        id: readString(entry.id, `act-${index + 1}`),
        type,
        startedAt,
        endsAt,
        durationSeconds: Math.max(1, Math.floor(readNumber(entry.durationSeconds, 30))),
        baseMultiplier: Math.max(0, readNumber(entry.baseMultiplier, 1)),
        cost: Math.max(0, readNumber(entry.cost, 0))
      } satisfies ActiveAct;
    })
    .filter((entry): entry is ActiveAct => Boolean(entry));

  return sanitized.slice(0, 64);
}

function sanitizeRivals(value: unknown, fallback: RivalState[]): RivalState[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: readString(entry.id, `rival-${index + 1}`),
        strength: Math.max(1, readNumber(entry.strength, 1)),
        spawnedAt: Math.max(0, readNumber(entry.spawnedAt, 0))
      } satisfies RivalState;
    })
    .filter((entry): entry is RivalState => Boolean(entry));

  return sanitized.slice(0, 8);
}

function sanitizePantheonAllies(value: unknown, fallback: PantheonAlly[]): PantheonAlly[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const domain = readDomainId(entry.domain);
      const disposition = readPantheonDisposition(entry.disposition);
      if (!domain || !disposition) return null;
      return {
        id: readString(entry.id, `ally-${index + 1}`),
        name: readString(entry.name, "Unnamed Forgotten"),
        domain,
        disposition,
        joinedAt: Math.max(0, readNumber(entry.joinedAt, 0)),
        betrayedAt:
          typeof entry.betrayedAt === "number" && Number.isFinite(entry.betrayedAt)
            ? Math.max(0, entry.betrayedAt)
            : null
      } satisfies PantheonAlly;
    })
    .filter((entry): entry is PantheonAlly => Boolean(entry));

  return sanitized.slice(0, 8);
}

function sanitizeDomainPoisonRuns(value: unknown, fallback: DomainPoisonRuns): DomainPoisonRuns {
  const normalized: DomainPoisonRuns = {
    fire: fallback.fire,
    death: fallback.death,
    harvest: fallback.harvest,
    storm: fallback.storm,
    memory: fallback.memory,
    void: fallback.void
  };

  if (!isRecord(value)) return normalized;

  for (const domainId of Object.keys(normalized) as DomainId[]) {
    normalized[domainId] = Math.max(0, Math.floor(readNumber(value[domainId], normalized[domainId])));
  }

  return normalized;
}

function sanitizePantheonLegacy(value: unknown, fallback: PantheonLegacyState): PantheonLegacyState {
  if (!isRecord(value)) return fallback;
  return {
    domainPoisonRuns: sanitizeDomainPoisonRuns(value.domainPoisonRuns, fallback.domainPoisonRuns),
    betrayalsLifetime: Math.max(0, Math.floor(readNumber(value.betrayalsLifetime, fallback.betrayalsLifetime))),
    betrayedAllyEver: readBoolean(value.betrayedAllyEver, fallback.betrayedAllyEver)
  };
}

function sanitizePantheon(value: unknown, fallback: PantheonState): PantheonState {
  if (!isRecord(value)) return fallback;

  const allies = sanitizePantheonAllies(value.allies, fallback.allies);
  const activeAllyId = readNullableString(value.activeAllyId, fallback.activeAllyId);
  const pendingPoisonDomains = Array.isArray(value.pendingPoisonDomains)
    ? value.pendingPoisonDomains
        .map((domain) => readDomainId(domain))
        .filter((domain): domain is DomainId => Boolean(domain))
        .slice(0, 6)
    : fallback.pendingPoisonDomains;

  return {
    unlocked: readBoolean(value.unlocked, fallback.unlocked),
    allies,
    activeAllyId: activeAllyId && allies.some((ally) => ally.id === activeAllyId) ? activeAllyId : null,
    pendingPoisonDomains,
    betrayalsThisRun: Math.max(0, Math.floor(readNumber(value.betrayalsThisRun, fallback.betrayalsThisRun))),
    nextAllyId: Math.max(1, Math.floor(readNumber(value.nextAllyId, fallback.nextAllyId)))
  };
}

function sanitizeGhostDomainLevels(
  value: unknown,
  fallback: Record<DomainId, number>
): Record<DomainId, number> {
  const normalized: Record<DomainId, number> = {
    fire: fallback.fire,
    death: fallback.death,
    harvest: fallback.harvest,
    storm: fallback.storm,
    memory: fallback.memory,
    void: fallback.void
  };
  if (!isRecord(value)) return normalized;

  for (const domainId of Object.keys(normalized) as DomainId[]) {
    normalized[domainId] = Math.max(0, Math.floor(readNumber(value[domainId], normalized[domainId])));
  }

  return normalized;
}

function sanitizeGhostSignatures(value: unknown, fallback: GhostRunSignature[]): GhostRunSignature[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const dominantDomain = readDomainId(entry.dominantDomain);
      if (!dominantDomain) return null;
      const source = entry.source === "imported" ? "imported" : "local";
      return {
        id: readString(entry.id, `ghost-signature-${index + 1}`),
        label: readString(entry.label, "Unnamed Echo Signature"),
        source,
        createdAt: Math.max(0, readNumber(entry.createdAt, Date.now())),
        dominantDomain,
        domainLevels: sanitizeGhostDomainLevels(entry.domainLevels, {
          fire: 0,
          death: 0,
          harvest: 0,
          storm: 0,
          memory: 0,
          void: 0
        }),
        miracles: Math.max(0, Math.floor(readNumber(entry.miracles, 0))),
        betrayals: Math.max(0, Math.floor(readNumber(entry.betrayals, 0))),
        veilCollapses: Math.max(0, Math.floor(readNumber(entry.veilCollapses, 0))),
        totalBelief: Math.max(0, readNumber(entry.totalBelief, 0))
      } satisfies GhostRunSignature;
    })
    .filter((entry): entry is GhostRunSignature => Boolean(entry));

  return sanitized.slice(0, 60);
}

function sanitizeGhostInfluences(value: unknown, fallback: GhostInfluence[]): GhostInfluence[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const dominantDomain = readDomainId(entry.dominantDomain);
      if (!dominantDomain) return null;
      const source = entry.source === "imported" ? "imported" : "local";
      return {
        id: readString(entry.id, `ghost-influence-${index + 1}`),
        signatureId: readString(entry.signatureId, "unknown-signature"),
        source,
        title: readString(entry.title, "Unnamed Influence"),
        description: readString(entry.description, "An old echo lingers."),
        dominantDomain,
        domainSynergyDelta: readNumber(entry.domainSynergyDelta, 0),
        rivalSpawnDelta: readNumber(entry.rivalSpawnDelta, 0),
        faithDecayDelta: readNumber(entry.faithDecayDelta, 0)
      } satisfies GhostInfluence;
    })
    .filter((entry): entry is GhostInfluence => Boolean(entry));

  return sanitized.slice(0, 8);
}

function sanitizeGhostState(value: unknown, fallback: GhostState): GhostState {
  if (!isRecord(value)) return fallback;
  return {
    localSignatures: sanitizeGhostSignatures(value.localSignatures, fallback.localSignatures),
    importedSignatures: sanitizeGhostSignatures(value.importedSignatures, fallback.importedSignatures),
    activeInfluences: sanitizeGhostInfluences(value.activeInfluences, fallback.activeInfluences),
    lastRunIdInitialized: readNullableString(value.lastRunIdInitialized, fallback.lastRunIdInitialized),
    nextSignatureId: Math.max(1, Math.floor(readNumber(value.nextSignatureId, fallback.nextSignatureId)))
  };
}

function sanitizeDoctrine(value: unknown, fallback: DoctrineState): DoctrineState {
  if (!isRecord(value)) return fallback;
  const followerRitesUsed: Record<FollowerRiteType, number> = {
    procession: Math.max(
      0,
      Math.floor(readNumber(isRecord(value.followerRitesUsed) ? value.followerRitesUsed.procession : null, fallback.followerRitesUsed.procession))
    ),
    convergence: Math.max(
      0,
      Math.floor(readNumber(isRecord(value.followerRitesUsed) ? value.followerRitesUsed.convergence : null, fallback.followerRitesUsed.convergence))
    )
  };
  return {
    activeActs: sanitizeActiveActs(value.activeActs, fallback.activeActs),
    actsCompleted: Math.max(0, Math.floor(readNumber(value.actsCompleted, fallback.actsCompleted))),
    shrinesBuilt: Math.max(0, Math.floor(readNumber(value.shrinesBuilt, fallback.shrinesBuilt))),
    followerRitesUsed,
    rivals: sanitizeRivals(value.rivals, fallback.rivals),
    lastRivalSpawnAt: Math.max(0, readNumber(value.lastRivalSpawnAt, fallback.lastRivalSpawnAt)),
    survivedRivalEvent: readBoolean(value.survivedRivalEvent, fallback.survivedRivalEvent),
    nextActId: Math.max(1, Math.floor(readNumber(value.nextActId, fallback.nextActId))),
    nextRivalId: Math.max(1, Math.floor(readNumber(value.nextRivalId, fallback.nextRivalId)))
  };
}

function sanitizeCataclysm(value: unknown, fallback: CataclysmState): CataclysmState {
  if (!isRecord(value)) return fallback;
  return {
    miraclesThisRun: Math.max(0, Math.floor(readNumber(value.miraclesThisRun, fallback.miraclesThisRun))),
    miracleReserve: Math.max(0, readNumber(value.miracleReserve, fallback.miracleReserve)),
    civilizationHealth: Math.max(0, Math.min(100, readNumber(value.civilizationHealth, fallback.civilizationHealth))),
    civilizationCollapsed: readBoolean(value.civilizationCollapsed, fallback.civilizationCollapsed),
    civilizationRebuildEndsAt: Math.max(0, readNumber(value.civilizationRebuildEndsAt, fallback.civilizationRebuildEndsAt)),
    civilizationRebuilds: Math.max(0, Math.floor(readNumber(value.civilizationRebuilds, fallback.civilizationRebuilds))),
    peakFollowers: Math.max(0, Math.floor(readNumber(value.peakFollowers, fallback.peakFollowers))),
    veilZeroStreakMs: Math.max(0, readNumber(value.veilZeroStreakMs, fallback.veilZeroStreakMs)),
    wasBelowVeilCollapseThreshold: readBoolean(
      value.wasBelowVeilCollapseThreshold,
      fallback.wasBelowVeilCollapseThreshold
    ),
    totalVeilCollapses: Math.max(0, Math.floor(readNumber(value.totalVeilCollapses, fallback.totalVeilCollapses))),
    veilCollapseImmunityUntil: Math.max(0, readNumber(value.veilCollapseImmunityUntil, fallback.veilCollapseImmunityUntil))
  };
}

function sanitizeEchoBonuses(value: unknown, fallback: EchoBonuses): EchoBonuses {
  if (!isRecord(value)) return fallback;
  return {
    startInf: readBoolean(value.startInf, fallback.startInf),
    faithFloor: readBoolean(value.faithFloor, fallback.faithFloor),
    prophetThreshold: readBoolean(value.prophetThreshold, fallback.prophetThreshold),
    resonantWord: readBoolean(value.resonantWord, fallback.resonantWord),
    cultCostBase: readBoolean(value.cultCostBase, fallback.cultCostBase),
    era1Gate: readBoolean(value.era1Gate, fallback.era1Gate),
    era2Gate: readBoolean(value.era2Gate, fallback.era2Gate),
    actFloor: readBoolean(value.actFloor, fallback.actFloor),
    actDiscount: readBoolean(value.actDiscount, fallback.actDiscount),
    rivalDelay: readBoolean(value.rivalDelay, fallback.rivalDelay),
    rivalWeaken: readBoolean(value.rivalWeaken, fallback.rivalWeaken),
    veilRegen: readBoolean(value.veilRegen, fallback.veilRegen),
    miracleVeilDiscount: readBoolean(value.miracleVeilDiscount, fallback.miracleVeilDiscount),
    collapseThreshold: readBoolean(value.collapseThreshold, fallback.collapseThreshold),
    collapseImmunity: readBoolean(value.collapseImmunity, fallback.collapseImmunity),
    civRebuild: readBoolean(value.civRebuild, fallback.civRebuild)
  };
}

function sanitizeArchitecture(value: unknown, fallback: ArchitectureState): ArchitectureState {
  if (!isRecord(value)) return fallback;
  return {
    beliefRule: readArchitectureBeliefRule(value.beliefRule, fallback.beliefRule),
    civilizationRule: readArchitectureCivilizationRule(value.civilizationRule, fallback.civilizationRule),
    domainRule: readArchitectureDomainRule(value.domainRule, fallback.domainRule)
  };
}

function sanitizeRemembranceLetters(
  value: unknown,
  fallback: RemembranceLetters
): RemembranceLetters {
  if (!isRecord(value)) return fallback;
  return {
    domainLevelTen: readBoolean(value.domainLevelTen, fallback.domainLevelTen),
    lifetimeEchoesFiftyThousand: readBoolean(
      value.lifetimeEchoesFiftyThousand,
      fallback.lifetimeEchoesFiftyThousand
    ),
    veilZeroSixtySeconds: readBoolean(value.veilZeroSixtySeconds, fallback.veilZeroSixtySeconds),
    betrayedPantheonAlly: readBoolean(value.betrayedPantheonAlly, fallback.betrayedPantheonAlly),
    civilizationsRebuiltThree: readBoolean(
      value.civilizationsRebuiltThree,
      fallback.civilizationsRebuiltThree
    ),
    allDomainsEight: readBoolean(value.allDomainsEight, fallback.allDomainsEight),
    followersMillion: readBoolean(value.followersMillion, fallback.followersMillion),
    beliefBillion: readBoolean(value.beliefBillion, fallback.beliefBillion)
  };
}

function sanitizeRemembrance(value: unknown, fallback: RemembranceState): RemembranceState {
  if (!isRecord(value)) return fallback;
  const finalChoice = readFinalChoice(value.finalChoice, fallback.finalChoice);
  return {
    letters: sanitizeRemembranceLetters(value.letters, fallback.letters),
    lifetimeBeliefEarned: Math.max(0, readNumber(value.lifetimeBeliefEarned, fallback.lifetimeBeliefEarned)),
    lifetimeCivilizationRebuilds: Math.max(
      0,
      Math.floor(readNumber(value.lifetimeCivilizationRebuilds, fallback.lifetimeCivilizationRebuilds))
    ),
    peakFollowersEver: Math.max(
      0,
      Math.floor(readNumber(value.peakFollowersEver, fallback.peakFollowersEver))
    ),
    bestVeilZeroStreakMs: Math.max(
      0,
      readNumber(value.bestVeilZeroStreakMs, fallback.bestVeilZeroStreakMs)
    ),
    finalChoice,
    finalChoiceAt:
      finalChoice === "none"
        ? null
        : typeof value.finalChoiceAt === "number" && Number.isFinite(value.finalChoiceAt)
          ? Math.max(0, value.finalChoiceAt)
          : fallback.finalChoiceAt
  };
}

function inferTreeRankFromBonuses(bonuses: EchoBonuses, keys: Array<keyof EchoBonuses>): number {
  let rank = 0;
  for (const key of keys) {
    if (!bonuses[key]) break;
    rank += 1;
  }
  return rank;
}

function inferTreeRanksFromEchoBonuses(bonuses: EchoBonuses): {
  whispers: number;
  doctrine: number;
  cataclysm: number;
} {
  return {
    whispers: inferTreeRankFromBonuses(bonuses, [
      "startInf",
      "prophetThreshold",
      "faithFloor",
      "era1Gate",
      "rivalWeaken"
    ]),
    doctrine: inferTreeRankFromBonuses(bonuses, [
      "cultCostBase",
      "rivalDelay",
      "actFloor",
      "actDiscount",
      "era2Gate"
    ]),
    cataclysm: inferTreeRankFromBonuses(bonuses, [
      "veilRegen",
      "miracleVeilDiscount",
      "collapseThreshold",
      "collapseImmunity",
      "civRebuild"
    ])
  };
}

function sanitizePrestige(
  value: unknown,
  fallback: PrestigeState,
  normalizedBonuses: EchoBonuses
): PrestigeState {
  if (!isRecord(value)) {
    const inferredTreeRanks = inferTreeRanksFromEchoBonuses(normalizedBonuses);
    return {
      ...fallback,
      treeRanks: inferredTreeRanks,
      pantheon: fallback.pantheon,
      architecture: fallback.architecture,
      remembrance: fallback.remembrance
    };
  }

  const rawTreeRanks = isRecord(value.treeRanks) ? value.treeRanks : {};
  const normalizedTreeRanks = {
    whispers: fallback.treeRanks.whispers,
    doctrine: fallback.treeRanks.doctrine,
    cataclysm: fallback.treeRanks.cataclysm
  };

  for (const [key, entry] of Object.entries(rawTreeRanks)) {
    const treeId = readEchoTreeId(key);
    if (!treeId) continue;
    normalizedTreeRanks[treeId] = Math.max(
      0,
      Math.min(ECHO_TREE_MAX_RANK, Math.floor(readNumber(entry, 0)))
    );
  }

  const inferredTreeRanks = inferTreeRanksFromEchoBonuses(normalizedBonuses);
  const hasAnyRank =
    normalizedTreeRanks.whispers > 0 ||
    normalizedTreeRanks.doctrine > 0 ||
    normalizedTreeRanks.cataclysm > 0;

  const treeRanks = hasAnyRank ? normalizedTreeRanks : inferredTreeRanks;

  return {
    echoes: Math.max(0, Math.floor(readNumber(value.echoes, fallback.echoes))),
    lifetimeEchoes: Math.max(
      0,
      Math.floor(
        readNumber(value.lifetimeEchoes, Math.max(fallback.lifetimeEchoes, readNumber(value.echoes, 0)))
      )
    ),
    completedRuns: Math.max(0, Math.floor(readNumber(value.completedRuns, fallback.completedRuns))),
    dominantDevotionPath: sanitizeDevotionPath(value.dominantDevotionPath, fallback.dominantDevotionPath),
    treeRanks,
    pantheon: sanitizePantheonLegacy(value.pantheon, fallback.pantheon),
    architecture: sanitizeArchitecture(value.architecture, fallback.architecture),
    remembrance: sanitizeRemembrance(value.remembrance, fallback.remembrance)
  };
}

function sanitizeDevotionPath(value: unknown, fallback: DevotionPath): DevotionPath {
  if (typeof value !== "string") return fallback;
  return DEVOTION_PATH_IDS.includes(value as DevotionPath) ? (value as DevotionPath) : fallback;
}

function sanitizeDevotionMomentum(value: unknown, fallback: DevotionMomentum): DevotionMomentum {
  if (!isRecord(value)) return fallback;

  const readMomentum = (key: keyof DevotionMomentum): number =>
    Math.max(0, Math.floor(readNumber(value[key], fallback[key])));

  return {
    fervour: readMomentum("fervour"),
    accord: readMomentum("accord"),
    reverence: readMomentum("reverence"),
    ardour: readMomentum("ardour")
  };
}

function sanitizeState(rawState: unknown, nowMs: number): GameState {
  const fallback = createInitialGameState(nowMs);
  if (!isRecord(rawState)) return fallback;

  const rawMeta = isRecord(rawState.meta) ? rawState.meta : {};
  const rawSimulation = isRecord(rawState.simulation) ? rawState.simulation : {};
  const rawResources = isRecord(rawState.resources) ? rawState.resources : {};
  const rawActivity = isRecord(rawState.activity) ? rawState.activity : {};
  const rawStats = isRecord(rawState.stats) ? rawState.stats : {};
  const rawDoctrine = isRecord(rawState.doctrine) ? rawState.doctrine : {};
  const rawCataclysm = isRecord(rawState.cataclysm) ? rawState.cataclysm : {};
  const rawLineage = isRecord(rawState.lineage) ? rawState.lineage : {};
  const rawPantheon = isRecord(rawState.pantheon) ? rawState.pantheon : {};
  const rawGhost = isRecord(rawState.ghost) ? rawState.ghost : {};
  const normalizedEchoBonuses = sanitizeEchoBonuses(rawState.echoBonuses, fallback.echoBonuses);
  const normalizedPrestige = sanitizePrestige(rawState.prestige, fallback.prestige, normalizedEchoBonuses);
  const syncedEchoBonuses = getEchoBonusesFromTreeRanks(normalizedPrestige.treeRanks);
  const normalizedLineage = sanitizeLineage(rawLineage, fallback.lineage);
  const normalizedPantheon = sanitizePantheon(rawPantheon, fallback.pantheon);
  const normalizedGhost = sanitizeGhostState(rawGhost, fallback.ghost);
  const pantheonUnlocked =
    normalizedPantheon.unlocked || normalizedPrestige.completedRuns >= PANTHEON_UNLOCK_COMPLETED_RUNS;

  return {
    meta: {
      schemaVersion: GAME_STATE_SCHEMA_VERSION,
      runId: readString(rawMeta.runId, fallback.meta.runId),
      runStartTimestamp: Math.max(
        0,
        readNumber(
          rawMeta.runStartTimestamp,
          readNumber(rawMeta.createdAt, fallback.meta.runStartTimestamp)
        )
      ),
      createdAt: readNumber(rawMeta.createdAt, fallback.meta.createdAt),
      updatedAt: Math.max(0, readNumber(rawMeta.updatedAt, nowMs))
    },
    simulation: {
      tickMs: fallback.simulation.tickMs,
      lastTickAt: Math.max(0, readNumber(rawSimulation.lastTickAt, readNumber(rawMeta.updatedAt, nowMs))),
      accumulatedMs: Math.max(0, readNumber(rawSimulation.accumulatedMs, 0)),
      totalTicks: Math.max(0, Math.floor(readNumber(rawSimulation.totalTicks, 0))),
      totalElapsedMs: Math.max(0, readNumber(rawSimulation.totalElapsedMs, 0))
    },
    resources: {
      belief: Math.max(0, readNumber(rawResources.belief, fallback.resources.belief)),
      influence: Math.max(0, readNumber(rawResources.influence, fallback.resources.influence)),
      veil: Math.max(0, readNumber(rawResources.veil, fallback.resources.veil)),
      followers: Math.max(0, Math.floor(readNumber(rawResources.followers, fallback.resources.followers)))
    },
    activity: {
      lastEventAt: Math.max(0, readNumber(rawActivity.lastEventAt, nowMs)),
      whisperWindowStartedAt: Math.max(0, readNumber(rawActivity.whisperWindowStartedAt, nowMs)),
      whispersInWindow: Math.max(0, Math.floor(readNumber(rawActivity.whispersInWindow, 0))),
      lastCadencePromptAt: Math.max(0, readNumber(rawActivity.lastCadencePromptAt, nowMs)),
      cadencePromptActive: readBoolean(rawActivity.cadencePromptActive, false)
    },
    stats: {
      totalBeliefEarned: Math.max(0, readNumber(rawStats.totalBeliefEarned, fallback.stats.totalBeliefEarned))
    },
    doctrine: sanitizeDoctrine(rawDoctrine, fallback.doctrine),
    cataclysm: sanitizeCataclysm(rawCataclysm, fallback.cataclysm),
    prestige: normalizedPrestige,
    lineage: normalizedLineage,
    pantheon: {
      ...normalizedPantheon,
      unlocked: pantheonUnlocked
    },
    ghost: normalizedGhost,
    echoBonuses: syncedEchoBonuses,
    era: readNumber(rawState.era, fallback.era) >= 3 ? 3 : readNumber(rawState.era, fallback.era) >= 2 ? 2 : 1,
    mortals: sanitizeMortals(rawState.mortals, fallback.mortals),
    domains: sanitizeDomains(rawState.domains, fallback.domains),
    prophets: Math.max(0, Math.floor(readNumber(rawState.prophets, fallback.prophets))),
    cults: Math.max(0, Math.floor(readNumber(rawState.cults, fallback.cults))),
    devotionStacks: Math.max(
      0,
      Math.min(
        DEVOTION_STACK_MAX,
        Math.floor(readNumber(rawState.devotionStacks, fallback.devotionStacks))
      )
    ),
    devotionPath: sanitizeDevotionPath(rawState.devotionPath, fallback.devotionPath),
    devotionMomentum: sanitizeDevotionMomentum(
      rawState.devotionMomentum,
      createDefaultDevotionMomentum()
    ),
    matchingDomainPairs: Math.max(0, Math.floor(readNumber(rawState.matchingDomainPairs, fallback.matchingDomainPairs))),
    rngState: Math.max(1, Math.floor(readNumber(rawState.rngState, fallback.rngState))) >>> 0,
    omenLog: sanitizeOmenLog(rawState.omenLog, fallback.omenLog),
    nextEventId: Math.max(1, Math.floor(readNumber(rawState.nextEventId, fallback.nextEventId)))
  };
}

function migrateFromSchemaV1(rawState: unknown, nowMs: number): GameState {
  return sanitizeState(rawState, nowMs);
}

function migrateFromSchemaV2(rawState: unknown, nowMs: number): GameState {
  return sanitizeState(rawState, nowMs);
}

type Migrator = (rawState: unknown, nowMs: number) => GameState;

const MIGRATORS: Record<number, Migrator> = {
  1: migrateFromSchemaV1,
  2: migrateFromSchemaV2,
  3: sanitizeState,
  4: sanitizeState,
  5: sanitizeState,
  6: sanitizeState,
  7: sanitizeState,
  8: sanitizeState,
  9: sanitizeState,
  10: sanitizeState,
  11: sanitizeState,
  12: sanitizeState,
  13: sanitizeState,
  14: sanitizeState,
  15: sanitizeState,
  16: sanitizeState
};

function applyReturnAnchor(state: GameState, nowMs: number): GameState {
  return {
    ...state,
    activity: {
      ...state.activity,
      cadencePromptActive: false
    },
    simulation: {
      ...state.simulation,
      lastTickAt: nowMs,
      accumulatedMs: 0
    },
    meta: {
      ...state.meta,
      updatedAt: nowMs
    }
  };
}

function simulateOfflineProgress(state: GameState, nowMs: number): LoadGameStateResult {
  const lastSeenAt = Math.max(state.meta.updatedAt, state.simulation.lastTickAt, state.meta.createdAt);
  const rawElapsedSeconds = Math.max(0, (nowMs - lastSeenAt) / 1000);

  if (rawElapsedSeconds < 1) {
    return {
      state: applyReturnAnchor(state, nowMs),
      offlineSummary: null,
      recoveryNotice: null,
      recoveredFromSnapshot: false
    };
  }

  const elapsedSeconds = Math.min(OFFLINE_MAX_SECONDS, rawElapsedSeconds);
  const wasCapped = rawElapsedSeconds > OFFLINE_MAX_SECONDS;
  const beliefPerSecondAtClose = getBeliefPerSecond(state, lastSeenAt);
  const beliefGained = beliefPerSecondAtClose * elapsedSeconds * OFFLINE_BELIEF_EFFICIENCY;
  const influenceCap = getInfluenceCap(state);
  const influenceAfter = influenceCap * OFFLINE_INFLUENCE_RETURN_RATIO;

  const veilDeltaRaw = (getVeilRegenPerSecond(state) - getVeilErosionPerSecond(state)) * elapsedSeconds;
  const veilBefore = state.resources.veil;
  const veilRaw = veilBefore + veilDeltaRaw;
  const veilAfter = Math.max(OFFLINE_VEIL_FLOOR, Math.min(VEIL_MAX, veilRaw));
  const veilDelta = veilAfter - veilBefore;
  const veilFloorHit = veilRaw < OFFLINE_VEIL_FLOOR;

  const cultOutputAtClose = getCultOutput(state);
  const totalRivalStrength = state.doctrine.rivals.reduce((sum, rival) => sum + rival.strength, 0);
  const rivalDrainApplies = totalRivalStrength > cultOutputAtClose * 0.5;
  let followerDrain = 0;
  const passiveFollowerGain = getPassiveFollowerRate(state, lastSeenAt) * elapsedSeconds;
  const rivalsAfter = state.doctrine.rivals
    .map((rival) => {
      const ageAtCloseSeconds = Math.max(0, (lastSeenAt - rival.spawnedAt) / 1000);
      const remainingSeconds = Math.max(0, RIVAL_EVENT_DURATION_MS / 1000 - ageAtCloseSeconds);
      const activeSecondsOffline = Math.min(elapsedSeconds, remainingSeconds);

      if (rivalDrainApplies) {
        followerDrain +=
          rival.strength * RIVAL_DRAIN_RATE * OFFLINE_RIVAL_DRAIN_MULTIPLIER * activeSecondsOffline;
      }

      const remainingAfterOffline = remainingSeconds - activeSecondsOffline;
      if (remainingAfterOffline <= 0) return null;

      const ageAtReturnSeconds = RIVAL_EVENT_DURATION_MS / 1000 - remainingAfterOffline;
      return {
        ...rival,
        spawnedAt: nowMs - ageAtReturnSeconds * 1000
      } satisfies RivalState;
    })
    .filter((rival): rival is RivalState => Boolean(rival));

  const followersBefore = state.resources.followers;
  const followersAfter = Math.max(0, followersBefore + passiveFollowerGain - followerDrain);
  const followersDelta = followersAfter - followersBefore;
  const activeActsAfter = state.doctrine.activeActs.filter((act) => act.endsAt > nowMs);

  let civilizationHealth = state.cataclysm.civilizationHealth;
  let civilizationCollapsed = state.cataclysm.civilizationCollapsed;
  let civilizationRebuildEndsAt = state.cataclysm.civilizationRebuildEndsAt;

  if (civilizationCollapsed) {
    if (civilizationRebuildEndsAt > 0 && nowMs >= civilizationRebuildEndsAt) {
      civilizationCollapsed = false;
      civilizationHealth = CIV_HEALTH_MAX;
      civilizationRebuildEndsAt = 0;
    } else {
      civilizationHealth = 0;
    }
  } else {
    civilizationHealth = Math.min(
      CIV_HEALTH_MAX,
      civilizationHealth + getCivilizationRegenPerSecond(state) * elapsedSeconds
    );
  }

  const nextState = applyReturnAnchor(
    {
      ...state,
      resources: {
        ...state.resources,
        belief: state.resources.belief + beliefGained,
        influence: influenceAfter,
        veil: veilAfter,
        followers: followersAfter
      },
      stats: {
        ...state.stats,
        totalBeliefEarned: state.stats.totalBeliefEarned + beliefGained
      },
      doctrine: {
        ...state.doctrine,
        activeActs: activeActsAfter,
        rivals: rivalsAfter
      },
      cataclysm: {
        ...state.cataclysm,
        miracleReserve: Math.max(
          0,
          Math.min(getMiracleReserveCap(state), state.cataclysm.miracleReserve)
        ),
        civilizationHealth,
        civilizationCollapsed,
        civilizationRebuildEndsAt,
        peakFollowers: Math.max(state.cataclysm.peakFollowers, followersAfter),
        wasBelowVeilCollapseThreshold: state.cataclysm.wasBelowVeilCollapseThreshold || veilFloorHit
      },
      simulation: {
        ...state.simulation,
        totalElapsedMs: state.simulation.totalElapsedMs + elapsedSeconds * 1000
      }
    },
    nowMs
  );

  const faithDecayMultiplier = getFaithDecay(nextState, nowMs);

  return {
    state: nextState,
    offlineSummary: {
      elapsedSeconds,
      wasCapped,
      beliefGained,
      veilDelta,
      followersDelta,
      influenceAfter,
      faithDecayMultiplier,
      veilFloorHit
    },
    recoveryNotice: null,
    recoveredFromSnapshot: false
  };
}

export function runOfflineSimulationForRegression(
  state: GameState,
  nowMs: number
): LoadGameStateResult {
  return simulateOfflineProgress(state, nowMs);
}

function toSaveEnvelope(state: GameState): SaveEnvelope {
  return {
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
    savedAt: Date.now(),
    state
  };
}

function toSnapshotEnvelope(
  state: GameState,
  reason: "ascension" | "era_transition"
): SnapshotEnvelope {
  return {
    ...toSaveEnvelope(state),
    reason
  };
}

function parseEnvelope(raw: string): SaveEnvelope | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const schemaVersion = Math.floor(readNumber(parsed.schemaVersion, 0));
    if (!Number.isFinite(schemaVersion) || schemaVersion <= 0) return null;
    if (!("state" in parsed)) return null;
    return {
      schemaVersion,
      savedAt: Math.max(0, readNumber(parsed.savedAt, Date.now())),
      state: parsed.state
    };
  } catch {
    return null;
  }
}

function migrateEnvelopeState(
  envelope: SaveEnvelope,
  nowMs: number
): { state: GameState | null; warning: string | null } {
  if (envelope.schemaVersion > GAME_STATE_SCHEMA_VERSION) {
    return {
      state: null,
      warning: `Save schema v${envelope.schemaVersion} is newer than supported v${GAME_STATE_SCHEMA_VERSION}.`
    };
  }

  const migrator = MIGRATORS[envelope.schemaVersion];
  if (!migrator) {
    return {
      state: null,
      warning: `No migration path found for schema v${envelope.schemaVersion}.`
    };
  }

  const migrated = migrator(envelope.state, nowMs);
  const normalized: GameState = {
    ...migrated,
    simulation: {
      ...migrated.simulation,
      lastTickAt: nowMs,
      accumulatedMs: 0
    },
    meta: {
      ...migrated.meta,
      updatedAt: nowMs
    }
  };

  if (envelope.schemaVersion < GAME_STATE_SCHEMA_VERSION) {
    return {
      state: normalized,
      warning: `Imported schema v${envelope.schemaVersion} was migrated to v${GAME_STATE_SCHEMA_VERSION}.`
    };
  }

  return {
    state: normalized,
    warning: null
  };
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(toSaveEnvelope(state)));
  } catch {
    // Ignore localStorage write failures and keep the session running.
  }
}

export function saveRecoverySnapshot(
  state: GameState,
  reason: "ascension" | "era_transition"
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(toSnapshotEnvelope(state, reason)));
  } catch {
    // Ignore snapshot write failures and keep session running.
  }
}

export function getRecoverySnapshotMeta(): SnapshotMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const reason = parsed.reason === "ascension" || parsed.reason === "era_transition" ? parsed.reason : null;
    if (!reason) return null;
    return {
      savedAt: Math.max(0, readNumber(parsed.savedAt, 0)),
      reason
    };
  } catch {
    return null;
  }
}

export function restoreRecoverySnapshot(nowMs = Date.now()): SaveImportResult {
  if (typeof window === "undefined") {
    return { state: createInitialGameState(nowMs), warnings: [], error: null };
  }

  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) {
      return {
        state: null,
        warnings: [],
        error: "No recovery snapshot is available."
      };
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return {
        state: null,
        warnings: [],
        error: "Recovery snapshot is corrupted."
      };
    }

    const reason = parsed.reason === "ascension" || parsed.reason === "era_transition" ? parsed.reason : null;
    if (!reason) {
      return {
        state: null,
        warnings: [],
        error: "Recovery snapshot metadata is invalid."
      };
    }

    const envelope: SaveEnvelope = {
      schemaVersion: Math.floor(readNumber(parsed.schemaVersion, 0)),
      savedAt: Math.max(0, readNumber(parsed.savedAt, nowMs)),
      state: parsed.state
    };

    const migrated = migrateEnvelopeState(envelope, nowMs);
    if (!migrated.state) {
      return {
        state: null,
        warnings: migrated.warning ? [migrated.warning] : [],
        error: "Recovery snapshot could not be migrated."
      };
    }

    saveGameState(migrated.state);
    return {
      state: migrated.state,
      warnings: migrated.warning ? [migrated.warning] : [],
      error: null
    };
  } catch {
    return {
      state: null,
      warnings: [],
      error: "Recovery snapshot could not be restored."
    };
  }
}

export function createSaveExportPayload(state: GameState): string {
  return JSON.stringify(toSaveEnvelope(state), null, 2);
}

export function importSavePayload(
  rawText: string,
  currentState: GameState,
  nowMs = Date.now()
): SaveImportResult {
  const warnings: string[] = [];
  const envelope = parseEnvelope(rawText);

  if (!envelope) {
    return {
      state: null,
      warnings,
      error: "Save file is not a valid Veilborn save envelope."
    };
  }

  const migrated = migrateEnvelopeState(envelope, nowMs);
  if (!migrated.state) {
    return {
      state: null,
      warnings: migrated.warning ? [migrated.warning] : warnings,
      error: "Save could not be imported with this build."
    };
  }

  const imported = migrated.state;
  if (migrated.warning) warnings.push(migrated.warning);
  if (imported.meta.runId === currentState.meta.runId) {
    warnings.push("Imported save has the same run id as the current session.");
  }
  if (imported.meta.updatedAt < currentState.meta.updatedAt) {
    warnings.push("Imported save appears older than your current session.");
  }
  if (imported.prestige.completedRuns < currentState.prestige.completedRuns) {
    warnings.push("Imported save has fewer completed runs than your current session.");
  }

  return {
    state: imported,
    warnings,
    error: null
  };
}

export function loadGameStateWithOffline(nowMs = Date.now()): LoadGameStateResult {
  if (typeof window === "undefined") {
    return {
      state: createInitialGameState(nowMs),
      offlineSummary: null,
      recoveryNotice: null,
      recoveredFromSnapshot: false
    };
  }

  let raw = "";
  try {
    raw = window.localStorage.getItem(SAVE_KEY) ?? "";
  } catch {
    return {
      state: createInitialGameState(nowMs),
      offlineSummary: null,
      recoveryNotice: "Primary save could not be read. Started a fresh cycle.",
      recoveredFromSnapshot: false
    };
  }

  if (!raw) {
    return {
      state: createInitialGameState(nowMs),
      offlineSummary: null,
      recoveryNotice: null,
      recoveredFromSnapshot: false
    };
  }
  const primaryEnvelope = parseEnvelope(raw);
  if (primaryEnvelope) {
    const migrated = migrateEnvelopeState(primaryEnvelope, nowMs);
    if (migrated.state) {
      const simulated = simulateOfflineProgress(migrated.state, nowMs);
      return {
        ...simulated,
        recoveryNotice: migrated.warning,
        recoveredFromSnapshot: false
      };
    }
  }

  const snapshotResult = restoreRecoverySnapshot(nowMs);
  if (snapshotResult.state) {
    const simulated = simulateOfflineProgress(snapshotResult.state, nowMs);
    return {
      ...simulated,
      recoveryNotice:
        "Primary save looked corrupted. Restored from the last good snapshot before transition.",
      recoveredFromSnapshot: true
    };
  }

  return {
    state: createInitialGameState(nowMs),
    offlineSummary: null,
    recoveryNotice:
      "Primary save and snapshot could not be recovered. A fresh cycle was started to keep playability.",
    recoveredFromSnapshot: false
  };
}

export function loadGameState(nowMs = Date.now()): GameState {
  return loadGameStateWithOffline(nowMs).state;
}

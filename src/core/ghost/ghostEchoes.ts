import {
  DOMAIN_IDS,
  DOMAIN_LABELS,
  type DomainId,
  type GameState,
  type GhostInfluence,
  type GhostRunSignature,
  type GhostState
} from "../state/gameState";

const MAX_LOCAL_SIGNATURES = 14;
const MAX_IMPORTED_SIGNATURES = 40;
const MAX_ACTIVE_INFLUENCES = 3;
const SIGNATURE_BUNDLE_VERSION = 1;

interface RandomPick<T> {
  seed: number;
  value: T;
}

interface RawSignatureBundle {
  version?: number;
  signatures?: unknown;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function nextRandom(seed: number): RandomPick<number> {
  let x = seed >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const next = x >>> 0 || 0x6d2b79f5;
  return {
    seed: next,
    value: next / 4294967296
  };
}

function pickOne<T>(seed: number, values: T[]): RandomPick<T> {
  const roll = nextRandom(seed);
  const index = Math.min(values.length - 1, Math.floor(roll.value * values.length));
  return {
    seed: roll.seed,
    value: values[index]
  };
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 0x811c9dc5;
}

function normalizeDomainLevels(
  domainLevels: Partial<Record<DomainId, number>> | undefined
): Record<DomainId, number> {
  return {
    fire: Math.max(0, Math.floor(domainLevels?.fire ?? 0)),
    death: Math.max(0, Math.floor(domainLevels?.death ?? 0)),
    harvest: Math.max(0, Math.floor(domainLevels?.harvest ?? 0)),
    storm: Math.max(0, Math.floor(domainLevels?.storm ?? 0)),
    memory: Math.max(0, Math.floor(domainLevels?.memory ?? 0)),
    void: Math.max(0, Math.floor(domainLevels?.void ?? 0))
  };
}

function getDominantDomain(levels: Record<DomainId, number>): DomainId {
  let dominant: DomainId = "fire";
  for (const domainId of DOMAIN_IDS) {
    if (levels[domainId] > levels[dominant]) {
      dominant = domainId;
    }
  }
  return dominant;
}

function getSignatureFingerprint(signature: GhostRunSignature): string {
  return [
    signature.dominantDomain,
    signature.miracles,
    signature.betrayals,
    signature.veilCollapses,
    Math.floor(signature.totalBelief / 1000)
  ].join("|");
}

function getEffectsText(influence: GhostInfluence): string {
  const pieces: string[] = [];
  if (influence.domainSynergyDelta !== 0) {
    const sign = influence.domainSynergyDelta > 0 ? "+" : "";
    pieces.push(`synergy ${sign}${Math.round(influence.domainSynergyDelta * 100)}%`);
  }
  if (influence.rivalSpawnDelta !== 0) {
    const direction = influence.rivalSpawnDelta < 0 ? "faster" : "slower";
    pieces.push(`rivals ${direction}`);
  }
  return pieces.join(", ");
}

function createInfluenceFromSignature(signature: GhostRunSignature, ordinal: number): GhostInfluence {
  let domainSynergyDelta = 0;
  let rivalSpawnDelta = 0;
  let title = `${DOMAIN_LABELS[signature.dominantDomain]} Afterimage`;

  switch (signature.dominantDomain) {
    case "fire":
      domainSynergyDelta += 0.03;
      rivalSpawnDelta -= 0.1;
      title = "Scorched Scripture";
      break;
    case "death":
      domainSynergyDelta += 0.07;
      title = "Sepulcher Cant";
      break;
    case "harvest":
      domainSynergyDelta += 0.04;
      title = "Granary Hymn";
      break;
    case "storm":
      rivalSpawnDelta -= 0.12;
      title = "Thunder Litany";
      break;
    case "memory":
      domainSynergyDelta += 0.02;
      title = "Echo Chronicle";
      break;
    case "void":
      rivalSpawnDelta += 0.07;
      domainSynergyDelta -= 0.03;
      title = "Abyssal Quiet";
      break;
  }

  if (signature.miracles >= 4) {
    rivalSpawnDelta -= 0.05;
  }

  if (signature.betrayals > 0) {
    rivalSpawnDelta -= 0.03;
  }

  if (signature.veilCollapses >= 2) {
    domainSynergyDelta += 0.05;
  }

  const influence: GhostInfluence = {
    id: `anomaly-${signature.id}-${ordinal}`,
    signatureId: signature.id,
    source: signature.source,
    title,
    description: "",
    dominantDomain: signature.dominantDomain,
    domainSynergyDelta: clamp(domainSynergyDelta, -0.18, 0.2),
    rivalSpawnDelta: clamp(rivalSpawnDelta, -0.2, 0.2)
  };

  const effectsText = getEffectsText(influence);
  influence.description =
    effectsText.length > 0
      ? `${signature.label} leaves a ${effectsText} residue.`
      : `${signature.label} leaves a faint residue.`;
  return influence;
}

function sanitizeDomainId(input: unknown): DomainId | null {
  if (
    input === "fire" ||
    input === "death" ||
    input === "harvest" ||
    input === "storm" ||
    input === "memory" ||
    input === "void"
  ) {
    return input;
  }
  return null;
}

function sanitizeImportedSignature(raw: unknown, fallbackIndex: number): GhostRunSignature | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const rawDomain = sanitizeDomainId(record.dominantDomain);
  const rawLevels = typeof record.domainLevels === "object" && record.domainLevels !== null
    ? (record.domainLevels as Partial<Record<DomainId, number>>)
    : undefined;
  const domainLevels = normalizeDomainLevels(rawLevels);
  const dominantDomain = rawDomain ?? getDominantDomain(domainLevels);
  const label =
    typeof record.label === "string" && record.label.trim().length > 0
      ? record.label.trim()
      : `Imported Echo ${fallbackIndex + 1}`;
  const createdAt =
    typeof record.createdAt === "number" && Number.isFinite(record.createdAt)
      ? Math.max(0, Math.floor(record.createdAt))
      : Date.now();

  return {
    id: typeof record.id === "string" ? record.id : `imported-${fallbackIndex + 1}`,
    label,
    source: "imported",
    createdAt,
    dominantDomain,
    domainLevels,
    miracles:
      typeof record.miracles === "number" && Number.isFinite(record.miracles)
        ? Math.max(0, Math.floor(record.miracles))
        : 0,
    betrayals:
      typeof record.betrayals === "number" && Number.isFinite(record.betrayals)
        ? Math.max(0, Math.floor(record.betrayals))
        : 0,
    veilCollapses:
      typeof record.veilCollapses === "number" && Number.isFinite(record.veilCollapses)
        ? Math.max(0, Math.floor(record.veilCollapses))
        : 0,
    totalBelief:
      typeof record.totalBelief === "number" && Number.isFinite(record.totalBelief)
        ? Math.max(0, record.totalBelief)
        : 0
  };
}

export function createGhostRunSignature(state: GameState, nowMs: number): GhostRunSignature {
  const domainLevels = normalizeDomainLevels(
    state.domains.reduce(
      (accumulator, domain) => {
        accumulator[domain.id] = domain.level;
        return accumulator;
      },
      {} as Partial<Record<DomainId, number>>
    )
  );
  const dominantDomain = getDominantDomain(domainLevels);
  const runNumber = state.prestige.completedRuns + 1;

  return {
    id: `local-${state.ghost.nextSignatureId}`,
    label: `Run ${runNumber} - ${DOMAIN_LABELS[dominantDomain]} imprint`,
    source: "local",
    createdAt: nowMs,
    dominantDomain,
    domainLevels,
    miracles: state.cataclysm.miraclesThisRun,
    betrayals: state.pantheon.betrayalsThisRun,
    veilCollapses: state.cataclysm.totalVeilCollapses,
    totalBelief: state.stats.totalBeliefEarned
  };
}

export function appendLocalGhostSignature(ghost: GhostState, signature: GhostRunSignature): GhostState {
  const normalized: GhostRunSignature = {
    ...signature,
    source: "local",
    id: `local-${ghost.nextSignatureId}`
  };

  return {
    ...ghost,
    localSignatures: [normalized, ...ghost.localSignatures].slice(0, MAX_LOCAL_SIGNATURES),
    nextSignatureId: ghost.nextSignatureId + 1
  };
}

export function createGhostSignatureBundle(ghost: GhostState): string {
  const payload = {
    version: SIGNATURE_BUNDLE_VERSION,
    signatures: [...ghost.localSignatures, ...ghost.importedSignatures].map((signature) => ({
      ...signature,
      source: "imported" as const
    }))
  };
  return JSON.stringify(payload, null, 2);
}

export function parseGhostSignatureBundle(rawText: string): GhostRunSignature[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    return [];
  }

  const entries: unknown[] = Array.isArray(parsed)
    ? parsed
    : ((parsed as RawSignatureBundle)?.signatures as unknown[]) ?? [];

  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry, index) => sanitizeImportedSignature(entry, index))
    .filter((entry): entry is GhostRunSignature => Boolean(entry));
}

export function mergeImportedGhostSignatures(
  ghost: GhostState,
  signatures: GhostRunSignature[]
): { ghost: GhostState; importedCount: number } {
  if (signatures.length <= 0) {
    return {
      ghost,
      importedCount: 0
    };
  }

  const existingFingerprints = new Set(
    [...ghost.localSignatures, ...ghost.importedSignatures].map(getSignatureFingerprint)
  );

  const additions: GhostRunSignature[] = [];
  for (const signature of signatures) {
    const fingerprint = getSignatureFingerprint(signature);
    if (existingFingerprints.has(fingerprint)) continue;
    existingFingerprints.add(fingerprint);
    additions.push({
      ...signature,
      id: `imported-${ghost.nextSignatureId + additions.length}`,
      source: "imported"
    });
  }

  if (additions.length <= 0) {
    return {
      ghost,
      importedCount: 0
    };
  }

  return {
    ghost: {
      ...ghost,
      importedSignatures: [...additions, ...ghost.importedSignatures].slice(0, MAX_IMPORTED_SIGNATURES),
      nextSignatureId: ghost.nextSignatureId + additions.length
    },
    importedCount: additions.length
  };
}

export function selectGhostInfluences(
  ghost: GhostState,
  runId: string,
  rngSeed: number
): GhostInfluence[] {
  const importedPool = [...ghost.importedSignatures]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);
  const localPool = [...ghost.localSignatures]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  const pool = [...importedPool, ...localPool];
  if (pool.length <= 0) return [];

  const candidates = [...pool];
  let seed = hashString(runId) ^ (rngSeed >>> 0);
  const selected: GhostRunSignature[] = [];
  const target = Math.min(MAX_ACTIVE_INFLUENCES, candidates.length);

  while (selected.length < target && candidates.length > 0) {
    const roll = pickOne(seed, candidates);
    seed = roll.seed;
    selected.push(roll.value);
    const index = candidates.findIndex((entry) => entry.id === roll.value.id);
    if (index >= 0) {
      candidates.splice(index, 1);
    } else {
      candidates.shift();
    }
  }

  return selected.map((signature, index) => createInfluenceFromSignature(signature, index + 1));
}

export function initializeGhostForRun(ghost: GhostState, runId: string, rngSeed: number): GhostState {
  if (ghost.lastRunIdInitialized === runId) return ghost;
  return {
    ...ghost,
    activeInfluences: selectGhostInfluences(ghost, runId, rngSeed),
    lastRunIdInitialized: runId
  };
}

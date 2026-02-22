import {
  GAME_STATE_SCHEMA_VERSION,
  createInitialGameState,
  type DomainId,
  type DomainProgress,
  type GameState,
  type Mortal,
  type MortalTrait,
  type OmenEntry
} from "./gameState";

const SAVE_KEY = "veilborn.save";

interface SaveEnvelope {
  schemaVersion: number;
  savedAt: number;
  state: unknown;
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

function sanitizeMortals(value: unknown, fallback: Mortal[]): Mortal[] {
  if (!Array.isArray(value)) return fallback;

  const sanitized = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: readString(entry.id, `mortal-${index + 1}`),
        name: readString(entry.name, "Unnamed Listener"),
        trait: readTrait(entry.trait, "cautious")
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
      level: Math.max(0, readNumber(entry.level, 0)),
      xp: Math.max(0, readNumber(entry.xp, 0))
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

function migrateFromSchemaV1(rawState: unknown, nowMs: number): GameState {
  const fallback = createInitialGameState(nowMs);
  if (!isRecord(rawState)) return fallback;

  const rawMeta = isRecord(rawState.meta) ? rawState.meta : {};
  const rawSimulation = isRecord(rawState.simulation) ? rawState.simulation : {};
  const rawResources = isRecord(rawState.resources) ? rawState.resources : {};

  const prophets = Math.max(0, Math.floor(readNumber(rawState.prophets, fallback.prophets)));
  const mortals = sanitizeMortals(rawState.mortals, fallback.mortals);
  const domains = sanitizeDomains(rawState.domains, fallback.domains);
  const omenLog = sanitizeOmenLog(rawState.omenLog, fallback.omenLog);

  return {
    meta: {
      schemaVersion: GAME_STATE_SCHEMA_VERSION,
      runId: readString(rawMeta.runId, fallback.meta.runId),
      createdAt: readNumber(rawMeta.createdAt, fallback.meta.createdAt),
      updatedAt: nowMs
    },
    simulation: {
      tickMs: fallback.simulation.tickMs,
      // Reset to current wall-clock to avoid accidental offline progression before M6.
      lastTickAt: nowMs,
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
    mortals,
    domains,
    prophets,
    omenLog,
    nextEventId: Math.max(1, Math.floor(readNumber(rawState.nextEventId, fallback.nextEventId)))
  };
}

type Migrator = (rawState: unknown, nowMs: number) => GameState;

const MIGRATORS: Record<number, Migrator> = {
  1: migrateFromSchemaV1
};

function toSaveEnvelope(state: GameState): SaveEnvelope {
  return {
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
    savedAt: Date.now(),
    state
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

export function loadGameState(nowMs = Date.now()): GameState {
  if (typeof window === "undefined") return createInitialGameState(nowMs);

  let raw = "";
  try {
    raw = window.localStorage.getItem(SAVE_KEY) ?? "";
  } catch {
    return createInitialGameState(nowMs);
  }

  if (!raw) return createInitialGameState(nowMs);

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return createInitialGameState(nowMs);

    const schemaVersion = Math.floor(readNumber(parsed.schemaVersion, 0));
    const migrator = MIGRATORS[schemaVersion];
    if (!migrator) return createInitialGameState(nowMs);

    return migrator(parsed.state, nowMs);
  } catch {
    return createInitialGameState(nowMs);
  }
}


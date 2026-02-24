import {
  createInitialGameState,
  DEVOTION_STACK_MAX,
  OFFLINE_INFLUENCE_RETURN_RATIO,
  OFFLINE_MAX_SECONDS,
  OFFLINE_VEIL_FLOOR
} from "../src/core/state/gameState";
import { runOfflineSimulationForRegression } from "../src/core/state/persistence";
import {
  getBeliefGenerationBreakdown,
  getDevotionRecruitMultiplier,
  getEraOneGateStatus,
  getFaithDecay,
  getInfluenceCap,
  getInfluenceRegenBreakdown,
  getPassiveFollowerRate
} from "../src/core/engine/formulas";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertApprox(actual: number, expected: number, epsilon: number, message: string): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${message} (expected ${expected}, got ${actual})`);
  }
}

function testEraOneGateFollowerCondition(): void {
  const nowMs = 1_000_000;
  const state = createInitialGameState(nowMs);
  state.stats.totalBeliefEarned = 10_000;
  state.prophets = 3;
  state.resources.followers = 499;

  const below = getEraOneGateStatus(state);
  assert(!below.ready, "Era I gate should not be ready below 500 followers.");
  assert(!below.followersReady, "Era I follower condition should be false below threshold.");

  state.resources.followers = 500;
  const atTarget = getEraOneGateStatus(state);
  assert(atTarget.followersReady, "Era I follower condition should be true at 500.");
  assert(atTarget.ready, "Era I gate should be ready when all conditions are met.");
}

function testDevotionRecruitMultiplier(): void {
  const nowMs = 2_000_000;
  const state = createInitialGameState(nowMs);

  state.devotionStacks = 0;
  assertApprox(getDevotionRecruitMultiplier(state), 1, 1e-9, "Devotion 0-stack multiplier mismatch.");

  state.devotionStacks = DEVOTION_STACK_MAX;
  assertApprox(
    getDevotionRecruitMultiplier(state),
    1.24,
    1e-9,
    "Devotion max-stack multiplier mismatch."
  );

  state.devotionStacks = 999;
  assertApprox(
    getDevotionRecruitMultiplier(state),
    1.24,
    1e-9,
    "Devotion multiplier should clamp above stack cap."
  );
}

function testInfluenceBreakdownFormula(): void {
  const nowMs = 3_000_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.prophets = 10;
  state.cults = 15;
  state.resources.followers = 12_000;
  state.doctrine.shrinesBuilt = 3;

  const breakdown = getInfluenceRegenBreakdown(state);
  assertApprox(breakdown.basePerSecond, 6, 1e-9, "Influence base regen mismatch.");
  assertApprox(breakdown.shrinePerSecond, 0.6, 1e-9, "Influence shrine regen mismatch.");
  assertApprox(breakdown.cultPerSecond, 12, 1e-9, "Influence cult regen mismatch.");
  assertApprox(breakdown.totalPerSecond, 18.6, 1e-9, "Influence total regen mismatch.");
}

function testPassiveFollowerRateFormula(): void {
  const nowMs = 4_000_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.cults = 15;
  state.prophets = 10;
  state.doctrine.shrinesBuilt = 3;
  state.cataclysm.civilizationHealth = 80;
  state.resources.veil = 42;
  state.activity.lastEventAt = nowMs - 3 * 60_000;

  const faithDecay = getFaithDecay(state, nowMs);
  const expected = (0.35 * 15 + 0.25 * 3 + 0.05 * 10) * faithDecay * 0.8 * 1.1;
  const rate = getPassiveFollowerRate(state, nowMs);
  assertApprox(rate, expected, 1e-9, "Passive follower rate mismatch.");
}

function testFollowerTrickleBeliefFloor(): void {
  const nowMs = 5_000_000;
  const state = createInitialGameState(nowMs);
  state.resources.followers = 100;
  state.prophets = 0;
  state.cults = 0;

  const breakdown = getBeliefGenerationBreakdown(state, nowMs);
  assert(breakdown.followerPerSecond > 0, "Follower trickle should contribute positive B/s.");
  assertApprox(
    breakdown.totalPerSecond,
    breakdown.followerPerSecond,
    1e-9,
    "With zero prophets/cults, belief should equal follower trickle."
  );
}

function testOfflineSimulationCapAndInfluenceReset(): void {
  const baseMs = 10_000_000;
  const nowMs = baseMs + 10 * 60 * 60 * 1000; // 10h later
  const state = createInitialGameState(baseMs);
  state.era = 3;
  state.prophets = 5;
  state.meta.updatedAt = baseMs;
  state.simulation.lastTickAt = baseMs;
  state.simulation.totalElapsedMs = 0;
  state.resources.influence = 0;

  const result = runOfflineSimulationForRegression(state, nowMs);
  assert(result.offlineSummary !== null, "Offline summary should exist when elapsed time is > 1s.");
  if (!result.offlineSummary) {
    return;
  }

  assert(result.offlineSummary.wasCapped, "Offline summary should be marked capped above 8h.");
  assert(
    result.offlineSummary.elapsedSeconds === OFFLINE_MAX_SECONDS,
    "Offline elapsed seconds should clamp to 8h cap."
  );

  const expectedInfluence = getInfluenceCap(state) * OFFLINE_INFLUENCE_RETURN_RATIO;
  assertApprox(
    result.state.resources.influence,
    expectedInfluence,
    1e-9,
    "Offline influence return should reset to 50% of cap."
  );
}

function testOfflineNoVeilCollapseAndFloorClamp(): void {
  const baseMs = 20_000_000;
  const nowMs = baseMs + 2 * 60 * 60 * 1000;
  const state = createInitialGameState(baseMs);
  state.era = 3;
  state.resources.veil = 0;
  state.resources.followers = 1000;
  state.prophets = 0;
  state.cults = 0;
  state.doctrine.shrinesBuilt = 0;
  state.cataclysm.totalVeilCollapses = 7;
  state.cataclysm.wasBelowVeilCollapseThreshold = false;
  state.meta.updatedAt = baseMs;
  state.simulation.lastTickAt = baseMs;

  const result = runOfflineSimulationForRegression(state, nowMs);
  assert(
    result.state.cataclysm.totalVeilCollapses === 7,
    "Offline simulation should not trigger additional Veil collapse events."
  );
  assert(
    result.state.resources.veil >= OFFLINE_VEIL_FLOOR,
    "Offline Veil should be clamped to floor 15."
  );
  assert(
    result.state.resources.followers === 1000,
    "Offline collapse should not reduce followers while no rival/passive deltas are present."
  );
}

function testOfflinePassiveFollowerGainApplied(): void {
  const baseMs = 30_000_000;
  const nowMs = baseMs + 60 * 60 * 1000;
  const state = createInitialGameState(baseMs);
  state.era = 3;
  state.cults = 10;
  state.prophets = 5;
  state.doctrine.shrinesBuilt = 2;
  state.resources.followers = 500;
  state.resources.veil = 45;
  state.cataclysm.civilizationHealth = 100;
  state.meta.updatedAt = baseMs;
  state.simulation.lastTickAt = baseMs;

  const expectedRate = getPassiveFollowerRate(state, baseMs);
  const result = runOfflineSimulationForRegression(state, nowMs);
  assert(result.offlineSummary !== null, "Offline summary should be available for passive gain check.");
  if (!result.offlineSummary) {
    return;
  }

  const expectedDelta = expectedRate * 3600;
  assertApprox(
    result.offlineSummary.followersDelta,
    expectedDelta,
    1e-6,
    "Offline passive follower gain mismatch."
  );
}

function main(): void {
  const checks: Array<{ name: string; run: () => void }> = [
    { name: "Era I gate uses follower threshold", run: testEraOneGateFollowerCondition },
    { name: "Devotion recruit multiplier scaling", run: testDevotionRecruitMultiplier },
    { name: "Influence regen breakdown formula", run: testInfluenceBreakdownFormula },
    { name: "Passive follower rate formula", run: testPassiveFollowerRateFormula },
    { name: "Follower trickle belief floor", run: testFollowerTrickleBeliefFloor },
    { name: "Offline cap + influence reset", run: testOfflineSimulationCapAndInfluenceReset },
    { name: "Offline no-collapse + Veil floor clamp", run: testOfflineNoVeilCollapseAndFloorClamp },
    { name: "Offline passive follower gain", run: testOfflinePassiveFollowerGainApplied }
  ];

  for (const check of checks) {
    check.run();
    console.log(`PASS: ${check.name}`);
  }

  console.log(`M14 regression checks passed (${checks.length} checks).`);
}

main();

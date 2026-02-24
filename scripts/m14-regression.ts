import {
  createInitialGameState,
  DEVOTION_STACK_MAX,
  OFFLINE_INFLUENCE_RETURN_RATIO,
  OFFLINE_MAX_SECONDS,
  OFFLINE_VEIL_FLOOR
} from "../src/core/state/gameState";
import {
  performAscension,
  performCastMiracle,
  performCultFormation,
  performStartAct
} from "../src/core/engine/actions";
import { runOfflineSimulationForRegression } from "../src/core/state/persistence";
import {
  getActRewardBelief,
  getBeliefGenerationBreakdown,
  getCultOutput,
  getDevotionPath,
  getDevotionRecruitMultiplier,
  getEraOneGateStatus,
  getFaithDecay,
  getInfluenceCap,
  getInfluenceRegenBreakdown,
  getPassiveFollowerRate,
  getVeilErosionPerSecond
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

function testDevotionPathEmergenceAndSwitching(): void {
  const nowMs = 40_000_000;
  let state = createInitialGameState(nowMs);
  state.era = 2;
  state.cults = 2;
  state.resources.influence = 5_000;
  state.resources.belief = 500_000;

  state = performStartAct(state, "shrine", nowMs + 1_000);
  state = performStartAct(state, "ritual", nowMs + 2_000);
  assert(getDevotionPath(state) === "fervour", "Era II should emerge Fervour from act-heavy play.");

  state = performCultFormation(state, nowMs + 3_000);
  state = performCultFormation(state, nowMs + 4_000);
  state = performCultFormation(state, nowMs + 5_000);
  state = performCultFormation(state, nowMs + 6_000);
  assert(getDevotionPath(state) === "accord", "Devotion path should switch to Accord after sustained cult-heavy play.");
}

function testDevotionPathEffects(): void {
  const nowMs = 50_000_000;
  const base = createInitialGameState(nowMs);
  base.era = 3;
  base.prophets = 12;
  base.cults = 8;
  base.resources.followers = 20_000;
  base.resources.veil = 35;
  base.activity.lastEventAt = nowMs - 7 * 60_000;
  base.stats.totalBeliefEarned = 8_000_000;
  base.doctrine.shrinesBuilt = 8;
  base.resources.influence = 20_000;
  base.resources.belief = 100_000_000;
  base.devotionStacks = 3;

  const noPath = { ...base, devotionPath: "none" as const };
  const fervour = {
    ...base,
    devotionPath: "fervour" as const,
    devotionMomentum: { ...base.devotionMomentum, fervour: 10 }
  };
  const accord = {
    ...base,
    devotionPath: "accord" as const,
    devotionMomentum: { ...base.devotionMomentum, accord: 10 }
  };
  const reverence = {
    ...base,
    devotionPath: "reverence" as const,
    devotionMomentum: { ...base.devotionMomentum, reverence: 10 }
  };
  const ardour = {
    ...base,
    devotionPath: "ardour" as const,
    devotionMomentum: { ...base.devotionMomentum, ardour: 10 }
  };

  const baselineActReward = getActRewardBelief(noPath, 10_000, 45, 4);
  const fervourActReward = getActRewardBelief(fervour, 10_000, 45, 4);
  assert(fervourActReward > baselineActReward, "Fervour should increase act rewards.");

  const baselineCultOutput = getCultOutput(noPath);
  const accordCultOutput = getCultOutput(accord);
  assert(accordCultOutput > baselineCultOutput, "Accord should increase cult output.");

  const baselineErosion = getVeilErosionPerSecond(noPath);
  const reverenceErosion = getVeilErosionPerSecond(reverence);
  assert(reverenceErosion < baselineErosion, "Reverence should reduce Veil erosion.");

  const baselineFaithDecay = getFaithDecay(noPath, nowMs);
  const ardourFaithDecay = getFaithDecay(ardour, nowMs);
  assert(ardourFaithDecay >= baselineFaithDecay, "Ardour should resist faith decay pressure.");

  const baselineBelief = getBeliefGenerationBreakdown(noPath, nowMs).prophetPerSecond;
  const ardourBelief = getBeliefGenerationBreakdown(ardour, nowMs).prophetPerSecond;
  assert(ardourBelief > baselineBelief, "Ardour should improve prophet output contribution.");

  const baselineMiracle = performCastMiracle(noPath, 2, nowMs + 1_000).resources.belief;
  const fervourMiracle = performCastMiracle(fervour, 2, nowMs + 1_000).resources.belief;
  assert(fervourMiracle > baselineMiracle, "Fervour should amplify miracle belief gain.");
}

function testDevotionLineageMemoryOnAscension(): void {
  const nowMs = 60_000_000;
  let state = createInitialGameState(nowMs);
  state.era = 3;
  state.stats.totalBeliefEarned = 5_000_000;
  state.resources.veil = 20;
  state.cataclysm.miraclesThisRun = 2;
  state.simulation.totalElapsedMs = 240 * 60 * 1000;
  state.devotionPath = "fervour";
  state.devotionMomentum = { ...state.devotionMomentum, fervour: 8 };

  state = performAscension(state, nowMs + 1_000);
  assert(state.prestige.completedRuns === 1, "Ascension should complete one run.");
  assert(
    state.prestige.dominantDevotionPath === "fervour",
    "Ascension should persist dominant devotion path to prestige memory."
  );
  assert(
    state.devotionMomentum.fervour === 1,
    "Next run should start with one momentum point toward prior dominant path."
  );
  assert(state.devotionPath === "none", "New run should start with no active path.");
  assert(state.devotionStacks === 0, "Ascension should still reset devotion stacks.");
}

function main(): void {
  const checks: Array<{ name: string; run: () => void }> = [
    { name: "Era I gate uses follower threshold", run: testEraOneGateFollowerCondition },
    { name: "Devotion recruit multiplier scaling", run: testDevotionRecruitMultiplier },
    { name: "Influence regen breakdown formula", run: testInfluenceBreakdownFormula },
    { name: "Passive follower rate formula", run: testPassiveFollowerRateFormula },
    { name: "Follower trickle belief floor", run: testFollowerTrickleBeliefFloor },
    { name: "Devotion path emergence and switching", run: testDevotionPathEmergenceAndSwitching },
    { name: "Devotion path effect modifiers", run: testDevotionPathEffects },
    { name: "Devotion lineage memory on ascension", run: testDevotionLineageMemoryOnAscension },
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

import {
  createInitialGameState,
  DEVOTION_STACK_MAX,
  INFLUENCE_BASE_CAP,
  INFLUENCE_CAP_CULT_BASELINE,
  INFLUENCE_CAP_DOMAIN_LEVEL_BASELINE,
  INFLUENCE_CAP_PER_CULT_OVER_BASE,
  INFLUENCE_CAP_PER_DOMAIN_LEVEL_OVER_BASE,
  INFLUENCE_CAP_PER_PROPHET,
  INFLUENCE_CAP_PER_SHRINE_OVER_BASE,
  INFLUENCE_CAP_SHRINE_BASELINE,
  INFLUENCE_START_BONUS,
  MIRACLE_RESERVE_BASE_CAP,
  MIRACLE_RESERVE_DOMAIN_LEVEL_BASELINE,
  MIRACLE_RESERVE_MAX_CAP,
  MIRACLE_RESERVE_PER_CULT,
  MIRACLE_RESERVE_PER_DOMAIN_LEVEL_OVER_BASE,
  MIRACLE_RESERVE_PER_PROPHET,
  MIRACLE_RESERVE_PER_SHRINE,
  MIRACLE_RESERVE_START_BONUS,
  OFFLINE_INFLUENCE_RETURN_RATIO,
  OFFLINE_MAX_SECONDS,
  OFFLINE_VEIL_FLOOR,
  VEIL_EROSION_LOG_SCALE,
  VEIL_EROSION_PER_SHRINE_SCALE,
  VEIL_REGEN_ECHO_SECONDS,
  VEIL_REGEN_PER_SHRINE_SECONDS,
  VEIL_REGEN_SHRINE_DIMINISHING_SCALE
} from "../src/core/state/gameState";
import {
  canCastMiracle,
  performAscension,
  performCastMiracle,
  performCultFormation,
  performStartAct
} from "../src/core/engine/actions";
import { advanceWorld } from "../src/core/engine/worldTick";
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
  getMiracleReserveCap,
  getPassiveFollowerRate,
  getVeilRegenPerSecond,
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

function testEraThreeInfluenceCapScaling(): void {
  const nowMs = 3_500_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.echoBonuses.startInf = true;
  state.prophets = 18;
  state.cults = 26;
  state.doctrine.shrinesBuilt = 240;
  for (const domain of state.domains) {
    domain.level = 6;
  }

  const baseCap = INFLUENCE_BASE_CAP + state.prophets * INFLUENCE_CAP_PER_PROPHET + INFLUENCE_START_BONUS;
  const cultBonus =
    Math.max(0, state.cults - INFLUENCE_CAP_CULT_BASELINE) * INFLUENCE_CAP_PER_CULT_OVER_BASE;
  const domainAverage = state.domains.reduce((sum, domain) => sum + domain.level, 0) / state.domains.length;
  const domainBonus =
    Math.max(0, domainAverage - INFLUENCE_CAP_DOMAIN_LEVEL_BASELINE) *
    INFLUENCE_CAP_PER_DOMAIN_LEVEL_OVER_BASE;
  const shrineBonus =
    Math.max(0, state.doctrine.shrinesBuilt - INFLUENCE_CAP_SHRINE_BASELINE) *
    INFLUENCE_CAP_PER_SHRINE_OVER_BASE;
  const expectedCap = Math.floor(baseCap + cultBonus + domainBonus + shrineBonus);

  assertApprox(getInfluenceCap(state), expectedCap, 1e-9, "Era III influence cap scaling mismatch.");
}

function testMiracleReserveCapAndOverflow(): void {
  const nowMs = 3_750_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.echoBonuses.startInf = true;
  state.prophets = 12;
  state.cults = 10;
  state.doctrine.shrinesBuilt = 50;
  for (const domain of state.domains) {
    domain.level = 5;
  }
  state.resources.influence = getInfluenceCap(state);
  state.cataclysm.miracleReserve = 0;

  const domainAverage = state.domains.reduce((sum, domain) => sum + domain.level, 0) / state.domains.length;
  const expectedReserveCap = Math.max(
    0,
    Math.min(
      MIRACLE_RESERVE_MAX_CAP,
      Math.floor(
        MIRACLE_RESERVE_BASE_CAP +
          state.prophets * MIRACLE_RESERVE_PER_PROPHET +
          state.cults * MIRACLE_RESERVE_PER_CULT +
          state.doctrine.shrinesBuilt * MIRACLE_RESERVE_PER_SHRINE +
          Math.max(0, domainAverage - MIRACLE_RESERVE_DOMAIN_LEVEL_BASELINE) *
            MIRACLE_RESERVE_PER_DOMAIN_LEVEL_OVER_BASE +
          MIRACLE_RESERVE_START_BONUS
      )
    )
  );
  assertApprox(
    getMiracleReserveCap(state),
    expectedReserveCap,
    1e-9,
    "Miracle reserve cap formula mismatch."
  );

  const next = advanceWorld(state, nowMs + 5000);
  assert(
    next.cataclysm.miracleReserve > state.cataclysm.miracleReserve,
    "Influence overflow should accumulate into miracle reserve."
  );
}

function testMiracleReserveCastingAccessibility(): void {
  const nowMs = 3_900_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.resources.influence = 500;
  state.cataclysm.miracleReserve = 1_100;
  state.cataclysm.civilizationCollapsed = false;
  state.cataclysm.civilizationHealth = 100;
  state.prophets = 8;
  state.cults = 8;
  state.doctrine.shrinesBuilt = 40;

  assert(canCastMiracle(state, 2), "Tier-2 miracle should be castable via influence + reserve.");

  const cast = performCastMiracle(state, 2, nowMs + 500);
  assert(cast.resources.influence === 0, "Miracle casting should spend available influence first.");
  assert(cast.cataclysm.miracleReserve === 0, "Miracle casting should spend reserve for remaining cost.");
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

function testVeilRegenDiminishingReturns(): void {
  const nowMs = 70_000_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.doctrine.shrinesBuilt = 240;

  const regen = getVeilRegenPerSecond(state);
  const expected =
    1 / 120 +
    (240 * (1 / VEIL_REGEN_PER_SHRINE_SECONDS)) /
      (1 + 240 * VEIL_REGEN_SHRINE_DIMINISHING_SCALE);
  assertApprox(regen, expected, 1e-9, "Veil regen should use diminishing returns per shrine.");

  state.echoBonuses.veilRegen = true;
  const regenWithEcho = getVeilRegenPerSecond(state);
  const expectedWithEcho =
    1 / VEIL_REGEN_ECHO_SECONDS +
    (240 * (1 / VEIL_REGEN_ECHO_SECONDS)) /
      (1 + 240 * VEIL_REGEN_SHRINE_DIMINISHING_SCALE);
  assertApprox(
    regenWithEcho,
    expectedWithEcho,
    1e-9,
    "Veil regen echo should shift shrine base rate to 1/80 within diminishing formula."
  );
}

function testVeilErosionShrineTerm(): void {
  const nowMs = 80_000_000;
  const state = createInitialGameState(nowMs);
  state.era = 3;
  state.stats.totalBeliefEarned = 52_000_000_000;
  state.doctrine.shrinesBuilt = 240;

  const expected =
    VEIL_EROSION_LOG_SCALE * Math.log10(state.stats.totalBeliefEarned) +
    VEIL_EROSION_PER_SHRINE_SCALE * state.doctrine.shrinesBuilt;
  const erosion = getVeilErosionPerSecond(state);
  assertApprox(erosion, expected, 1e-9, "Veil erosion should include shrine-count pressure term.");
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
    { name: "Era III influence cap scaling", run: testEraThreeInfluenceCapScaling },
    { name: "Miracle reserve cap + overflow behavior", run: testMiracleReserveCapAndOverflow },
    { name: "Miracle reserve casting accessibility", run: testMiracleReserveCastingAccessibility },
    { name: "Passive follower rate formula", run: testPassiveFollowerRateFormula },
    { name: "Follower trickle belief floor", run: testFollowerTrickleBeliefFloor },
    { name: "Devotion path emergence and switching", run: testDevotionPathEmergenceAndSwitching },
    { name: "Devotion path effect modifiers", run: testDevotionPathEffects },
    { name: "Veil regen diminishing-returns curve", run: testVeilRegenDiminishingReturns },
    { name: "Veil erosion includes shrine pressure", run: testVeilErosionShrineTerm },
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

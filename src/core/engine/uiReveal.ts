import type { GameState } from "../state/gameState";

export interface UiRevealState {
  legibility: number;
  showHeaderSubtext: boolean;
  showVeilHud: boolean;
  showFollowersHud: boolean;
  showProphetsHud: boolean;
  showCultsHud: boolean;
  showDomainSumHud: boolean;
  showDomainPanel: boolean;
  showProgressPanel: boolean;
  showEraGatePanel: boolean;
  showDoctrinePanel: boolean;
  showCataclysmPanel: boolean;
  showAscensionPanel: boolean;
  showPantheonPanel: boolean;
  showStatsDrawer: boolean;
  omenVisibleCount: number;
  omenTitle: string;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function getUiRevealState(state: GameState): UiRevealState {
  const veilSignal = clamp((100 - state.resources.veil) / 100);
  const beliefSignal = clamp(Math.log10(state.stats.totalBeliefEarned + 1) / 5.5);
  const prophetSignal = clamp(state.prophets / 6);
  const eraSignal = clamp((state.era - 1) / 2);

  const legibility = clamp(
    0.08 + veilSignal * 0.32 + beliefSignal * 0.32 + prophetSignal * 0.16 + eraSignal * 0.28
  );

  const showFollowersHud = legibility >= 0.14 || state.resources.followers > 0;
  const showProphetsHud = legibility >= 0.2 || state.prophets > 0;
  const showCultsHud = state.era >= 2;
  const showVeilHud = state.era >= 3 || legibility >= 0.58;
  const showDomainSumHud = state.era >= 2 || legibility >= 0.62;

  return {
    legibility,
    showHeaderSubtext: legibility >= 0.22 || state.era >= 2,
    showVeilHud,
    showFollowersHud,
    showProphetsHud,
    showCultsHud,
    showDomainSumHud,
    showDomainPanel: legibility >= 0.18 || state.prophets > 0 || state.era >= 2,
    showProgressPanel: legibility >= 0.2 || state.prophets > 0 || state.era >= 2,
    showEraGatePanel: legibility >= 0.22 || state.prophets > 0 || state.era >= 2,
    showDoctrinePanel: state.era >= 2,
    showCataclysmPanel: state.era >= 3,
    showAscensionPanel: state.prestige.completedRuns > 0 || state.era >= 3,
    showPantheonPanel: state.pantheon.unlocked && state.era >= 2,
    showStatsDrawer: legibility >= 0.28 || state.era >= 2,
    omenVisibleCount: legibility < 0.2 ? 3 : legibility < 0.45 ? 5 : 8,
    omenTitle: legibility < 0.3 ? "Murmurs" : "Omens"
  };
}

export function veilMaskText(text: string, legibility: number): string {
  if (legibility >= 0.9) return text;

  const keepRatio = clamp(0.2 + legibility * 0.75, 0.2, 1);
  const chars = [...text];

  return chars
    .map((char, index) => {
      if (!/[a-z]/i.test(char)) return char;
      const deterministic = ((index * 31 + text.length * 17) % 100) / 100;
      return deterministic <= keepRatio ? char : "·";
    })
    .join("");
}


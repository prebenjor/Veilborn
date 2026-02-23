import type { GameState } from "../state/gameState";
import {
  canRevealCataclysm,
  canRevealDoctrine,
  canRevealDomainAggregate,
  canRevealPantheon,
  canRevealVeilHud
} from "./revealPolicy";

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
  const showCultsHud = canRevealDoctrine(state.era);
  const showVeilHud = canRevealVeilHud(state.era);
  const showDomainSumHud = canRevealDomainAggregate(state.era);

  return {
    legibility,
    showHeaderSubtext: legibility >= 0.22 || canRevealDoctrine(state.era),
    showVeilHud,
    showFollowersHud,
    showProphetsHud,
    showCultsHud,
    showDomainSumHud,
    showDomainPanel: legibility >= 0.18 || state.prophets > 0 || canRevealDoctrine(state.era),
    showProgressPanel: legibility >= 0.2 || state.prophets > 0 || canRevealDoctrine(state.era),
    showEraGatePanel: legibility >= 0.22 || state.prophets > 0 || canRevealDoctrine(state.era),
    showDoctrinePanel: canRevealDoctrine(state.era),
    showCataclysmPanel: canRevealCataclysm(state.era),
    showAscensionPanel: state.prestige.completedRuns > 0 || state.era >= 3,
    showPantheonPanel: canRevealPantheon(state.era, state.pantheon.unlocked),
    showStatsDrawer: legibility >= 0.28 || canRevealDoctrine(state.era),
    omenVisibleCount: legibility < 0.2 ? 2 : legibility < 0.45 ? 4 : 6,
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

export type VeilStateId = "calm" | "thinning" | "fraying" | "critical" | "unraveling";

export interface VeilStabilityView {
  id: VeilStateId;
  label: string;
  cssClass: string;
  backgroundZone: "stable" | "optimal" | "danger";
}

export function getVeilStabilityView(
  veilValue: number,
  collapseThreshold: number
): VeilStabilityView {
  if (veilValue <= collapseThreshold) {
    return {
      id: "unraveling",
      label: "Unraveling",
      cssClass: "veil-state-unraveling",
      backgroundZone: "danger"
    };
  }

  if (veilValue <= 15) {
    return {
      id: "critical",
      label: "Critical",
      cssClass: "veil-state-critical",
      backgroundZone: "danger"
    };
  }

  if (veilValue < 30) {
    return {
      id: "fraying",
      label: "Fraying",
      cssClass: "veil-state-fraying",
      backgroundZone: "danger"
    };
  }

  if (veilValue <= 55) {
    return {
      id: "thinning",
      label: "Thinning",
      cssClass: "veil-state-thinning",
      backgroundZone: "optimal"
    };
  }

  return {
    id: "calm",
    label: "Calm",
    cssClass: "veil-state-calm",
    backgroundZone: "stable"
  };
}

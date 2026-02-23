export type Era = 1 | 2 | 3;

export function isEraUnlocked(currentEra: Era, requiredEra: Era): boolean {
  return currentEra >= requiredEra;
}

export function canRevealDoctrine(currentEra: Era): boolean {
  return isEraUnlocked(currentEra, 2);
}

export function canRevealCataclysm(currentEra: Era): boolean {
  return isEraUnlocked(currentEra, 3);
}

export function canRevealPantheon(currentEra: Era, pantheonUnlocked: boolean): boolean {
  return pantheonUnlocked && isEraUnlocked(currentEra, 2);
}

export function canRevealVeilHud(currentEra: Era): boolean {
  return isEraUnlocked(currentEra, 3);
}

export function canRevealDomainAggregate(currentEra: Era): boolean {
  return isEraUnlocked(currentEra, 2);
}

export function shouldRevealCultControls(
  currentEra: Era,
  belief: number,
  nextCultBeliefCost: number,
  cultsOwned: number
): boolean {
  if (!isEraUnlocked(currentEra, 2)) return false;
  const revealThreshold = nextCultBeliefCost * 0.9;
  return cultsOwned > 0 || belief >= revealThreshold;
}

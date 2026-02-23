function hasLargeMagnitude(value: number): boolean {
  return Math.abs(value) >= 10000;
}

export function formatResource(value: number, maximumFractionDigits = 1): string {
  if (!Number.isFinite(value)) return "0";
  if (hasLargeMagnitude(value)) {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 2
    }).format(value);
  }

  return Intl.NumberFormat("en-US", {
    maximumFractionDigits
  }).format(value);
}

export function formatSignedResource(value: number, maximumFractionDigits = 1): string {
  const formatted = formatResource(Math.abs(value), maximumFractionDigits);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatRate(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const absolute = Math.abs(value);
  if (absolute === 0) return "0";
  return Intl.NumberFormat("en-US", {
    notation: absolute >= 10000 ? "compact" : "standard",
    compactDisplay: "short",
    maximumSignificantDigits: 3,
    minimumSignificantDigits: 2
  }).format(value);
}

export function formatProjected(value: number): string {
  if (!Number.isFinite(value)) return "~0";
  const absolute = Math.abs(value);
  const formatted = Intl.NumberFormat("en-US", {
    notation: absolute >= 10000 ? "compact" : "standard",
    compactDisplay: "short",
    maximumSignificantDigits: 3,
    minimumSignificantDigits: 1
  }).format(value);
  return `~${formatted}`;
}

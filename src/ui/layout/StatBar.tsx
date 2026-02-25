import { formatRate, formatResource } from "../../core/ui/numberFormat";
import type { VeilStabilityView } from "../../core/ui/veilPresentation";

interface StatBarProps {
  era: 1 | 2 | 3;
  belief: number;
  beliefPerSecond: number;
  influence: number;
  influenceCap: number;
  influencePerSecond: number;
  followers: number;
  followerPerSecond: number;
  veil: number;
  veilStability: VeilStabilityView;
}

export function StatBar({
  era,
  belief,
  beliefPerSecond,
  influence,
  influenceCap,
  influencePerSecond,
  followers,
  followerPerSecond,
  veil,
  veilStability
}: StatBarProps) {
  return (
    <section className="veil-statbar grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-3">
      <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Belief</p>
        <p className="mt-2 text-xl text-white">{formatResource(belief)}</p>
        <p className="mt-1 text-xs text-veil/65">{formatRate(beliefPerSecond)} / sec</p>
      </article>
      <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Influence</p>
        <p className="mt-2 text-xl text-white">
          {formatResource(influence)} / {formatResource(influenceCap)}
        </p>
        <p className="mt-1 text-xs text-veil/65">{formatRate(influencePerSecond)} / sec</p>
      </article>
      <article className="veil-stat-card rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Followers</p>
        <p className="mt-2 text-xl text-white">{formatResource(followers)}</p>
        {era >= 2 ? (
          <p className="mt-1 text-xs text-veil/65">{formatRate(followerPerSecond)} / sec</p>
        ) : null}
        {era >= 3 ? (
          <p className="mt-1 text-xs text-veil/65">
            Veil {formatResource(veil)} <span className="text-veil/55">&middot;</span>{" "}
            <span className={`${veilStability.cssClass} text-base`}>{veilStability.label}</span>
          </p>
        ) : null}
      </article>
    </section>
  );
}

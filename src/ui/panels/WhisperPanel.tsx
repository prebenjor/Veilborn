import { useState } from "react";
import { formatResource } from "../../core/ui/numberFormat";
import { formatDurationCompact } from "../../core/ui/timeFormat";
import type { WhisperMagnitude, WhisperTarget } from "../../core/state/gameState";

interface WhisperOptionView {
  target: WhisperTarget;
  magnitude: WhisperMagnitude;
  label: string;
  cost: number;
  canUse: boolean;
  cooldownSeconds: number;
  failChance: number;
  successFollowers: number;
  strainedFollowers: number;
}

interface WhisperPanelProps {
  era: number;
  influence: number;
  whisperCost: number;
  whisperOptions: WhisperOptionView[];
  recruitCost: number;
  recruitPreview: string;
  cadencePromptActive: boolean;
  rivalDrainWarning?: string | null;
  onWhisper: (target: WhisperTarget, magnitude: WhisperMagnitude) => void;
  onRecruit: () => void;
}

export function WhisperPanel({
  era,
  influence,
  whisperCost,
  whisperOptions,
  recruitCost,
  recruitPreview,
  cadencePromptActive,
  rivalDrainWarning,
  onWhisper,
  onRecruit
}: WhisperPanelProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const whisperDisabled = influence < whisperCost;
  const recruitDisabled = influence < recruitCost;
  const hoveredWhisperOption = whisperOptions.find(
    (option) => hoveredAction === `whisper:${option.target}:${option.magnitude}`
  );

  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Whispers</h2>
      {era <= 1 ? (
        <p className="mt-3 text-sm text-veil/70">Words spread. Silence lets faith fade.</p>
      ) : null}
      {cadencePromptActive ? (
        <p className="mt-2 rounded-lg border border-ember/40 bg-ember/10 px-2 py-1 text-xs text-ember">
          Silence is thickening. Act now for a cadence bonus.
        </p>
      ) : null}
      {rivalDrainWarning ? <p className="mt-2 text-xs text-ember/80">{rivalDrainWarning}</p> : null}
      {era >= 2 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {whisperOptions.map((option) => {
            const optionKey = `whisper:${option.target}:${option.magnitude}`;
            const isCoolingDown = option.cooldownSeconds > 0;
            return (
              <button
                key={optionKey}
                type="button"
                disabled={!option.canUse}
                onClick={() => onWhisper(option.target, option.magnitude)}
                onMouseEnter={() => setHoveredAction(optionKey)}
                onMouseLeave={() =>
                  setHoveredAction((previous) => (previous === optionKey ? null : previous))
                }
                onFocus={() => setHoveredAction(optionKey)}
                onBlur={() => setHoveredAction((previous) => (previous === optionKey ? null : previous))}
                className="rounded-xl border border-ember/60 px-3 py-2 text-left text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
              >
                <p>{option.label}</p>
                <p className="mt-1 text-[11px] text-veil/70">
                  {formatResource(option.cost)} Influence
                  {isCoolingDown ? ` - ready in ${formatDurationCompact(option.cooldownSeconds)}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={whisperDisabled}
            onClick={() => onWhisper("crowd", "base")}
            onMouseEnter={() => setHoveredAction("whisper:crowd:base")}
            onMouseLeave={() =>
              setHoveredAction((previous) => (previous === "whisper:crowd:base" ? null : previous))
            }
            onFocus={() => setHoveredAction("whisper:crowd:base")}
            onBlur={() =>
              setHoveredAction((previous) => (previous === "whisper:crowd:base" ? null : previous))
            }
            className="rounded-xl border border-ember/60 px-3 py-2 text-sm text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
          >
            Whisper ({formatResource(whisperCost)} Influence)
          </button>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={recruitDisabled}
          onClick={onRecruit}
          onMouseEnter={() => setHoveredAction("recruit")}
          onMouseLeave={() => setHoveredAction((previous) => (previous === "recruit" ? null : previous))}
          onFocus={() => setHoveredAction("recruit")}
          onBlur={() => setHoveredAction((previous) => (previous === "recruit" ? null : previous))}
          className="rounded-xl border border-omen/60 px-3 py-2 text-sm text-omen transition hover:bg-omen/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
        >
          Recruit ({formatResource(recruitCost)} Influence)
        </button>
      </div>
      {hoveredAction ? (
        <p className="mt-2 text-xs text-veil/65">
          {hoveredAction === "recruit"
            ? `Recruit: ${recruitPreview}`
            : hoveredWhisperOption
              ? hoveredWhisperOption.failChance > 0
                ? `${hoveredWhisperOption.label}: +${formatResource(
                    hoveredWhisperOption.successFollowers
                  )} followers (${Math.round(hoveredWhisperOption.failChance * 100)}% strain - +${formatResource(
                    hoveredWhisperOption.strainedFollowers
                  )})`
                : `${hoveredWhisperOption.label}: +${formatResource(
                    hoveredWhisperOption.successFollowers
                  )} followers`
              : null}
        </p>
      ) : null}
    </section>
  );
}


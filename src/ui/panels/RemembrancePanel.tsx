import type {
  ArchitectureBeliefRule,
  ArchitectureCivilizationRule,
  ArchitectureDomainRule,
  FinalChoice
} from "../../core/state/gameState";
import type { RemembranceConditionView } from "../../core/engine/remembrance";
import { formatResource } from "../../core/ui/numberFormat";

interface RemembrancePanelProps {
  architectureUnlocked: boolean;
  beliefRule: ArchitectureBeliefRule;
  civilizationRule: ArchitectureCivilizationRule;
  domainRule: ArchitectureDomainRule;
  unlockedLetters: number;
  totalLetters: number;
  conditions: RemembranceConditionView[];
  finalChoice: FinalChoice;
  canInvokeFinalChoice: boolean;
  onSetBeliefRule: (rule: ArchitectureBeliefRule) => void;
  onSetCivilizationRule: (rule: ArchitectureCivilizationRule) => void;
  onSetDomainRule: (rule: ArchitectureDomainRule) => void;
  onInvokeFinalChoice: (choice: Exclude<FinalChoice, "none">) => void;
}

const BELIEF_RULE_OPTIONS: Array<{
  id: ArchitectureBeliefRule;
  label: string;
  description: string;
}> = [
  { id: "orthodox", label: "Orthodox", description: "Balanced belief output." },
  { id: "fervor", label: "Fervor", description: "Higher belief, harsher faith decay." },
  { id: "litany", label: "Litany", description: "Lower belief, gentler faith decay." }
];

const CIV_RULE_OPTIONS: Array<{
  id: ArchitectureCivilizationRule;
  label: string;
  description: string;
}> = [
  { id: "steady", label: "Steady", description: "Balanced civilization recovery." },
  { id: "expansion", label: "Expansion", description: "Faster civilization healing." },
  { id: "fracture", label: "Fracture", description: "Slower civilization healing." }
];

const DOMAIN_RULE_OPTIONS: Array<{
  id: ArchitectureDomainRule;
  label: string;
  description: string;
}> = [
  { id: "constellation", label: "Constellation", description: "Balanced domain synergy." },
  { id: "focused", label: "Focused", description: "Narrower domain resonance." },
  { id: "chaotic", label: "Chaotic", description: "Higher domain resonance variance." }
];

function RuleRow<T extends string>({
  title,
  value,
  options,
  onSelect
}: {
  title: string;
  value: T;
  options: Array<{ id: T; label: string; description: string }>;
  onSelect: (value: T) => void;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-veil/70">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`rounded-lg border px-2 py-1 text-xs transition ${
              value === option.id
                ? "border-omen/70 bg-omen/10 text-omen"
                : "border-white/20 text-veil/75 hover:border-veil/60 hover:text-veil"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-veil/60">
        {options.find((option) => option.id === value)?.description ?? "No rule selected."}
      </p>
    </article>
  );
}

export function RemembrancePanel({
  architectureUnlocked,
  beliefRule,
  civilizationRule,
  domainRule,
  unlockedLetters,
  totalLetters,
  conditions,
  finalChoice,
  canInvokeFinalChoice,
  onSetBeliefRule,
  onSetCivilizationRule,
  onSetDomainRule,
  onInvokeFinalChoice
}: RemembrancePanelProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">Architecture and Remembrance</h2>
      <p className="mt-2 text-sm text-veil/70">
        Name letters recovered: {formatResource(unlockedLetters)} / {formatResource(totalLetters)}.
      </p>

      <div className="mt-3 grid gap-2">
        {conditions.map((condition) => (
          <article
            key={condition.id}
            className={`rounded-xl border p-3 ${
              condition.unlocked
                ? "border-omen/40 bg-omen/10 text-omen"
                : "border-white/10 bg-black/20 text-veil/75"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Letter {condition.id}</p>
            <p className="mt-1 text-sm">{condition.fragment}</p>
            <p className="mt-1 text-[11px] opacity-80">
              {condition.unlocked
                ? "Condition complete."
                : `${condition.targetLabel} | ${condition.progressText}`}
            </p>
          </article>
        ))}
      </div>

      {architectureUnlocked ? (
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <RuleRow
            title="Belief Formation"
            value={beliefRule}
            options={BELIEF_RULE_OPTIONS}
            onSelect={onSetBeliefRule}
          />
          <RuleRow
            title="Civilization Growth"
            value={civilizationRule}
            options={CIV_RULE_OPTIONS}
            onSelect={onSetCivilizationRule}
          />
          <RuleRow
            title="Domain Semantics"
            value={domainRule}
            options={DOMAIN_RULE_OPTIONS}
            onSelect={onSetDomainRule}
          />
        </div>
      ) : (
        <p className="mt-4 text-xs text-veil/60">
          The architecture layer remains sealed until the third cycle (run 3).
        </p>
      )}

      <article className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Final Choice</p>
        {finalChoice === "none" ? (
          <p className="mt-1 text-xs text-veil/60">
            Recover every name letter to invoke the final choice.
          </p>
        ) : (
          <p className="mt-1 text-xs text-veil/60">
            The choice was made. Its consequence remains in this cycle.
          </p>
        )}

        {finalChoice === "none" ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canInvokeFinalChoice}
              onClick={() => onInvokeFinalChoice("remember")}
              className="rounded-lg border border-ember/60 px-2 py-1 text-xs text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Speak the Name
            </button>
            <button
              type="button"
              disabled={!canInvokeFinalChoice}
              onClick={() => onInvokeFinalChoice("forget")}
              className="rounded-lg border border-veil/60 px-2 py-1 text-xs text-veil transition hover:bg-veil/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/30"
            >
              Bury the Name
            </button>
          </div>
        ) : null}
      </article>
    </section>
  );
}

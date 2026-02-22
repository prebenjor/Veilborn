import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { openingOmen } from "./core/content/omens";
import { initialGameState } from "./core/state/gameState";
import { WhisperPanel } from "./ui/panels/WhisperPanel";

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export default function App() {
  const [influence, setInfluence] = useState(initialGameState.resources.influence);
  const [belief, setBelief] = useState(initialGameState.resources.belief);
  const [veil] = useState(initialGameState.resources.veil);
  const [omens, setOmens] = useState<string[]>([openingOmen]);

  const whisperCost = 10;
  const canWhisper = influence >= whisperCost;

  const veilOpacity = useMemo(() => {
    const normalized = Math.max(0.15, Math.min(1, veil / 100));
    return normalized;
  }, [veil]);

  const onWhisper = () => {
    if (!canWhisper) return;
    setInfluence((prev) => prev - whisperCost);
    setBelief((prev) => prev + 2);
    setOmens((prev) => [
      "A voice crossed the valley. A family did not sleep.",
      ...prev
    ]);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-slate-950/20 to-black"
        style={{ opacity: veilOpacity }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8"
      >
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-veil/70">Veilborn</p>
          <h1 className="text-2xl font-semibold text-veil md:text-4xl">
            Someone is listening.
          </h1>
          <p className="max-w-2xl text-sm text-veil/70">
            M0 scaffold: React + TypeScript + Tailwind + Framer Motion. Systems in
            `MANIFESTO.md` drive all later implementation.
          </p>
        </header>

        <section className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Belief</p>
            <p className="mt-2 text-xl text-white">{formatNumber(belief)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Influence</p>
            <p className="mt-2 text-xl text-white">{formatNumber(influence)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
              Veil Thickness
            </p>
            <p className="mt-2 text-xl text-white">{formatNumber(veil)}</p>
          </article>
        </section>

        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <WhisperPanel influence={influence} onWhisper={onWhisper} />
          <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
            <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">
              Omens
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-veil/75">
              {omens.slice(0, 6).map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        </div>
      </motion.div>
    </main>
  );
}


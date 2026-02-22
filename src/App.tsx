import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { canWhisper, performWhisper } from "./core/engine/actions";
import { advanceWorld, getInfluenceCap } from "./core/engine/worldTick";
import {
  WHISPER_INFLUENCE_COST,
  WORLD_TICK_MS,
  type GameState
} from "./core/state/gameState";
import { loadGameState, saveGameState } from "./core/state/persistence";
import { WhisperPanel } from "./ui/panels/WhisperPanel";

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const tickTimer = window.setInterval(() => {
      setGameState((prev) => advanceWorld(prev, Date.now()));
    }, WORLD_TICK_MS);

    return () => window.clearInterval(tickTimer);
  }, []);

  useEffect(() => {
    const autosaveTimer = window.setInterval(() => {
      saveGameState(gameStateRef.current);
    }, 2000);

    return () => window.clearInterval(autosaveTimer);
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      saveGameState(gameStateRef.current);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const canUseWhisper = canWhisper(gameState);

  const veilOpacity = useMemo(() => {
    const normalized = Math.max(0.15, Math.min(1, gameState.resources.veil / 100));
    return normalized;
  }, [gameState.resources.veil]);

  const onWhisper = () => {
    setGameState((prev) => performWhisper(prev, Date.now()));
  };

  const influenceCap = getInfluenceCap(gameState.prophets);
  const elapsedSeconds = Math.floor(gameState.simulation.totalElapsedMs / 1000);

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
            Deterministic fixed-step loop with persistent save state is active. This
            is the M1 baseline for formulas, actions, and progression systems.
          </p>
        </header>

        <section className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Belief</p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.resources.belief)}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Influence</p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.resources.influence)} / {formatNumber(influenceCap)}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">
              Veil Thickness
            </p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.resources.veil)}
            </p>
          </article>
        </section>

        <section className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Followers</p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.resources.followers)}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Prophets</p>
            <p className="mt-2 text-xl text-white">{formatNumber(gameState.prophets)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Ticks</p>
            <p className="mt-2 text-xl text-white">
              {formatNumber(gameState.simulation.totalTicks)}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-veil/70">Run Time</p>
            <p className="mt-2 text-xl text-white">{formatNumber(elapsedSeconds)}s</p>
          </article>
        </section>

        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <WhisperPanel
            influence={gameState.resources.influence}
            cost={WHISPER_INFLUENCE_COST}
            onWhisper={onWhisper}
          />
          <section className="rounded-2xl border border-white/15 bg-black/25 p-4 shadow-veil backdrop-blur-sm">
            <h2 className="text-sm uppercase tracking-[0.25em] text-veil/80">
              Omens
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-veil/75">
              {gameState.omenLog.slice(0, 6).map((entry) => (
                <li key={entry.id}>{entry.text}</li>
              ))}
            </ul>
          </section>
        </div>

        <p className="text-xs text-veil/60">
          Whisper cost: {WHISPER_INFLUENCE_COST} influence.{" "}
          {canUseWhisper ? "A mortal can still hear you." : "The silence is too thick."}
        </p>
      </motion.div>
    </main>
  );
}

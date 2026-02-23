import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import type { DomainId } from "../state/gameState";

const AUDIO_PREFS_KEY = "veilborn.audio.preferences.v1";
const MIN_LAYER_GAIN = 0.08;
const MAX_LAYER_GAIN = 0.42;

type AudioMode = "idle" | "running" | "fallback" | "error";

interface AudioPreferences {
  muted: boolean;
  fallback: boolean;
}

type SynthOscillatorType = "sine" | "triangle" | "square" | "sawtooth";

interface DomainLayerConfig {
  notes: readonly string[];
  interval: string;
  oscillator: SynthOscillatorType;
}

interface DomainLayer {
  gain: Tone.Gain;
  synth: Tone.Synth;
  loop: Tone.Loop;
  step: number;
}

export interface AudioSnapshot {
  era: 1 | 2 | 3;
  veil: number;
  civilizationHealth: number;
  civilizationCollapsed: boolean;
  rivalCount: number;
  totalDomainLevel: number;
  domains: Record<DomainId, number>;
}

export interface AudioUiState {
  supported: boolean;
  mode: AudioMode;
  muted: boolean;
  message: string | null;
}

interface UseVeilAudioResult {
  controls: AudioUiState;
  enableAudio: () => Promise<void>;
  disableAudio: () => void;
  toggleMute: () => void;
  useSilentFallback: () => void;
}

const DOMAIN_AUDIO_CONFIG: Record<DomainId, DomainLayerConfig> = {
  fire: {
    notes: ["C3", "E3", "G3", "Bb3", "D4"],
    interval: "4n",
    oscillator: "sawtooth"
  },
  death: {
    notes: ["D2", "F2", "A2", "C3"],
    interval: "2n",
    oscillator: "triangle"
  },
  harvest: {
    notes: ["G2", "B2", "D3", "G3", "A3"],
    interval: "2n",
    oscillator: "sine"
  },
  storm: {
    notes: ["A2", "C3", "E3", "G3", "Bb3"],
    interval: "8n",
    oscillator: "square"
  },
  memory: {
    notes: ["E3", "G3", "B3", "D4"],
    interval: "2n",
    oscillator: "sine"
  },
  void: {
    notes: ["B1", "D2", "F2", "A2"],
    interval: "1n",
    oscillator: "triangle"
  }
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function getWebAudioSupport(): boolean {
  if (typeof window === "undefined") return false;
  const webAudioWindow = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  return Boolean(window.AudioContext || webAudioWindow.webkitAudioContext);
}

function loadAudioPreferences(): AudioPreferences {
  if (typeof window === "undefined") {
    return { muted: false, fallback: false };
  }

  try {
    const raw = window.localStorage.getItem(AUDIO_PREFS_KEY);
    if (!raw) return { muted: false, fallback: false };
    const parsed = JSON.parse(raw) as Partial<AudioPreferences>;
    return {
      muted: Boolean(parsed.muted),
      fallback: Boolean(parsed.fallback)
    };
  } catch {
    return { muted: false, fallback: false };
  }
}

function saveAudioPreferences(preferences: AudioPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore preference write failures to keep gameplay uninterrupted.
  }
}

class VeilbornAudioEngine {
  private readonly masterFilter: Tone.Filter;
  private readonly masterGain: Tone.Gain;
  private readonly layerBus: Tone.Gain;
  private readonly layers: Record<DomainId, DomainLayer>;
  private instability = 0;
  private dropoutChance = 0;
  private started = false;
  private disposed = false;

  constructor() {
    this.masterFilter = new Tone.Filter({
      frequency: 1800,
      type: "lowpass",
      rolloff: -24
    }).toDestination();

    this.masterGain = new Tone.Gain(0.16).connect(this.masterFilter);
    this.layerBus = new Tone.Gain(1).connect(this.masterGain);

    this.layers = (Object.keys(DOMAIN_AUDIO_CONFIG) as DomainId[]).reduce((accumulator, domainId) => {
      const config = DOMAIN_AUDIO_CONFIG[domainId];
      const gain = new Tone.Gain(0).connect(this.layerBus);
      const synth = new Tone.Synth({
        oscillator: { type: config.oscillator },
        envelope: {
          attack: 0.06,
          decay: 0.3,
          sustain: 0.25,
          release: 0.8
        }
      }).connect(gain);

      const loop = new Tone.Loop((time) => {
        if (Math.random() < this.dropoutChance) return;
        const layer = this.layers[domainId];
        const note = config.notes[layer.step % config.notes.length];
        layer.step = (layer.step + 1) % config.notes.length;

        const detuneJitter = (Math.random() - 0.5) * this.instability * 65;
        layer.synth.detune.rampTo(detuneJitter, 0.12);
        const velocity = 0.23 + (1 - this.instability) * 0.24;
        layer.synth.triggerAttackRelease(note, "8n", time, velocity);
      }, config.interval).start(0);

      accumulator[domainId] = {
        gain,
        synth,
        loop,
        step: 0
      };
      return accumulator;
    }, {} as Record<DomainId, DomainLayer>);
  }

  async start(): Promise<void> {
    if (this.disposed) return;
    await Tone.start();
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start("+0.05");
    }
    this.started = true;
  }

  stop(): void {
    if (this.disposed) return;
    if (Tone.Transport.state === "started") {
      Tone.Transport.stop();
    }
    this.started = false;
    for (const domainId of Object.keys(this.layers) as DomainId[]) {
      this.layers[domainId].gain.gain.rampTo(0, 0.2);
    }
  }

  setMuted(muted: boolean): void {
    if (this.disposed) return;
    Tone.Destination.mute = muted;
  }

  update(snapshot: AudioSnapshot): void {
    if (!this.started || this.disposed) return;

    const veilPressure = clamp((55 - snapshot.veil) / 55);
    const civilizationPressure = clamp((100 - snapshot.civilizationHealth) / 100);
    const rivalPressure = clamp(snapshot.rivalCount / 2) * 0.2;
    const collapsePressure = snapshot.civilizationCollapsed ? 0.32 : 0;
    const eraPressure = snapshot.era >= 3 ? 0.08 : snapshot.era === 2 ? 0.03 : 0;

    const instability = clamp(
      veilPressure * 0.5 + civilizationPressure * 0.35 + rivalPressure + collapsePressure + eraPressure
    );

    this.instability = instability;
    this.dropoutChance = clamp((instability - 0.35) * 1.1, 0, 0.65);

    const targetBpm = 52 + snapshot.era * 8 + Math.min(snapshot.totalDomainLevel, 24) * 0.65;
    Tone.Transport.bpm.rampTo(targetBpm, 1.2);
    this.masterFilter.frequency.rampTo(2200 - instability * 1400, 0.5);
    this.masterGain.gain.rampTo(0.18 - instability * 0.06, 0.5);

    for (const domainId of Object.keys(this.layers) as DomainId[]) {
      const domainLevel = snapshot.domains[domainId];
      const levelSignal = clamp(domainLevel / 10);
      let gainTarget =
        domainLevel <= 0
          ? 0
          : MIN_LAYER_GAIN + levelSignal * (MAX_LAYER_GAIN - MIN_LAYER_GAIN);

      if (snapshot.era === 1) {
        gainTarget *= 0.82;
      }

      gainTarget *= 1 - instability * 0.28;
      this.layers[domainId].gain.gain.rampTo(gainTarget, 0.45);
    }
  }

  dispose(): void {
    if (this.disposed) return;

    this.stop();
    for (const domainId of Object.keys(this.layers) as DomainId[]) {
      const layer = this.layers[domainId];
      layer.loop.dispose();
      layer.synth.dispose();
      layer.gain.dispose();
    }

    this.layerBus.dispose();
    this.masterGain.dispose();
    this.masterFilter.dispose();
    this.disposed = true;
  }
}

export function useVeilAudio(snapshot: AudioSnapshot): UseVeilAudioResult {
  const supported = useMemo(() => getWebAudioSupport(), []);
  const initialPreferences = useMemo(() => loadAudioPreferences(), []);
  const [muted, setMuted] = useState(initialPreferences.muted);
  const [mode, setMode] = useState<AudioMode>(() => {
    if (!supported) return "fallback";
    return initialPreferences.fallback ? "fallback" : "idle";
  });
  const [message, setMessage] = useState<string | null>(() => {
    if (supported) return null;
    return "WebAudio unavailable in this browser. Silent fallback enabled.";
  });

  const engineRef = useRef<VeilbornAudioEngine | null>(null);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const savePreferences = useCallback(
    (nextMode: AudioMode, nextMuted: boolean) => {
      saveAudioPreferences({
        muted: nextMuted,
        fallback: nextMode === "fallback"
      });
    },
    []
  );

  const ensureEngine = useCallback((): VeilbornAudioEngine => {
    if (!engineRef.current) {
      engineRef.current = new VeilbornAudioEngine();
    }
    return engineRef.current;
  }, []);

  const enableAudio = useCallback(async () => {
    if (!supported) {
      setMode("fallback");
      setMessage("WebAudio unavailable in this browser. Silent fallback enabled.");
      savePreferences("fallback", muted);
      return;
    }

    try {
      const engine = ensureEngine();
      await engine.start();
      engine.setMuted(muted);
      engine.update(snapshotRef.current);
      setMode("running");
      setMessage(null);
      savePreferences("running", muted);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Audio could not be initialized in this context.";
      setMode("error");
      setMessage(`Audio init failed: ${reason}`);
      savePreferences("error", muted);
    }
  }, [ensureEngine, muted, savePreferences, supported]);

  const disableAudio = useCallback(() => {
    engineRef.current?.stop();
    setMode("idle");
    setMessage(null);
    savePreferences("idle", muted);
  }, [muted, savePreferences]);

  const useSilentFallback = useCallback(() => {
    engineRef.current?.stop();
    setMode("fallback");
    setMessage("Silent fallback active.");
    savePreferences("fallback", muted);
  }, [muted, savePreferences]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      engineRef.current?.setMuted(next);
      savePreferences(mode, next);
      return next;
    });
  }, [mode, savePreferences]);

  useEffect(() => {
    if (mode !== "running") return;
    engineRef.current?.update(snapshot);
  }, [mode, snapshot]);

  useEffect(() => {
    if (mode !== "running") return;
    engineRef.current?.setMuted(muted);
  }, [mode, muted]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return {
    controls: {
      supported,
      mode,
      muted,
      message
    },
    enableAudio,
    disableAudio,
    toggleMute,
    useSilentFallback
  };
}

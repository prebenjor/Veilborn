import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import type { DomainId } from "../state/gameState";

const AUDIO_PREFS_KEY = "veilborn.audio.preferences.v1";

// All melodic content is anchored to D minor so the soundtrack
// keeps a stable tonal center across domain combinations.
type AudioMode = "idle" | "running" | "fallback" | "error";

interface AudioPreferences {
  muted: boolean;
  fallback: boolean;
}

type SynthOscillatorType = "sine" | "triangle" | "square" | "sawtooth";

interface DomainLayerConfig {
  notes: readonly string[];
  rhythmPattern: readonly boolean[];
  interval: string;
  oscillator: SynthOscillatorType;
  baseGain: number;
  reverbSend: number;
  attackRelease: [number, number];
}

const DOMAIN_AUDIO_CONFIG: Record<DomainId, DomainLayerConfig> = {
  fire: {
    notes: ["D4", "F4", "A4", "C5", "D5", "A4"],
    rhythmPattern: [true, false, true, true, false, true, false, false],
    interval: "8n",
    oscillator: "sawtooth",
    baseGain: 0.28,
    reverbSend: 0.15,
    attackRelease: [0.04, 0.6]
  },
  death: {
    notes: ["D2", "F2", "A2", "D2", "C2", "A1"],
    rhythmPattern: [true, false, false, true, false, false, true, false],
    interval: "2n",
    oscillator: "triangle",
    baseGain: 0.38,
    reverbSend: 0.4,
    attackRelease: [0.12, 1.4]
  },
  harvest: {
    notes: ["A3", "G3", "A3", "Bb3", "A3", "F3", "G3", "A3"],
    rhythmPattern: [true, false, true, false, true, false, false, true],
    interval: "4n",
    oscillator: "sine",
    baseGain: 0.22,
    reverbSend: 0.25,
    attackRelease: [0.08, 0.9]
  },
  storm: {
    notes: ["A3", "C4", "A3", "G3", "A3", "C4", "Bb3", "A3"],
    rhythmPattern: [true, true, false, true, false, false, true, false],
    interval: "8n",
    oscillator: "square",
    baseGain: 0.18,
    reverbSend: 0.1,
    attackRelease: [0.03, 0.4]
  },
  memory: {
    notes: ["F3", "E3", "D3", "E3", "F3", "G3", "F3", "E3"],
    rhythmPattern: [true, false, false, true, false, true, false, false],
    interval: "2n",
    oscillator: "sine",
    baseGain: 0.26,
    reverbSend: 0.55,
    attackRelease: [0.18, 2.0]
  },
  void: {
    notes: ["D1", "Ab1", "D1", "D1", "G1", "D1"],
    rhythmPattern: [true, false, false, false, true, false, false, false],
    interval: "1n",
    oscillator: "triangle",
    baseGain: 0.32,
    reverbSend: 0.65,
    attackRelease: [0.25, 2.8]
  }
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function getWebAudioSupport(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return Boolean(window.AudioContext || w.webkitAudioContext);
}

function loadAudioPreferences(): AudioPreferences {
  if (typeof window === "undefined") return { muted: false, fallback: false };
  try {
    const raw = window.localStorage.getItem(AUDIO_PREFS_KEY);
    if (!raw) return { muted: false, fallback: false };
    const parsed = JSON.parse(raw) as Partial<AudioPreferences>;
    return { muted: Boolean(parsed.muted), fallback: Boolean(parsed.fallback) };
  } catch {
    return { muted: false, fallback: false };
  }
}

function saveAudioPreferences(preferences: AudioPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore preference write failure.
  }
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

interface DomainLayer {
  gain: Tone.Gain;
  reverbGain: Tone.Gain;
  synth: Tone.Synth;
  loop: Tone.Loop;
  step: number;
}

class VeilbornAudioEngine {
  private readonly masterFilter: Tone.Filter;
  private readonly masterGain: Tone.Gain;
  private readonly layerBus: Tone.Gain;
  private readonly reverbBus: Tone.Gain;
  private readonly reverb: Tone.Reverb;
  private readonly layers: Record<DomainId, DomainLayer>;

  private instability = 0;
  private started = false;
  private disposed = false;

  private readonly drone: Tone.Synth;
  private readonly droneGain: Tone.Gain;
  private droneActive = false;

  constructor() {
    this.reverb = new Tone.Reverb({ decay: 6.0, wet: 1.0, preDelay: 0.08 });
    this.reverbBus = new Tone.Gain(0.38);
    this.layerBus = new Tone.Gain(1.0);
    this.masterGain = new Tone.Gain(0.18);
    this.masterFilter = new Tone.Filter({
      frequency: 2000,
      type: "lowpass",
      rolloff: -24
    });

    this.reverb.connect(this.reverbBus);
    this.reverbBus.connect(this.masterGain);
    this.layerBus.connect(this.masterGain);
    this.masterGain.connect(this.masterFilter);
    this.masterFilter.toDestination();

    this.reverb.generate().catch(() => {
      // Reverb impulse failed; continue with dry signal.
    });

    this.droneGain = new Tone.Gain(0).connect(this.layerBus);
    this.drone = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 4.0, decay: 0, sustain: 1.0, release: 5.0 }
    }).connect(this.droneGain);

    this.layers = (Object.keys(DOMAIN_AUDIO_CONFIG) as DomainId[]).reduce(
      (acc, domainId) => {
        const config = DOMAIN_AUDIO_CONFIG[domainId];

        const gain = new Tone.Gain(0).connect(this.layerBus);
        const reverbGain = new Tone.Gain(config.reverbSend).connect(this.reverb);
        gain.connect(reverbGain);

        const synth = new Tone.Synth({
          oscillator: { type: config.oscillator },
          envelope: {
            attack: config.attackRelease[0],
            decay: 0.25,
            sustain: 0.3,
            release: config.attackRelease[1]
          }
        }).connect(gain);

        const loop = new Tone.Loop((time) => {
          const layer = this.layers[domainId];
          const patternIndex = layer.step % config.rhythmPattern.length;
          const dropoutChance = clamp((this.instability - 0.4) * 1.6, 0, 0.72);
          const patternStep = config.rhythmPattern[patternIndex];

          layer.step = (layer.step + 1) % config.rhythmPattern.length;

          if (!patternStep || Math.random() < dropoutChance) return;

          const noteIndex = layer.step % config.notes.length;
          const note = config.notes[noteIndex];

          const jitterRange = clamp(this.instability, 0, 0.55) * 80;
          const detuneTarget = (Math.random() - 0.5) * jitterRange;
          layer.synth.detune.rampTo(detuneTarget, 0.1);

          const velocity = clamp(0.35 - this.instability * 0.12, 0.1, 0.5);
          layer.synth.triggerAttackRelease(note, "16n", time, velocity);
        }, config.interval).start(0);

        acc[domainId] = { gain, reverbGain, synth, loop, step: 0 };
        return acc;
      },
      {} as Record<DomainId, DomainLayer>
    );
  }

  async start(): Promise<void> {
    if (this.disposed) return;
    await Tone.start();
    if (Tone.Transport.state !== "started") {
      Tone.Transport.bpm.value = 52;
      Tone.Transport.start("+0.05");
    }
    this.started = true;
  }

  stop(): void {
    if (this.disposed) return;
    if (Tone.Transport.state === "started") Tone.Transport.stop();
    this.started = false;
    for (const id of Object.keys(this.layers) as DomainId[]) {
      this.layers[id].gain.gain.rampTo(0, 0.3);
    }
    this.droneGain.gain.rampTo(0, 1.0);
  }

  setMuted(muted: boolean): void {
    if (this.disposed) return;
    Tone.Destination.mute = muted;
  }

  update(snapshot: AudioSnapshot): void {
    if (!this.started || this.disposed) return;

    const veilPressure = clamp((60 - snapshot.veil) / 60);
    const civPressure = clamp((100 - snapshot.civilizationHealth) / 100) * 0.3;
    const rivalPressure = clamp(snapshot.rivalCount / 2) * 0.15;
    const collapseSurge = snapshot.civilizationCollapsed ? 0.28 : 0;
    const eraFloor = snapshot.era === 3 ? 0.06 : snapshot.era === 2 ? 0.02 : 0;

    const rawInstability = veilPressure * 0.55 + civPressure + rivalPressure + collapseSurge + eraFloor;
    this.instability = clamp(this.instability * 0.88 + rawInstability * 0.12);

    const domainContribution = Math.min(snapshot.totalDomainLevel, 30) * 0.4;
    const instabilityPush = this.instability * 8;
    const targetBpm = clamp(48 + snapshot.era * 6 + domainContribution + instabilityPush, 48, 82);
    Tone.Transport.bpm.rampTo(targetBpm, 2.0);

    const filterFreq = clamp(2200 - this.instability * 1600, 300, 2200);
    this.masterFilter.frequency.rampTo(filterFreq, 0.8);

    const gainTarget =
      this.instability > 0.7 ? 0.18 - (this.instability - 0.7) * 0.2 : 0.18;
    this.masterGain.gain.rampTo(clamp(gainTarget, 0.04, 0.18), 0.8);

    const reverbBusTarget = 0.3 + this.instability * 0.35;
    this.reverbBus.gain.rampTo(clamp(reverbBusTarget, 0.3, 0.65), 1.0);

    const droneShouldBeActive = snapshot.era >= 3 && snapshot.veil < 30;
    if (droneShouldBeActive && !this.droneActive) {
      this.drone.triggerAttack("D1");
      this.droneActive = true;
    } else if (!droneShouldBeActive && this.droneActive) {
      this.drone.triggerRelease();
      this.droneActive = false;
    }
    const droneGainTarget = droneShouldBeActive ? clamp((30 - snapshot.veil) / 30) * 0.14 : 0;
    this.droneGain.gain.rampTo(droneGainTarget, 2.0);

    const eraMultiplier = snapshot.era === 1 ? 0.7 : 1.0;
    const instabilityDampen =
      this.instability > 0.7 ? 1 - (this.instability - 0.7) * 0.5 : 1.0;

    for (const domainId of Object.keys(this.layers) as DomainId[]) {
      const config = DOMAIN_AUDIO_CONFIG[domainId];
      const level = snapshot.domains[domainId];

      if (level <= 0) {
        this.layers[domainId].gain.gain.rampTo(0, 0.5);
        continue;
      }

      const levelSignal = clamp(Math.sqrt(level / 10));
      const target = config.baseGain * levelSignal * eraMultiplier * instabilityDampen;
      this.layers[domainId].gain.gain.rampTo(target, 0.6);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.stop();
    for (const id of Object.keys(this.layers) as DomainId[]) {
      const layer = this.layers[id];
      layer.loop.dispose();
      layer.synth.dispose();
      layer.reverbGain.dispose();
      layer.gain.dispose();
    }
    this.drone.dispose();
    this.droneGain.dispose();
    this.reverb.dispose();
    this.reverbBus.dispose();
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
  const [message, setMessage] = useState<string | null>(() =>
    supported ? null : "WebAudio unavailable in this browser. Silent fallback enabled."
  );

  const engineRef = useRef<VeilbornAudioEngine | null>(null);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const savePreferences = useCallback((nextMode: AudioMode, nextMuted: boolean) => {
    saveAudioPreferences({ muted: nextMuted, fallback: nextMode === "fallback" });
  }, []);

  const ensureEngine = useCallback((): VeilbornAudioEngine => {
    if (!engineRef.current) engineRef.current = new VeilbornAudioEngine();
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
      const reason = error instanceof Error ? error.message : "Audio could not be initialized.";
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
    controls: { supported, mode, muted, message },
    enableAudio,
    disableAudio,
    toggleMute,
    useSilentFallback
  };
}

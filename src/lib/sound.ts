"use client";

import { loadMuted } from "./storage";

/**
 * A tiny WebAudio synth. No samples to download, so the sounds work offline
 * and the first tap on the page is enough to unlock them on iOS.
 */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/** Call from the first user gesture so later, un-gestured sounds can play. */
export function primeAudio(): void {
  ac();
}

function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; at?: number; slide?: number } = {}
): void {
  const c = ac();
  if (!c || loadMuted()) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t0);
  if (opts.slide) o.frequency.exponentialRampToValueAtTime(opts.slide, t0 + dur);
  const vol = opts.gain ?? 0.18;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  got() {
    tone(660, 0.12, { type: "triangle" });
    tone(990, 0.18, { type: "triangle", at: 0.09 });
  },
  skip() {
    tone(320, 0.09, { type: "sine", gain: 0.12, slide: 180 });
  },
  buzz() {
    tone(150, 0.42, { type: "sawtooth", gain: 0.16 });
    tone(148, 0.42, { type: "square", gain: 0.06 });
  },
  tick() {
    tone(1400, 0.035, { type: "square", gain: 0.05 });
  },
  count() {
    tone(880, 0.1, { type: "sine", gain: 0.14 });
  },
  go() {
    tone(1320, 0.28, { type: "sine", gain: 0.16 });
  },
  timeUp() {
    tone(520, 0.22, { type: "square", gain: 0.12 });
    tone(390, 0.22, { type: "square", gain: 0.12, at: 0.2 });
    tone(260, 0.5, { type: "square", gain: 0.12, at: 0.4 });
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: "triangle", at: i * 0.11 }));
  },
};

export function buzzHaptic(): void {
  try {
    navigator.vibrate?.([60, 40, 90]);
  } catch {}
}
export function tapHaptic(): void {
  try {
    navigator.vibrate?.(18);
  } catch {}
}
export function gotHaptic(): void {
  try {
    navigator.vibrate?.([20, 30, 20]);
  } catch {}
}
export function timeUpHaptic(): void {
  try {
    navigator.vibrate?.([120, 60, 120, 60, 200]);
  } catch {}
}

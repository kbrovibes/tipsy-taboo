"use client";

import { useEffect } from "react";

/**
 * Publishes the visible height as --sh. `dvh` measures the viewport minus
 * browser chrome but not minus anything iOS slides in later; pinning the game
 * shell to visualViewport.height keeps the card and the buttons on screen.
 */
export function useShellMetrics(): void {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    const apply = () => {
      const h = Math.round(vv ? vv.height : window.innerHeight);
      root.style.setProperty("--sh", `${h}px`);
    };
    apply();
    vv?.addEventListener("resize", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      root.style.removeProperty("--sh");
    };
  }, []);
}

/**
 * Kill the browser's edge-swipe "back" gesture inside the game.
 *
 * Swiping a card off the left edge would otherwise slide people out of the
 * app. `touch-action: none` does not help — Safari decides on the swipe from
 * the raw touch stream — but a non-passive touchstart that calls
 * preventDefault() inside the edge band does. Only touches that BEGIN in the
 * band are cancelled, and anything pressable is left alone because a cancelled
 * touchstart also swallows the click iOS would synthesise from it.
 */
const BAND = 32;
const PRESSABLE = "button, a, input, textarea, select, label, [role='button']";

export function useEdgeSwipeGuard(active = true): void {
  useEffect(() => {
    if (!active) return;
    const onStart = (e: TouchEvent) => {
      if (!e.cancelable || e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      if (x > BAND && x < window.innerWidth - BAND) return;
      const el = e.target as Element | null;
      if (el?.closest?.(PRESSABLE)) return;
      e.preventDefault();
    };
    document.addEventListener("touchstart", onStart, { passive: false });
    return () => document.removeEventListener("touchstart", onStart);
  }, [active]);
}

/** Keep the screen awake while a turn is running. Best effort. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    let lock: { release: () => Promise<void> } | null = null;
    let gone = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    const grab = async () => {
      try {
        const l = await nav.wakeLock?.request("screen");
        if (gone) l?.release();
        else lock = l ?? null;
      } catch {}
    };
    const onVis = () => {
      if (document.visibilityState === "visible") grab();
    };
    grab();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      gone = true;
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, [active]);
}

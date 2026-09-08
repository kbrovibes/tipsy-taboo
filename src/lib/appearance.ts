"use client";

import { useEffect, useState } from "react";

export type Appearance = "system" | "light" | "dark";

const KEY = "tt_theme";

/**
 * The inline script that runs before first paint. It stamps data-theme on
 * <html> when the choice is explicit, and leaves the attribute off for
 * "system" so the prefers-color-scheme rules in globals.css decide. Kept as a
 * string because it has to run before React does, or the first frame flashes
 * the wrong palette.
 */
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export function readAppearance(): Appearance {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : "system";
  } catch {
    return "system";
  }
}

/** The palette actually on screen right now, once "system" is resolved. */
export function resolved(a: Appearance): "light" | "dark" {
  if (a !== "system") return a;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(a: Appearance): void {
  const root = document.documentElement;
  if (a === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", a);
  // the address bar / status bar follows the painted background
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved(a) === "dark" ? "#0e0c17" : "#f7f6fb");
  }
}

export function writeAppearance(a: Appearance): void {
  try {
    if (a === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, a);
  } catch {}
  apply(a);
}

/**
 * The current preference, plus a setter. Following the device is the default,
 * and while it is selected a change to the OS setting repaints immediately.
 */
export function useAppearance(): [Appearance, (a: Appearance) => void] {
  const [pref, setPref] = useState<Appearance>("system");

  useEffect(() => {
    const a = readAppearance();
    setPref(a);
    apply(a);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (readAppearance() === "system") apply("system");
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  return [
    pref,
    (a: Appearance) => {
      setPref(a);
      writeAppearance(a);
    },
  ];
}

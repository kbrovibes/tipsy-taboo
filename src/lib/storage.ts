import type { DeckKey, Game, Settings } from "./types";

const GAME_KEY = "tt_game";
const SETTINGS_KEY = "tt_settings";
const MUTE_KEY = "tt_mute";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const COLOR_MIGRATION: Record<string, string> = { berry: "grape", ocean: "teal", lime: "amber", tangerine: "pink" };

export function loadGame(): Game | null {
  const g = read<Game>(GAME_KEY);
  if (!g || !Array.isArray(g.teams) || !g.settings) return null;
  // games saved before pass and buzz were folded into one action
  return {
    ...g,
    teams: g.teams.map((t) => ({ ...t, color: (COLOR_MIGRATION[t.color] ?? t.color) as Game["teams"][number]["color"] })),
    turn: g.turn
      ? { ...g.turn, played: g.turn.played.map((p) => ({ ...p, outcome: p.outcome === "got" ? "got" : "pass" })) }
      : g.turn,
  };
}

export function saveGame(g: Game | null): void {
  if (!g) {
    try {
      localStorage.removeItem(GAME_KEY);
    } catch {}
    return;
  }
  write(GAME_KEY, g);
}

/** The house rules from last time, so a second game is two taps. */
export function loadSettings(): Settings | null {
  return read<Settings>(SETTINGS_KEY);
}

export function saveSettings(s: Settings): void {
  write(SETTINGS_KEY, s);
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {}
}

// --- the used-card memory -------------------------------------------------
//
// A physical deck remembers which cards were played because they are in the
// other pile. This does the same per deck, across games, keyed by the word
// itself so a deck update never scrambles it.

function usedKey(deck: DeckKey): string {
  return `tt_used:${deck}`;
}

export function loadUsed(deck: DeckKey): Set<string> {
  return new Set(read<string[]>(usedKey(deck)) ?? []);
}

export function markUsed(deck: DeckKey, words: string[], deckSize: number): void {
  const used = loadUsed(deck);
  for (const w of words) used.add(w);
  // the whole deck has been through: start the pile again
  if (used.size >= deckSize) used.clear();
  write(usedKey(deck), [...used]);
}

export function resetUsed(deck: DeckKey): void {
  try {
    localStorage.removeItem(usedKey(deck));
  } catch {}
}

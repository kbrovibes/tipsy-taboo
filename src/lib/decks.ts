import meta from "@/data/meta.json";
import type { Card, DeckKey, Difficulty } from "./types";

export interface DeckInfo {
  key: DeckKey;
  label: string;
  emoji: string;
  blurb: string;
}

export const DIFFICULTIES: (DeckInfo & { key: Difficulty; who: string })[] = [
  { key: "kids", label: "Kids", emoji: "🧸", blurb: "Animals, snacks, cartoons", who: "6 to 9 year olds, and the adults humouring them" },
  { key: "medium", label: "Medium", emoji: "🍹", blurb: "Classic party-pack cards", who: "everyday words everybody knows" },
  { key: "hard", label: "Hard", emoji: "🌶️", blurb: "Idioms, feelings, knowledge", who: "the most-played level — 30 seconds of squirming per card" },
  { key: "insane", label: "Insane", emoji: "💀", blurb: "Jargon, deep cuts, named effects", who: "brutal but fair — for people who think Hard is cute" },
];

export const THEMES: DeckInfo[] = [
  { key: "theme:bollywood", label: "Bollywood", emoji: "🎬", blurb: "stars, films and every trope" },
  { key: "theme:malayalam", label: "Malayalam Movies", emoji: "🥥", blurb: "Mohanlal to Manjummel Boys" },
  { key: "theme:celebs", label: "Famous Indians", emoji: "⭐", blurb: "screen, pitch and beyond" },
  { key: "theme:places", label: "Places in India", emoji: "🛕", blurb: "monuments, cities, hill stations" },
  { key: "theme:desi", label: "Desi Life", emoji: "🫖", blurb: "food, festivals, and NRI problems" },
  { key: "theme:cricket", label: "Cricket", emoji: "🏏", blurb: "gully rules to the World Cup" },
  { key: "theme:retro", label: "90s India", emoji: "📺", blurb: "Doordarshan, Rasna, STD booths" },
  { key: "theme:movies", label: "Movies (world)", emoji: "🍿", blurb: "tropes, genres and cinema things" },
  { key: "theme:mix", label: "The Big Mix", emoji: "🎲", blurb: "every theme, shuffled together" },
];

const COUNTS = meta as Record<string, number>;

function fileKey(key: DeckKey): string {
  return key.startsWith("theme:") ? `theme-${key.slice(6)}` : key;
}

export function deckCount(key: DeckKey): number {
  if (key === "theme:mix")
    return THEMES.filter((t) => t.key !== "theme:mix").reduce((n, t) => n + deckCount(t.key), 0);
  return COUNTS[fileKey(key)] ?? 0;
}

export function totalCards(): number {
  return Object.values(COUNTS).reduce((n, c) => n + c, 0);
}

export function deckInfo(key: DeckKey): DeckInfo {
  return (
    DIFFICULTIES.find((d) => d.key === key) ??
    THEMES.find((t) => t.key === key) ?? { key, label: "Cards", emoji: "🃏", blurb: "" }
  );
}

export function isTheme(key: DeckKey): boolean {
  return key.startsWith("theme:");
}

/**
 * Each deck is its own chunk, so a Kids night never downloads the Insane
 * deck. The switch is spelled out so the bundler can see every path.
 */
export async function loadDeck(key: DeckKey): Promise<Card[]> {
  switch (key) {
    case "kids":
      return (await import("@/data/kids.json")).default as Card[];
    case "medium":
      return (await import("@/data/medium.json")).default as Card[];
    case "hard":
      return (await import("@/data/hard.json")).default as Card[];
    case "insane":
      return (await import("@/data/insane.json")).default as Card[];
    case "theme:bollywood":
      return (await import("@/data/theme-bollywood.json")).default as Card[];
    case "theme:malayalam":
      return (await import("@/data/theme-malayalam.json")).default as Card[];
    case "theme:celebs":
      return (await import("@/data/theme-celebs.json")).default as Card[];
    case "theme:places":
      return (await import("@/data/theme-places.json")).default as Card[];
    case "theme:desi":
      return (await import("@/data/theme-desi.json")).default as Card[];
    case "theme:cricket":
      return (await import("@/data/theme-cricket.json")).default as Card[];
    case "theme:retro":
      return (await import("@/data/theme-retro.json")).default as Card[];
    case "theme:movies":
      return (await import("@/data/theme-movies.json")).default as Card[];
    case "theme:mix": {
      const parts = await Promise.all(
        THEMES.filter((t) => t.key !== "theme:mix").map((t) => loadDeck(t.key))
      );
      const seen = new Set<string>();
      const out: Card[] = [];
      for (const c of parts.flat()) {
        const k = c.w.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(c);
      }
      return out;
    }
    default:
      return (await import("@/data/medium.json")).default as Card[];
  }
}

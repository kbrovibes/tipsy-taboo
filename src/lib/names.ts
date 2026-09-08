import type { TeamColor } from "./types";

const ADJ = [
  "Wobbly", "Sneaky", "Soggy", "Funky", "Grumpy", "Sparkly", "Wiggly",
  "Cranky", "Zesty", "Goofy", "Spicy", "Fluffy", "Jazzy", "Squishy",
  "Dizzy", "Sassy", "Bouncy", "Chunky", "Slippery", "Feral", "Majestic",
  "Suspicious", "Dramatic", "Chaotic", "Turbo", "Sleepy", "Screaming",
  "Dancing", "Spinning", "Tipsy", "Giggling", "Rowdy", "Smug", "Frantic",
] as const;

const NOUN = [
  "Pickles", "Walruses", "Noodles", "Waffles", "Bananas", "Goblins", "Llamas",
  "Nuggets", "Potatoes", "Raccoons", "Burritos", "Penguins", "Wombats",
  "Donuts", "Cabbages", "Ferrets", "Mangoes", "Gremlins", "Hamsters",
  "Meatballs", "Toads", "Yetis", "Narwhals", "Biscuits", "Dumplings",
  "Geese", "Shrimps", "Muffins", "Badgers", "Turnips", "Weasels", "Otters",
  "Pandas", "Flamingos", "Sloths", "Capybaras",
] as const;

function pick<T>(xs: readonly T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

/** "Wobbly Pickles" — never the same noun twice on one night. */
export function goofyTeamName(taken: string[] = []): string {
  for (let i = 0; i < 40; i++) {
    const n = `${pick(ADJ)} ${pick(NOUN)}`;
    const noun = n.split(" ")[1];
    if (!taken.some((t) => t.endsWith(noun))) return n;
  }
  return `${pick(ADJ)} ${pick(NOUN)}`;
}

/**
 * A short code you can read out across a room. No O/0/I/1 so nobody has to
 * ask "is that a one or an el".
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newCode(): string {
  let s = "";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return s;
}

export function cleanCode(raw: string): string {
  const m = raw.match(/\/watch\/([a-z0-9]+)/i);
  return (m ? m[1] : raw).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

export const TEAM_COLORS: TeamColor[] = ["berry", "ocean", "lime", "tangerine"];

export const TEAM_STYLE: Record<TeamColor, { label: string; color: string; tint: string; deep: string }> = {
  berry: { label: "Berry", color: "#d63d7a", tint: "#ffdce9", deep: "#9c1f52" },
  ocean: { label: "Ocean", color: "#2f6fe0", tint: "#dbe7ff", deep: "#1d4fb0" },
  lime: { label: "Lime", color: "#4f8c0f", tint: "#e5f5c7", deep: "#3a6a08" },
  tangerine: { label: "Tangerine", color: "#e0761a", tint: "#ffe6cc", deep: "#b2560c" },
};

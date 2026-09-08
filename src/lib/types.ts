export type Difficulty = "kids" | "medium" | "hard" | "insane";
export type DeckKey = Difficulty | `theme:${string}`;

export interface Card {
  /** the word the table has to say */
  w: string;
  /** the five words the clue-giver may not */
  t: string[];
}

/**
 * Two ways off the screen. A pass covers both "we give up" and "a taboo word
 * slipped out" — the first few passes in a turn are free, the rest cost a
 * point, and the house rule decides how many are free.
 */
export type Outcome = "got" | "pass";

export type TeamColor = "grape" | "teal" | "amber" | "pink";

export interface Team {
  id: number;
  name: string;
  color: TeamColor;
  score: number;
  /** turns taken — decides when a round is complete */
  turns: number;
}

export interface Settings {
  deck: DeckKey;
  turnSeconds: number;
  /** null = play until somebody ends the game */
  rounds: number | null;
  /** free passes per turn; null = every pass is free */
  skipLimit: number | null;
}

export type Phase = "handoff" | "countdown" | "turn" | "recap" | "over";

export interface Played {
  card: Card;
  outcome: Outcome;
}

export interface Turn {
  /** epoch ms the clock runs out, or null while paused / not started */
  endsAt: number | null;
  /** ms left, only meaningful while paused */
  remainingMs: number;
  played: Played[];
  /** index into game.order of the card on screen */
  current: number | null;
  skipsUsed: number;
}

export interface Game {
  /** doubles as the referee code */
  id: string;
  createdAt: number;
  settings: Settings;
  teams: Team[];
  /** shuffled indices into the deck, unplayed cards first */
  order: number[];
  /** next position in `order` to deal */
  cursor: number;
  phase: Phase;
  turnTeam: number;
  round: number;
  turn: Turn | null;
  /** who won, once phase is "over" — several ids means a tie */
  winners?: number[];
}

/** What a referee's phone sees: enough to mirror the card and the scores. */
export interface Snapshot {
  code: string;
  phase: Phase;
  round: number;
  rounds: number | null;
  turnTeam: number;
  teams: { name: string; color: TeamColor; score: number }[];
  endsAt: number | null;
  remainingMs: number;
  turnSeconds: number;
  card: Card | null;
  turnTotal: number;
  played: number;
  freeLeft: number | null;
  winners?: number[];
}

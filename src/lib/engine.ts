import type { Card, Game, Outcome, Played, Settings, Snapshot, TeamColor } from "./types";

/**
 * The pure game. Nothing in here touches the DOM, storage or the clock —
 * every function takes `now` when it needs it and returns a new Game.
 */

export function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createGame(opts: {
  id: string;
  settings: Settings;
  teams: { name: string; color: TeamColor }[];
  deckWords: readonly string[];
  used: Set<string>;
}): Game {
  const fresh: number[] = [];
  const old: number[] = [];
  opts.deckWords.forEach((w, i) => (opts.used.has(w) ? old : fresh).push(i));
  return {
    id: opts.id,
    createdAt: Date.now(),
    settings: opts.settings,
    teams: opts.teams.map((t, i) => ({ id: i, name: t.name, color: t.color, score: 0, turns: 0 })),
    // cards nobody at this table has seen come first; the rest only if we run out
    order: [...shuffle(fresh), ...shuffle(old)],
    cursor: 0,
    phase: "handoff",
    turnTeam: 0,
    round: 1,
    turn: null,
  };
}

export function beginCountdown(g: Game): Game {
  if (g.phase !== "handoff") return g;
  return {
    ...g,
    phase: "countdown",
    turn: {
      endsAt: null,
      remainingMs: g.settings.turnSeconds * 1000,
      played: [],
      current: null,
      skipsUsed: 0,
    },
  };
}

function deal(g: Game): { idx: number; cursor: number } {
  const cursor = g.cursor >= g.order.length ? 0 : g.cursor;
  return { idx: g.order[cursor], cursor: cursor + 1 };
}

export function startTurn(g: Game, now: number): Game {
  if (g.phase !== "countdown" || !g.turn) return g;
  const { idx, cursor } = deal(g);
  return {
    ...g,
    phase: "turn",
    cursor,
    turn: { ...g.turn, endsAt: now + g.turn.remainingMs, current: idx },
  };
}

export function canSkip(g: Game): boolean {
  const lim = g.settings.skipLimit;
  return lim === null || (g.turn?.skipsUsed ?? 0) < lim;
}

export function skipsLeft(g: Game): number | null {
  const lim = g.settings.skipLimit;
  return lim === null ? null : Math.max(0, lim - (g.turn?.skipsUsed ?? 0));
}

/** The card on screen was got / skipped / buzzed; deal the next one. */
export function mark(g: Game, card: Card, outcome: Outcome): Game {
  if (g.phase !== "turn" || !g.turn || g.turn.current === null || g.turn.endsAt === null) return g;
  if (outcome === "skip" && !canSkip(g)) return g;
  const { idx, cursor } = deal(g);
  return {
    ...g,
    cursor,
    turn: {
      ...g.turn,
      played: [...g.turn.played, { card, outcome }],
      current: idx,
      skipsUsed: g.turn.skipsUsed + (outcome === "skip" ? 1 : 0),
    },
  };
}

export function isPaused(g: Game): boolean {
  return g.phase === "turn" && !!g.turn && g.turn.endsAt === null;
}

export function remainingMs(g: Game, now: number): number {
  if (!g.turn) return 0;
  if (g.turn.endsAt === null) return g.turn.remainingMs;
  return Math.max(0, g.turn.endsAt - now);
}

export function pauseTurn(g: Game, now: number): Game {
  if (g.phase !== "turn" || !g.turn || g.turn.endsAt === null) return g;
  return { ...g, turn: { ...g.turn, remainingMs: remainingMs(g, now), endsAt: null } };
}

export function resumeTurn(g: Game, now: number): Game {
  if (g.phase !== "turn" || !g.turn || g.turn.endsAt !== null) return g;
  return { ...g, turn: { ...g.turn, endsAt: now + g.turn.remainingMs } };
}

/** Time's up. The card that was on screen is not counted, as on the table. */
export function endTurn(g: Game): Game {
  if (g.phase !== "turn" || !g.turn) return g;
  return {
    ...g,
    phase: "recap",
    // put the unfinished card back on top of the deck
    cursor: g.turn.current !== null ? Math.max(0, g.cursor - 1) : g.cursor,
    turn: { ...g.turn, endsAt: null, remainingMs: 0, current: null },
  };
}

export function setOutcome(g: Game, i: number, outcome: Outcome): Game {
  if (g.phase !== "recap" || !g.turn) return g;
  const played = g.turn.played.map((p, k) => (k === i ? { ...p, outcome } : p));
  return { ...g, turn: { ...g.turn, played } };
}

export function turnTotal(played: readonly Played[]): number {
  return played.reduce((n, p) => n + (p.outcome === "got" ? 1 : p.outcome === "buzz" ? -1 : 0), 0);
}

export function winnerIds(g: Game): number[] {
  const top = Math.max(...g.teams.map((t) => t.score));
  return g.teams.filter((t) => t.score === top).map((t) => t.id);
}

/** Bank the turn, pass the phone. Ends the game when the last round is done. */
export function finishRecap(g: Game): Game {
  if (g.phase !== "recap" || !g.turn) return g;
  const total = turnTotal(g.turn.played);
  const teams = g.teams.map((t) =>
    t.id === g.turnTeam ? { ...t, score: t.score + total, turns: t.turns + 1 } : t
  );
  const lastInRound = g.turnTeam === g.teams.length - 1;
  const roundDone = lastInRound;
  const next: Game = {
    ...g,
    teams,
    turn: null,
    turnTeam: (g.turnTeam + 1) % g.teams.length,
    round: roundDone ? g.round + 1 : g.round,
    phase: "handoff",
  };
  if (roundDone && g.settings.rounds !== null && g.round >= g.settings.rounds) {
    // tied at the top: one more round, everybody plays
    const w = winnerIds(next);
    if (w.length > 1) return next;
    return { ...next, phase: "over", winners: w };
  }
  return next;
}

export function endGame(g: Game): Game {
  const banked = g.phase === "recap" ? finishRecap(g) : g;
  const base = banked.phase === "over" ? banked : { ...banked, turn: null };
  return { ...base, phase: "over", winners: winnerIds(base) };
}

/** Same teams, same deck, scores wiped, a different team goes first. */
export function rematch(g: Game): Game {
  const teams = g.teams.map((t) => ({ ...t, score: 0, turns: 0 }));
  return {
    ...g,
    createdAt: Date.now(),
    teams,
    phase: "handoff",
    turnTeam: g.teams.length > 1 ? 1 % g.teams.length : 0,
    round: 1,
    turn: null,
    winners: undefined,
  };
}

export function isTied(g: Game): boolean {
  return (g.winners?.length ?? 0) > 1;
}

export function toSnapshot(g: Game, deck: readonly Card[] | null): Snapshot {
  const cur = g.turn?.current;
  return {
    code: g.id,
    phase: g.phase,
    round: g.round,
    rounds: g.settings.rounds,
    turnTeam: g.turnTeam,
    teams: g.teams.map((t) => ({ name: t.name, color: t.color, score: t.score })),
    endsAt: g.turn?.endsAt ?? null,
    remainingMs: g.turn?.remainingMs ?? 0,
    turnSeconds: g.settings.turnSeconds,
    card: g.phase === "turn" && cur !== null && cur !== undefined && deck ? deck[cur] ?? null : null,
    turnTotal: g.turn ? turnTotal(g.turn.played) : 0,
    played: g.turn?.played.length ?? 0,
    winners: g.winners,
  };
}

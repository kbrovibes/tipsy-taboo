"use client";

import { IconCheck, IconGear, IconHand, IconLogo, IconPlay, IconX } from "@/components/icons";
import { deckInfo } from "@/lib/decks";
import { TEAM_STYLE } from "@/lib/names";
import type { Game } from "@/lib/types";
import Scoreboard from "./Scoreboard";

/**
 * Between turns. Doubles as the scoreboard, because the moment the phone
 * changes hands is exactly when everybody wants to know the score.
 */
export default function Handoff({
  game,
  onReady,
  onSheet,
}: {
  game: Game;
  onReady: () => void;
  onSheet: () => void;
}) {
  const team = game.teams[game.turnTeam];
  const s = TEAM_STYLE[team.color];
  const { rounds, turnSeconds, skipLimit, deck } = game.settings;
  const tieBreak = rounds !== null && game.round > rounds;
  const firstEver = game.round === 1 && game.turnTeam === 0 && game.teams.every((t) => t.turns === 0);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-3">
      <header className="flex items-center justify-between">
        <a href="/" aria-label="Home" className="with-glyph flex items-center gap-1.5 font-display text-sm font-bold text-ink/60">
          <IconLogo size={26} /> Tipsy Taboo
        </a>
        <p className="font-display text-sm font-bold text-ink/60">
          {tieBreak ? "Tie-break round" : rounds ? `Round ${game.round} of ${rounds}` : `Round ${game.round}`}
        </p>
        <button onClick={onSheet} aria-label="Game menu" className="rounded-xl bg-white p-2 text-ink/70 shadow-clay">
          <IconGear size={20} />
        </button>
      </header>

      <div className="mt-4">
        <Scoreboard teams={game.teams} current={game.turnTeam} />
      </div>

      <section
        className="mt-5 flex flex-1 flex-col items-center justify-center rounded-3xl px-5 py-8 text-center shadow-clay"
        style={{ background: s.tint }}
      >
        <p className="text-sm font-bold uppercase tracking-wider" style={{ color: s.deep }}>
          Pass the phone to
        </p>
        <h2 className="mt-2 font-display font-extrabold leading-tight" style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)", color: s.deep }}>
          {team.name}
        </h2>
        <p className="mt-4 max-w-xs text-sm text-ink/70">
          Pick a clue-giver. Their team shouts guesses; the other team watches the card and buzzes.
        </p>

        {firstEver && (
          <ul className="mt-5 w-full max-w-xs space-y-2 text-left text-sm">
            <li className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-go-tint text-go"><IconCheck size={18} /></span>
              <span><b>Swipe right</b> when they get it</span>
            </li>
            <li className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fizz text-ink"><IconX size={18} /></span>
              <span><b>Swipe left</b> to skip{skipLimit !== null ? ` (${skipLimit} per turn)` : ""}</span>
            </li>
            <li className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-buzz-tint text-buzz"><IconHand size={18} /></span>
              <span><b>Tap the hand</b> if a taboo word slips out (−1)</span>
            </li>
          </ul>
        )}
      </section>

      <button onClick={onReady} className="btn-primary mt-5 w-full text-xl" style={{ background: s.color }}>
        Start the clock <IconPlay size={22} />
      </button>
      <p className="mt-2 text-center text-xs text-ink/50">
        {turnSeconds}s on the clock · {deckInfo(deck).emoji} {deckInfo(deck).label}
      </p>
    </main>
  );
}

"use client";

import { IconArrowRight, IconCheck, IconHand, IconX } from "@/components/icons";
import { turnTotal } from "@/lib/engine";
import { TEAM_STYLE } from "@/lib/names";
import type { Game, Outcome } from "@/lib/types";

/**
 * Time's up. Every card from the turn, with its outcome, and the chance to
 * fix a fat-fingered swipe before the points are banked.
 */
export default function Recap({
  game,
  onChange,
  onDone,
}: {
  game: Game;
  onChange: (i: number, o: Outcome) => void;
  onDone: () => void;
}) {
  const team = game.teams[game.turnTeam];
  const s = TEAM_STYLE[team.color];
  const played = game.turn?.played ?? [];
  const total = turnTotal(played);
  const next = game.teams[(game.turnTeam + 1) % game.teams.length];
  const lastInRound = game.turnTeam === game.teams.length - 1;
  const gameEnds =
    lastInRound && game.settings.rounds !== null && game.round >= game.settings.rounds;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-28 pt-4">
      <div className="rounded-3xl px-5 py-6 text-center shadow-clay" style={{ background: s.tint }}>
        <p className="text-sm font-bold uppercase tracking-wider" style={{ color: s.deep }}>
          Time&apos;s up · {team.name}
        </p>
        <p className="pop-in mt-1 font-display font-extrabold leading-none" style={{ fontSize: "5rem", color: total < 0 ? "var(--buzz)" : s.deep }}>
          {total > 0 ? `+${total}` : total}
        </p>
        <p className="mt-1 text-sm text-ink/60">
          {played.filter((p) => p.outcome === "got").length} got · {played.filter((p) => p.outcome === "skip").length} skipped ·{" "}
          {played.filter((p) => p.outcome === "buzz").length} buzzed
        </p>
      </div>

      {played.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {played.map((p, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-clay">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold">{p.card.w}</p>
                <p className="truncate text-[11px] text-ink/50">{p.card.t.join(" · ")}</p>
              </div>
              <div className="flex gap-1 rounded-xl bg-well p-1" role="radiogroup" aria-label={`Outcome for ${p.card.w}`}>
                {(
                  [
                    { o: "got", Icon: IconCheck, on: "bg-go text-white", label: "Got it" },
                    { o: "skip", Icon: IconX, on: "bg-fizz text-ink", label: "Skipped" },
                    { o: "buzz", Icon: IconHand, on: "bg-buzz text-white", label: "Taboo word said" },
                  ] as const
                ).map(({ o, Icon, on, label }) => (
                  <button
                    key={o}
                    role="radio"
                    aria-checked={p.outcome === o}
                    aria-label={label}
                    onClick={() => onChange(i, o)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${p.outcome === o ? on + " shadow-clay" : "text-ink/40"}`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-center text-sm text-ink/55">Not a single card. Stage fright?</p>
      )}
      <p className="mt-3 text-center text-xs text-ink/45">Tap an icon to correct a mis-swipe.</p>

      <div className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 tt-frost">
        <div className="mx-auto max-w-md">
          <button onClick={onDone} className="btn-primary w-full text-xl">
            {gameEnds ? "See who won" : <>Bank it · {next.name} next <IconArrowRight size={22} /></>}
          </button>
        </div>
      </div>
    </main>
  );
}

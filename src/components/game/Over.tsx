"use client";

import { useEffect, useState } from "react";
import { IconRefresh, IconTrophy } from "@/components/icons";
import { TEAM_STYLE } from "@/lib/names";
import { sfx } from "@/lib/sound";
import type { Game } from "@/lib/types";

const CONFETTI = ["#5b3df5", "#c9f542", "#fbbf24", "#0d9488", "#db2777", "#7c5cff"];

export default function Over({
  game,
  onRematch,
  onNew,
}: {
  game: Game;
  onRematch: () => void;
  onNew: () => void;
}) {
  const winners = game.winners ?? [];
  const ranked = [...game.teams].sort((a, b) => b.score - a.score);
  const champ = ranked[0];
  const s = TEAM_STYLE[champ.color];
  const [bits, setBits] = useState<{ left: number; delay: number; dur: number; color: string; w: number }[]>([]);

  useEffect(() => {
    setBits(
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.8,
        dur: 2.6 + Math.random() * 2,
        color: CONFETTI[i % CONFETTI.length],
        w: 6 + Math.random() * 8,
      }))
    );
  }, []);

  useEffect(() => {
    sfx.win();
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-14">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: `${b.left}%`, background: b.color, width: b.w, height: b.w * 1.6, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
          aria-hidden
        />
      ))}

      <section className="rounded-3xl px-5 py-8 text-center shadow-clay" style={{ background: s.tint }}>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white" style={{ background: s.color }}>
          <IconTrophy size={36} />
        </span>
        <p className="mt-4 text-sm font-bold uppercase tracking-wider" style={{ color: s.deep }}>
          {winners.length > 1 ? "It's a draw between" : "Champions"}
        </p>
        <h2 className="mt-1 font-display font-extrabold leading-tight" style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)", color: s.deep }}>
          {winners.length > 1 ? winners.map((id) => game.teams[id].name).join(" & ") : champ.name}
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          {champ.score} point{champ.score === 1 ? "" : "s"} over {game.round - 1 || 1} round{game.round - 1 === 1 ? "" : "s"}
        </p>
      </section>

      <ol className="mt-4 space-y-2">
        {ranked.map((t, i) => {
          const ts = TEAM_STYLE[t.color];
          return (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-clay">
              <span className="w-6 text-center font-display text-lg font-extrabold text-ink/40">{i + 1}</span>
              <span className="h-4 w-4 rounded-full" style={{ background: ts.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate font-display text-base font-bold">{t.name}</span>
              <span className="font-display text-2xl font-extrabold tabular-nums">{t.score}</span>
            </li>
          );
        })}
      </ol>

      <button onClick={onRematch} className="btn-primary mt-6 w-full text-xl">
        Rematch <IconRefresh size={22} />
      </button>
      <button onClick={onNew} className="btn-quiet mt-3 w-full">
        New game, new teams
      </button>
      <a href="/" className="mt-5 text-center text-sm font-bold text-ink/50 hover:text-ink">
        Back to the start
      </a>
    </main>
  );
}

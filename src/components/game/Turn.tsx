"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck, IconPass, IconPause, IconPlay } from "@/components/icons";
import { freePassesLeft, isPaused, remainingMs, turnTotal } from "@/lib/engine";
import { TEAM_STYLE } from "@/lib/names";
import { buzzHaptic, gotHaptic, sfx, tapHaptic, timeUpHaptic } from "@/lib/sound";
import type { Card, Game, Outcome } from "@/lib/types";

/**
 * The turn. One card at a time, two ways off the screen:
 *
 *   swipe right / tap ✓   they said it                       +1
 *   swipe left  / tap ←   pass — stuck, or a banned word slipped out
 *
 * Passing is one action because at the table it is one moment: either way the
 * card is dead and you want the next one NOW. The house rule decides how many
 * passes are free; after that each one costs a point, and the button turns red
 * to say so before it is pressed.
 */

const FLY_MS = 240;

/**
 * A word never breaks across lines mid-syllable: the second term shrinks the
 * type until the longest word fits the card's width, and the first is the
 * ceiling for short words on a big screen. 0.62em is about the average glyph
 * advance of the display face at these weights.
 */
function wordSize(w: string): string {
  const longest = Math.max(...w.split(" ").map((p) => p.length));
  const cap = longest > 12 || w.length > 22 ? "2.2rem" : longest > 9 || w.length > 14 ? "2.8rem" : "3.6rem";
  return `min(${cap}, calc((min(100vw, 28rem) - 5.5rem) / ${longest} / 0.62))`;
}

export default function Turn({
  game,
  deck,
  buzzSignal,
  onOutcome,
  onPause,
  onResume,
  onTimeUp,
  onEndEarly,
  onQuit,
}: {
  game: Game;
  deck: Card[];
  /** bumps when a referee phone calls a taboo word */
  buzzSignal: number;
  onOutcome: (card: Card, o: Outcome) => void;
  onPause: () => void;
  onResume: () => void;
  onTimeUp: () => void;
  onEndEarly: () => void;
  onQuit: () => void;
}) {
  const team = game.teams[game.turnTeam];
  const s = TEAM_STYLE[team.color];
  const turn = game.turn!;
  const card = turn.current !== null ? deck[turn.current] : null;
  const paused = isPaused(game);
  const total = turnTotal(turn.played, game.settings.skipLimit);
  const free = freePassesLeft(game);
  const passCosts = free !== null && free === 0;

  // --- the clock ---------------------------------------------------------
  const [ms, setMs] = useState(() => remainingMs(game, Date.now()));
  const firedRef = useRef(false);
  const lastTickRef = useRef(-1);
  useEffect(() => {
    firedRef.current = false;
    const id = setInterval(() => {
      const r = remainingMs(game, Date.now());
      setMs(r);
      const sec = Math.ceil(r / 1000);
      if (!paused && sec <= 5 && sec > 0 && sec !== lastTickRef.current) {
        lastTickRef.current = sec;
        sfx.tick();
      }
      if (r <= 0 && !paused && !firedRef.current) {
        firedRef.current = true;
        sfx.timeUp();
        timeUpHaptic();
        onTimeUp();
      }
    }, 100);
    return () => clearInterval(id);
  }, [game, paused, onTimeUp]);

  const secs = Math.ceil(ms / 1000);
  const frac = Math.max(0, Math.min(1, ms / (game.settings.turnSeconds * 1000)));
  const urgent = secs <= 10;

  // --- the swipe -----------------------------------------------------------
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [fly, setFly] = useState<Outcome | null>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const busy = useRef(false);

  const commit = useCallback(
    (o: Outcome) => {
      if (!card || busy.current || paused) return;
      busy.current = true;
      setFly(o);
      if (o === "got") {
        sfx.got();
        gotHaptic();
      } else if (passCosts) {
        sfx.buzz();
        buzzHaptic();
      } else {
        sfx.skip();
        tapHaptic();
      }
      setTimeout(() => {
        onOutcome(card, o);
        setFly(null);
        setDrag(null);
        busy.current = false;
      }, FLY_MS);
    },
    [card, paused, passCosts, onOutcome]
  );

  // a taboo word called from a referee phone is just a pass
  const seenBuzz = useRef(buzzSignal);
  useEffect(() => {
    if (buzzSignal !== seenBuzz.current) {
      seenBuzz.current = buzzSignal;
      commit("pass");
    }
  }, [buzzSignal, commit]);

  // keyboard, for the desk-bound
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowRight") commit("got");
      else if (e.key === "ArrowLeft") commit("pass");
      else if (e.key === " ") {
        e.preventDefault();
        if (paused) onResume();
        else onPause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, paused, onPause, onResume]);

  function onDown(e: React.PointerEvent<HTMLDivElement>) {
    if (busy.current || paused) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current || start.current.id !== e.pointerId) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  }
  function onUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current || start.current.id !== e.pointerId) return;
    const dx = e.clientX - start.current.x;
    start.current = null;
    const threshold = Math.min(120, (e.currentTarget.clientWidth || 360) * 0.3);
    if (dx > threshold) commit("got");
    else if (dx < -threshold) commit("pass");
    else setDrag(null);
  }

  const dx = drag?.x ?? 0;
  const lean = Math.max(-1, Math.min(1, dx / 140));
  const style: React.CSSProperties = fly
    ? {
        transform:
          fly === "got" ? "translate(130vw, -40px) rotate(18deg)" : "translate(-130vw, -40px) rotate(-18deg)",
        opacity: 0.6,
        transition: `transform ${FLY_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLY_MS}ms`,
      }
    : drag
    ? { transform: `translate(${dx}px, ${drag.y * 0.15}px) rotate(${lean * 9}deg)`, transition: "none" }
    : { transform: "translate(0,0) rotate(0)", transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)" };

  const passTone = passCosts ? "var(--buzz-tint)" : "var(--well)";
  const tint =
    fly === "got" || lean > 0.25
      ? "var(--go-tint)"
      : fly === "pass" || lean < -0.25
      ? passTone
      : s.tint;

  return (
    <div className="tt-game tt-nosel" style={{ background: tint, transition: "background 0.2s" }}>
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
        {/* header */}
        <header className="flex items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <button
            onClick={paused ? onResume : onPause}
            aria-label={paused ? "Resume" : "Pause"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-ink/70 shadow-clay"
          >
            {paused ? <IconPlay size={22} /> : <IconPause size={22} />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold" style={{ color: s.deep }}>
              {team.name}
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${frac * 100}%`,
                  background: urgent ? "var(--buzz)" : s.color,
                  transition: "width 0.1s linear, background 0.3s",
                }}
              />
            </div>
          </div>
          <p
            className={`w-16 text-right font-display text-3xl font-extrabold tabular-nums ${urgent ? "text-buzz" : ""}`}
            style={urgent ? undefined : { color: s.deep }}
          >
            {secs}
          </p>
          <p
            className="flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-display text-lg font-extrabold text-white"
            style={{ background: total < 0 ? "var(--buzz)" : total > 0 ? "var(--go)" : "rgba(120,120,140,0.55)" }}
            aria-label={`${total} points this turn`}
          >
            {total > 0 ? `+${total}` : total}
          </p>
        </header>

        {/* the card */}
        <div className="relative flex min-h-0 flex-1 items-stretch px-4 pb-2 pt-3">
          {card && (
            <div
              key={turn.current}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className="card-in relative flex w-full flex-col overflow-hidden rounded-3xl bg-white"
              style={{ ...style, boxShadow: "var(--lift-lg)", touchAction: "none", cursor: "grab" }}
            >
              <div className="px-5 pb-4 pt-5 text-center" style={{ background: s.tint }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: s.deep }}>
                  get them to say
                </p>
                <p
                  className="mt-1 font-display font-extrabold leading-[1.05] text-ink"
                  style={{ fontSize: wordSize(card.w), textWrap: "balance", overflowWrap: "normal", hyphens: "none" }}
                >
                  {card.w}
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-center px-5 py-3">
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-buzz">without saying</p>
                <ul className="mt-2 space-y-1.5">
                  {card.t.map((t) => (
                    <li
                      key={t}
                      className="flex items-center justify-center gap-2 rounded-xl bg-buzz-tint py-1.5 font-display text-xl font-bold text-ink"
                      style={{ fontSize: t.length > 16 ? "1.05rem" : undefined }}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-buzz" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* stamps */}
              {(lean > 0.25 || fly === "got") && (
                <span
                  className="stamp-in absolute left-4 top-4 rounded-xl px-3 py-1 text-go"
                  style={{ boxShadow: "inset 0 0 0 4px currentColor" }}
                >
                  <IconCheck size={40} />
                </span>
              )}
              {(lean < -0.25 || fly === "pass") && (
                <span
                  className="stamp-in absolute right-4 top-4 rounded-xl px-3 py-1"
                  style={{ boxShadow: "inset 0 0 0 4px currentColor", color: passCosts ? "var(--buzz)" : "var(--ink)" }}
                >
                  <IconPass size={40} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* the two buttons, for people who would rather not swipe */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
          <button
            onClick={() => commit("pass")}
            aria-label={passCosts ? "Pass — costs a point" : `Pass, ${free === null ? "unlimited" : free} free left`}
            className="relative flex h-[4.5rem] flex-col items-center justify-center rounded-3xl font-display text-sm font-extrabold transition-transform active:scale-[0.97]"
            style={{
              background: passCosts ? "var(--buzz)" : "var(--surface)",
              color: passCosts ? "#fff" : "var(--ink)",
              boxShadow: "var(--lift), 0 0 0 1px var(--hair)",
            }}
          >
            <IconPass size={30} />
            <span className="mt-0.5 opacity-80">
              {free === null ? "Pass" : passCosts ? "Pass · −1" : `Pass · ${free} free`}
            </span>
          </button>
          <button
            onClick={() => commit("got")}
            aria-label="They got it"
            className="flex h-[4.5rem] flex-col items-center justify-center rounded-3xl font-display text-sm font-extrabold text-white transition-transform active:scale-[0.97]"
            style={{ background: "var(--go)", boxShadow: "var(--lift)" }}
          >
            <IconCheck size={32} />
            <span className="mt-0.5 opacity-90">Got it · +1</span>
          </button>
        </div>

        {/* paused */}
        {paused && (
          <div className="tt-frost absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-4xl font-extrabold text-ink">Paused</p>
            <p className="mt-1 text-sm text-ink/60">
              {secs}s left · {total > 0 ? `+${total}` : total} so far
            </p>
            <button onClick={onResume} className="btn-primary mt-6 w-full max-w-xs text-xl">
              Resume <IconPlay size={22} />
            </button>
            <button onClick={onEndEarly} className="btn-quiet mt-3 w-full max-w-xs">
              End this turn now
            </button>
            <button onClick={onQuit} className="mt-6 text-sm font-bold text-ink/50 hover:text-ink">
              Quit to the home screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

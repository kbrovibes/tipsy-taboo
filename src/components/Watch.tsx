"use client";

import { useEffect, useRef, useState } from "react";
import { IconBack, IconLogo, IconPass } from "@/components/icons";
import Scoreboard from "@/components/game/Scoreboard";
import { TEAM_STYLE } from "@/lib/names";
import { realtimeAvailable, watchChannel } from "@/lib/realtime";
import { primeAudio, sfx, buzzHaptic } from "@/lib/sound";
import { useShellMetrics } from "@/lib/shell";
import type { Snapshot } from "@/lib/types";

/**
 * The referee's phone. A mirror of the card on the host's screen and one very
 * large button: press it when a banned word is said, and the host's card is
 * passed exactly as if they had swiped it left themselves.
 */
export default function Watch({ code }: { code: string }) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [waited, setWaited] = useState(false);
  const [ms, setMs] = useState(0);
  const [flash, setFlash] = useState(false);
  const ch = useRef<ReturnType<typeof watchChannel>>(null);

  useShellMetrics();

  useEffect(() => {
    if (!realtimeAvailable) return;
    ch.current = watchChannel(code, { onState: setSnap, onStatus: setConnected });
    const t = setTimeout(() => setWaited(true), 8000);
    return () => {
      clearTimeout(t);
      ch.current?.close();
    };
  }, [code]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!snap) return;
      setMs(snap.endsAt === null ? snap.remainingMs : Math.max(0, snap.endsAt - Date.now()));
    }, 200);
    return () => clearInterval(id);
  }, [snap]);

  function call() {
    primeAudio();
    ch.current?.buzz();
    sfx.buzz();
    buzzHaptic();
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
  }

  if (!realtimeAvailable) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 text-center text-sm text-ink/60">
        The referee link is not switched on for this build.
      </main>
    );
  }

  const team = snap ? snap.teams[snap.turnTeam] : null;
  const s = team ? TEAM_STYLE[team.color] : null;
  const secs = Math.ceil(ms / 1000);
  const live = snap?.phase === "turn" && snap.card && snap.endsAt !== null;
  const costs = snap?.freeLeft === 0;

  return (
    <div
      className="tt-game tt-nosel"
      style={{
        background: flash ? "var(--buzz-tint)" : s?.tint ?? "var(--paper)",
        transition: "background 0.2s",
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <header className="flex items-center justify-between px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <a href="/" aria-label="Home" className="rounded-xl bg-white/80 p-2 text-ink/70 shadow-clay">
            <IconBack size={20} />
          </a>
          <p className="with-glyph flex items-center gap-1.5 font-display text-sm font-bold text-ink/70">
            <IconLogo size={22} /> Referee · <span className="font-mono tracking-widest">{code}</span>
          </p>
          <span
            className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-go" : "bg-ink/25"}`}
            aria-label={connected ? "connected" : "connecting"}
          />
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
          {!snap ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="font-display text-xl font-bold text-ink/70">
                {connected ? "Waiting for the game…" : "Connecting…"}
              </p>
              {waited && (
                <p className="mt-2 max-w-xs text-sm text-ink/55">
                  Nothing on this code yet. Check the four letters, and make sure the host phone has the game open.
                </p>
              )}
            </div>
          ) : live && snap.card && s && team ? (
            <>
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate font-display text-base font-bold" style={{ color: s.deep }}>
                  {team.name}
                </p>
                <p
                  className={`font-display text-3xl font-extrabold tabular-nums ${secs <= 10 ? "text-buzz" : ""}`}
                  style={secs <= 10 ? undefined : { color: s.deep }}
                >
                  {secs}
                </p>
                <p className="rounded-full bg-white/80 px-3 py-1 font-display text-base font-extrabold">
                  {snap.turnTotal > 0 ? `+${snap.turnTotal}` : snap.turnTotal}
                </p>
              </div>
              <div
                className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white"
                style={{ boxShadow: "var(--lift-lg)" }}
              >
                <div className="px-5 pb-3 pt-4 text-center" style={{ background: s.tint }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: s.deep }}>
                    they must say
                  </p>
                  <p
                    className="mt-1 font-display font-extrabold leading-[1.05]"
                    style={{
                      fontSize: `min(2.8rem, calc((min(100vw, 28rem) - 5.5rem) / ${Math.max(
                        ...snap.card.w.split(" ").map((p) => p.length)
                      )} / 0.62))`,
                      textWrap: "balance",
                      overflowWrap: "normal",
                    }}
                  >
                    {snap.card.w}
                  </p>
                </div>
                <div className="flex flex-1 flex-col justify-center px-5 py-3">
                  <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-buzz">
                    call it if you hear
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {snap.card.t.map((t) => (
                      <li
                        key={t}
                        className="flex items-center justify-center gap-2 rounded-xl bg-buzz-tint py-1.5 font-display text-lg font-bold"
                      >
                        <span className="h-2 w-2 rounded-full bg-buzz" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={call}
                className="pulse-ring mt-4 flex h-24 w-full items-center justify-center gap-3 rounded-3xl bg-buzz font-display text-3xl font-extrabold text-white active:scale-[0.98]"
                style={{ boxShadow: "var(--lift)" }}
              >
                <IconPass size={36} /> TABOO!
              </button>
              <p className="mt-1.5 text-center text-[11px] text-ink/55">
                {costs ? "Their free passes are gone — this costs them a point." : "Passes the card. Free ones first, then −1 each."}
              </p>
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-center font-display text-2xl font-bold text-ink/80">
                {snap.phase === "over"
                  ? "Game over"
                  : snap.phase === "recap"
                  ? `Time's up for ${team?.name}`
                  : snap.phase === "turn"
                  ? "Paused"
                  : `Waiting for ${team?.name} to start`}
              </p>
              <p className="mt-1 text-center text-sm text-ink/55">
                {snap.rounds ? `Round ${Math.min(snap.round, snap.rounds)} of ${snap.rounds}` : `Round ${snap.round}`}
              </p>
              <div className="mt-6">
                <Scoreboard teams={snap.teams} current={snap.phase === "over" ? undefined : snap.turnTeam} large />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

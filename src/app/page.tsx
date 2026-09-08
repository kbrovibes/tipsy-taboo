"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconCheck, IconLogo, IconPass, IconPhone, Wordmark } from "@/components/icons";
import AppearanceToggle from "@/components/AppearanceToggle";
import InstallTip from "@/components/InstallTip";
import Scoreboard from "@/components/game/Scoreboard";
import { deckInfo, THEMES, totalCards } from "@/lib/decks";
import { cleanCode } from "@/lib/names";
import { realtimeAvailable } from "@/lib/realtime";
import { loadGame, saveGame } from "@/lib/storage";
import type { Game } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [saved, setSaved] = useState<Game | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    setSaved(loadGame());
  }, []);

  const resumable = saved && saved.phase !== "over";
  const cards = totalCards();

  function startFresh() {
    saveGame(null);
    router.push("/play");
  }

  function watch(e: React.FormEvent) {
    e.preventDefault();
    const c = cleanCode(code);
    if (c.length === 4) router.push(`/watch/${c}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-6 sm:py-10">
      <div className="text-center">
        {/* a plain href: tapping the logo is the universal "clean start" */}
        <a href="/" className="inline-block" aria-label="Tipsy Taboo home">
          <span className="animate-wiggle inline-block">
            <IconLogo size={64} className="sm:hidden" />
            <IconLogo size={88} className="hidden sm:inline-block" />
          </span>
          <h1 className="mt-3 whitespace-nowrap leading-none" style={{ fontSize: "clamp(2.1rem, 9.5vw, 3.4rem)" }}>
            <Wordmark />
          </h1>
        </a>
        <p className="mt-2 text-base text-ink/60 sm:text-lg">Say anything. Except that.</p>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-4 shadow-clay sm:p-5">
        {resumable && saved ? (
          <>
            <p className="text-center text-xs font-bold uppercase tracking-wider text-ink/50">
              Game in progress · {deckInfo(saved.settings.deck).label}
            </p>
            <div className="mt-3">
              <Scoreboard teams={saved.teams} current={saved.turnTeam} />
            </div>
            <button onClick={() => router.push("/play")} className="btn-primary mt-4 w-full text-lg">
              Pick up where we left off <IconArrowRight size={20} />
            </button>
            <button
              onClick={startFresh}
              className="mt-2 w-full rounded-xl py-2 text-sm font-bold text-ink/50 hover:text-ink"
            >
              Start a new game instead
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-ink/65">
              One phone, two to four teams. Get your team to say the word without saying any of the five words under it.
            </p>
            <button onClick={startFresh} className="btn-primary mt-4 w-full text-xl">
              New game <IconArrowRight size={22} />
            </button>
          </>
        )}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 text-center text-xs text-ink/65">
        <li className="rounded-2xl bg-white/70 px-2 py-3">
          <span className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-go-tint text-go">
            <IconCheck size={20} />
          </span>
          <b className="block text-ink">Swipe right</b> they got it, +1
        </li>
        <li className="rounded-2xl bg-white/70 px-2 py-3">
          <span className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-buzz-tint text-buzz">
            <IconPass size={20} />
          </span>
          <b className="block text-ink">Swipe left</b> pass, or a banned word slipped
        </li>
      </ul>

      {realtimeAvailable && (
        <form onSubmit={watch} className="mt-4 rounded-2xl bg-white/70 p-3">
          <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
            <IconPhone size={18} /> Referee on a second phone? Enter the code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={40}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-xl bg-paper px-3 py-2 text-center font-mono text-2xl font-black uppercase tracking-[0.3em] outline-none placeholder:text-ink/20"
              style={{ boxShadow: "inset 0 0 0 1px var(--hair)" }}
            />
            <button disabled={cleanCode(code).length !== 4} className="btn-quiet px-4 disabled:opacity-40" aria-label="Watch">
              <IconArrowRight size={22} />
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-ink/50">
        {cards.toLocaleString()} cards · 4 difficulties · {THEMES.length - 1} themes · plays offline
      </p>

      <div className="mx-auto mt-3 w-full max-w-[15rem]">
        <AppearanceToggle />
      </div>

      <InstallTip />

      <p className="mt-6 text-center text-xs text-ink/40">
        No accounts · no ads · no cards under the sofa
        <br />
        <a href="/about.html" className="underline decoration-ink/30 hover:text-ink">
          about
        </a>
        {" · "}
        <a href="https://github.com/kbrovibes/tipsy-taboo" className="underline decoration-ink/30 hover:text-ink" rel="noopener">
          source
        </a>
      </p>
    </main>
  );
}

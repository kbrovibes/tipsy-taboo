"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconBack, IconLogo, Wordmark } from "@/components/icons";
import { cleanCode } from "@/lib/names";
import { realtimeAvailable } from "@/lib/realtime";

export default function WatchEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const c = cleanCode(code);
    if (c.length === 4) router.push(`/watch/${c}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-3">
      <header className="flex items-center justify-between">
        <a href="/" aria-label="Back" className="rounded-xl bg-white p-2 text-ink/70 shadow-clay">
          <IconBack size={20} />
        </a>
        <span className="with-glyph flex items-center gap-1.5 text-lg">
          <IconLogo size={26} /> <Wordmark />
        </span>
        <span className="w-9" />
      </header>

      <form onSubmit={go} className="mt-10 rounded-3xl bg-white p-5 text-center shadow-clay">
        <h1 className="font-display text-2xl font-bold">Referee phone</h1>
        <p className="mt-2 text-sm text-ink/60">
          See the card the other team is playing and buzz when a taboo word slips out. The host finds the code under the ⚙ menu.
        </p>
        {realtimeAvailable ? (
          <>
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={40}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="mt-5 w-full rounded-2xl border-2 border-ink/15 bg-paper py-4 text-center font-mono text-4xl font-black uppercase tracking-[0.35em] outline-none placeholder:text-ink/20"
            />
            <button disabled={cleanCode(code).length !== 4} className="btn-primary mt-3 w-full text-xl disabled:opacity-40">
              Watch the card <IconArrowRight size={22} />
            </button>
          </>
        ) : (
          <p className="mt-5 rounded-2xl bg-well px-4 py-3 text-sm text-ink/60">
            The referee link is not switched on for this build.
          </p>
        )}
      </form>
    </main>
  );
}

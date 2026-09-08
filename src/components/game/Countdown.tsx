"use client";

import { useEffect, useState } from "react";
import { TEAM_STYLE } from "@/lib/names";
import { sfx } from "@/lib/sound";
import type { Team } from "@/lib/types";

/** 3 · 2 · 1 · GO — then the clock starts. */
export default function Countdown({ team, onDone }: { team: Team; onDone: () => void }) {
  const [n, setN] = useState(3);
  const s = TEAM_STYLE[team.color];

  useEffect(() => {
    if (n > 0) sfx.count();
    else sfx.go();
    const t = setTimeout(() => {
      if (n > 0) setN(n - 1);
      else onDone();
    }, n > 0 ? 800 : 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <div
      className="tt-game tt-nosel flex flex-col items-center justify-center text-center"
      style={{ background: s.tint }}
    >
      <p className="font-display text-xl font-bold" style={{ color: s.deep }}>
        {team.name}
      </p>
      <p key={n} className="pop-in mt-4 font-display font-extrabold leading-none" style={{ fontSize: "9rem", color: s.color }}>
        {n > 0 ? n : "GO"}
      </p>
      <p className="mt-6 text-sm text-ink/60">{n > 0 ? "Eyes on the clue-giver" : "Talk!"}</p>
    </div>
  );
}

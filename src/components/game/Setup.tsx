"use client";

import { useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconBack, IconLogo, IconRefresh, IconX, Wordmark } from "@/components/icons";
import { deckCount, DIFFICULTIES, isTheme, THEMES } from "@/lib/decks";
import { goofyTeamName, TEAM_COLORS, TEAM_STYLE } from "@/lib/names";
import { primeAudio } from "@/lib/sound";
import type { DeckKey, Settings, TeamColor } from "@/lib/types";

interface TeamDraft {
  name: string;
  color: TeamColor;
}

const DEFAULTS: Settings = { deck: "hard", turnSeconds: 60, rounds: 5, skipLimit: 3 };

function Seg<T extends string | number | null>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-well p-1">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-lg py-2 text-sm font-extrabold transition-all ${
            o.v === value ? "bg-white text-ink shadow-clay" : "text-ink/55 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Setup({
  initial,
  onStart,
  onBack,
}: {
  initial: Settings | null;
  onStart: (settings: Settings, teams: TeamDraft[]) => Promise<void>;
  onBack: () => void;
}) {
  const [settings, setSettings] = useState<Settings>(initial ?? DEFAULTS);
  const [teams, setTeams] = useState<TeamDraft[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const a = goofyTeamName();
    setTeams([
      { name: a, color: "berry" },
      { name: goofyTeamName([a]), color: "ocean" },
    ]);
  }, []);

  const theme = isTheme(settings.deck);
  const count = useMemo(() => deckCount(settings.deck), [settings.deck]);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setSettings((s) => ({ ...s, [k]: v }));
  }

  function addTeam() {
    if (teams.length >= 4) return;
    const color = TEAM_COLORS.find((c) => !teams.some((t) => t.color === c)) ?? "lime";
    setTeams([...teams, { name: goofyTeamName(teams.map((t) => t.name)), color }]);
  }

  function rename(i: number, name: string) {
    setTeams(teams.map((t, k) => (k === i ? { ...t, name } : t)));
  }

  function reroll() {
    const names: string[] = [];
    setTeams(
      teams.map((t) => {
        const n = goofyTeamName(names);
        names.push(n);
        return { ...t, name: n };
      })
    );
  }

  async function start() {
    if (busy) return;
    primeAudio();
    setBusy(true);
    const clean = teams.map((t, i) => ({ ...t, name: t.name.trim() || `Team ${i + 1}` }));
    try {
      await onStart(settings, clean);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-28 pt-3">
      <header className="flex items-center justify-between">
        <button onClick={onBack} aria-label="Back" className="rounded-xl bg-white p-2 text-ink/70 shadow-clay">
          <IconBack size={20} />
        </button>
        <span className="with-glyph flex items-center gap-1.5 text-lg">
          <IconLogo size={26} /> <Wordmark />
        </span>
        <span className="w-9" />
      </header>

      {/* teams */}
      <section className="mt-5 rounded-3xl bg-white p-4 shadow-clay">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Teams</h2>
          <button onClick={reroll} className="with-glyph flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-ink/55 hover:text-ink" type="button">
            <IconRefresh size={14} /> new names
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {teams.map((t, i) => {
            const s = TEAM_STYLE[t.color];
            return (
              <li key={t.color} className="flex items-center gap-2 rounded-2xl px-2 py-1.5" style={{ background: s.tint }}>
                <span className="h-7 w-7 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                <input
                  value={t.name}
                  onChange={(e) => rename(i, e.target.value)}
                  maxLength={22}
                  aria-label={`Team ${i + 1} name`}
                  className="min-w-0 flex-1 rounded-lg border-2 border-transparent bg-transparent px-2 py-1.5 font-display text-base font-bold outline-none focus:bg-white/70"
                />
                {teams.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setTeams(teams.filter((_, k) => k !== i))}
                    aria-label={`Remove ${t.name}`}
                    className="rounded-lg p-1.5 text-ink/45 hover:text-ink"
                  >
                    <IconX size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {teams.length < 4 && (
          <button
            type="button"
            onClick={addTeam}
            className="mt-2 w-full rounded-2xl border-2 border-dashed border-ink/25 py-2 text-sm font-bold text-ink/55 hover:text-ink"
          >
            + Add a team
          </button>
        )}
      </section>

      {/* deck */}
      <section className="mt-4 rounded-3xl bg-white p-4 shadow-clay">
        <h2 className="font-display text-lg font-bold">Cards</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((d) => {
            const on = settings.deck === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => set("deck", d.key)}
                className={`rounded-2xl px-3 py-3 text-left transition-all ${on ? "bg-lime shadow-clay ring-2 ring-ink" : "bg-well hover:bg-lime/40"}`}
              >
                <span className="text-xl" aria-hidden>{d.emoji}</span>
                <span className="mt-1 block font-display text-base font-extrabold">{d.label}</span>
                <span className="block text-xs text-ink/60">{d.blurb}</span>
                <span className="mt-1 block text-[11px] font-bold text-ink/45">{deckCount(d.key).toLocaleString()} cards</span>
              </button>
            );
          })}
        </div>
        {!theme && (
          <p className="mt-2 text-xs text-ink/55">{DIFFICULTIES.find((d) => d.key === settings.deck)?.who}</p>
        )}

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink/50">or a theme</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {THEMES.map((t) => {
            const on = settings.deck === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => set("deck", t.key as DeckKey)}
                className={`rounded-xl px-1.5 py-2 text-center transition-all ${on ? "bg-lime shadow-clay ring-2 ring-ink" : "bg-well hover:bg-lime/40"}`}
              >
                <span className="text-lg" aria-hidden>{t.emoji}</span>
                <span className="block text-[11px] font-extrabold leading-tight">{t.label}</span>
              </button>
            );
          })}
        </div>
        {theme && (
          <p className="mt-2 text-xs text-ink/55">
            {THEMES.find((t) => t.key === settings.deck)?.blurb} · {count.toLocaleString()} cards · themes play at medium difficulty
          </p>
        )}
      </section>

      {/* house rules */}
      <section className="mt-4 rounded-3xl bg-white p-4 shadow-clay">
        <h2 className="font-display text-lg font-bold">House rules</h2>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-ink/50">Seconds per turn</label>
        <div className="mt-1.5">
          <Seg
            options={[{ v: 60, label: "60" }, { v: 90, label: "90" }, { v: 120, label: "120" }]}
            value={settings.turnSeconds}
            onChange={(v) => set("turnSeconds", v)}
          />
        </div>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-ink/50">Rounds</label>
        <div className="mt-1.5">
          <Seg
            options={[{ v: 3, label: "3" }, { v: 5, label: "5" }, { v: 8, label: "8" }, { v: null, label: "∞" }]}
            value={settings.rounds}
            onChange={(v) => set("rounds", v)}
          />
        </div>
        <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-ink/50">Skips per turn</label>
        <div className="mt-1.5">
          <Seg
            options={[{ v: 0, label: "None" }, { v: 3, label: "3" }, { v: null, label: "∞" }]}
            value={settings.skipLimit}
            onChange={(v) => set("skipLimit", v)}
          />
        </div>
        <p className="mt-3 text-xs text-ink/55">
          Got it +1 · skipped 0 · taboo word said −1. Every team plays once per round; a tie at the end adds a round.
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 tt-frost">
        <div className="mx-auto max-w-md">
          <button onClick={start} disabled={busy || count === 0} className="btn-primary w-full text-xl disabled:opacity-40">
            {busy ? "Shuffling…" : count === 0 ? "This deck is empty" : <>Deal the cards <IconArrowRight size={22} /></>}
          </button>
        </div>
      </div>
    </main>
  );
}

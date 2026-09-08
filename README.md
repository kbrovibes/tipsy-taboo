# Tipsy Taboo

**Say anything. Except that.**

The word game where the obvious clues are banned, rebuilt for one phone that
gets passed around the table. Pick your teams, pick a deck, hand the phone to
whoever is giving clues, and swipe. No accounts, no installs, no ads, and no
cards under the sofa.

- **Play it:** <https://tipsy-taboo.vercel.app>
- **About page:** <https://tipsy-taboo.vercel.app/about.html> (also mirrored at
  <https://kbrovibes.github.io/tipsy-taboo/>)

---

## How a night goes

1. **Set up.** Two to four teams with goofy auto-names (editable), a deck, and
   the house rules: 60 / 90 / 120 second turns, 3 / 5 / 8 / endless rounds,
   0 / 3 / unlimited skips per turn. Last night's rules are remembered.
2. **Pass the phone.** The handoff screen doubles as the scoreboard. The team
   picks a clue-giver, taps *Start the clock*, and gets a 3‑2‑1.
3. **Play the card.** The word sits on top, the five banned words underneath.
   Three ways off the screen and none of them have a label:
   - **swipe right** or tap the green circle — they said it, **+1**
   - **swipe left** or tap the amber circle — skip, **0** (counted against the
     skip limit)
   - **tap the red hand** — a banned word slipped out, **−1**. That button
     belongs to the other team, who watch the card over the clue-giver's
     shoulder, or from their own phone (see the referee link below).
   Sound and haptics on every action, ticks for the last five seconds, a horn
   at time-up. Arrow keys and `B` do the same on a laptop.
4. **Bank it.** Time's up shows every card from the turn with its outcome. Tap
   an icon to fix a fat-fingered swipe, then bank the points. The card that
   was on screen when the clock ran out goes back on top of the deck.
5. **Win.** Every team plays once per round; after the last round the top
   score wins, and a tie adds a round. Confetti, standings, rematch.

The game is saved to the phone on every change, so a locked screen, a refresh
or a dead battery mid-turn costs nothing: open the app and pick up where you
left off. The screen stays awake while the clock runs.

### The referee link

Under the ⚙ menu is a four-letter code and a QR. A second phone opens
`/watch`, types the code, and sees the live card with a very large **BUZZ**
button — so the opposing team can police the banned words without leaning
over anybody. It is a Supabase Realtime broadcast channel and nothing else:
the host phone publishes a snapshot after every change, watchers send buzzes
back, nothing is stored. Without the two public env vars the feature is simply
not offered and the game plays on exactly as before.

## The cards

| Deck | Cards | Who it is for |
|---|---:|---|
| 🧸 Kids | 1,102 | 6–9 year olds: animals, snacks, cartoons. Simple banned words, a couple of easy routes left open. |
| 🍹 Medium | 1,041 | The classic party pack: everyday words everybody knows. |
| 🌶️ Hard | 1,021 | The most-played level: idioms, feelings, verbs, general knowledge. Every obvious route closed. |
| 💀 Insane | 1,072 | Named effects, jargon, deep cuts, multi-word ideas. Brutal but still guessable. |

Plus eight themed packs (2,044 cards between them, 240–350 each), played at medium difficulty, aimed
at the people this app is actually played by — Indian friends abroad in their
thirties and forties: **Bollywood, Malayalam Movies, Famous Indians, Places in
India, Desi Life, Cricket, 90s India, Movies (world)** — and *The Big Mix*,
which shuffles them all together.

Every card is `{ w: "Hangover", t: ["Headache", "Drunk", "Morning", "Alcohol", "Regret"] }`:
the five banned words are the five clues you would reach for first. The decks
were written by a team of parallel Claude sub-agents, each given one tier and
one slice of subject matter, against the spec in [`data/SPEC.md`](data/SPEC.md).
`scripts/build-decks.mjs` then validates every card (exactly five banned words,
no banned word sharing a stem with the target in either direction, allowed
characters, no near-duplicates), removes duplicates, and makes sure a word
lives in exactly one difficulty tier — the easiest wins. Rejects are logged,
never silently dropped. Each deck is its own JS chunk, so a Kids night never
downloads the Insane deck.

Like a real deck, the phone remembers which cards it has already dealt, per
deck, across games. Fresh cards come first; the pile only recycles once it is
empty.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` in `globals.css`) |
| Type | Bricolage Grotesque + Manrope via `next/font` |
| State | One `Game` object in `localStorage`; a pure engine in `lib/engine.ts` |
| Referee link | Supabase Realtime broadcast (no tables, no rows) |
| PWA | Web manifest + a service worker that caches the shell and the deck chunks, so it plays offline |
| Hosting | Vercel; landing page on GitHub Pages from `docs/` |

### Layout of the code

```
src/
  app/
    page.tsx                 home: new game / resume / referee code
    play/page.tsx            the game (client-side state machine)
    watch/[code]/page.tsx    the referee's phone
    globals.css              the theme (linen / ink / berry / lime)
    manifest.ts              PWA manifest
  components/
    game/Game.tsx            the loop: load, persist, publish, route by phase
    game/Setup.tsx           teams, deck, house rules
    game/Handoff.tsx         pass-the-phone + scoreboard
    game/Turn.tsx            the card, the swipe, the clock, the buzzer
    game/Recap.tsx           time's up, fix mis-swipes, bank
    game/Over.tsx            results and confetti
    game/Sheet.tsx           menu: sound, referee code + QR, end game
    Watch.tsx                referee view
    icons.tsx                hand-drawn glyphs and the wordmark
  lib/
    engine.ts                pure game state machine
    decks.ts                 deck metadata and lazy loaders
    realtime.ts              host / watcher broadcast channels
    storage.ts               game, settings, mute, used-card memory
    sound.ts                 WebAudio synth and haptics
    shell.ts                 visible-height, edge-swipe guard, wake lock
    qr.ts                    QR encoder (no CDN)
  data/                      generated decks + meta.json (do not edit by hand)
data/
  SPEC.md                    what a card is and what makes a good one
  raw/                       the agents' output, one file per slice
scripts/
  build-decks.mjs            raw → src/data, with validation
  icons.mjs, og.mjs          app icons and the social image
```

## Local development

Requires Node 20+.

```bash
git clone https://github.com/kbrovibes/tipsy-taboo
cd tipsy-taboo
npm install
npm run dev
```

Optional, for the referee link — create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Rebuild the decks after editing anything in `data/raw/`:

```bash
node scripts/build-decks.mjs
```

## Privacy

Team names, scores and which cards you have seen live in your own browser's
storage and never leave the phone. The only thing that goes over the network is
the referee broadcast — the current card and the scores — and only while a
referee phone is connected. No analytics, no ads, no accounts.

## Licence

No licence file yet — all rights reserved. Ask if you want to reuse something.

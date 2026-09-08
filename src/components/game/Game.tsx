"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconGear } from "@/components/icons";
import { loadDeck } from "@/lib/decks";
import * as E from "@/lib/engine";
import { newCode } from "@/lib/names";
import { hostChannel, realtimeAvailable, type Host } from "@/lib/realtime";
import { primeAudio } from "@/lib/sound";
import { useEdgeSwipeGuard, useShellMetrics, useWakeLock } from "@/lib/shell";
import { loadGame, loadMuted, loadSettings, loadUsed, markUsed, saveGame, saveMuted, saveSettings } from "@/lib/storage";
import type { Card, Game as G, Outcome, Settings, TeamColor } from "@/lib/types";
import Countdown from "./Countdown";
import Handoff from "./Handoff";
import Over from "./Over";
import Recap from "./Recap";
import Setup from "./Setup";
import Sheet from "./Sheet";
import Turn from "./Turn";

/**
 * The client-side game loop. Everything lives in one Game object that is
 * saved to localStorage on every change, so a locked phone, a refresh or a
 * dead battery halfway through a turn costs nothing.
 */
export default function Game() {
  const router = useRouter();
  const [game, setGame] = useState<G | null | undefined>(undefined);
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [muted, setMuted] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [watchers, setWatchers] = useState(0);
  const [buzzSignal, setBuzzSignal] = useState(0);
  const [initial, setInitial] = useState<Settings | null>(null);
  const hostRef = useRef<Host | null>(null);
  const gameRef = useRef<G | null>(null);

  useShellMetrics();
  useEdgeSwipeGuard(game?.phase === "turn" || game?.phase === "countdown");
  useWakeLock(game?.phase === "turn" || game?.phase === "countdown");

  useEffect(() => {
    setGame(loadGame());
    setInitial(loadSettings());
    setMuted(loadMuted());
  }, []);

  // persist
  useEffect(() => {
    if (game === undefined) return;
    gameRef.current = game;
    saveGame(game);
  }, [game]);

  // the deck follows the game's deck key
  const deckKey = game?.settings.deck;
  useEffect(() => {
    if (!deckKey) return;
    let live = true;
    loadDeck(deckKey).then((d) => {
      if (live) setDeck(d);
    });
    return () => {
      live = false;
    };
  }, [deckKey]);

  const update = useCallback((fn: (g: G) => G) => setGame((g) => (g ? fn(g) : g)), []);

  // a saved game whose deck has since changed shape gets re-dealt rather than
  // pointing at cards that are not there any more
  useEffect(() => {
    if (!game || !deck || game.order.length === deck.length) return;
    update((g) => {
      const order = E.shuffle(deck.map((_, i) => i));
      const inTurn = g.turn && g.turn.current !== null;
      return { ...g, order, cursor: inTurn ? 1 : 0, turn: g.turn ? { ...g.turn, current: inTurn ? order[0] : null } : null };
    });
  }, [game, deck, update]);

  // referee channel: one per game id
  const gameId = game?.id;
  useEffect(() => {
    if (!gameId || !realtimeAvailable) return;
    const host = hostChannel(gameId, {
      onBuzz: () => {
        const g = gameRef.current;
        if (g && g.phase === "turn" && !E.isPaused(g)) setBuzzSignal((n) => n + 1);
      },
      onWatchers: setWatchers,
    });
    hostRef.current = host;
    return () => {
      host?.close();
      hostRef.current = null;
    };
  }, [gameId]);

  useEffect(() => {
    if (game) hostRef.current?.publish(E.toSnapshot(game, deck));
  }, [game, deck]);

  async function start(settings: Settings, teams: { name: string; color: TeamColor }[]) {
    const d = await loadDeck(settings.deck);
    const g = E.createGame({
      id: newCode(),
      settings,
      teams,
      deckWords: d.map((c) => c.w),
      used: loadUsed(settings.deck),
    });
    saveSettings(settings);
    setDeck(d);
    setGame(g);
  }

  const outcome = useCallback(
    (card: Card, o: Outcome) => {
      update((g) => E.mark(g, card, o));
      if (deckKey && deck) markUsed(deckKey, [card.w], deck.length);
    },
    [update, deckKey, deck]
  );

  const onTimeUp = useCallback(() => update(E.endTurn), [update]);
  const onPause = useCallback(() => update((g) => E.pauseTurn(g, Date.now())), [update]);
  const onResume = useCallback(() => update((g) => E.resumeTurn(g, Date.now())), [update]);

  function quit() {
    setSheet(false);
    router.push("/");
  }

  function newGame() {
    setSheet(false);
    setGame(null);
    setDeck(null);
  }

  if (game === undefined) return null;

  if (game === null) {
    return <Setup initial={initial} onStart={start} onBack={() => router.push("/")} />;
  }

  const team = game.teams[game.turnTeam];

  return (
    <>
      {game.phase === "handoff" && (
        <Handoff
          game={game}
          onReady={() => {
            primeAudio();
            update(E.beginCountdown);
          }}
          onSheet={() => setSheet(true)}
        />
      )}

      {game.phase === "countdown" && <Countdown team={team} onDone={() => update((g) => E.startTurn(g, Date.now()))} />}

      {game.phase === "turn" &&
        (deck ? (
          <Turn
            game={game}
            deck={deck}
            buzzSignal={buzzSignal}
            onOutcome={outcome}
            onPause={onPause}
            onResume={onResume}
            onTimeUp={onTimeUp}
            onEndEarly={() => update(E.endTurn)}
            onQuit={() => {
              onPause();
              router.push("/");
            }}
          />
        ) : (
          <div className="tt-game flex items-center justify-center text-sm text-ink/60">Shuffling the deck…</div>
        ))}

      {game.phase === "recap" && (
        <>
          <Recap game={game} onChange={(i, o) => update((g) => E.setOutcome(g, i, o))} onDone={() => update(E.finishRecap)} />
          <button
            onClick={() => setSheet(true)}
            aria-label="Game menu"
            className="fixed right-4 top-4 z-10 rounded-xl bg-white p-2 text-ink/70 shadow-clay"
          >
            <IconGear size={20} />
          </button>
        </>
      )}

      {game.phase === "over" && (
        <>
          <Over game={game} onRematch={() => update(E.rematch)} onNew={newGame} />
          <button
            onClick={() => setSheet(true)}
            aria-label="Game menu"
            className="fixed right-4 top-4 z-10 rounded-xl bg-white p-2 text-ink/70 shadow-clay"
          >
            <IconGear size={20} />
          </button>
        </>
      )}

      {sheet && (
        <Sheet
          game={game}
          muted={muted}
          watchers={watchers}
          onMute={(m) => {
            setMuted(m);
            saveMuted(m);
          }}
          onEnd={() => {
            setSheet(false);
            update(E.endGame);
          }}
          onQuit={quit}
          onClose={() => setSheet(false)}
        />
      )}
    </>
  );
}

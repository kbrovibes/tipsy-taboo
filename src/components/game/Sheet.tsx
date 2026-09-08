"use client";

import { useMemo, useState } from "react";
import { IconEye, IconShare, IconVolume, IconVolumeOff, IconX } from "@/components/icons";
import AppearanceToggle from "@/components/AppearanceToggle";
import { deckInfo } from "@/lib/decks";
import { encodeQr, qrPath } from "@/lib/qr";
import { realtimeAvailable } from "@/lib/realtime";
import type { Game } from "@/lib/types";

function QrBlock({ text }: { text: string }) {
  const qr = useMemo(() => {
    try {
      const code = encodeQr(text);
      return { d: qrPath(code), span: code.size + 4 };
    } catch {
      return null;
    }
  }, [text]);
  if (!qr) return null;
  return (
    /* a camera needs real black on real white, whatever the app theme is */
    <svg viewBox={`0 0 ${qr.span} ${qr.span}`} className="h-36 w-36 rounded-xl" shapeRendering="crispEdges" aria-label={`QR code for ${text}`}>
      <rect width={qr.span} height={qr.span} fill="#fff" />
      <path d={qr.d} fill="#000" />
    </svg>
  );
}

/**
 * The game menu. Sound, the referee link, and the two ways out. Slides up
 * over whatever screen you were on.
 */
export default function Sheet({
  game,
  muted,
  watchers,
  onMute,
  onEnd,
  onQuit,
  onClose,
}: {
  game: Game;
  muted: boolean;
  watchers: number;
  onMute: (m: boolean) => void;
  onEnd: () => void;
  onQuit: () => void;
  onClose: () => void;
}) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://tipsy-taboo.vercel.app";
  const url = `${origin}/watch/${game.id}`;
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const { deck, turnSeconds, rounds, skipLimit } = game.settings;

  async function share() {
    const text = `Referee code ${game.id} — open ${url} to see the card and call taboo words`;
    try {
      if (canShare) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className="relative max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-paper px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-clay">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-ink/15" />
          <div className="mt-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Game menu</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-xl bg-white p-2 text-ink/60 shadow-clay">
              <IconX size={18} />
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-clay">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/50">Appearance</p>
            <AppearanceToggle />
          </div>

          <button
            onClick={() => onMute(!muted)}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-clay"
          >
            <span className="text-ink/70">{muted ? <IconVolumeOff size={22} /> : <IconVolume size={22} />}</span>
            <span className="flex-1 font-bold">Sound</span>
            <span className="rounded-full px-3 py-1 text-xs font-extrabold" style={{ background: muted ? "var(--well)" : "var(--lime)", color: muted ? "var(--muted)" : "var(--on-lime)" }}>
              {muted ? "off" : "on"}
            </span>
          </button>

          {realtimeAvailable && (
            <section className="mt-3 rounded-2xl bg-white p-4 shadow-clay">
              <div className="flex items-center gap-2">
                <IconEye size={20} className="text-ink/70" />
                <h3 className="font-bold">Referee phone</h3>
                {watchers > 0 && (
                  <span className="ml-auto rounded-full bg-go-tint px-2 py-0.5 text-xs font-extrabold text-go">
                    {watchers} watching
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-ink/60">
                The other team can see the card and call a taboo word from their own phone — no more leaning over shoulders. Open the app on another phone and type this code.
              </p>
              <div className="mt-3 flex items-center gap-4">
                <QrBlock text={url} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-4xl font-black tracking-[0.2em]">{game.id}</p>
                  <p className="mt-1 break-all text-[11px] text-ink/50">{url.replace(/^https?:\/\//, "")}</p>
                  <button onClick={share} className="btn-quiet mt-3 w-full text-sm">
                    <IconShare size={16} /> {canShare ? "Share code" : "Copy code"}
                  </button>
                </div>
              </div>
            </section>
          )}

          <p className="mt-3 rounded-2xl bg-white/70 px-4 py-2 text-xs text-ink/60">
            {deckInfo(deck).emoji} {deckInfo(deck).label} · {turnSeconds}s turns · {rounds ? `${rounds} rounds` : "endless"} ·{" "}
            {skipLimit === null ? "free passes" : skipLimit === 0 ? "every pass costs a point" : `${skipLimit} free passes`}
          </p>

          <div className="mt-4 flex gap-2">
            <button onClick={onQuit} className="btn-quiet flex-1 text-sm">
              Home (keeps the game)
            </button>
            {game.phase !== "over" && (
              <button
                onClick={() => (confirmEnd ? onEnd() : setConfirmEnd(true))}
                className={`flex-1 rounded-2xl px-3 py-3 text-sm font-bold shadow-clay ${confirmEnd ? "bg-buzz text-white" : "bg-white text-buzz"}`}
              >
                {confirmEnd ? "Yes, end it" : "End game now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

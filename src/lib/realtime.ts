"use client";

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { Snapshot } from "./types";

/**
 * The referee link. The phone running the game is the only authority; it
 * broadcasts a snapshot after every change and re-sends the latest one when a
 * new watcher says hello. Watchers can send exactly one thing back: a buzz.
 *
 * Nothing is stored anywhere — this is a Realtime broadcast channel and no
 * more. Without the two public env vars the feature simply is not offered and
 * the game plays on exactly as before.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const realtimeAvailable = Boolean(URL && KEY);

let client: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  if (!URL || !KEY) return null;
  client ??= createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 20 } } });
  return client;
}

function channel(code: string): RealtimeChannel | null {
  const c = sb();
  return c ? c.channel(`tt:${code.toUpperCase()}`, { config: { broadcast: { self: false } } }) : null;
}

export interface Host {
  publish: (s: Snapshot) => void;
  close: () => void;
}

export function hostChannel(
  code: string,
  handlers: { onBuzz: () => void; onWatchers?: (n: number) => void }
): Host | null {
  const ch = channel(code);
  if (!ch) return null;
  let joined = false;
  let latest: Snapshot | null = null;
  let watchers = 0;
  const send = (s: Snapshot) => {
    ch.send({ type: "broadcast", event: "state", payload: s }).catch(() => {});
  };
  ch.on("broadcast", { event: "buzz" }, () => handlers.onBuzz());
  ch.on("broadcast", { event: "hello" }, () => {
    watchers += 1;
    handlers.onWatchers?.(watchers);
    if (latest) send(latest);
  });
  ch.on("broadcast", { event: "bye" }, () => {
    watchers = Math.max(0, watchers - 1);
    handlers.onWatchers?.(watchers);
  });
  ch.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      joined = true;
      if (latest) send(latest);
    }
  });
  return {
    publish(s) {
      latest = s;
      if (joined) send(s);
    },
    close() {
      sb()?.removeChannel(ch);
    },
  };
}

export interface Watcher {
  buzz: () => void;
  close: () => void;
}

export function watchChannel(
  code: string,
  handlers: { onState: (s: Snapshot) => void; onStatus?: (ok: boolean) => void }
): Watcher | null {
  const ch = channel(code);
  if (!ch) return null;
  ch.on("broadcast", { event: "state" }, ({ payload }) => handlers.onState(payload as Snapshot));
  ch.subscribe((status) => {
    handlers.onStatus?.(status === "SUBSCRIBED");
    if (status === "SUBSCRIBED") ch.send({ type: "broadcast", event: "hello", payload: {} }).catch(() => {});
  });
  return {
    buzz() {
      ch.send({ type: "broadcast", event: "buzz", payload: {} }).catch(() => {});
    },
    close() {
      ch.send({ type: "broadcast", event: "bye", payload: {} }).catch(() => {});
      sb()?.removeChannel(ch);
    },
  };
}

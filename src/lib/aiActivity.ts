"use client";

import { useSyncExternalStore } from "react";

/** Global "is any AI call in flight" signal plus live streaming progress, so a
    single header/sidebar bar can show processing (and the text as it generates)
    anywhere in the app. */
let active = 0;
let chars = 0;
let preview = "";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

// Stable snapshot so useSyncExternalStore doesn't loop.
let snap = { busy: false, chars: 0, preview: "" };
const refresh = () => {
  snap = { busy: active > 0, chars, preview };
  emit();
};

export const aiActivity = {
  start() {
    active += 1;
    chars = 0;
    preview = "";
    refresh();
  },
  end() {
    active = Math.max(0, active - 1);
    if (active === 0) {
      chars = 0;
      preview = "";
    }
    refresh();
  },
  /** Called as tokens stream in: total chars so far and a cleaned tail to show. */
  progress(n: number, tail: string) {
    chars = n;
    preview = tail;
    refresh();
  },
  subscribe(f: () => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
  busy: () => active > 0,
};

export function useAiBusy(): boolean {
  return useSyncExternalStore(aiActivity.subscribe, () => snap.busy, () => false);
}

export function useAiProgress(): { busy: boolean; chars: number; preview: string } {
  return useSyncExternalStore(aiActivity.subscribe, () => snap, () => snap);
}

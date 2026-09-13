"use client";

import { useSyncExternalStore } from "react";

/**
 * The manual "bring your own AI" bridge. When the provider is "manual", an ai()
 * call parks here instead of hitting the network: the UI shows the prompt to
 * copy, the user pastes the model's reply back, and `submit` validates it and
 * resolves the original call. One exchange at a time.
 */
export type ManualRequest = {
  title: string;
  /** The full prompt for the user to copy into any chat model. */
  prompt: string;
  /** Parse + validate a pasted reply. Returns the value, or an error message. */
  parse: (reply: string) => { ok: true; value: unknown } | { ok: false; error: string };
};

type Pending = ManualRequest & {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
};

let current: Pending | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

export const manualBridge = {
  /** Called by ai(): park the request and resolve when the user submits a reply. */
  request<T>(req: ManualRequest): Promise<T> {
    // Only one exchange at a time; a new one supersedes an unfinished one.
    if (current) current.reject(new Error("Replaced by a newer request."));
    return new Promise<T>((resolve, reject) => {
      current = { ...req, resolve: resolve as (v: unknown) => void, reject };
      emit();
    });
  },
  /** UI: the active request, or null. */
  peek: () => current,
  /** UI: user pasted a reply. Validates; on success resolves and closes. */
  submit(reply: string): { ok: true } | { ok: false; error: string } {
    if (!current) return { ok: false, error: "Nothing to submit." };
    const res = current.parse(reply);
    if (!res.ok) return res;
    current.resolve(res.value);
    current = null;
    emit();
    return { ok: true };
  },
  /** UI: user cancelled. */
  cancel() {
    if (!current) return;
    current.reject(new Error("Cancelled."));
    current = null;
    emit();
  },
  subscribe(f: () => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
};

export function useManualRequest(): Pending | null {
  return useSyncExternalStore(
    manualBridge.subscribe,
    () => current,
    () => null,
  );
}

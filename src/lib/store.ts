"use client";

import { useSyncExternalStore } from "react";
import { emptyResume, normalizeResume, type Resume } from "./schema";

const KEY = "bespoke:resumes:v1";
const EMPTY: Resume[] = [];

let cache: Resume[] | null = null;
const subs = new Set<() => void>();

function read(): Resume[] {
  if (cache) return cache;
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Array<Partial<Resume> & { id: string }>) : [];
    cache = list.map(normalizeResume);
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: Resume[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // quota or private mode: keep the in-memory copy so the session still works
  }
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  subs.add(f);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      f();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subs.delete(f);
    window.removeEventListener("storage", onStorage);
  };
}

export const store = {
  all: read,
  subscribe,
  get: (id: string) => read().find((r) => r.id === id),
  upsert(r: Resume) {
    const next = { ...r, updatedAt: Date.now() };
    write([next, ...read().filter((x) => x.id !== r.id)]);
    return next;
  },
  remove(id: string) {
    write(read().filter((x) => x.id !== id));
  },
  create(partial?: Partial<Resume>) {
    const r = { ...emptyResume(), ...partial, id: emptyResume().id };
    write([r, ...read()]);
    return r;
  },
  duplicate(id: string) {
    const src = read().find((r) => r.id === id);
    if (!src) return;
    const copy = { ...structuredClone(src), id: emptyResume().id, title: `${src.title} (copy)` };
    write([copy, ...read()]);
    return copy;
  },
};

export function useResumes(): Resume[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/* ── Settings: the visitor's own OpenAI key, kept in their browser ── */

const SETTINGS_KEY = "bespoke:settings:v1";
export type Settings = { openaiKey: string };

export function getSettings(): Settings {
  try {
    return { openaiKey: "", ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { openaiKey: "" };
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

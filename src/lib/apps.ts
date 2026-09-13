"use client";

import { useSyncExternalStore } from "react";
import { emptyApplication, type Application } from "./schema";

/** Job applications, kept in the browser like resumes. Separate key/store. */
const KEY = "bespoke:applications:v1";
const EMPTY: Application[] = [];

let cache: Application[] | null = null;
const subs = new Set<() => void>();

function read(): Application[] {
  if (cache) return cache;
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: Application[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
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

export const apps = {
  all: read,
  get: (id: string) => read().find((a) => a.id === id),
  create(partial?: Partial<Application>) {
    const a = emptyApplication(partial);
    write([a, ...read()]);
    return a;
  },
  upsert(a: Application) {
    const next = { ...a, updatedAt: Date.now() };
    write([next, ...read().filter((x) => x.id !== a.id)]);
    return next;
  },
  patch(id: string, patch: Partial<Application>) {
    const cur = read().find((a) => a.id === id);
    if (cur) this.upsert({ ...cur, ...patch });
  },
  remove(id: string) {
    write(read().filter((x) => x.id !== id));
  },
};

export function useApplications(): Application[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

"use client";

/** Theme control. "system" follows the OS; "light" = Cloud, "dark" = Night Bench.
    The choice lives on <html data-theme> and in localStorage. */
export type Mode = "light" | "dark" | "system";
const KEY = "bespoke:theme";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const themeStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", cb);
    return () => {
      listeners.delete(cb);
      mq.removeEventListener?.("change", cb);
    };
  },
  mode(): Mode {
    const d = document.documentElement.dataset.theme;
    return d === "light" || d === "dark" ? d : "system";
  },
  resolved(): "light" | "dark" {
    const d = document.documentElement.dataset.theme;
    if (d === "light" || d === "dark") return d;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },
  serverResolved(): "light" | "dark" {
    return "light";
  },
  set(mode: Mode) {
    const el = document.documentElement;
    if (mode === "system") delete el.dataset.theme;
    else el.dataset.theme = mode;
    try {
      localStorage.setItem(KEY, mode);
    } catch {}
    notify();
  },
};

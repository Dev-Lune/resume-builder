"use client";

import { useCallback, useRef, useState } from "react";
import { ai, type AiTask } from "@/lib/ai";

/** One in-flight model call with busy/error state and a live character count
    (streamed from the model) so callers can show real progress. */
export function useAi() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chars, setChars] = useState(0);
  const ctrl = useRef<AbortController | null>(null);

  const run = useCallback(async <T,>(task: AiTask, input: unknown): Promise<T | null> => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setBusy(true);
    setError(null);
    setChars(0);
    try {
      return await ai<T>(task, input, { signal: c.signal, onChars: (n) => setChars(n) });
    } catch (e) {
      if ((e as Error).name === "AbortError") return null;
      setError((e as Error).message || "Something went wrong.");
      return null;
    } finally {
      if (ctrl.current === c) setBusy(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);
  return { run, busy, error, chars, reset };
}

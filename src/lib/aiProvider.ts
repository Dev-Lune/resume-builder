"use client";

import { useSyncExternalStore } from "react";

export type ProviderChoice = "auto" | "ollama" | "openrouter" | "openai" | "nim" | "manual";

export const PROVIDERS: { id: ProviderChoice; label: string; hint: string }[] = [
  { id: "auto", label: "Automatic", hint: "Best available provider" },
  { id: "ollama", label: "Local", hint: "Ollama on this machine" },
  { id: "openrouter", label: "OpenRouter", hint: "Free and paid models" },
  { id: "nim", label: "Nvidia NIM", hint: "Needs an nvapi- key" },
  { id: "openai", label: "OpenAI", hint: "Needs an OpenAI key" },
  { id: "manual", label: "Manual (no key)", hint: "Copy prompt, paste into any AI" },
];

const KEY = "bespoke:ai-provider";
const listeners = new Set<() => void>();

function read(): ProviderChoice {
  try {
    const v = localStorage.getItem(KEY);
    return PROVIDERS.some((p) => p.id === v) ? (v as ProviderChoice) : "auto";
  } catch {
    return "auto";
  }
}

export const aiProvider = {
  get: read,
  set(v: ProviderChoice) {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    listeners.forEach((f) => f());
  },
  subscribe(f: () => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
};

export function useAiProvider(): ProviderChoice {
  return useSyncExternalStore(aiProvider.subscribe, read, () => "auto");
}

/* ── Per-provider config: docs, API key, model id, base URL. Kept per browser
   and sent with each call so the chosen provider's key/model actually apply. ── */

export type ProviderMeta = {
  docUrl: string;
  docLabel: string;
  needsKey: boolean;
  keyLabel?: string;
  keyPlaceholder?: string;
  modelLabel?: string;
  modelPlaceholder?: string;
  defaultModel?: string;
  editableBase?: boolean;
  baseLabel?: string;
  basePlaceholder?: string;
  note: string;
};

export const PROVIDER_META: Record<ProviderChoice, ProviderMeta> = {
  auto: {
    docUrl: "https://openrouter.ai/keys",
    docLabel: "Get an API key",
    needsKey: false,
    note: "Picks the best provider that is configured: your local model, then a pasted key, then the server's key. Set a specific provider to configure it.",
  },
  ollama: {
    docUrl: "https://ollama.com/library",
    docLabel: "Browse Ollama models",
    needsKey: false,
    modelLabel: "Model",
    modelPlaceholder: "qwen3:8b",
    defaultModel: "qwen3:8b",
    editableBase: true,
    baseLabel: "Server URL",
    basePlaceholder: "http://localhost:11434/v1",
    note: "Runs fully on this machine, so your data never leaves it. Start Ollama and pull a model first.",
  },
  openrouter: {
    docUrl: "https://openrouter.ai/keys",
    docLabel: "openrouter.ai/keys",
    needsKey: true,
    keyPlaceholder: "sk-or-v1-...",
    modelLabel: "Model",
    modelPlaceholder: "google/gemma-4-31b-it:free",
    defaultModel: "google/gemma-4-31b-it:free",
    note: "One key, hundreds of models including free ones. Find model ids at openrouter.ai/models.",
  },
  nim: {
    docUrl: "https://build.nvidia.com/",
    docLabel: "build.nvidia.com",
    needsKey: true,
    keyPlaceholder: "nvapi-...",
    modelLabel: "Model",
    modelPlaceholder: "meta/llama-3.1-8b-instruct",
    defaultModel: "meta/llama-3.1-8b-instruct",
    note: "Nvidia-hosted models with a free tier. Copy your key and a model id from build.nvidia.com.",
  },
  openai: {
    docUrl: "https://platform.openai.com/api-keys",
    docLabel: "platform.openai.com",
    needsKey: true,
    keyPlaceholder: "sk-...",
    modelLabel: "Model",
    modelPlaceholder: "gpt-4.1-mini",
    defaultModel: "gpt-4.1-mini",
    note: "The most reliable output. Needs a paid OpenAI key.",
  },
  manual: {
    docUrl: "https://chatgpt.com",
    docLabel: "Open a chat model",
    needsKey: false,
    note: "No key, no network. Each AI action shows a prompt to copy into ChatGPT, Claude, Gemini, or any chat model; paste its reply back and it renders. Inline one-tap rewrites become a copy-paste round trip.",
  },
};

export type ProviderConfig = { apiKey: string; model: string; baseUrl: string };

const CFG_KEY = "bespoke:ai-config:v1";
const cfgListeners = new Set<() => void>();

function readAll(): Record<string, Partial<ProviderConfig>> {
  try {
    const v = JSON.parse(localStorage.getItem(CFG_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

const EMPTY: ProviderConfig = { apiKey: "", model: "", baseUrl: "" };
const snapCache = new Map<string, { raw: string; val: ProviderConfig }>();

export function getProviderConfig(id: ProviderChoice): ProviderConfig {
  const c = readAll()[id] ?? {};
  const val: ProviderConfig = { apiKey: c.apiKey ?? "", model: c.model ?? "", baseUrl: c.baseUrl ?? "" };
  const raw = JSON.stringify(val);
  const hit = snapCache.get(id);
  if (hit && hit.raw === raw) return hit.val; // stable ref for useSyncExternalStore
  snapCache.set(id, { raw, val });
  return val;
}

export const aiConfig = {
  get: getProviderConfig,
  set(id: ProviderChoice, patch: Partial<ProviderConfig>) {
    try {
      const all = readAll();
      all[id] = { ...all[id], ...patch };
      localStorage.setItem(CFG_KEY, JSON.stringify(all));
    } catch {}
    cfgListeners.forEach((f) => f());
  },
  subscribe(f: () => void) {
    cfgListeners.add(f);
    return () => {
      cfgListeners.delete(f);
    };
  },
};

export function useProviderConfig(id: ProviderChoice): ProviderConfig {
  return useSyncExternalStore(
    aiConfig.subscribe,
    () => getProviderConfig(id),
    () => EMPTY,
  );
}

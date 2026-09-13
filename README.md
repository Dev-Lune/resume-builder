<div align="center">

# Bespoke

### A resume cut to the job, not off the rack.

An AI resume builder that interviews you, writes a parser-safe resume, lets you edit it beside a live sheet, tailors it to any posting, scores it like an ATS, and exports a clean PDF, Word, or text file. Free, no account, and it runs on whatever AI you already have — including none.

<p>
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-1f7a5c?style=flat-square" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript" />
  <img alt="Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss" />
</p>

<p>
  <img alt="No account" src="https://img.shields.io/badge/no%20account-required-1f7a5c?style=flat-square" />
  <img alt="Runs in your browser" src="https://img.shields.io/badge/data-stays%20in%20your%20browser-1f7a5c?style=flat-square" />
  <img alt="Bring your own AI" src="https://img.shields.io/badge/AI-bring%20your%20own%2C%20or%20none-e0a458?style=flat-square" />
</p>

</div>

---

## Why Bespoke

- **Runs on any AI, even none.** Pick a local model on your machine (Ollama), a free hosted one (OpenRouter), Nvidia NIM, OpenAI, or **Manual mode** — copy the prompt into ChatGPT / Claude / Gemini and paste the reply back. No key required, ever.
- **Nothing leaves your browser.** No account, no server. Your resume lives on your device; only the text you hand the model is sent, and local or manual mode sends nothing at all.
- **Free to export, always.** PDF, Word, and plain text, with no download paywall and no watermark. The sheet you see on screen is the file that prints.
- **It won't invent your career.** The model is held to your facts, so no fabricated employers, titles, or numbers — and a fit score where every open check points to the section that fixes it.

## How it stacks up

| | **Bespoke** | Typical AI builders |
|---|---|---|
| Cost to download your resume | **Free** | Usually paywalled |
| Account required | **None** | Required |
| Where your data lives | **Your browser** | Their servers |
| Use your own or a free AI | **Local, free, or any chat model** | Their model only |
| ATS score you can act on | **Every check jumps to the fix** | A number, often gated |
| Makes up facts to fill space | **Never** | Sometimes |

## Features

- **Interview to draft.** Answer a short, role-specific interview and get a first resume written from your answers.
- **Live editor.** A form beside a live sheet that updates as you type. Rewrite any bullet three ways and keep the one you like.
- **Tailor to a posting.** Paste a job description, see the keyword gap, apply a rewritten summary and bullets — nothing invented.
- **ATS scan.** Twelve checks a parser and a recruiter both make, a fit score, bulk scanning, and an application tracker that remembers the version you sent.
- **Five templates.** Classic, Modern, Compact, Executive, Technical — all parser-safe, single-column, real text.
- **Export.** PDF (true to the on-screen sheet), Word (.docx), and plain text.

## AI providers

Choose per browser, switch any time from the top bar.

| Provider | Key needed | Notes |
|---|---|---|
| **Automatic** | — | Best configured option: local, then a pasted key, then the server key |
| **Local (Ollama)** | No | Runs fully on your machine; nothing leaves it |
| **OpenRouter** | Yes (`sk-or-…`) | Hundreds of models, including free ones |
| **Nvidia NIM** | Yes (`nvapi-…`) | Nvidia-hosted models with a free tier |
| **OpenAI** | Yes (`sk-…`) | The most reliable output |
| **Manual (no key)** | No | Copy the prompt into any chat model, paste the reply back |

## Quick start

```bash
git clone https://github.com/SIDDHU123M/resume-builder.git
cd resume-builder
npm install
cp .env.example .env   # optional: add a provider key, or use Local/Manual with none
npm run dev            # http://localhost:3000
```

No key on hand? Start the dev server, pick **Manual** or **Local (Ollama)** in the provider menu, and go.

## Privacy

Your resume is stored only in your browser (localStorage). The app has no accounts and no database. The only network call an AI action makes is to the provider you choose, carrying just the text for that task — and Local and Manual modes make no call at all.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · GSAP for the scroll-driven landing · pdf.js + mammoth for import · a deterministic ATS engine · zod-validated model output.

## License

[MIT](./LICENSE) © DevLune

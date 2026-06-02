# Reader — iPhone PWA: Photo OCR + Multilingual Text-to-Speech with Google Gemini AI on Cloudflare Workers (React, TypeScript)

## Description

iPhone PWA that captures printed text, transcribes it with Google Gemini, detects the language, and speaks it aloud through the phone's native voices. One snap → one round trip → reading on-device.

## Skills

React, TypeScript, Vite, PWA, Cloudflare Workers, Cloudflare Pages, Google Gemini API, AI, Vision OCR, Web Speech API, SpeechSynthesis, Serverless, Multilingual, iPhone, GitHub Actions

## Published

May 26, 2026

## Live URL

reader-app.pages.dev

## Full Description

Built for a single user need: pick up any printed page in any language, have the iPhone read it aloud — no app store, no per-page processing fee, no privacy export.

### Flow

1. iPhone PWA opens the camera or photo library.
2. Image is base64-encoded and POSTed to a Cloudflare Worker.
3. The Worker calls Gemini 2.5 Flash with a JSON-schema-constrained prompt:
   - field 1: `text` — verbatim transcription, preserving line breaks
   - field 2: `language` — 2-letter ISO 639-1 code (detected, not assumed)
4. Worker returns `{ text, language }` in the same response.
5. Phone selects an appropriate voice from `window.speechSynthesis.getVoices()` filtered by the detected language, and speaks the text. The user can scrub speed, pause/resume, or edit the text before re-speaking.

### Why it's interesting

- **Language detection drives voice selection.** The card switches the language picker automatically when Gemini reports `uk` vs `en` (currently the two supported voices), but the underlying logic is generic — adding another language is one line.
- **Native iOS voices, no third-party TTS.** Speech runs through `window.speechSynthesis` so audio stays on-device. No cloud TTS billing, no extra latency, no extra privacy surface.
- **JSON-schema response enforcement.** Gemini's `responseMimeType: "application/json"` + `responseSchema` removes the "did the model hallucinate the JSON shape this time" failure mode. The Worker validates and falls back to `language: "und"` on garbage.
- **Truly free to run.** Cloudflare Workers + Gemini Flash free tiers cover personal usage indefinitely.

### Architecture

```
iPhone PWA                  Cloudflare Worker          Google Gemini
(Vite + React              (reader-app-api)            (gemini-2.5-flash)
 + speechSynthesis) ──────▶ serverless, edge ────────▶ vision OCR
                    POST    JSON-schema response       + language detect
                    image   forced via responseSchema
                                              ◀──── { text, language } ────
                    ◀──── { text, language } ────
        ▼
  speechSynthesis.speak(utterance)
        (voice chosen by detected language)
```

### Tech

- React 18, TypeScript, Vite — static PWA, ~148 KB JS gzipped
- Cloudflare Workers — `wrangler` deploy, secret-scoped Gemini key
- Google Gemini 2.5 Flash — direct REST call with `responseSchema` for typed JSON output
- Web Speech API — `SpeechSynthesisUtterance` + on-device voice selection
- GitHub Actions CI — typecheck + build for both app and worker

### Repo

https://github.com/ohrytskov/reader-app (private)

## Screenshots

- `image-01.png` — Home screen: speaker icon, serif "Reader" title, schematic camera + library buttons, books decoration on a shelf below
- `image-02.png` — Done state: transcribed text in a serif reading panel; language auto-detected as `en`, voice picker pre-set to "Google US English (en-US)"; Play / Stop / New controls
- `image-03.png` — Worker source (`worker/src/index.ts`) — Gemini call with `responseSchema` for typed JSON output

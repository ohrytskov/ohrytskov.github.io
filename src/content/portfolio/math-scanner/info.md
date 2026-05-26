# Math Scanner — iPhone PWA: Camera + Google Gemini AI on Cloudflare Workers (React, TypeScript)

## Description

iPhone PWA that captures a photo of a math problem and returns the solved answer in seconds. Vision and solving happen in a single Gemini 2.5 Flash call from a Cloudflare Worker — no server, no storage, no polling.

## Skills

React, TypeScript, Vite, PWA, Cloudflare Workers, Cloudflare Pages, Google Gemini API, AI, Vision OCR, Serverless, iPhone, GitHub Actions

## Published

May 26, 2026

## Live URL

math-scanner.pages.dev

## Full Description

A purpose-built mobile scanner that does exactly one thing well: phone snaps a math problem → AI returns the solved answer.

### Flow

1. iPhone PWA opens the native camera via `<input capture="environment">`.
2. The captured image is base64-encoded and POSTed to a Cloudflare Worker.
3. The Worker forwards the image + a terse prompt to Google Gemini 2.5 Flash.
4. The model's answer is returned in the same response — no taskId, no polling.
5. Phone renders the answer text. Tap "Scan another" to repeat.

End-to-end latency: ~3-5s for a single problem, ~15-20s for a full page of problems.

### Why it's interesting

- **One round trip.** Earlier iteration used a local daemon + filesystem + Claude Code agent watching for new images. Replaced all of that with a single Cloudflare Worker → Gemini call. The app is now autonomous and serverless in the literal sense.
- **Zero infra at rest.** No always-on server, no database, no queue. The Worker runs on demand, Cloudflare Pages serves the static PWA, image data lives only in transit.
- **Confidence markers in the prompt.** The Gemini prompt asks the model to append `?` and a parenthetical note to any line where a digit or operator was unclear in the image — so the user sees "did you mean 6 or 8?" rather than a confidently wrong answer.
- **Truly free to run.** Both Cloudflare Workers (100k req/day) and Gemini Flash (1,500 req/day) free tiers cover personal usage forever.

### Architecture

```
iPhone PWA               Cloudflare Worker        Google Gemini
(Vite + React)    ─────▶ (math-scanner-api) ─────▶ (gemini-2.5-flash)
                  POST    serverless, edge          vision + reasoning
                  image   single fetch call         in one model
                                       ◀──── { answer } ────
                  ◀──── { answer } ────
```

### Tech

- React 18, TypeScript, Vite — static PWA, ~146 KB JS gzipped
- Cloudflare Workers — `wrangler` deploy, `account_id`-scoped secret for the Gemini key
- Google Gemini 2.5 Flash — direct REST call, no SDK (Workers-runtime compatible)
- iPhone-native camera input (`<input type="file" capture="environment">`)
- GitHub Actions CI — typecheck + build for both app and worker

### Repo

https://github.com/ohrytskov/math-scanner (private)

## Screenshots

- `image-01.png` — Idle state: "Take photo" + "Choose from library" buttons
- `image-02.png` — Solving state: image preview + "Solving..." spinner
- `image-03.png` — Done state: original image + multi-line solved answers from Gemini ("12 + 7 = 19", "144 / 12 = 12", "5^3 = 125", ...) + "Scan another" button
- `image-04.png` — Worker source (`worker/src/index.ts`) — Gemini call (single fetch, no SDK)

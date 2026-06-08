# HubSpot CRM Deal Workspace — Three Custom UI Extension Cards (React, TypeScript, Serverless Functions)

## Description

A production-style HubSpot Deal record workspace built as three custom CRM UI Extension cards. Stage-aware checklists with hard-gate enforcement, append-only narrative and review history, Google Drive evidence capture, and read-only program metrics — all surfaced inside the Deal record itself.

## Skills

HubSpot, HubSpot CRM, HubSpot UI Extensions, HubSpot Serverless Functions, React, TypeScript, Vite, Vitest, GitHub Actions, CRM Customization, API Integration, Google Drive

## Published

Apr 26, 2026

## Full Description

Three React + TypeScript cards sit on the Deal record and surface a real internal-sales workflow without leaving HubSpot. Writes go through a HubSpot serverless function (no external server). 60 custom Deal properties are provisioned by an idempotent bootstrap script. Vitest unit tests cover the pure card logic; GitHub Actions runs tests, build, and a property-manifest dry-run on every push.

### What it does

- **Stage Workspace card** — renders a different checklist per `dealstage` and partner tier, computes hard-gate status (`blocked` / `in_progress` / `ready`), keeps append-only narrative history, and stores Google Drive evidence URLs per stage.
- **Document Library card** — surfaces NDA / SOW / MSA / Contract template links, captures submission metadata, enforces a 48-hour minimum review window, routes review ownership to COO / Ops / Legal deterministically, and keeps an append-only review history.
- **Program Builder card** — read-only display of selected programs with aggregate conversion, monthly lead volume, and projected ACV. Reads stored Deal properties without recalculating in the UI.
- **Property bootstrap** — `config/deal-properties.json` declares the 60 custom Deal properties; `scripts/create-properties.mjs` supports dry-run and apply.

### Why it's interesting

- **Stage- and tier-aware UI driven by Deal properties.** The cards re-render based on `dealstage` + custom `bd_partner_tier`. Hard-gate logic lives in a pure module so it's unit-testable apart from the card.
- **Append-only writes through HubSpot serverless.** Narrative and review history are append-only — the serverless function fetches the current value, appends with a stable separator, and PATCHes the Deal. No external backend, no client-side mutation risk.
- **No file-upload hack.** HubSpot UI Extensions don't offer a native file-upload component, so the evidence flow is honest: upload to Google Drive first, then store the share URL on the Deal.
- **60-property bootstrap.** Custom Deal properties were the gnarly part of this build — idempotent dry-run / apply scripts mean the schema is reproducible across portals.

### Tech

- HubSpot `2026.03` project structure, CRM UI Extensions registered with `hubspot.extend()`
- React 18, TypeScript, Vite for the local preview app
- HubSpot serverless function (Node) for the write path
- Vitest unit tests for stage gating, tier-conditional checklist, document routing
- GitHub Actions CI: tests + build + property-manifest dry-run

### Repo

Public on GitHub: https://github.com/ohrytskov/hubspot-deal-workspace

### Captures

A 2-minute Loom walkthrough covers all three cards plus the supporting code:
https://www.loom.com/share/e24406f61fa143cca6548fd6bccbd7d4

## Screenshots

- `image-01.png` — Stage Workspace card rendered on the Deal record (mid-checklist, hard-gate visible)
- `image-02.png` — Document Library card with template access, submission, and review-routing rows
- `image-03.png` — Program Builder card showing aggregate conversion, lead volume, and projected ACV
- `image-04.png` — Tier-aware checklist and hard-gate logic extracted into a pure module (`src/app/cards/cardLogic.ts`)
- `image-05.png` — GitHub Actions CI workflow (tests, build, property-manifest dry-run)

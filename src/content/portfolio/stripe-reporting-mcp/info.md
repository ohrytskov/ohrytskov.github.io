# Stripe Reporting MCP — Read-Only Finance API Across MCP, HTTP, and CLI

## Description

A read-only Stripe finance, ops, and risk reporting layer — built once, exposed three ways from a single TypeScript backend.

## Skills

Node.js, TypeScript, MongoDB, API, Stripe

## Published

May 11, 2026

## Full Description

A read-only Stripe finance, ops, and risk reporting layer — built once, exposed three ways from a single TypeScript backend:

- **MCP server (stdio)** — for AI agents in Claude Code and any MCP client
- **HTTP API (Express)** — for dashboards, scripts, and non-MCP integrations
- **CLI (`stripe-reporting`)** — for ad-hoc inspection, scripts, and CI checks

All three transports share the same service layer, the same demo / stripe mode switch, and write to the same MongoDB audit log.

### What it does

- Normalizes Stripe balances, payments, customers, payouts, refunds, disputes, reconciliation totals, and risk alerts into a stable response shape.
- Surfaces deterministic risk signals (failure spikes, payout delays, repeat-failure customers) — not vague LLM scoring.
- Captures every call (transport, endpoint, status, latency, user) into a Mongo audit collection — same shape across MCP / HTTP / CLI.
- Schema-on-the-fly persistence: `save <collection> <json>` writes to a new Mongo collection at first use; `find <collection>` reads it back.
- Optional Google-OAuth + server-issued API tokens with TTL and a distinct `auth_expired` error so clients can prompt re-login instead of silent 401s.

### Why it's interesting

- **One backend, three transports.** The MCP tools, HTTP routes, and CLI commands all delegate to the same `ReportingBackend` — a single source of truth with no transport-specific business logic drift.
- **Demo-first.** Seeded fixtures mean a full live demo is possible without Stripe credentials. Same response shape, swap one env var to go live read-only against the Stripe API.
- **Read-only by design.** No path in the codebase can create charges, invoices, refunds, or payouts. Safe to give to AI agents.

### Tech

- TypeScript, Node 20, Express, Mongoose
- `@modelcontextprotocol/sdk`, `stripe` (read-only key)
- yargs CLI, Vitest, ESLint, Prettier
- `vhs` for terminal recordings, `ffmpeg` for poster extraction

### Captures

Five short terminal captures live in the repo's `docs/captures/`:

1. Same query via CLI / HTTP / MCP — identical shape from all three
2. Demo mode → Stripe mode with one env var
3. Risk alerts + audit-log tail in MongoDB
4. Schema-on-the-fly: `save` then `find` with no migration
5. Auth lifecycle — `whoami`, `auth_expired`, `logout`, `auth_required`

## Screenshots

Each of the five terminal captures has two files in this dir:

- `image-NN.gif` — the full animated terminal recording (the real content)
- `image-NN.png` — a static poster frame (useful where GIFs don't render, e.g., when pasted into LinkedIn or similar)

| # | Capture | Poster | Animation |
|---|---|---|---|
| 1 | Same query via CLI / HTTP / MCP | `image-01.png` | `image-01.gif` |
| 2 | Demo mode → Stripe mode | `image-02.png` | `image-02.gif` |
| 3 | Risk alerts + audit log | `image-03.png` | `image-03.gif` |
| 4 | Schema-on-the-fly | `image-04.png` | `image-04.gif` |
| 5 | Auth lifecycle | `image-05.png` | `image-05.gif` |

GIFs copied from the source project at `/var/www/hello/apply/stripe-reporting-mcp-area/stripe-reporting-mcp/docs/captures/images/`. Tapes (VHS source) live alongside in `tapes/` in the same project dir.

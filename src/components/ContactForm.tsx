"use client";

import {useState} from "react";

// Worker endpoint. Set at build time so it can be swapped without code changes.
// Falls back to the production worker URL when the env var isn't provided.
const WORKER_URL =
  process.env.NEXT_PUBLIC_CONTACT_WORKER_URL ??
  "https://ohrytskov-contact.ohrytskov20230516.workers.dev";

type Status =
  | {kind: "idle"}
  | {kind: "sending"}
  | {kind: "sent"}
  | {kind: "error"; message: string};

type Props = {
  // "light" = white card background (slate-300 borders, dark text)
  // "dark"  = slate-950 card background (slate-700 borders, light text, white-tint inputs)
  variant?: "light" | "dark";
};

export function ContactForm({variant = "light"}: Props) {
  const [status, setStatus] = useState<Status>({kind: "idle"});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    setStatus({kind: "sending"});

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    try {
      const r = await fetch(WORKER_URL, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({name, email, message, website: honeypot}),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({error: `http_${r.status}`}));
        throw new Error(body?.error ?? `http_${r.status}`);
      }
      setStatus({kind: "sent"});
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus({kind: "error", message: (err as Error).message});
    }
  }

  const dark = variant === "dark";

  const inputClass = dark
    ? "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-white/40"
    : "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-950";

  const submitClass = dark
    ? "inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
    : "inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50";

  if (status.kind === "sent") {
    return (
      <div
        className={
          dark
            ? "rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100"
            : "rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-800"
        }
      >
        Thanks — message sent. I&apos;ll get back to you by email within 24 hours.
        <button
          type="button"
          className={`mt-3 block text-xs font-medium underline underline-offset-4 ${dark ? "text-emerald-200" : "text-emerald-700"}`}
          onClick={() => setStatus({kind: "idle"})}
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          maxLength={200}
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          maxLength={320}
          className={inputClass}
        />
      </div>
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What can I help with?"
        required
        rows={4}
        maxLength={10000}
        className={inputClass}
      />
      {/* Honeypot — bots fill, humans don't. Hidden via inline style so even
          motivated bots can't easily detect via class scanning. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0}}
        aria-hidden="true"
      />
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={status.kind === "sending"} className={submitClass}>
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </button>
        {status.kind === "error" && (
          <p className={`text-sm ${dark ? "text-red-300" : "text-red-600"}`}>
            Couldn&apos;t send: {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

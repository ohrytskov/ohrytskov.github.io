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

export function ContactForm() {
  const [status, setStatus] = useState<Status>({kind: "idle"});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    setStatus({kind: "sending"});

    const form = e.currentTarget;
    // Read the honeypot field directly from the DOM (kept off React state on purpose).
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

  if (status.kind === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-800">
        Thanks — message sent. I&apos;ll get back to you by email.
        <button
          type="button"
          className="mt-3 block text-xs font-medium text-emerald-700 underline underline-offset-4"
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
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-950"
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          maxLength={320}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-950"
        />
      </div>
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What's on your mind?"
        required
        rows={4}
        maxLength={10000}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-950"
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
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {status.kind === "sending" ? "Sending…" : "Send"}
        </button>
        {status.kind === "error" && (
          <p className="text-sm text-red-600">Couldn&apos;t send: {status.message}</p>
        )}
      </div>
    </form>
  );
}

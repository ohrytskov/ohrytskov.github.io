import Image from "next/image";
import Link from "next/link";
import {ContactForm} from "@/components/ContactForm";
import {
  formatDateLong,
  formatNumber,
  getGitHubProfile,
  splitBio,
} from "@/lib/github";

function getFocusAreas(bioLines: string[]) {
  return Array.from(
    new Set(
      bioLines
        .flatMap((line) => line.split(/[•,]/))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 backdrop-blur-sm">
      <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export default async function Home() {
  const profile = await getGitHubProfile();
  const bioLines = splitBio(profile.bio);
  const focusAreas = getFocusAreas(bioLines);
  const latestContributionDate = formatDateLong(profile.latest_contribution_date);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e6f1ff,_#f7f7f5_45%,_#f1efe8_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Public GitHub Profile
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-950">
              github.com/ohrytskov
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              href="/portfolio/"
            >
              Portfolio →
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-full border border-slate-950 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-950 hover:text-white"
              href={profile.html_url}
              target="_blank"
              rel="noreferrer"
            >
              Open GitHub
            </a>
          </div>
        </header>

        {/* Hero + Contact, side by side. Contact is now first-fold content,
            visible without scrolling on most screens. */}
        <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_1fr] lg:py-14">
          <div className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Oleksandr Hrytskov
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Full-Stack engineer for React, TypeScript, and AI integration work.
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-8 text-slate-700">
                {bioLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>
                  Selected work lives on the{" "}
                  <Link
                    href="/portfolio/"
                    className="font-medium text-slate-950 underline decoration-slate-400 underline-offset-4 transition hover:decoration-slate-950"
                  >
                    portfolio page
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Contact — moved to first-fold, dark accent to draw attention */}
          <section
            id="contact"
            className="flex flex-col rounded-[2rem] border border-black/10 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Get in touch
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Have a project? Let&apos;s talk.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Drop a short message — goes straight to my inbox. I usually reply within 24 hours.
            </p>
            <div className="mt-6">
              <ContactForm variant="dark" />
            </div>
          </section>
        </section>

        {/* Profile snapshot — secondary, after the primary call-to-action */}
        <section className="grid gap-8 pb-10 sm:grid-cols-2 lg:pb-14">
          <section className="rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-[0_16px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="flex items-start gap-5">
              <Image
                src={profile.avatar_url}
                alt={`${profile.name ?? profile.login} avatar`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl border border-black/10 object-cover"
                priority
                unoptimized
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  GitHub handle
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">@{profile.login}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  <a
                    href={profile.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 underline decoration-slate-400 underline-offset-4 transition hover:decoration-slate-950"
                  >
                    github.com/ohrytskov
                  </a>
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Stat label="Location" value={profile.location ?? "Ukraine"} />
              <Stat label="Latest Contribution" value={latestContributionDate} />
              <Stat label="Public Repos" value={formatNumber(profile.public_repos)} />
              <Stat
                label="Contributions (Last Year)"
                value={formatNumber(profile.contributions_last_year)}
              />
            </dl>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[#f5efe3] p-8 text-slate-900 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              What I work on
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              <li>
                <strong className="text-slate-900">Full-stack product builds</strong> —
                React/Next.js + TypeScript front, Node/Express or serverless back.
              </li>
              <li>
                <strong className="text-slate-900">AI / LLM integration</strong> —
                Claude/OpenAI workflows, MCP servers, retrieval, agent tooling.
              </li>
              <li>
                <strong className="text-slate-900">Production-ready delivery</strong> —
                tests, CI, monitoring, clear comms, US-business-hours overlap from Kyiv.
              </li>
            </ul>
          </section>
        </section>

        <footer className="mt-auto border-t border-black/10 pt-6 text-xs uppercase tracking-[0.22em] text-slate-500">
          Static profile · built with Next.js · deployed via GitHub Pages
        </footer>
      </div>
    </main>
  );
}

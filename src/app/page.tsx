import Image from "next/image";
import { formatMonthYear, getGitHubProfile, splitBio } from "@/lib/github";

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
  const joined = formatMonthYear(profile.created_at);
  const refreshed = formatMonthYear(profile.updated_at);

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
          <a
            className="inline-flex items-center justify-center rounded-full border border-slate-950 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-950 hover:text-white"
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
          >
            Open GitHub
          </a>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.35fr_0.85fr] lg:py-14">
          <div className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Oleksandr Hrytskov
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                A clean profile site built from the public GitHub account only.
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-8 text-slate-700">
                {bioLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>
                  This page intentionally shows profile data only. Repository lists,
                  pinned projects, and contribution views are left out on purpose.
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

          <aside className="grid gap-6">
            <section className="rounded-[2rem] border border-black/10 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
              <div className="flex items-start gap-5">
                <Image
                  src={profile.avatar_url}
                  alt={`${profile.name ?? profile.login} avatar`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-3xl border border-white/10 object-cover"
                  priority
                  unoptimized
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    GitHub handle
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">@{profile.login}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Source profile:{" "}
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                    >
                      github.com/ohrytskov
                    </a>
                  </p>
                </div>
              </div>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <Stat label="Location" value={profile.location ?? "Ukraine"} />
                <Stat label="On GitHub Since" value={joined} />
                <Stat label="Followers" value={String(profile.followers)} />
                <Stat label="Following" value={String(profile.following)} />
              </dl>
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-[#f5efe3] p-8 text-slate-900 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Public data snapshot
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
                <li>Name and bio are pulled from the live GitHub user profile.</li>
                <li>
                  The page is exported statically for GitHub Pages and rebuilt from
                  public data during deployment.
                </li>
                <li>
                  Last public profile update seen by the GitHub API: {refreshed}.
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

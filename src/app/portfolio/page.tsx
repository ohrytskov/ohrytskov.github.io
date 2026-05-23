import Link from "next/link";
import {getAllProjects} from "@/lib/portfolio";

export const metadata = {
  title: "Portfolio — Oleksandr Hrytskov",
  description: "Selected projects.",
};

export default async function PortfolioIndex() {
  const projects = await getAllProjects();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e6f1ff,_#f7f7f5_45%,_#f1efe8_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Selected work
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-950">Portfolio</h1>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-950 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-950 hover:text-white"
            href="/"
          >
            ← Profile
          </Link>
        </header>

        <section className="grid flex-1 gap-6 py-10 sm:grid-cols-2 lg:py-14">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/portfolio/${p.slug}/`}
              className="group flex flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]"
            >
              {p.coverImage && (
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {/* Plain <img> — static export, no next/image runtime needed */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/portfolio/${p.slug}/${p.coverImage}`}
                    alt={`${p.title} cover`}
                    className="h-full w-full object-cover object-top transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-slate-950">{p.title}</h2>
                <p className="mt-3 line-clamp-5 text-sm leading-6 text-slate-700">
                  {p.description}
                </p>
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-2">
                    {p.skills.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                    {p.skills.length > 5 && (
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                        +{p.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <footer className="mt-auto border-t border-black/10 pt-6 text-xs uppercase tracking-[0.22em] text-slate-500">
          {projects.length} project{projects.length === 1 ? "" : "s"} · synced from upwork portfolio
        </footer>
      </div>
    </main>
  );
}

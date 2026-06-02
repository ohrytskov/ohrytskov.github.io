import Link from "next/link";
import {notFound} from "next/navigation";
import {getAllSlugs, getProjectBySlug} from "@/lib/portfolio";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.title} — Oleksandr Hrytskov`,
    description: p.description.slice(0, 200),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e6f1ff,_#f7f7f5_45%,_#f1efe8_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-6">
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-950 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-950 hover:text-white"
            href="/portfolio/"
          >
            ← Portfolio
          </Link>
        </header>

        <article className="flex-1 py-10 lg:py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {p.title}
          </h1>
          {p.role && (
            <p className="mt-3 text-sm uppercase tracking-[0.24em] text-slate-500">
              Role: {p.role}
            </p>
          )}
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{p.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {p.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {s}
              </span>
            ))}
          </div>

          {p.published && (
            <p className="mt-4 text-sm text-slate-500">Published {p.published}</p>
          )}

          {p.liveUrl && (
            <p className="mt-2 text-sm">
              <span className="text-slate-500">Live · </span>
              <a
                href={p.liveUrl.startsWith("http") ? p.liveUrl : `https://${p.liveUrl}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-950 underline decoration-slate-400 underline-offset-4 transition hover:decoration-slate-950"
              >
                {p.liveUrl.replace(/^https?:\/\//, "")}
              </a>
            </p>
          )}

          {p.images.length > 0 && (
            <section className="mt-12 grid gap-6">
              {p.images.map((img) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={img}
                  src={`/portfolio/${p.slug}/${img}`}
                  alt={`${p.title} — ${img}`}
                  className="w-full rounded-2xl border border-black/10 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                  loading="lazy"
                />
              ))}
            </section>
          )}

          {p.fullDescriptionHtml && (
            <section className="mt-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Full description
              </h2>
              <div
                className="prose prose-slate mt-4 max-w-none"
                dangerouslySetInnerHTML={{__html: p.fullDescriptionHtml}}
              />
            </section>
          )}
        </article>
      </div>
    </main>
  );
}

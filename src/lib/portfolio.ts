// Portfolio data layer. Reads src/content/portfolio/<slug>/info.md at build
// time and returns typed Project objects. The site is statically exported, so
// all of this runs in Node during `next build` — never in the browser.

import {readFile, readdir} from "node:fs/promises";
import {join} from "node:path";
import {remark} from "remark";
import remarkHtml from "remark-html";

const CONTENT_ROOT = join(process.cwd(), "src/content/portfolio");
const IMAGES_ROOT = join(process.cwd(), "public/portfolio");

export type Project = {
  slug: string;
  title: string;
  description: string;        // short pitch (from "## Description")
  skills: string[];           // from "## Skills" — comma-separated
  published?: string;         // from "## Published" — date string
  liveUrl?: string;           // from "## Live URL"
  role?: string;              // from "## My role" (used by cybersemics/em)
  fullDescriptionHtml?: string; // from "## Full Description" — rendered to HTML
  screenshotsCaption?: string; // "## Screenshots" raw markdown (rendered HTML)
  images: string[];           // basenames, ordered alphabetically
  coverImage: string | null;  // first image (for index card)
};

/**
 * Split an info.md into a map of section heading → body markdown.
 * Conventions: top-level `#` is the title (returned separately).
 * Subsequent `## Heading` blocks become the section keys.
 */
function parseSections(md: string): {title: string; sections: Record<string, string>} {
  const lines = md.split(/\r?\n/);
  let title = "";
  const sections: Record<string, string> = {};
  let currentKey: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (currentKey !== null) {
      sections[currentKey] = buf.join("\n").trim();
    }
    buf = [];
  };

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    if (h1 && !title) {
      title = h1[1]!.trim();
      continue;
    }
    if (h2) {
      flush();
      currentKey = h2[1]!.trim().toLowerCase();
      continue;
    }
    if (currentKey !== null) buf.push(line);
  }
  flush();

  return {title, sections};
}

async function renderMarkdown(md: string): Promise<string> {
  if (!md) return "";
  const file = await remark().use(remarkHtml).process(md);
  return String(file);
}

async function loadProject(slug: string): Promise<Project> {
  const mdPath = join(CONTENT_ROOT, slug, "info.md");
  const md = await readFile(mdPath, "utf8");
  const {title, sections} = parseSections(md);

  const description = sections["description"] ?? "";
  const skillsRaw = sections["skills"] ?? "";
  const skills = skillsRaw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const published = sections["published"]?.trim() || undefined;
  const liveUrl = sections["live url"]?.trim() || undefined;
  const role = sections["my role"]?.trim() || undefined;
  const fullDescriptionMd = sections["full description"] ?? "";
  const screenshotsMd = sections["screenshots"] ?? "";

  // Image list = whatever is in public/portfolio/<slug>/, sorted.
  let images: string[] = [];
  try {
    images = (await readdir(join(IMAGES_ROOT, slug))).filter((f) =>
      /\.(png|jpe?g|webp|gif)$/i.test(f),
    );
    images.sort();
  } catch {
    images = [];
  }
  // Prefer .gif over .png when both exist for the same numeric prefix
  // (e.g. image-03.gif beats image-03.png in cybersemics-em / stripe-reporting-mcp).
  const byPrefix = new Map<string, string>();
  for (const img of images) {
    const prefix = img.replace(/\.(png|jpe?g|webp|gif)$/i, "");
    const existing = byPrefix.get(prefix);
    if (!existing || (img.endsWith(".gif") && !existing.endsWith(".gif"))) {
      byPrefix.set(prefix, img);
    }
  }
  const dedupedImages = Array.from(byPrefix.values()).sort();
  const coverImage = dedupedImages[0] ?? null;

  const [fullDescriptionHtml, screenshotsCaption] = await Promise.all([
    renderMarkdown(fullDescriptionMd),
    renderMarkdown(screenshotsMd),
  ]);

  return {
    slug,
    title,
    description,
    skills,
    published,
    liveUrl,
    role,
    fullDescriptionHtml,
    screenshotsCaption,
    images: dedupedImages,
    coverImage,
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const slugs = (await readdir(CONTENT_ROOT, {withFileTypes: true}))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const projects = await Promise.all(slugs.map(loadProject));
  // Sort by published date desc; undated last; tie-break by title.
  return projects.sort((a, b) => {
    const da = a.published ? Date.parse(a.published) : -Infinity;
    const db = b.published ? Date.parse(b.published) : -Infinity;
    if (db !== da) return db - da;
    return a.title.localeCompare(b.title);
  });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    return await loadProject(slug);
  } catch {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const entries = await readdir(CONTENT_ROOT, {withFileTypes: true});
  return entries.filter((d) => d.isDirectory()).map((d) => d.name);
}

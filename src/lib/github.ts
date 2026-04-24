export type GitHubProfile = {
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  created_at: string;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
  login: string;
  name: string | null;
  twitter_username: string | null;
  updated_at: string;
};

const GITHUB_USERNAME = "ohrytskov";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;

const fallbackProfile: GitHubProfile = {
  avatar_url: "https://avatars.githubusercontent.com/u/134293432?v=4",
  bio: "Full-Stack Developer\nReact, TypeScript, Node.js • AI / LLM integrations",
  blog: null,
  created_at: "2023-05-22T13:02:33Z",
  followers: 0,
  following: 0,
  html_url: "https://github.com/ohrytskov",
  location: "Kyiv, Ukraine",
  login: "ohrytskov",
  name: "Oleksandr Hrytskov",
  twitter_username: null,
  updated_at: "2026-01-18T21:29:29Z",
};

export async function getGitHubProfile(): Promise<GitHubProfile> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(GITHUB_API_URL, {
      cache: "force-cache",
      headers,
    });

    if (!response.ok) {
      return fallbackProfile;
    }

    const data = (await response.json()) as GitHubProfile;
    return data;
  } catch {
    return fallbackProfile;
  }
}

export function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function splitBio(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

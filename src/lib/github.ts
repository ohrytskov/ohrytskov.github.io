export type GitHubProfile = {
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  contributions_last_year: number;
  created_at: string;
  html_url: string;
  latest_contribution_date: string;
  location: string | null;
  login: string;
  name: string | null;
  public_repos: number;
  twitter_username: string | null;
  updated_at: string;
};

type GitHubRestProfile = {
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  created_at: string;
  html_url: string;
  location: string | null;
  login: string;
  name: string | null;
  public_repos: number;
  twitter_username: string | null;
  updated_at: string;
};

type ContributionDay = {
  contributionCount?: number;
  date?: string;
};

type GitHubGraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: Array<{
            contributionDays?: ContributionDay[];
          }>;
        };
      };
      repositories?: {
        totalCount?: number;
      };
    };
  };
};

const GITHUB_USERNAME = "ohrytskov";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_GRAPHQL_QUERY = `query GitHubProfileMetrics($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
    repositories(privacy: PUBLIC) {
      totalCount
    }
  }
}`;

const fallbackProfile: GitHubProfile = {
  avatar_url: "https://avatars.githubusercontent.com/u/134293432?v=4",
  bio: "Full-Stack Developer\nReact, TypeScript, Node.js • AI / LLM integrations",
  blog: null,
  contributions_last_year: 564,
  created_at: "2023-05-22T13:02:33Z",
  html_url: "https://github.com/ohrytskov",
  latest_contribution_date: "2026-04-24",
  location: "Kyiv, Ukraine",
  login: "ohrytskov",
  name: "Oleksandr Hrytskov",
  public_repos: 10,
  twitter_username: null,
  updated_at: "2026-01-18T21:29:29Z",
};

function getLatestContributionDate(days: ContributionDay[]) {
  const latest = days.reduce<string | null>((acc, day) => {
    if (!day.date || !day.contributionCount || day.contributionCount < 1) {
      return acc;
    }

    if (!acc || day.date > acc) {
      return day.date;
    }

    return acc;
  }, null);

  return latest ?? fallbackProfile.latest_contribution_date;
}

async function getContributionMetrics(token?: string) {
  if (!token) {
    return {
      contributions_last_year: fallbackProfile.contributions_last_year,
      latest_contribution_date: fallbackProfile.latest_contribution_date,
      public_repos: fallbackProfile.public_repos,
    };
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      cache: "force-cache",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GITHUB_GRAPHQL_QUERY,
        variables: {
          login: GITHUB_USERNAME,
        },
      }),
    });

    if (!response.ok) {
      return {
        contributions_last_year: fallbackProfile.contributions_last_year,
        latest_contribution_date: fallbackProfile.latest_contribution_date,
        public_repos: fallbackProfile.public_repos,
      };
    }

    const data = (await response.json()) as GitHubGraphQLResponse;
    const user = data.data?.user;
    const days =
      user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
        (week) => week.contributionDays ?? [],
      ) ?? [];

    return {
      contributions_last_year:
        user?.contributionsCollection?.contributionCalendar?.totalContributions ??
        fallbackProfile.contributions_last_year,
      latest_contribution_date: getLatestContributionDate(days),
      public_repos: user?.repositories?.totalCount ?? fallbackProfile.public_repos,
    };
  } catch {
    return {
      contributions_last_year: fallbackProfile.contributions_last_year,
      latest_contribution_date: fallbackProfile.latest_contribution_date,
      public_repos: fallbackProfile.public_repos,
    };
  }
}

export async function getGitHubProfile(): Promise<GitHubProfile> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const [profileResponse, metrics] = await Promise.all([
      fetch(GITHUB_API_URL, {
        cache: "force-cache",
        headers,
      }),
      getContributionMetrics(token),
    ]);

    if (!profileResponse.ok) {
      return {
        ...fallbackProfile,
        ...metrics,
      };
    }

    const data = (await profileResponse.json()) as GitHubRestProfile;

    return {
      ...data,
      contributions_last_year: metrics.contributions_last_year,
      latest_contribution_date: metrics.latest_contribution_date,
      public_repos: metrics.public_repos || data.public_repos,
    };
  } catch {
    return fallbackProfile;
  }
}

export function formatDateLong(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
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

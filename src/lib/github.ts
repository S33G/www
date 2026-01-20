export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  homepage: string | null;
}

interface GitHubAPIResponse {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  homepage: string | null;
}

/**
 * Fetch a single GitHub repository
 */
export async function fetchRepo(owner: string, name: string): Promise<GitHubRepo | null> {
  try {
    const token = import.meta.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers,
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${owner}/${name}: ${response.status}`);
      return null;
    }

    const data: GitHubAPIResponse = await response.json();

    return {
      name: data.name,
      description: data.description,
      url: data.html_url,
      stars: data.stargazers_count,
      language: data.language,
      topics: data.topics || [],
      updatedAt: data.updated_at,
      homepage: data.homepage,
    };
  } catch (error) {
    console.error(`Error fetching ${owner}/${name}:`, error);
    return null;
  }
}

/**
 * Fetch multiple GitHub repositories
 */
export async function fetchRepos(
  repos: { owner: string; name: string }[]
): Promise<GitHubRepo[]> {
  const results = await Promise.all(
    repos.map(({ owner, name }) => fetchRepo(owner, name))
  );

  return results.filter((repo): repo is GitHubRepo => repo !== null);
}

/**
 * Get fallback project data when GitHub API is unavailable
 */
export function getFallbackProjects(
  repos: { owner: string; name: string; description?: string }[]
): GitHubRepo[] {
  return repos.map(({ owner, name, description }) => ({
    name,
    description: description || null,
    url: `https://github.com/${owner}/${name}`,
    stars: 0,
    language: null,
    topics: [],
    updatedAt: new Date().toISOString(),
    homepage: null,
  }));
}

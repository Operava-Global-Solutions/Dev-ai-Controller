export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

export interface CreateIssueParams {
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
}

export interface GitHubIssueResult {
  id: number;
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  repo: string;
  createdAt: string;
}

/**
 * List GitHub repositories using production token
 */
export async function listGitHubRepos(
  token: string,
  options?: { perPage?: number; sort?: string }
): Promise<GitHubRepo[]> {
  const perPage = options?.perPage || 10;
  const sort = options?.sort || 'updated';

  if (!token) {
    return [];
  }

  const response = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&sort=${sort}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Cloudflare-Agent-Hub/2.0',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    private: r.private,
    htmlUrl: r.html_url,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    updatedAt: r.updated_at,
  }));
}

/**
 * Create an issue on GitHub directly in production
 */
export async function createGitHubIssue(
  token: string,
  params: CreateIssueParams
): Promise<GitHubIssueResult> {
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not configured');
  }

  const repoFullName = params.repo.includes('/') ? params.repo : `operava/${params.repo}`;

  const response = await fetch(`https://api.github.com/repos/${repoFullName}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Cloudflare-Agent-Hub/2.0',
    },
    body: JSON.stringify({
      title: params.title,
      body: params.body || '',
      labels: params.labels || ['agent-task'],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub API create issue failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    number: data.number,
    title: data.title,
    state: data.state,
    htmlUrl: data.html_url,
    repo: repoFullName,
    createdAt: data.created_at,
  };
}

/**
 * Test GitHub token connection against live API
 */
export async function testGitHubToken(
  token: string
): Promise<{ valid: boolean; user?: string; scopes?: string[]; message?: string }> {
  if (!token) {
    return {
      valid: false,
      message: 'GITHUB_TOKEN secret not yet set in environment. Set in Cloudflare Secrets to enable live repo actions.',
    };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Cloudflare-Agent-Hub/2.0',
      },
    });

    if (res.ok) {
      const user = await res.json();
      const scopesHeader = res.headers.get('x-oauth-scopes');
      const scopes = scopesHeader ? scopesHeader.split(',').map((s) => s.trim()) : [];
      return {
        valid: true,
        user: user.login,
        scopes,
        message: `Authenticated as @${user.login} (${user.public_repos} repos, scopes: ${scopes.join(', ') || 'repo'})`,
      };
    }

    const err = await res.text();
    return {
      valid: false,
      message: `GitHub authentication rejected: HTTP ${res.status} - ${err}`,
    };
  } catch (err: any) {
    return {
      valid: false,
      message: `Failed to connect to GitHub API: ${err.message}`,
    };
  }
}

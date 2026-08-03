/**
 * 构建时从 Gitee API 同步仓库列表到 public/projects.json
 * 用法: node scripts/sync-gitee-projects.mjs
 *
 * 环境变量:
 * - GITEE_USERNAME（默认 codeing-rz）
 * - GITEE_ACCESS_TOKEN / GITEE_TOKEN（可选；带 token 可提高限额，避免匿名 403）
 * - GITEE_ACTIVE_WITHIN_DAYS（默认 180，仅保留该天数内有推送的仓库）
 * - GITEE_SYNC_STRICT=1（失败时退出非 0；默认失败则保留已有 projects.json 并继续构建）
 */
import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputPath = join(root, 'public/projects.json');

const username = process.env.GITEE_USERNAME ?? 'codeing-rz';
const accessToken = process.env.GITEE_ACCESS_TOKEN ?? process.env.GITEE_TOKEN ?? '';
const activeWithinDays = Number(process.env.GITEE_ACTIVE_WITHIN_DAYS ?? 180);
const strict = process.env.GITEE_SYNC_STRICT === '1';
const apiBase = 'https://gitee.com/api/v5';
const readmeExcerptMaxLen = 240;
const maxRetries = 3;

const isGiteeBoilerplate = (text) =>
  /Gitee 是 OSCHINA|以下是 Gitee 平台说明|企业项目请看|专为开发者提供稳定、高效、安全的云端软件开发协作平台/i.test(
    text,
  );

const normalizeHref = (htmlUrl) => (htmlUrl ?? '').replace(/\.git$/, '');

const buildTags = (repo) => {
  const tags = [];
  if (repo.language) tags.push(repo.language);
  if (repo.stargazers_count > 0) tags.push(`${repo.stargazers_count} stars`);
  return tags;
};

const isActiveRepo = (repo, withinDays) => {
  if (!repo.pushed_at) return false;
  const pushedDate = new Date(repo.pushed_at);
  if (Number.isNaN(pushedDate.getTime())) return false;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - withinDays);
  return pushedDate >= cutoff;
};

const decodeReadmeContent = (data) => {
  if (!data?.content) return '';
  const encoding = data.encoding ?? 'base64';
  if (encoding === 'base64') {
    return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
  }
  return String(data.content);
};

const excerptFromMarkdown = (markdown, maxLen = readmeExcerptMaxLen) => {
  let text = markdown.replace(/^---[\s\S]*?---\s*/, '');
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');
  text = text.replace(/!\[.*?\]\(.*?\)/g, ' ');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/[*_~]/g, '');
  text = text.replace(/<[^>]+>/g, ' ');

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0 && !isGiteeBoilerplate(p));

  const first =
    paragraphs.find((p) => p.length > 12 && !/^readme$/i.test(p)) ?? '';

  if (!first) return '';
  if (first.length <= maxLen) return first;
  return `${first.slice(0, maxLen).trimEnd()}…`;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withAuth(url) {
  if (!accessToken) return url;
  const u = new URL(url);
  u.searchParams.set('access_token', accessToken);
  return u.toString();
}

function isRateLimited(status, bodyText) {
  if (status === 429) return true;
  if (status !== 403) return false;
  return /rate limit|Rate Limit|访问频率/i.test(bodyText);
}

async function fetchJson(url, { retries = maxRetries } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = await fetch(withAuth(url), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'alephyeah-sync-gitee-projects',
      },
    });

    if (response.ok) {
      return response.json();
    }

    const bodyText = await response.text().catch(() => '');
    const rateLimited = isRateLimited(response.status, bodyText);
    lastError = new Error(
      `Gitee API 请求失败: HTTP ${response.status}${rateLimited ? ' (限流)' : ''} (${url})`,
    );

    if (rateLimited && attempt < retries) {
      const retryAfter = Number(response.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** (attempt - 1);
      console.warn(
        `[sync-gitee-projects] 限流，${waitMs}ms 后重试 (${attempt}/${retries})`,
      );
      await sleep(waitMs);
      continue;
    }

    throw lastError;
  }

  throw lastError ?? new Error('Gitee API 请求失败');
}

async function fetchReposPage(page) {
  const params = new URLSearchParams({
    sort: 'pushed',
    direction: 'desc',
    per_page: '100',
    page: String(page),
  });
  const url = `${apiBase}/users/${encodeURIComponent(username)}/repos?${params}`;
  const data = await fetchJson(url);
  if (!Array.isArray(data)) {
    throw new Error('Gitee API 返回格式异常，期望数组');
  }
  return data;
}

async function fetchAllRepos() {
  const repos = [];
  let page = 1;

  while (true) {
    const batch = await fetchReposPage(page);
    if (batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

async function fetchReadme(owner, repoPath) {
  const url = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoPath)}/readme`;
  try {
    const data = await fetchJson(url, { retries: 2 });
    if (!data?.content) return null;
    return decodeReadmeContent(data);
  } catch {
    return null;
  }
}

async function mapRepoWithReadme(repo) {
  const owner = repo.owner?.login ?? username;
  const repoPath = repo.path ?? repo.name;
  let description = (repo.description ?? '').trim();

  const readme = await fetchReadme(owner, repoPath);
  if (readme) {
    const excerpt = excerptFromMarkdown(readme);
    if (excerpt) description = excerpt;
  }

  if (!description && isGiteeBoilerplate((repo.description ?? '').trim())) {
    description = '';
  }

  return {
    id: repoPath,
    title: (repo.name ?? repoPath ?? '').replace(/\s+/g, ' ').trim(),
    description,
    tags: buildTags(repo),
    href: normalizeHref(repo.html_url),
    pushedAt: repo.pushed_at ?? null,
  };
}

async function mapInBatches(items, mapper, concurrency = 4) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const mapped = await Promise.all(batch.map(mapper));
    results.push(...mapped);
  }
  return results;
}

async function outputExists() {
  try {
    await access(outputPath);
    return true;
  } catch {
    return false;
  }
}

async function keepExistingOnFailure(error) {
  const hasExisting = await outputExists();
  if (hasExisting) {
    let count = '?';
    try {
      const existing = JSON.parse(await readFile(outputPath, 'utf8'));
      count = Array.isArray(existing.projects) ? existing.projects.length : '?';
    } catch {
      // ignore parse errors; file still usable as last-known artifact
    }
    console.warn(
      `[sync-gitee-projects] ${error.message ?? error}`,
    );
    console.warn(
      `[sync-gitee-projects] 保留已有 projects.json（${count} 个项目），构建继续`,
    );
    if (!accessToken) {
      console.warn(
        '[sync-gitee-projects] 提示: 设置 GITEE_ACCESS_TOKEN 可提高 API 限额',
      );
    }
    return;
  }

  if (strict) {
    throw error;
  }

  // 没有旧文件时写空清单，避免整站构建挂掉
  const empty = {
    version: 1,
    source: 'gitee',
    username,
    syncedAt: new Date().toISOString(),
    activeWithinDays,
    projects: [],
    syncError: String(error.message ?? error),
  };
  await writeFile(outputPath, `${JSON.stringify(empty, null, 2)}\n`, 'utf8');
  console.warn(`[sync-gitee-projects] ${error.message ?? error}`);
  console.warn('[sync-gitee-projects] 无缓存可用，已写入空 projects.json，构建继续');
}

async function main() {
  console.log(`[sync-gitee-projects] 同步 Gitee 用户仓库: ${username}`);
  console.log(`[sync-gitee-projects] 活跃窗口: 最近 ${activeWithinDays} 天内有推送`);
  console.log(
    `[sync-gitee-projects] 鉴权: ${accessToken ? 'access_token' : '匿名（易触发限流）'}`,
  );

  try {
    const rawRepos = await fetchAllRepos();
    const nonForkRepos = rawRepos.filter((repo) => !repo.fork);
    const activeRepos = nonForkRepos.filter((repo) => isActiveRepo(repo, activeWithinDays));
    const inactiveCount = nonForkRepos.length - activeRepos.length;

    console.log(
      `[sync-gitee-projects] 仓库统计: 共 ${rawRepos.length} 个，非 fork ${nonForkRepos.length} 个，过滤不活跃 ${inactiveCount} 个`,
    );

    const projects = await mapInBatches(activeRepos, mapRepoWithReadme, 4);
    const visibleProjects = projects.filter((project) => project.id && project.href);

    const manifest = {
      version: 1,
      source: 'gitee',
      username,
      syncedAt: new Date().toISOString(),
      activeWithinDays,
      projects: visibleProjects,
    };

    await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`[sync-gitee-projects] 已写入 ${visibleProjects.length} 个项目 → public/projects.json`);
  } catch (error) {
    if (strict) {
      throw error;
    }
    await keepExistingOnFailure(error);
  }
}

main().catch((error) => {
  console.error('[sync-gitee-projects] 失败:', error.message ?? error);
  process.exit(1);
});

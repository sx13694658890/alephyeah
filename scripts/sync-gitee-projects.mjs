/**
 * 构建时从 Gitee 公开 API 同步仓库列表到 public/projects.json
 * 用法: node scripts/sync-gitee-projects.mjs
 *
 * 环境变量:
 * - GITEE_USERNAME（默认 codeing-rz）
 * - GITEE_ACTIVE_WITHIN_DAYS（默认 180，仅保留该天数内有推送的仓库）
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputPath = join(root, 'public/projects.json');

const username = process.env.GITEE_USERNAME ?? 'codeing-rz';
const activeWithinDays = Number(process.env.GITEE_ACTIVE_WITHIN_DAYS ?? 180);
const apiBase = 'https://gitee.com/api/v5';
const readmeExcerptMaxLen = 240;

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

async function fetchReposPage(page) {
  const params = new URLSearchParams({
    sort: 'pushed',
    direction: 'desc',
    per_page: '100',
    page: String(page),
  });
  const url = `${apiBase}/users/${encodeURIComponent(username)}/repos?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gitee API 请求失败: HTTP ${response.status} (${url})`);
  }

  const data = await response.json();
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
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  if (!data?.content) return null;

  return decodeReadmeContent(data);
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

async function main() {
  console.log(`[sync-gitee-projects] 同步 Gitee 用户仓库: ${username}`);
  console.log(`[sync-gitee-projects] 活跃窗口: 最近 ${activeWithinDays} 天内有推送`);

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
}

main().catch((error) => {
  console.error('[sync-gitee-projects] 失败:', error.message ?? error);
  process.exit(1);
});

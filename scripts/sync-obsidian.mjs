#!/usr/bin/env node
/**
 * 构建时从 Obsidian 仓库同步笔记到 public/knowledge-base/
 *
 * 读取 /Users/sxl/Documents/素材/ 下的所有 .md 文件，
 * 解析 frontmatter、提取标题/摘要/标签/wiki 链接，
 * 生成索引 JSON，并将 .md 文件复制到 public 目录供前端按需加载。
 *
 * 用法: node scripts/sync-obsidian.mjs
 *
 * 环境变量:
 *   OBSIDIAN_VAULT_PATH  — 仓库路径（默认 /Users/sxl/Documents/素材）
 *   OBSIDIAN_OUTPUT_DIR  — 输出目录（默认 public/knowledge-base）
 */
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH ?? '/Users/sxl/Documents/素材';
const OUTPUT_DIR = join(root, process.env.OBSIDIAN_OUTPUT_DIR ?? 'public/knowledge-base');
const NOTES_OUTPUT_DIR = join(OUTPUT_DIR, 'notes');

const isSkippedFile = (name) => {
  // 隐藏文件、未命名文件、Pasted image 文件
  if (name.startsWith('.') || name.startsWith('未命名') || name.startsWith('Pasted image')) return true;
  const ext = extname(name).toLowerCase();
  // 只同步 .md 文件（前端只能渲染 markdown）
  return ext !== '.md';
};

const isSkippedDir = (name) => {
  return name.startsWith('.');
};

const excerptMaxLen = 200;

/**
 * 简单解析 YAML frontmatter
 */
function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { frontmatter: {}, body: text };

  const raw = match[1];
  const frontmatter = {};
  for (const line of raw.split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();

    // 处理数组: "- item1\n- item2"
    if (value === '' || value === '[]') {
      const lines = raw.split('\n');
      const idx = lines.indexOf(line);
      const items = [];
      for (let i = idx + 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed.startsWith('- ')) break;
        items.push(trimmed.slice(2).trim());
      }
      if (items.length > 0) {
        frontmatter[key] = items;
        continue;
      }
    }

    // 处理数组: [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      frontmatter[key] = value;
    } else {
      // 去掉引号
      value = value.replace(/^['"]|['"]$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body: match[1] ? text.slice(match[0].length) : text };
}

/**
 * 从文件名或 body 中提取标题
 */
function extractTitle(name, body) {
  // 先尝试 body 中的 H1
  const h1Match = body.match(/^#\s+(.+)/m);
  if (h1Match) return h1Match[1].trim().replace(/^#+\s*/, '');

  // 去掉 .md 后缀，用文件名
  return basename(name, '.md');
}

/**
 * 从 body 提取摘要（第一个有意义的段落）
 */
function extractExcerpt(body, maxLen = excerptMaxLen) {
  let text = body.replace(/^---[\s\S]*?---\s*/, '');
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');
  text = text.replace(/!\[.*?\]\(.*?\)/g, ' ');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\[\[([^\]]+?)(?:\|[^\]]+)?\]\]/g, '$1');
  text = text.replace(/[*_~]/g, '');
  text = text.replace(/<[^>]+>/g, ' ');

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 8 && !/^---/.test(p));

  const first = paragraphs[0] ?? '';
  if (!first) return '';
  if (first.length <= maxLen) return first;
  return `${first.slice(0, maxLen).trimEnd()}…`;
}

/**
 * 提取 Obsidian wikilinks [[note]] 或 [[note|alias]]
 */
function extractWikilinks(body) {
  const links = [];
  const regex = /\[\[([^\]]+?)(?:\|([^\]]+))?\]\]/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    links.push({
      target: match[1].trim(),
      alias: match[2]?.trim() ?? match[1].trim(),
    });
  }
  return links;
}

/**
 * 提取 tags: 优先 frontmatter，若无则从 body 中的 #tag 提取
 */
function extractTags(frontmatter, body) {
  if (frontmatter.tags) {
    if (Array.isArray(frontmatter.tags)) return frontmatter.tags.map(String);
    if (typeof frontmatter.tags === 'string') {
      return frontmatter.tags.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  // fallback: 从 body 中提取 #tag
  const tags = [];
  const tagRegex = /(?<!\w)#([a-zA-Z\u4e00-\u9fff][\w\u4e00-\u9fff-]*)/g;
  let m;
  while ((m = tagRegex.exec(body)) !== null) {
    tags.push(m[1]);
  }
  return [...new Set(tags)];
}

function getCategory(frontmatter) {
  if (frontmatter.category) return String(frontmatter.category);
  return '未分类';
}

async function walkDir(dir, baseDir) {
  const entries = [];
  const { readdir, stat } = await import('node:fs/promises');

  let files;
  try {
    files = await readdir(dir);
  } catch {
    return entries;
  }

  for (const name of files) {
    if (isSkippedDir(name)) continue;
    const fullPath = join(dir, name);
    const s = await stat(fullPath);
    const relPath = relative(baseDir, fullPath);

    if (s.isDirectory()) {
      const sub = await walkDir(fullPath, baseDir);
      entries.push(...sub);
    } else if (s.isFile() && !isSkippedFile(name)) {
      entries.push({ fullPath, relPath, name });
    }
  }

  return entries;
}

async function processFile({ fullPath, relPath, name }) {
  const raw = await readFile(fullPath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(raw);
  const title = extractTitle(name, body);
  const description = extractExcerpt(body);
  const wikilinks = extractWikilinks(body);
  const tags = extractTags(frontmatter, body);
  const category = getCategory(frontmatter);

  let date = frontmatter.date ?? '';
  if (!date) {
    const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) date = dateMatch[1];
  }

  const id = relPath.replace(/\.md$/i, '').replace(/\\/g, '/');
  const dirPath = dirname(relPath).replace(/\\/g, '/');
  // 根目录的笔记 dirPath 设为空字符串
  const normalizedDirPath = dirPath === '.' ? '' : dirPath;

  return {
    id,
    title,
    description,
    date,
    category,
    tags,
    wikilinks,
    notePath: relPath.replace(/\\/g, '/'),
    dirPath: normalizedDirPath,
  };
}

function buildDirTree(notes) {
  const tree = { name: '知识库', path: '', children: {}, noteCount: 0 };

  for (const note of notes) {
    const parts = note.dirPath ? note.dirPath.split('/') : [];
    let current = tree;
    current.noteCount++;

    for (const part of parts) {
      if (!part) continue;
      if (!current.children[part]) {
        const pathSoFar = parts.slice(0, parts.indexOf(part) + 1).join('/');
        current.children[part] = { name: part, path: pathSoFar, children: {}, noteCount: 0 };
      }
      current = current.children[part];
      current.noteCount++;
    }
  }

  // 将 children 对象转为数组并按 noteCount 降序
  return flattenTree(tree);
}

function flattenTree(node) {
  const children = Object.values(node.children)
    .map(flattenTree)
    .sort((a, b) => b.noteCount - a.noteCount);
  return {
    name: node.name,
    path: node.path,
    noteCount: node.noteCount,
    children,
  };
}

async function main() {
  console.log(`[sync-obsidian] 读取仓库: ${VAULT_PATH}`);

  if (!existsSync(VAULT_PATH)) {
    console.error(`[sync-obsidian] 错误: 仓库路径不存在: ${VAULT_PATH}`);
    process.exit(1);
  }

  const files = await walkDir(VAULT_PATH, VAULT_PATH);
  console.log(`[sync-obsidian] 发现 ${files.length} 个文件`);

  const notes = [];
  for (const file of files) {
    try {
      const note = await processFile(file);
      notes.push(note);
    } catch (err) {
      console.error(`[sync-obsidian] 处理失败: ${file.relPath} — ${err.message}`);
    }
  }

  // 按目录排序
  notes.sort((a, b) => {
    if (a.dirPath !== b.dirPath) return a.dirPath.localeCompare(b.dirPath, 'zh');
    return a.title.localeCompare(b.title, 'zh');
  });

  // 构建目录树
  const dirTree = buildDirTree(notes);

  const manifest = {
    version: 2,
    source: 'obsidian',
    vaultPath: VAULT_PATH,
    syncedAt: new Date().toISOString(),
    notes,
    dirTree,
  };

  // 写入目录
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(NOTES_OUTPUT_DIR, { recursive: true });

  // 写入索引
  const indexPath = join(OUTPUT_DIR, 'index.json');
  await writeFile(indexPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[sync-obsidian] 已写入索引 → ${indexPath} (${notes.length} 条笔记)`);

  // 复制 .md 文件到 public/knowledge-base/notes/
  let copiedCount = 0;
  for (const file of files) {
    const targetPath = join(NOTES_OUTPUT_DIR, file.relPath);
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(file.fullPath, targetPath);
    copiedCount++;
  }
  console.log(`[sync-obsidian] 已复制 ${copiedCount} 个文件 → ${NOTES_OUTPUT_DIR}/`);

  // 验证
  console.log(`[sync-obsidian] 根目录笔记: ${notes.filter(n => !n.dirPath).length} 条`);
  const dirs = [...new Set(notes.filter(n => n.dirPath).map(n => n.dirPath))];
  console.log(`[sync-obsidian] 子目录: ${dirs.length} 个`);
}

main().catch((error) => {
  console.error('[sync-obsidian] 失败:', error.message ?? error);
  process.exit(1);
});

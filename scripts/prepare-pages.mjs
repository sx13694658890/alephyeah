#!/usr/bin/env node
/**
 * Cloudflare Pages 部署前准备：
 * 1. 生成 404.html —— 关闭「缺文件就回退 index.html」的 SPA 默认行为，
 *    避免 /static/*.js 404 时返回 text/html 导致 MIME 报错
 * 2. 校验 Pages 路由 / headers / redirects 已进入 dist
 */
import { copyFile, access, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const indexPath = join(dist, 'index.html');
  if (!(await exists(indexPath))) {
    throw new Error('dist/index.html missing — run rsbuild build first');
  }

  // 真实 404：缺失的 /static/js/xxx.js 不再伪装成可执行的 index.html
  await copyFile(indexPath, join(dist, '404.html'));

  const required = ['_routes.json', '_headers', '_redirects'];
  for (const name of required) {
    const target = join(dist, name);
    if (!(await exists(target))) {
      throw new Error(`dist/${name} missing — ensure public/${name} is copied by rsbuild`);
    }
  }

  // 兜底：保证 Functions 只匹配 /api/*
  const routesPath = join(dist, '_routes.json');
  const routes = JSON.parse(await readFile(routesPath, 'utf8'));
  if (!Array.isArray(routes.include) || !routes.include.includes('/api/*')) {
    await writeFile(
      routesPath,
      `${JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }, null, 2)}\n`,
    );
  }

  console.log('[prepare-pages] 404.html + Pages routing files ready');
}

main().catch((error) => {
  console.error('[prepare-pages]', error.message ?? error);
  process.exit(1);
});

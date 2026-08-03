#!/usr/bin/env node
/**
 * Cloudflare Pages 部署前准备：
 * 1. 删除根 404.html（保留 SPA）
 * 2. 写入 /static/404.html、/assets/404.html（缺 chunk 真 404）
 * 3. 把 lib-react / lib-router 等带连字符的入口 chunk 重命名并改写 HTML
 * 4. 给 /static/* 加 ?v=stamp，绕过浏览器对旧 URL 的 immutable 毒化缓存
 */
import { access, mkdir, readFile, writeFile, unlink, readdir, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const jsDir = join(dist, 'static', 'js');

const MINIMAL_404 = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex" />
    <title>Not Found</title>
  </head>
  <body>Not Found</body>
</html>
`;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensure404(dir) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, '404.html'), MINIMAL_404);
}

/** lib-router.abc.js → vendorRouter.abc.js （连字符名在部分 CF 缓存场景下易中毒） */
function safeChunkName(filename) {
  return filename
    .replace(/^lib-router\./, 'vendorRouter.')
    .replace(/^lib-react\./, 'vendorReact.');
}

async function renamePoisonedChunks() {
  const renames = new Map();
  if (!(await exists(jsDir))) return renames;

  const files = await readdir(jsDir);
  for (const name of files) {
    if (!name.endsWith('.js')) continue;
    const next = safeChunkName(name);
    if (next === name) continue;

    await rename(join(jsDir, name), join(jsDir, next));
    renames.set(name, next);

    const license = `${name}.LICENSE.txt`;
    if (files.includes(license)) {
      const nextLicense = `${next}.LICENSE.txt`;
      await rename(join(jsDir, license), join(jsDir, nextLicense));
      renames.set(license, nextLicense);
    }
  }
  return renames;
}

async function main() {
  const indexPath = join(dist, 'index.html');
  if (!(await exists(indexPath))) {
    throw new Error('dist/index.html missing — run rsbuild build first');
  }

  if (await exists(join(dist, '404.html'))) {
    await unlink(join(dist, '404.html'));
  }

  await ensure404(join(dist, 'static'));
  await ensure404(join(dist, 'assets'));

  for (const name of ['_routes.json', '_headers', '_redirects']) {
    if (!(await exists(join(dist, name)))) {
      throw new Error(`dist/${name} missing`);
    }
  }

  const routesPath = join(dist, '_routes.json');
  const routes = JSON.parse(await readFile(routesPath, 'utf8'));
  if (!Array.isArray(routes.include) || !routes.include.includes('/api/*')) {
    await writeFile(
      routesPath,
      `${JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }, null, 2)}\n`,
    );
  }

  const renames = await renamePoisonedChunks();
  let html = await readFile(indexPath, 'utf8');

  for (const [from, to] of renames) {
    html = html.split(from).join(to);
  }

  const stamp = `p${Date.now().toString(36)}`;
  html = html.replace(/<head>/i, `<head><meta name="alephyeah-build" content="${stamp}" />`);
  html = html.replace(
    /(src|href)="(\/static\/[^"?]+)(\?[^"]*)?"/g,
    (_, attr, url) => `${attr}="${url}?v=${stamp}"`,
  );

  if (/lib-router\.|lib-react\./.test(html)) {
    throw new Error('index.html still references lib-router/lib-react after rename');
  }

  await writeFile(indexPath, html);
  console.log(
    `[prepare-pages] ok build=${stamp} renames=${renames.size} scripts=${[...html.matchAll(/static\/js\/[^"?]+/g)].map((m) => m[0]).join(',')}`,
  );
}

main().catch((error) => {
  console.error('[prepare-pages]', error.message ?? error);
  process.exit(1);
});

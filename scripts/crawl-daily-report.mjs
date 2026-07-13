/**
 * 运行 Horizon 抓取日报 pipeline，并将最新中文日报同步到 data/summary-zh.md
 *
 * 前置条件:
 * - 已安装 uv (https://docs.astral.sh/uv/)
 * - horizon/.env 已配置至少一个 AI API Key
 * - horizon/data/config.json 已配置（可从 config.example.json 复制）
 *
 * 环境变量:
 * - HORIZON_HOURS: 抓取时间窗口（小时），传给 `horizon --hours`
 * - HORIZON_SKIP_CRAWL=1: 跳过抓取，仅从 horizon/data/summaries/ 同步最新中文日报
 */
import { spawn } from 'node:child_process';
import { access, copyFile, mkdir, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const horizonDir = join(root, 'horizon');
const summariesDir = join(horizonDir, 'data/summaries');
const outputPath = join(root, 'data/summary-zh.md');

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function findLatestZhSummary() {
  if (!(await fileExists(summariesDir))) {
    throw new Error(`未找到 summaries 目录: ${summariesDir}`);
  }

  const files = await readdir(summariesDir);
  const zhFiles = files
    .filter((name) => /^horizon-\d{4}-\d{2}-\d{2}-zh\.md$/.test(name))
    .sort()
    .reverse();

  if (zhFiles.length === 0) {
    throw new Error('未找到中文日报 (horizon-*-zh.md)，请先完成抓取');
  }

  return join(summariesDir, zhFiles[0]);
}

async function syncLatestSummary() {
  await mkdir(dirname(outputPath), { recursive: true });
  const latest = await findLatestZhSummary();
  await copyFile(latest, outputPath);
  console.log(`[crawl-daily] 已同步 → data/summary-zh.md (${latest.split('/').pop()})`);
}

async function runHorizon() {
  const configPath = join(horizonDir, 'data/config.json');
  if (!(await fileExists(configPath))) {
    console.error('[crawl-daily] 缺少 horizon/data/config.json');
    console.error('  cp horizon/data/config.example.json horizon/data/config.json');
    console.error('  cp horizon/.env.example horizon/.env  # 填入 AI API Key');
    process.exit(1);
  }

  const args = ['run', 'horizon'];
  const hours = process.env.HORIZON_HOURS;
  if (hours) {
    args.push('--hours', hours);
  }

  console.log('[crawl-daily] 运行 Horizon pipeline…');
  await runCommand('uv', args, horizonDir);
}

async function main() {
  if (process.env.HORIZON_SKIP_CRAWL === '1') {
    console.log('[crawl-daily] HORIZON_SKIP_CRAWL=1，跳过抓取');
  } else {
    await runHorizon();
  }

  await syncLatestSummary();
}

main().catch((error) => {
  console.error('[crawl-daily] 失败:', error.message ?? error);
  process.exit(1);
});

/**
 * 构建时将 data/summary-zh.md 同步到 public/daily/summary-zh.md
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const source = join(root, 'data/summary-zh.md');
const targetDir = join(root, 'public/daily');
const target = join(targetDir, 'summary-zh.md');

async function main() {
  await mkdir(targetDir, { recursive: true });
  await copyFile(source, target);
  console.log('[sync-daily-summary] 已同步 → public/daily/summary-zh.md');
}

main().catch((error) => {
  console.error('[sync-daily-summary] 失败:', error.message ?? error);
  process.exit(1);
});

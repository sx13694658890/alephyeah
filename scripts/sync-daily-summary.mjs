/**
 * 构建时将 data/summary-zh.md 同步到 public/daily/summary-zh.md
 * 源文件由 `pnpm crawl:daily` 从 Horizon pipeline 生成，或手动维护
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
  // Check if source exists; if not, create a placeholder
  try {
    await mkdir(targetDir, { recursive: true });
    await copyFile(source, target);
    console.log('[sync-daily-summary] 已同步 → public/daily/summary-zh.md');
  } catch {
    await mkdir(targetDir, { recursive: true });
    const { writeFile } = await import('node:fs/promises');
    await writeFile(target, '# Summary\n\nNo daily summary available.', 'utf8');
    console.log('[sync-daily-summary] 源文件不存在，已创建占位文件');
  }
}

main().catch((error) => {
  console.error('[sync-daily-summary] 失败:', error.message ?? error);
  process.exit(0); // non-fatal
});

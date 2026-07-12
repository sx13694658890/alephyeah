export const DAILY_SUMMARY_PATH = '/daily/summary-zh.md';

export interface DailyBriefMeta {
  series: string;
  date: string;
}

export interface ParsedDailyBrief {
  meta: DailyBriefMeta | null;
  articles: string[];
}

/** 去掉顶部目录索引，只保留正文条目 */
export const stripDailySummaryIndex = (raw: string): string => {
  const anchorIdx = raw.search(/\n<a id="item-\d+"/);
  if (anchorIdx !== -1) {
    return raw.slice(anchorIdx + 1).trimStart();
  }

  const parts = raw.split(/\n---\n/);
  if (parts.length >= 3) {
    return parts.slice(2).join('\n---\n').trim();
  }

  return raw;
};

export const extractBriefMeta = (raw: string): DailyBriefMeta | null => {
  const match = raw.match(/^#\s+(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})/m);
  if (!match) return null;
  return { series: match[1].trim(), date: match[2] };
};

/** 将 HTML 片段转为 MarkdownPreview 可渲染的格式 */
export const preprocessDailySummary = (raw: string): string =>
  raw
    .replace(/<a id="[^"]*"><\/a>\s*/g, '')
    .replace(
      /<details><summary>([^<]*)<\/summary>\s*([\s\S]*?)<\/details>/gi,
      (_, summary, body) => {
        const links = [...body.matchAll(/<a href="([^"]+)">([^<]*)<\/a>/gi)];
        if (links.length === 0) return '';
        const list = links.map(([, href, label]) => `- [${label.trim()}](${href})`).join('\n');
        return `\n**${summary.trim()}**\n${list}\n`;
      },
    );

export const parseDailyBrief = (raw: string): ParsedDailyBrief => {
  const meta = extractBriefMeta(raw);
  const stripped = stripDailySummaryIndex(raw);
  const processed = preprocessDailySummary(stripped);
  const articles = processed
    .split(/\n---\n/)
    .map((section) => section.trim())
    .filter((section) => section.length > 0 && /^##\s/m.test(section));

  return { meta, articles };
};

import { useState } from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import { MarkdownPreview } from '../ai/MarkdownPreview';
import type { ParsedDailyBrief } from '../../lib/daily-summary';

const INITIAL_VISIBLE_COUNT = 5;

interface DailyBriefFeedProps {
  brief: ParsedDailyBrief;
}

const BriefArticle = ({ article }: { article: string }) => (
  <article
    className="daily-brief-article group relative border-t border-border/40 py-7 first:border-t-0 first:pt-0 md:py-9"
  >
    <span
      aria-hidden
      className="absolute left-0 top-7 hidden h-[calc(100%-1.75rem)] w-px bg-linear-to-b from-accent/35 via-border/50 to-transparent sm:block md:top-9"
    />
    <div
      className={[
        'sm:pl-5',
        '[&_h2]:mb-3 [&_h2]:mt-0 [&_h2]:text-[1.05rem] [&_h2]:font-medium [&_h2]:leading-snug',
        '[&_h2_a]:text-foreground [&_h2_a]:underline-offset-[3px] [&_h2_a]:decoration-accent/30',
        '[&_h2_a]:transition-colors [&_h2_a]:hover:text-accent [&_h2_a]:hover:decoration-accent/55',
        '[&_p]:text-[0.9375rem] [&_p]:leading-[1.72] [&_p]:text-foreground/68',
        '[&_p_strong]:text-[0.8125rem] [&_p_strong]:font-medium [&_p_strong]:tracking-wide [&_p_strong]:text-foreground/42',
        '[&_a]:text-accent/90 [&_a]:decoration-accent/25',
        '[&_blockquote]:mb-3 [&_blockquote]:border-accent/20 [&_blockquote]:text-foreground/50',
      ].join(' ')}
    >
      <MarkdownPreview content={article} />
    </div>
  </article>
);

export const DailyBriefFeed = ({ brief }: DailyBriefFeedProps) => {
  const { t } = usePreferences();
  const { meta, articles } = brief;
  const [expanded, setExpanded] = useState(false);

  const hasMore = articles.length > INITIAL_VISIBLE_COUNT;
  const visibleArticles = expanded ? articles : articles.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = articles.length - INITIAL_VISIBLE_COUNT;

  return (
    <div className="daily-brief-feed md:max-w-3xl">
      {meta ? (
        <p className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm tracking-wide text-foreground/45 md:mb-9">
          <span className="font-medium text-foreground/55">{meta.series}</span>
          <span aria-hidden className="text-border/80">
            ·
          </span>
          <time dateTime={meta.date}>{meta.date}</time>
        </p>
      ) : null}

      <div className="space-y-0">
        {visibleArticles.map((article, index) => (
          <BriefArticle key={index} article={article} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-6 border-t border-border/35 pt-5 sm:pl-5">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="group inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-accent"
          >
            <span>{expanded ? t('home.todayNewsShowLess') : t('home.todayNewsShowMore')}</span>
            {!expanded ? (
              <span className="text-foreground/35 group-hover:text-accent/70">
                {hiddenCount}
              </span>
            ) : null}
            <span
              aria-hidden
              className={`text-xs text-foreground/35 transition-transform duration-300 group-hover:text-accent/70 ${expanded ? 'rotate-180' : ''}`}
            >
              ↓
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

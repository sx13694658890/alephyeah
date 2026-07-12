import { useCallback, useEffect, useState } from 'react';

import { AiResourceErrorState, AiResourceLoadingState } from '../ai/AiResourceState';
import { usePreferences } from '../../context/PreferencesContext';
import { DAILY_SUMMARY_PATH, parseDailyBrief, type ParsedDailyBrief } from '../../lib/daily-summary';
import { DailyBriefFeed } from './DailyBriefFeed';

interface TodayNewsSectionProps {
  className?: string;
}

export const TodayNewsSection = ({ className = '' }: TodayNewsSectionProps) => {
  const { t } = usePreferences();
  const [brief, setBrief] = useState<ParsedDailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(DAILY_SUMMARY_PATH, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const raw = await response.text();
      setBrief(parseDailyBrief(raw));
    } catch {
      setError(t('home.todayNewsError'));
      setBrief(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return (
    <section className={`today-news w-full text-left ${className}`.trim()}>
      <h2 className="mb-4 text-2xl font-light text-foreground md:mb-5">
        {t('home.todayNews')}
      </h2>

      {loading ? (
        <AiResourceLoadingState label={t('home.todayNewsLoading')} className="py-8" />
      ) : error ? (
        <AiResourceErrorState message={error} onRetry={fetchSummary} retryLabel={t('projects.retry')} />
      ) : brief && brief.articles.length > 0 ? (
        <DailyBriefFeed brief={brief} />
      ) : null}
    </section>
  );
};

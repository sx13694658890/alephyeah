import { cn } from '../../lib/cn';

interface AiResourceErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const AiResourceErrorState = ({
  message,
  onRetry,
  retryLabel = '重试',
  className,
}: AiResourceErrorStateProps) => (
  <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
    <p className="max-w-sm text-sm leading-relaxed text-foreground/55">{message}</p>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
      >
        {retryLabel}
      </button>
    ) : null}
  </div>
);

interface AiResourceLoadingStateProps {
  label?: string;
  className?: string;
}

export const AiResourceLoadingState = ({
  label = '加载中…',
  className,
}: AiResourceLoadingStateProps) => (
  <div className={cn('flex items-center justify-center py-12 text-sm text-foreground/45', className)}>
    {label}
  </div>
);

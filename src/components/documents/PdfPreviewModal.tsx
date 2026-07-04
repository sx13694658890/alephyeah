import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';

import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';

interface PdfPreviewModalProps {
  open: boolean;
  title: string;
  src: string;
  fileName: string;
  onClose: () => void;
}

export const PdfPreviewModal = ({
  open,
  title,
  src,
  fileName,
  onClose,
}: PdfPreviewModalProps) => {
  const { t } = usePreferences();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0 pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.5rem))] sm:items-center sm:p-4 sm:pt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))]"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-foreground/30 backdrop-blur-sm"
        aria-label={t('home.pdfClose')}
        onClick={onClose}
      />

      <div
        className={cn(
          'relative z-10 flex h-full w-full min-h-0 flex-col overflow-hidden',
          'max-h-full rounded-t-3xl border border-border/60 bg-background shadow-2xl',
          'sm:max-h-[min(88vh,900px)] sm:max-w-4xl sm:rounded-3xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
      >
        <header className="relative z-10 flex shrink-0 items-center gap-2 border-b border-border/60 bg-background px-4 py-3 sm:px-5">
          <h2
            id="pdf-preview-title"
            className="min-w-0 flex-1 truncate text-sm font-medium text-foreground sm:text-base"
          >
            {title}
          </h2>
          <a
            href={src}
            download={fileName}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 text-xs font-medium text-foreground/75 transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Download className="size-3.5" aria-hidden />
            {t('home.pdfDownload')}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label={t('home.pdfClose')}
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 bg-muted/20">
          <iframe
            src={src}
            title={title}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
};

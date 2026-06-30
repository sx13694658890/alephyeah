import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import type { CrawlerDocument } from '../../docs/crawler';
import { cn } from '../../lib/cn';
import { MarkdownPreview } from '../ai/MarkdownPreview';

interface DocumentModalProps {
  open: boolean;
  doc: CrawlerDocument | null;
  onClose: () => void;
}

export const DocumentModal = ({ open, doc, onClose }: DocumentModalProps) => {
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

  if (!open || !doc) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0 pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.5rem))] sm:items-center sm:p-4 sm:pt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))]"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-foreground/30 backdrop-blur-sm"
        aria-label="关闭"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative z-10 flex w-full min-h-0 flex-col overflow-hidden',
          'max-h-full rounded-t-3xl border border-border/60 bg-background shadow-2xl',
          'sm:max-h-[min(82vh,820px)] sm:max-w-3xl sm:rounded-3xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-modal-title"
      >
        <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-border/60 bg-background px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {doc.category}
              </span>
              <span className="text-xs text-foreground/40">{doc.date}</span>
            </div>
            <h2 id="document-modal-title" className="truncate text-base font-semibold text-foreground">
              {doc.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <MarkdownPreview content={doc.content} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

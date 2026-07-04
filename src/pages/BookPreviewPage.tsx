import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';

import { usePreferences } from '../context/PreferencesContext';
import { getBookById } from '../data/related-books';

export const BookPreviewPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const book = getBookById(bookId);
  const { t } = usePreferences();

  if (!book) {
    return <Navigate to="/" replace />;
  }

  const pdfSrc = encodeURI(book.src);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground/50 transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t('book.back')}
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-light text-foreground">{t(book.titleKey)}</h1>
        <a
          href={pdfSrc}
          download={book.fileName}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Download className="size-4" aria-hidden />
          {t('home.pdfDownload')}
        </a>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-muted/15 shadow-sm">
        <iframe src={pdfSrc} title={t(book.titleKey)} className="h-[min(78vh,920px)] w-full border-0" />
      </div>
    </div>
  );
};

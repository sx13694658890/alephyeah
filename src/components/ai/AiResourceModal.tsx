import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X } from 'lucide-react';
import {
  type AiResource,
  type AiResourceView,
  filterResourcesByView,
  getCategoryMeta,
} from '../../data/ai-resources';
import {
  loadAiResourceContent,
  loadAiResourceManifest,
  resolveAiResourceError,
  resolveReferencePath,
} from '../../lib/ai-resource-loader';
import { cn } from '../../lib/cn';
import { MarkdownPreview } from './MarkdownPreview';
import { AiResourceErrorState, AiResourceLoadingState } from './AiResourceState';

interface AiResourceModalProps {
  open: boolean;
  onClose: () => void;
  view: AiResourceView;
}

type PreviewFrame = {
  path: string;
  title: string;
};

export const AiResourceModal = ({ open, onClose, view }: AiResourceModalProps) => {
  const [allResources, setAllResources] = useState<AiResource[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [previewStack, setPreviewStack] = useState<PreviewFrame[]>([]);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const currentPreview = previewStack[previewStack.length - 1] ?? null;
  const items = useMemo(() => filterResourcesByView(allResources, view), [allResources, view]);
  const viewMeta = getCategoryMeta(view);

  const fetchManifest = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const resources = await loadAiResourceManifest();
      setAllResources(resources);
    } catch (error) {
      setListError(resolveAiResourceError(error));
      setAllResources([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadContentAtPath = useCallback(async (path: string) => {
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewContent(null);
    try {
      const content = await loadAiResourceContent(path);
      setPreviewContent(content);
    } catch (error) {
      setPreviewError(resolveAiResourceError(error));
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const fetchPreview = useCallback(
    (item: AiResource) => {
      setPreviewStack([{ path: item.path, title: item.title }]);
      loadContentAtPath(item.path);
    },
    [loadContentAtPath],
  );

  const openReference = useCallback(
    (reference: string) => {
      setPreviewStack((prev) => {
        const base = prev[prev.length - 1]?.path;
        if (!base) return prev;
        const resolved = resolveReferencePath(base, reference);
        const title = reference.split('/').pop() ?? reference;
        loadContentAtPath(resolved);
        return [...prev, { path: resolved, title }];
      });
    },
    [loadContentAtPath],
  );

  const handlePreviewBack = useCallback(() => {
    if (previewStack.length > 1) {
      const newStack = previewStack.slice(0, -1);
      setPreviewStack(newStack);
      loadContentAtPath(newStack[newStack.length - 1].path);
      return;
    }
    setPreviewStack([]);
    setPreviewContent(null);
    setPreviewError(null);
    setPreviewLoading(false);
  }, [previewStack, loadContentAtPath]);

  useEffect(() => {
    if (!open) return;
    fetchManifest();
  }, [open, fetchManifest]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentPreview) handlePreviewBack();
        else onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, currentPreview, handlePreviewBack]);

  useEffect(() => {
    if (!open) {
      setPreviewStack([]);
      setPreviewContent(null);
      setPreviewError(null);
      setPreviewLoading(false);
    }
  }, [open, view]);

  if (!open) return null;

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
          currentPreview && 'sm:max-w-4xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-resource-title"
      >
        <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-border/60 bg-background px-4 py-3 sm:px-5">
          {currentPreview ? (
            <button
              type="button"
              onClick={handlePreviewBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="返回"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2
              id="ai-resource-title"
              className="truncate text-base font-semibold text-foreground"
            >
              {currentPreview ? currentPreview.title : viewMeta.label}
            </h2>
            <p className="truncate text-xs text-foreground/50">
              {currentPreview ? currentPreview.path : `${items.length} 项资源`}
            </p>
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

        {currentPreview ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {previewLoading ? (
              <AiResourceLoadingState label="正在读取文件…" />
            ) : previewError ? (
              <AiResourceErrorState
                message={previewError}
                onRetry={() => loadContentAtPath(currentPreview.path)}
              />
            ) : previewContent ? (
              <MarkdownPreview
                content={previewContent}
                basePath={currentPreview.path}
                onOpenReference={openReference}
              />
            ) : null}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {listLoading ? (
              <AiResourceLoadingState label="正在加载资源列表…" />
            ) : listError ? (
              <AiResourceErrorState message={listError} onRetry={fetchManifest} />
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/45">{viewMeta.emptyHint}</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => fetchPreview(item)}
                      className={cn(
                        'w-full rounded-2xl border border-border/60 bg-white/50 p-4 text-left transition-all',
                        'hover:border-accent/30 hover:bg-accent/5 dark:bg-white/5',
                      )}
                    >
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-foreground/55">{item.description}</p>
                      <p className="mt-2 font-mono text-[11px] text-foreground/35">{item.path}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

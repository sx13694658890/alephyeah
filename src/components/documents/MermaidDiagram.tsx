import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Copy, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';

interface MermaidDiagramProps {
  source: string;
  title?: string;
  className?: string;
}

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2] as const;

const getMermaidTheme = (resolvedTheme: 'light' | 'dark') =>
  resolvedTheme === 'dark' ? 'dark' : 'neutral';

export const MermaidDiagram = ({ source, title, className }: MermaidDiagramProps) => {
  const reactId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCount = useRef(0);
  const { resolvedTheme } = usePreferences();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [copied, setCopied] = useState(false);

  const zoom = ZOOM_STEPS[zoomIndex];

  useEffect(() => {
    if (!expanded) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };

    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  useEffect(() => {
    let cancelled = false;
    const renderId = `mermaid-${reactId}-${++renderCount.current}`;

    const render = async () => {
      setLoading(true);
      setError(null);

      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: getMermaidTheme(resolvedTheme),
          securityLevel: 'strict',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        if (cancelled || !containerRef.current) return;

        const { svg, bindFunctions } = await mermaid.render(renderId, source.trim());

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        bindFunctions?.(containerRef.current);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '流程图渲染失败');
          setLoading(false);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [source, resolvedTheme, reactId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [source]);

  const zoomIn = () => setZoomIndex((index) => Math.min(index + 1, ZOOM_STEPS.length - 1));
  const zoomOut = () => setZoomIndex((index) => Math.max(index - 1, 0));

  const diagramBody = (
    <>
      <div className="relative min-h-[12rem] overflow-auto p-4 sm:p-6">
        {loading && !error ? (
          <div className="flex min-h-[10rem] items-center justify-center text-sm text-foreground/45">
            渲染流程图…
          </div>
        ) : null}

        {error ? (
          <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-xs text-foreground/70">
            {source}
          </pre>
        ) : (
          <div
            ref={containerRef}
            className={cn(
              'mermaid-diagram flex origin-top justify-center transition-transform duration-200 [&_svg]:h-auto [&_svg]:max-w-full',
              loading ? 'invisible absolute' : 'visible',
            )}
            style={{ transform: `scale(${zoom})` }}
            aria-hidden={loading}
          />
        )}
      </div>

      {!error ? (
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-border/60 bg-background/90 p-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-30"
            aria-label="缩小"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-10 text-center text-[10px] tabular-nums text-foreground/50">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-30"
            aria-label="放大"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </>
  );

  const card = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/70 bg-muted/20',
        expanded ? 'h-full' : '',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">{title ?? '流程图'}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/55 transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="复制源码"
            title={copied ? '已复制' : '复制源码'}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/55 transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label={expanded ? '退出全屏' : '全屏查看'}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {diagramBody}
    </div>
  );

  if (!expanded) {
    return <div className="my-3">{card}</div>;
  }

  return (
    <div className="my-3">
      <div
        className="fixed inset-0 z-[120] flex flex-col bg-background/95 p-4 backdrop-blur-sm sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? '流程图'}
      >
        <button
          type="button"
          className="absolute inset-0"
          aria-label="关闭全屏"
          onClick={() => setExpanded(false)}
        />
        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-muted/10 shadow-2xl">
          {card}
        </div>
      </div>
    </div>
  );
};

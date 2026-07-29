import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Download,
  ImageIcon,
  Link2,
  Link2Off,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';
import {
  ACCEPT_IMAGE_TYPES,
  compressImage,
  formatBytes,
  outputFileName,
  type OutputFormat,
} from '../../lib/image-compress';

type SourceState = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

type ResultState = {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  name: string;
};

function revoke(url?: string | null) {
  if (url) URL.revokeObjectURL(url);
}

export const ImageCompressor = () => {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';
  const inputRef = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState<SourceState | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragDepth = useRef(0);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [scalePercent, setScalePercent] = useState(100);

  const clearResult = useCallback(() => {
    setResult((prev) => {
      revoke(prev?.previewUrl);
      return null;
    });
  }, []);

  const clearSource = useCallback(() => {
    setSource((prev) => {
      revoke(prev?.previewUrl);
      return null;
    });
    clearResult();
    setError(null);
  }, [clearResult]);

  useEffect(() => () => {
    revoke(source?.previewUrl);
    revoke(result?.previewUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError(isZh ? '请选择图片文件' : 'Please choose an image file');
        return;
      }
      setError(null);
      clearSource();

      const previewUrl = URL.createObjectURL(file);
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error('decode'));
        img.src = previewUrl;
      }).catch(() => null);

      if (!dims) {
        revoke(previewUrl);
        setError(isZh ? '无法读取该图片' : 'Could not read this image');
        return;
      }

      setSource({ file, previewUrl, width: dims.w, height: dims.h });
      setWidth(dims.w);
      setHeight(dims.h);
      setScalePercent(100);
    },
    [clearSource, isZh],
  );

  // 整页拖拽上传（不只 dropzone）
  useEffect(() => {
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) void loadFile(file);
    };

    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [loadFile]);

  const onPickFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void loadFile(file);
  };

  const setWidthKeepAspect = (nextW: number) => {
    const w = Math.max(1, Math.round(nextW) || 1);
    setWidth(w);
    if (keepAspect && source) {
      setHeight(Math.max(1, Math.round((source.height / source.width) * w)));
    }
    setScalePercent(
      source ? Math.round((w / source.width) * 100) : 100,
    );
  };

  const setHeightKeepAspect = (nextH: number) => {
    const h = Math.max(1, Math.round(nextH) || 1);
    setHeight(h);
    if (keepAspect && source) {
      const w = Math.max(1, Math.round((source.width / source.height) * h));
      setWidth(w);
      setScalePercent(Math.round((w / source.width) * 100));
    }
  };

  const applyScale = (percent: number) => {
    if (!source) return;
    const p = Math.min(200, Math.max(1, Math.round(percent)));
    setScalePercent(p);
    const w = Math.max(1, Math.round((source.width * p) / 100));
    const h = Math.max(1, Math.round((source.height * p) / 100));
    setWidth(w);
    setHeight(h);
  };

  const runCompress = async () => {
    if (!source) return;
    setProcessing(true);
    setError(null);
    try {
      const { blob, width: outW, height: outH } = await compressImage(source.file, {
        width,
        height,
        keepAspect,
        quality,
        format,
      });
      clearResult();
      const previewUrl = URL.createObjectURL(blob);
      setResult({
        blob,
        previewUrl,
        width: outW,
        height: outH,
        name: outputFileName(source.file.name, format),
      });
    } catch {
      setError(isZh ? '压缩失败，请换一张图试试' : 'Compression failed. Try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.previewUrl;
    a.download = result.name;
    a.click();
  };

  const savedRatio = useMemo(() => {
    if (!source || !result) return null;
    const ratio = 1 - result.blob.size / source.file.size;
    return ratio;
  }, [source, result]);

  const formats: { value: OutputFormat; label: string }[] = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/webp', label: 'WebP' },
    { value: 'image/png', label: 'PNG' },
  ];

  return (
    <>
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-accent">
          <ImageIcon className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            {isZh ? '工具' : 'Tools'}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-light text-foreground">
          {isZh ? '图片压缩' : 'Image Compressor'}
        </h1>
        <p className="max-w-xl text-foreground/60">
          {isZh
            ? '在浏览器本地压缩、调整尺寸，图片不会上传。可拖拽到页面任意位置上传。'
            : 'Compress and resize images locally in your browser. Drop a file anywhere on the page to upload.'}
        </p>
      </div>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-3xl border-2 border-dashed border-accent bg-background/90 px-10 py-8 text-center shadow-lg">
            <Upload className="mx-auto mb-3 h-8 w-8 text-accent" />
            <p className="text-base font-medium text-foreground">
              {isZh ? '松开以上传图片' : 'Drop to upload image'}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {/* Dropzone */}
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex min-h-[11rem] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition-colors',
              dragging
                ? 'border-accent bg-accent/10'
                : 'border-border bg-background hover:border-accent/40 hover:bg-accent/5',
            )}
          >
            <Upload className="mb-3 h-7 w-7 text-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              {isZh ? '拖拽图片到这里，或点击选择' : 'Drop an image here, or click to choose'}
            </p>
            <p className="mt-1 text-xs text-foreground/45">JPG / PNG / WebP / GIF / BMP</p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_IMAGE_TYPES}
              className="hidden"
              onChange={(e) => {
                onPickFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}

          {/* Preview */}
          {(source || result) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {source && (
                <PreviewCard
                  title={isZh ? '原图' : 'Original'}
                  url={source.previewUrl}
                  meta={`${source.width}×${source.height} · ${formatBytes(source.file.size)}`}
                />
              )}
              {result ? (
                <PreviewCard
                  title={isZh ? '结果' : 'Result'}
                  url={result.previewUrl}
                  meta={`${result.width}×${result.height} · ${formatBytes(result.blob.size)}`}
                  highlight
                />
              ) : (
                <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-border bg-muted/40 text-sm text-foreground/40">
                  {isZh ? '压缩后预览将显示在这里' : 'Compressed preview appears here'}
                </div>
              )}
            </div>
          )}

          {result && savedRatio != null && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
              <span className="text-foreground/60">
                {isZh ? '体积变化' : 'Size change'}:{' '}
                <span
                  className={cn(
                    'font-medium',
                    savedRatio >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600',
                  )}
                >
                  {savedRatio >= 0 ? '−' : '+'}
                  {Math.abs(savedRatio * 100).toFixed(1)}%
                </span>
              </span>
              <span className="text-foreground/35">·</span>
              <span className="text-foreground/60">
                {formatBytes(source!.file.size)} → {formatBytes(result.blob.size)}
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-foreground px-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  {isZh ? '下载' : 'Download'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-background p-4 sm:sticky sm:top-28">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              {isZh ? '参数' : 'Settings'}
            </h2>
            {source && (
              <button
                type="button"
                onClick={clearSource}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-foreground/50 hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isZh ? '清除' : 'Clear'}
              </button>
            )}
          </div>

          <Field label={isZh ? '输出格式' : 'Format'}>
            <div className="grid grid-cols-3 gap-1.5">
              {formats.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  disabled={!source}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    'min-h-9 rounded-lg border text-xs font-medium transition-colors',
                    format === f.value
                      ? 'border-accent/40 bg-accent/12 text-foreground'
                      : 'border-border text-foreground/60 hover:border-accent/30',
                    !source && 'opacity-50',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label={
              format === 'image/png'
                ? isZh
                  ? '质量（PNG 无损，此项无效）'
                  : 'Quality (ignored for PNG)'
                : `${isZh ? '质量' : 'Quality'} ${Math.round(quality * 100)}%`
            }
          >
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              disabled={!source || format === 'image/png'}
              value={Math.round(quality * 100)}
              onChange={(e) => setQuality(Number(e.target.value) / 100)}
              className="w-full accent-[var(--color-accent,#9a8b7a)] disabled:opacity-40"
            />
          </Field>

          <Field label={isZh ? '缩放比例' : 'Scale'}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                disabled={!source}
                value={Math.min(100, scalePercent)}
                onChange={(e) => applyScale(Number(e.target.value))}
                className="min-w-0 flex-1 accent-[var(--color-accent,#9a8b7a)] disabled:opacity-40"
              />
              <span className="w-12 text-right font-mono text-xs text-foreground/60">
                {scalePercent}%
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={!source}
                  onClick={() => applyScale(p)}
                  className="rounded-md border border-border px-2 py-1 text-[11px] text-foreground/60 hover:border-accent/40 disabled:opacity-40"
                >
                  {p}%
                </button>
              ))}
            </div>
          </Field>

          <Field label={isZh ? '尺寸（像素）' : 'Size (px)'}>
            <div className="flex items-center gap-2">
              <NumberInput
                aria-label="width"
                disabled={!source}
                value={width}
                onChange={setWidthKeepAspect}
                suffix="W"
              />
              <button
                type="button"
                disabled={!source}
                title={isZh ? '锁定比例' : 'Lock aspect ratio'}
                onClick={() => setKeepAspect((v) => !v)}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
                  keepAspect
                    ? 'border-accent/40 bg-accent/12 text-foreground'
                    : 'border-border text-foreground/45',
                )}
              >
                {keepAspect ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
              </button>
              <NumberInput
                aria-label="height"
                disabled={!source}
                value={height}
                onChange={setHeightKeepAspect}
                suffix="H"
              />
            </div>
          </Field>

          <button
            type="button"
            disabled={!source || processing}
            onClick={() => void runCompress()}
            className={cn(
              'flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-opacity',
              source && !processing
                ? 'bg-foreground text-background hover:opacity-90'
                : 'bg-muted text-foreground/40',
            )}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {processing
              ? isZh
                ? '处理中…'
                : 'Processing…'
              : isZh
                ? '压缩并生成'
                : 'Compress'}
          </button>
        </aside>
      </div>
    </>
  );
};

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-foreground/55">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  disabled,
  suffix,
  'aria-label': ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  suffix: string;
  'aria-label'?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="number"
        min={1}
        aria-label={ariaLabel}
        disabled={disabled}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-8 font-mono text-sm text-foreground outline-none focus:border-accent/50 disabled:opacity-40"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-foreground/35">
        {suffix}
      </span>
    </div>
  );
}

function PreviewCard({
  title,
  url,
  meta,
  highlight,
}: {
  title: string;
  url: string;
  meta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-background',
        highlight ? 'border-accent/35' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
        <span className="text-xs font-medium text-foreground/70">{title}</span>
        <span className="font-mono text-[11px] text-foreground/45">{meta}</span>
      </div>
      <div className="flex min-h-[12rem] items-center justify-center bg-muted/30 p-3">
        <img
          src={url}
          alt={title}
          className="max-h-56 max-w-full object-contain"
        />
      </div>
    </div>
  );
}

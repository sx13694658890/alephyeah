import encodeJpeg from '@jsquash/jpeg/encode';
import decodeJpeg from '@jsquash/jpeg/decode';
import encodeWebp from '@jsquash/webp/encode';
import decodeWebp from '@jsquash/webp/decode';
import encodePng from '@jsquash/png/encode';
import decodePng from '@jsquash/png/decode';
import optimisePng from '@jsquash/oxipng/optimise';
import resize from '@jsquash/resize';

export type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png';

export type CompressOptions = {
  width?: number;
  height?: number;
  /** 0–1，JPEG/WebP 有效；PNG 走 oxipng */
  quality?: number;
  format?: OutputFormat;
  keepAspect?: boolean;
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function extensionForFormat(format: OutputFormat): string {
  if (format === 'image/webp') return 'webp';
  if (format === 'image/png') return 'png';
  return 'jpg';
}

export function outputFileName(originalName: string, format: OutputFormat): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-compressed.${extensionForFormat(format)}`;
}

export function resolveOutputSize(
  srcW: number,
  srcH: number,
  options: Pick<CompressOptions, 'width' | 'height' | 'keepAspect'>,
): { width: number; height: number } {
  const keepAspect = options.keepAspect !== false;
  let width = options.width;
  let height = options.height;

  if (!width && !height) {
    return { width: srcW, height: srcH };
  }

  if (keepAspect) {
    if (width && height) {
      const scale = Math.min(width / srcW, height / srcH);
      return {
        width: Math.max(1, Math.round(srcW * scale)),
        height: Math.max(1, Math.round(srcH * scale)),
      };
    }
    if (width) {
      return {
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round((srcH / srcW) * width)),
      };
    }
    return {
      width: Math.max(1, Math.round((srcW / srcH) * (height as number))),
      height: Math.max(1, Math.round(height as number)),
    };
  }

  return {
    width: Math.max(1, Math.round(width ?? srcW)),
    height: Math.max(1, Math.round(height ?? srcH)),
  };
}

/** 仅用于 GIF/BMP 等 jsquash 无原生解码器的格式：解码为 ImageData，不参与压缩编码 */
async function decodeViaBitmap(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas unsupported');
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

async function decodeToImageData(file: File): Promise<ImageData> {
  const buffer = await file.arrayBuffer();
  const type = file.type || '';

  try {
    if (type === 'image/jpeg' || type === 'image/jpg' || /\.jpe?g$/i.test(file.name)) {
      return await decodeJpeg(buffer);
    }
    if (type === 'image/webp' || /\.webp$/i.test(file.name)) {
      return await decodeWebp(buffer);
    }
    if (type === 'image/png' || /\.png$/i.test(file.name)) {
      return await decodePng(buffer);
    }
  } catch {
    // fall through to bitmap decode
  }

  return decodeViaBitmap(file);
}

async function encodeImageData(
  data: ImageData,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const q = Math.round(Math.min(100, Math.max(1, quality * 100)));

  if (format === 'image/jpeg') {
    const buf = await encodeJpeg(data, { quality: q });
    return new Blob([new Uint8Array(buf)], { type: 'image/jpeg' });
  }

  if (format === 'image/webp') {
    const buf = await encodeWebp(data, { quality: q });
    return new Blob([new Uint8Array(buf)], { type: 'image/webp' });
  }

  // PNG：先 rust png 编码，再用 oxipng 优化（Squoosh 同款）
  const raw = await encodePng(data);
  const optimised = await optimisePng(raw, { level: 2 });
  return new Blob([new Uint8Array(optimised)], { type: 'image/png' });
}

/**
 * 基于 jSquash（Google Squoosh WASM 编解码器）压缩：
 * MozJPEG / libwebp / rust-png + oxipng + WASM resize（非 canvas.toBlob）
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<{ blob: Blob; width: number; height: number }> {
  const format = options.format ?? 'image/jpeg';
  const quality = Math.min(1, Math.max(0.05, options.quality ?? 0.8));

  let imageData = await decodeToImageData(file);
  const target = resolveOutputSize(imageData.width, imageData.height, options);

  if (target.width !== imageData.width || target.height !== imageData.height) {
    imageData = await resize(imageData, {
      width: target.width,
      height: target.height,
      method: 'lanczos3',
      fitMethod: 'stretch',
      premultiply: true,
      linearRGB: true,
    });
  }

  const blob = await encodeImageData(imageData, format, quality);
  return { blob, width: imageData.width, height: imageData.height };
}

export const ACCEPT_IMAGE_TYPES =
  'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/jpg';

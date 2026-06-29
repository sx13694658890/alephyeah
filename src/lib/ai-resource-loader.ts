export const AI_RESOURCE_ERRORS = {
  manifest: '无法加载资源目录，请确认 public/ai-resources.json 可访问。',
  content: '无法读取文件内容，请确认 public 目录下对应文件存在。',
  network: '网络请求失败，请检查连接后重试。',
  unknown: '加载失败，请稍后重试。',
} as const;

export class AiResourceLoadError extends Error {
  readonly code: keyof typeof AI_RESOURCE_ERRORS;

  constructor(code: keyof typeof AI_RESOURCE_ERRORS, detail?: string) {
    super(detail ?? AI_RESOURCE_ERRORS[code]);
    this.name = 'AiResourceLoadError';
    this.code = code;
  }
}

export const resolveAiResourceError = (error: unknown): string => {
  if (error instanceof AiResourceLoadError) return error.message;
  if (error instanceof TypeError) return AI_RESOURCE_ERRORS.network;
  return AI_RESOURCE_ERRORS.unknown;
};

export const stripFrontmatter = (raw: string): string => {
  if (!raw.startsWith('---')) return raw;
  const end = raw.indexOf('---', 3);
  if (end === -1) return raw;
  return raw.slice(end + 3).trimStart();
};

const fetchPublicText = async (url: string): Promise<string> => {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new AiResourceLoadError(
      response.status === 404 ? 'content' : 'network',
      response.status === 404
        ? `${AI_RESOURCE_ERRORS.content}（${url}）`
        : `${AI_RESOURCE_ERRORS.network}（HTTP ${response.status}）`,
    );
  }
  return response.text();
};

let manifestCache: AiResourceManifest['resources'] | null = null;

interface AiResourceManifest {
  version: number;
  resources: Array<{
    id: string;
    title: string;
    description: string;
    category: 'prompts' | 'skills' | 'mcp';
    path: string;
  }>;
}

export const loadAiResourceManifest = async () => {
  if (manifestCache) return manifestCache;

  const raw = await fetchPublicText('/ai-resources.json');
  try {
    const data = JSON.parse(raw) as AiResourceManifest;
    if (!Array.isArray(data.resources)) {
      throw new AiResourceLoadError('manifest');
    }
    manifestCache = data.resources;
    return manifestCache;
  } catch {
    throw new AiResourceLoadError('manifest');
  }
};

const contentCache = new Map<string, string>();

export const loadAiResourceContent = async (path: string): Promise<string> => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (contentCache.has(normalized)) return contentCache.get(normalized)!;

  const raw = await fetchPublicText(normalized);
  const content = stripFrontmatter(raw);
  contentCache.set(normalized, content);
  return content;
};

/** 将 SKILL 内的相对路径解析为 public 绝对路径 */
export const resolveReferencePath = (basePublicPath: string, reference: string): string => {
  const ref = reference.trim();
  if (ref.startsWith('/')) return ref;

  const baseDir = basePublicPath.replace(/\/[^/]*$/, '');
  const segments = baseDir.split('/').filter(Boolean);

  for (const part of ref.split('/')) {
    if (part === '..') segments.pop();
    else if (part !== '.' && part.length > 0) segments.push(part);
  }

  return `/${segments.join('/')}`;
};

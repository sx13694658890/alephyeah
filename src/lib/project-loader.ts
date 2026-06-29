import type { ProjectItem, ProjectsManifest } from '../data/projects';

export const PROJECT_ERRORS = {
  manifest: '无法加载项目列表，请确认 public/projects.json 可访问。',
  network: '网络请求失败，请检查连接后重试。',
  unknown: '加载失败，请稍后重试。',
} as const;

export class ProjectLoadError extends Error {
  readonly code: keyof typeof PROJECT_ERRORS;

  constructor(code: keyof typeof PROJECT_ERRORS, detail?: string) {
    super(detail ?? PROJECT_ERRORS[code]);
    this.name = 'ProjectLoadError';
    this.code = code;
  }
}

export const resolveProjectError = (error: unknown): string => {
  if (error instanceof ProjectLoadError) return error.message;
  if (error instanceof TypeError) return PROJECT_ERRORS.network;
  return PROJECT_ERRORS.unknown;
};

let manifestCache: ProjectItem[] | null = null;

export const loadProjects = async (): Promise<ProjectItem[]> => {
  if (manifestCache) return manifestCache;

  const response = await fetch('/projects.json', { cache: 'no-cache' });
  if (!response.ok) {
    throw new ProjectLoadError(
      response.status === 404 ? 'manifest' : 'network',
      response.status === 404
        ? PROJECT_ERRORS.manifest
        : `${PROJECT_ERRORS.network}（HTTP ${response.status}）`,
    );
  }

  try {
    const data = (await response.json()) as ProjectsManifest;
    if (!Array.isArray(data.projects)) {
      throw new ProjectLoadError('manifest');
    }
    manifestCache = data.projects;
    return manifestCache;
  } catch (error) {
    if (error instanceof ProjectLoadError) throw error;
    throw new ProjectLoadError('manifest');
  }
};

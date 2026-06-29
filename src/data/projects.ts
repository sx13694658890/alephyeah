export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  pushedAt?: string | null;
}

export interface ProjectsManifest {
  version: number;
  source: string;
  username: string;
  syncedAt: string;
  activeWithinDays?: number;
  projects: ProjectItem[];
}

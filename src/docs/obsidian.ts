export interface ObsidianWikilink {
  target: string;
  alias: string;
}

export interface ObsidianNote {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  wikilinks: ObsidianWikilink[];
  notePath: string;
  dirPath: string;
}

export interface DirTreeNode {
  name: string;
  path: string;
  noteCount: number;
  children: DirTreeNode[];
}

export interface KnowledgeBaseManifest {
  version: number;
  source: string;
  vaultPath: string;
  syncedAt: string;
  notes: ObsidianNote[];
  dirTree: DirTreeNode;
}

export interface KnowledgeBaseState {
  manifest: KnowledgeBaseManifest | null;
  loading: boolean;
  error: string | null;
}

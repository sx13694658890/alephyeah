export type AiResourceCategory = 'prompts' | 'skills' | 'mcp';

export type AiResourceView = AiResourceCategory | 'all';

export interface AiResource {
  id: string;
  title: string;
  description: string;
  category: AiResourceCategory;
  /** public 目录下的访问路径，如 /skills/foo/SKILL.md */
  path: string;
}

export const AI_RESOURCE_CATEGORIES: {
  id: AiResourceCategory;
  label: string;
  emptyHint: string;
}[] = [
  { id: 'prompts', label: '提示词模版', emptyHint: '暂无提示词模版，请在 public/prompts 添加并更新 ai-resources.json。' },
  { id: 'skills', label: 'Skills', emptyHint: '暂无 Skills，请在 public/skills 添加并更新 ai-resources.json。' },
  { id: 'mcp', label: 'MCP', emptyHint: '暂无 MCP 配置，请在 public/mcps 添加并更新 ai-resources.json。' },
];

export const filterResourcesByView = (resources: AiResource[], view: AiResourceView) =>
  view === 'all' ? resources : resources.filter((r) => r.category === view);

export const getCategoryMeta = (view: AiResourceView) => {
  if (view === 'all') {
    return { label: 'AI 资源库', emptyHint: '暂无资源，请在 public 对应目录添加文件并更新 ai-resources.json。' };
  }
  const meta = AI_RESOURCE_CATEGORIES.find((c) => c.id === view);
  return meta ?? { label: view, emptyHint: '暂无内容。' };
};

import { Bot, FileText, Plug, Sparkles } from 'lucide-react';
import type { AiResourceCategory, AiResourceView } from '../../data/ai-resources';
import { cn } from '../../lib/cn';
import { UlCard3d } from '../ul-card-3d';

interface AiHubCardProps {
  onOpen: (view: AiResourceView) => void;
  className?: string;
}

const categoryActions: {
  category: AiResourceCategory;
  label: string;
  icon: typeof FileText;
}[] = [
  { category: 'prompts', label: '提示词模版', icon: FileText },
  { category: 'skills', label: 'Skills', icon: Bot },
  { category: 'mcp', label: 'MCP', icon: Plug },
];

export const AiHubCard = ({ onOpen, className }: AiHubCardProps) => {
  return (
    <div
      className={cn('flex w-full min-h-[300px] justify-center md:justify-start', className)}
      data-animate
      style={{ opacity: 0 }}
    >
      <UlCard3d
        variant="ai"
        className="ul-card-3d--fluid mx-auto w-full"
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-white/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#6b5d4f] dark:text-[#d4c5b5]">
              AI
            </span>
            AI 资源库
          </span>
        }
        text="收录提示词模版、Skills 与 MCP 配置。点击分类快速浏览，支持 Markdown 在线预览。"
        viewMoreLabel="浏览全部"
        onViewMore={() => onOpen('all')}
        logoIcon={<Sparkles className="h-5 w-5" strokeWidth={1.6} aria-hidden />}
        socialActions={categoryActions.map(({ category, label, icon: Icon }) => ({
          label,
          icon: <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />,
          onClick: () => onOpen(category),
        }))}
      />
    </div>
  );
};

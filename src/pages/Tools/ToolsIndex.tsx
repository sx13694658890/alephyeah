import { Link } from 'react-router-dom';
import { ArrowUpRight, Wrench } from 'lucide-react';
import { tools } from '../../data/tools';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';

export const ToolsIndex = () => {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';

  return (
    <>
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-accent">
          <Wrench className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            {isZh ? '工具' : 'Tools'}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-light text-foreground">
          {isZh ? '工具箱' : 'Toolbox'}
        </h1>
        <p className="max-w-xl text-foreground/60">
          {isZh
            ? '实用小工具合集。点进任意一项开始使用。'
            : 'A small set of practical utilities. Pick one to get started.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.href}
            className={cn(
              'group flex items-start gap-4 rounded-2xl border border-border bg-background p-5',
              'transition-[border-color,box-shadow,transform] duration-300',
              'hover:border-accent/30 hover:shadow-md active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent transition-colors group-hover:bg-accent/18">
              <tool.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-base font-medium text-foreground">
                  {isZh ? tool.titleZh : tool.title}
                </h2>
                <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/55">
                {isZh ? tool.descriptionZh : tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

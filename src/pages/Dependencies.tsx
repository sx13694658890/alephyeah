import { usePreferences } from '../context/PreferencesContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface DependencyItem {
  name: string;
  version: string;
  description: string;
  descriptionZh?: string;
  url?: string;
}

interface DependencyGroup {
  group: string;
  groupZh?: string;
  items: DependencyItem[];
}

const dependencies: DependencyGroup[] = [
  {
    group: 'Core Framework',
    groupZh: '核心框架',
    items: [
      { name: 'React', version: '^19.0.0', description: 'UI component library', url: 'https://react.dev' },
      { name: 'React Router', version: '^7.18.0', description: 'Client-side routing', url: 'https://reactrouter.com' },
      { name: 'TypeScript', version: '~5.7.0', description: 'Type-safe JavaScript', url: 'https://www.typescriptlang.org' },
    ],
  },
  {
    group: 'Build & Bundling',
    groupZh: '构建与打包',
    items: [
      { name: 'Rsbuild', version: '^2.0.9', description: 'Rspack-based build tool', url: 'https://rsbuild.dev' },
      { name: '@rsbuild/plugin-react', version: '^2.0.1', description: 'React JSX transform plugin', url: 'https://rsbuild.dev/plugins/list/react' },
      { name: 'Rspack', version: '^2.0.0', description: 'Rust-based bundler', url: 'https://rspack.dev' },
    ],
  },
  {
    group: 'Styling',
    groupZh: '样式',
    items: [
      { name: 'Tailwind CSS', version: '^4.3.0', description: 'Utility-first CSS framework', url: 'https://tailwindcss.com' },
      { name: '@iconify/tailwind4', version: '^1.2.3', description: 'Iconify integration for Tailwind v4', url: 'https://iconify.design' },
      { name: 'clsx + tailwind-merge', version: '^2.1.1 / ^3.0.2', description: 'Class merging utilities', url: 'https://github.com/lukeed/clsx' },
    ],
  },
  {
    group: 'Animation & 3D',
    groupZh: '动画与 3D',
    items: [
      { name: 'Anime.js', version: '^4.5.0', description: 'Lightweight animation library', url: 'https://animejs.com' },
      { name: '@react-three/fiber', version: '^9.6.1', description: 'React renderer for Three.js', url: 'https://docs.pmnd.rs/react-three-fiber' },
      { name: '@react-three/drei', version: '^10.7.7', description: 'Useful helpers for R3F', url: 'https://github.com/pmndrs/drei' },
      { name: 'Three.js', version: '^0.185.0', description: '3D graphics library', url: 'https://threejs.org' },
    ],
  },
  {
    group: 'Utilities',
    groupZh: '工具库',
    items: [
      { name: 'usehooks-ts', version: '^3.1.1', description: 'React hooks library', url: 'https://usehooks-ts.com' },
      { name: '@init-project/iconsvg', version: '1.0.3', description: 'Custom SVG icon set', url: '#' },
    ],
  },
  {
    group: 'Dev & Deployment',
    groupZh: '开发与部署',
    items: [
      { name: 'Wrangler', version: '^4.0.0', description: 'Cloudflare Workers CLI', url: 'https://developers.cloudflare.com/workers/wrangler' },
      { name: 'PostCSS', version: '^8.5.0', description: 'CSS post-processor', url: 'https://postcss.org' },
      { name: '@tailwindcss/postcss', version: '^4.3.0', description: 'Tailwind PostCSS plugin', url: 'https://tailwindcss.com' },
    ],
  },
];

/** 平时发现的好用开源 / 自托管项目（非本站依赖） */
const discoveredProjects: DependencyItem[] = [
  {
    name: 'Termix',
    version: 'OSS',
    description: 'Self-hosted SSH & remote desktop in the browser (terminal, SFTP, Docker, tunnels).',
    descriptionZh: '自托管 SSH / 远程桌面管理：浏览器终端、SFTP、Docker、隧道与主机监控。',
    url: 'https://termix.site/',
  },
];

export const Dependencies = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 90 });
  const { t, locale } = usePreferences();
  const isZh = locale === 'zh';

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          {t('dependencies.title')}
        </h1>
        <p className="max-w-xl text-foreground/60" data-animate style={{ opacity: 0 }}>
          {t('dependencies.subtitle')}
        </p>
      </div>

      <div className="space-y-10">
        <DependencyGroup
          group={{
            group: t('dependencies.discoveredTitle'),
            items: discoveredProjects.map((item) => ({
              ...item,
              version: t('dependencies.discoveredBadge'),
              description: isZh && item.descriptionZh ? item.descriptionZh : item.description,
            })),
          }}
        />

        {dependencies.map((group) => (
          <DependencyGroup
            key={group.group}
            group={{
              ...group,
              group: isZh && group.groupZh ? group.groupZh : group.group,
            }}
          />
        ))}
      </div>
    </>
  );
};

const DependencyGroup = ({ group }: { group: DependencyGroup }) => {
  const groupRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 50 });

  return (
    <div ref={groupRef}>
      <h2 className="mb-4 text-lg font-medium text-foreground" data-animate style={{ opacity: 0 }}>
        {group.group}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {group.items.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            data-animate
            style={{ opacity: 0 }}
            className="group flex min-h-[7.5rem] flex-col rounded-2xl border border-border bg-white/40 p-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/65 hover:shadow-[0_8px_24px_rgba(45,42,36,0.08)] active:scale-[0.98] dark:bg-white/5 dark:hover:bg-white/10 sm:min-h-[8.25rem] sm:p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground sm:text-[0.9375rem]">
                {item.name}
              </span>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none text-foreground/55">
                {item.version}
              </span>
            </div>
            <p className="mt-auto line-clamp-3 text-xs leading-relaxed text-foreground/50 sm:text-[13px]">
              {item.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

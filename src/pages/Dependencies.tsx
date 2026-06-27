import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface DependencyGroup {
  group: string;
  items: {
    name: string;
    version: string;
    description: string;
    url?: string;
  }[];
}

const dependencies: DependencyGroup[] = [
  {
    group: 'Core Framework',
    items: [
      { name: 'React', version: '^19.0.0', description: 'UI component library', url: 'https://react.dev' },
      { name: 'React Router', version: '^7.18.0', description: 'Client-side routing', url: 'https://reactrouter.com' },
      { name: 'TypeScript', version: '~5.7.0', description: 'Type-safe JavaScript', url: 'https://www.typescriptlang.org' },
    ],
  },
  {
    group: 'Build & Bundling',
    items: [
      { name: 'Rsbuild', version: '^2.0.9', description: 'Rspack-based build tool', url: 'https://rsbuild.dev' },
      { name: '@rsbuild/plugin-react', version: '^2.0.1', description: 'React JSX transform plugin', url: 'https://rsbuild.dev/plugins/list/react' },
      { name: 'Rspack', version: '^2.0.0', description: 'Rust-based bundler', url: 'https://rspack.dev' },
    ],
  },
  {
    group: 'Styling',
    items: [
      { name: 'Tailwind CSS', version: '^4.3.0', description: 'Utility-first CSS framework', url: 'https://tailwindcss.com' },
      { name: '@iconify/tailwind4', version: '^1.2.3', description: 'Iconify integration for Tailwind v4', url: 'https://iconify.design' },
      { name: 'clsx + tailwind-merge', version: '^2.1.1 / ^3.0.2', description: 'Class merging utilities', url: 'https://github.com/lukeed/clsx' },
    ],
  },
  {
    group: 'Animation & 3D',
    items: [
      { name: 'Anime.js', version: '^4.5.0', description: 'Lightweight animation library', url: 'https://animejs.com' },
      { name: '@react-three/fiber', version: '^9.6.1', description: 'React renderer for Three.js', url: 'https://docs.pmnd.rs/react-three-fiber' },
      { name: '@react-three/drei', version: '^10.7.7', description: 'Useful helpers for R3F', url: 'https://github.com/pmndrs/drei' },
      { name: 'Three.js', version: '^0.185.0', description: '3D graphics library', url: 'https://threejs.org' },
    ],
  },
  {
    group: 'Utilities',
    items: [
      { name: 'usehooks-ts', version: '^3.1.1', description: 'React hooks library', url: 'https://usehooks-ts.com' },
      { name: '@init-project/iconsvg', version: '1.0.3', description: 'Custom SVG icon set', url: '#' },
    ],
  },
  {
    group: 'Dev & Deployment',
    items: [
      { name: 'Wrangler', version: '^4.0.0', description: 'Cloudflare Workers CLI', url: 'https://developers.cloudflare.com/workers/wrangler' },
      { name: 'PostCSS', version: '^8.5.0', description: 'CSS post-processor', url: 'https://postcss.org' },
      { name: '@tailwindcss/postcss', version: '^4.3.0', description: 'Tailwind PostCSS plugin', url: 'https://tailwindcss.com' },
    ],
  },
];

export const Dependencies = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 90 });

  return (
    <>
      <div ref={titleRef} className="mb-12">
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          Dependencies
        </h1>
        <p className="max-w-xl text-foreground/60" data-animate style={{ opacity: 0 }}>
          The component ecosystem and tools this project depends on — documented for easy reference.
        </p>
      </div>

      <div className="space-y-10">
        {dependencies.map((group) => (
          <DependencyGroup key={group.group} group={group} />
        ))}
      </div>
    </>
  );
};

const DependencyGroup = ({ group }: { group: DependencyGroup }) => {
  const groupRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 60 });

  return (
    <div ref={groupRef}>
      <h2 className="mb-4 text-lg font-medium text-foreground" data-animate style={{ opacity: 0 }}>
        {group.group}
      </h2>
      <div className="space-y-2">
        {group.items.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            data-animate
            style={{ opacity: 0 }}
            className="flex items-center justify-between rounded-xl border border-border bg-white/40 px-5 py-3 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-white/60 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground/60">
                {item.version}
              </span>
            </div>
            <span className="text-sm text-foreground/50">{item.description}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

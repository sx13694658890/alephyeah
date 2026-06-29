export type TechItem = {
  name: string;
  icon: string;
  darkIcon?: string;
};

export const frontendSkills: TechItem[] = [
  { name: 'React', icon: '/tech/react.svg' },
  { name: 'TypeScript', icon: '/tech/typescript.svg' },
  { name: 'JavaScript', icon: '/tech/js.svg' },
  { name: 'Tailwind CSS', icon: '/tech/tailwindcss.svg' },
  {
    name: 'shadcn/ui',
    icon: '/tech/shadcn-ui-light.svg',
    darkIcon: '/tech/shadcn-ui-dark.svg',
  },
  { name: 'Three.js', icon: '/tech/motion.svg' },
  { name: 'HTML5', icon: '/tech/html5.svg' },
  {
    name: 'CSS',
    icon: '/tech/css3.svg',
    darkIcon: '/tech/css3-dark.svg',
  },
];

export const buildSkills: TechItem[] = [
  { name: 'Rsbuild', icon: '/tech/vite.svg' },
  { name: 'Rspack', icon: '/tech/vite.svg' },
  { name: 'pnpm', icon: '/tech/npm.svg' },
  { name: 'Anime.js', icon: '/tech/motion.svg' },
];

export const toolsSkills: TechItem[] = [
  { name: 'Git', icon: '/tech/git.svg' },
  {
    name: 'GitHub',
    icon: '/social/github.svg',
    darkIcon: '/social/github-dark.svg',
  },
  { name: 'Cloudflare', icon: '/tech/netlify.svg' },
  { name: 'NPM', icon: '/tech/npm.svg' },
  {
    name: 'Vercel',
    icon: '/tech/vercel-light.svg',
    darkIcon: '/tech/vercel-dark.svg',
  },
];

export const skillRows: {
  direction: 'left' | 'right';
  category: string;
  items: TechItem[];
}[] = [
  { direction: 'left', category: 'Frontend', items: frontendSkills },
  { direction: 'right', category: 'Build', items: buildSkills },
  { direction: 'left', category: 'Tools & Deploy', items: toolsSkills },
];

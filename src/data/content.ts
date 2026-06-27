export interface Project {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
}

export interface Doc {
  title: string;
  summary: string;
  date: string;
  tags: string[];
}

export interface Dependency {
  name: string;
  description: string;
  url: string;
  version?: string;
}

export const projects: Project[] = [
  {
    title: 'AlephYeah',
    description: 'Personal blog platform built with React, Rsbuild, and Tailwind CSS v4.',
    tags: ['React', 'Rsbuild', 'TypeScript', 'Tailwind CSS'],
    repo: '#',
    url: '#',
  },
  {
    title: 'HyperFrames',
    description: 'A composition framework for creating animated video content with HTML and GSAP.',
    tags: ['GSAP', 'HTML', 'Animation', 'Video'],
    url: '#',
    repo: '#',
  },
  {
    title: 'ICONSVG',
    description: 'Custom SVG icon system for design systems and component libraries.',
    tags: ['SVG', 'Design System', 'Icon'],
    repo: '#',
  },
];

export const documents: Doc[] = [
  {
    title: 'React + Rsbuild Project Setup Guide',
    summary: 'Step-by-step guide to setting up a modern React project with Rsbuild and Tailwind CSS v4.',
    date: '2025-06-01',
    tags: ['React', 'Rsbuild', 'Tutorial'],
  },
  {
    title: 'Tailwind CSS v4 Migration Notes',
    summary: 'Key changes and migration path from Tailwind v3 to v4, including CSS-first configuration.',
    date: '2025-05-15',
    tags: ['CSS', 'Tailwind', 'Migration'],
  },
  {
    title: 'TypeScript Best Practices for React',
    summary: 'Collection of TypeScript patterns and conventions used in this project.',
    date: '2025-04-20',
    tags: ['TypeScript', 'React', 'Best Practices'],
  },
  {
    title: 'Cloudflare Pages Deployment',
    summary: 'How to deploy a Rsbuild SPA to Cloudflare Pages with custom domain and proxy configuration.',
    date: '2025-03-10',
    tags: ['Cloudflare', 'Deployment', 'DevOps'],
  },
];

export const dependencies: Dependency[] = [
  {
    name: 'React',
    description: 'A JavaScript library for building user interfaces.',
    url: 'https://react.dev/',
    version: '^19.0.0',
  },
  {
    name: 'Rsbuild',
    description: 'The Rspack-based build tool for fast web development.',
    url: 'https://rsbuild.dev/',
    version: '^2.0.0',
  },
  {
    name: 'Tailwind CSS',
    description: 'A utility-first CSS framework for rapid UI development.',
    url: 'https://tailwindcss.com/',
    version: '^4.0.0',
  },
  {
    name: 'Three.js',
    description: 'A 3D library that makes WebGL simplified.',
    url: 'https://threejs.org/',
    version: '^0.185.0',
  },
  {
    name: 'Animate.css',
    description: 'A library of ready-to-use, cross-browser animations.',
    url: 'https://animate.style/',
    version: '^4.1.1',
  },
  {
    name: 'React Router',
    description: 'Declarative routing for React applications.',
    url: 'https://reactrouter.com/',
    version: '^7.18.0',
  },
  {
    name: 'usehooks-ts',
    description: 'A collection of React hooks written in TypeScript.',
    url: 'https://usehooks-ts.com/',
    version: '^3.1.1',
  },
  {
    name: 'Iconify',
    description: 'Unified icon framework with 100+ icon sets.',
    url: 'https://iconify.design/',
  },
  {
    name: 'Wrangler',
    description: 'Cloudflare Workers CLI tool for deployment.',
    url: 'https://developers.cloudflare.com/workers/wrangler/',
  },
];

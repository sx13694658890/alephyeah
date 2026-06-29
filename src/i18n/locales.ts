export type Locale = 'en' | 'zh';

export const LOCALE_STORAGE_KEY = 'alephyeah-locale';

export const messages = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      documents: 'Documents',
      dependencies: 'Dependencies',
      about: 'About',
      homeShort: 'Home',
      projectsShort: 'Work',
      documentsShort: 'Docs',
      dependenciesShort: 'Deps',
      aboutShort: 'About',
      main: 'Main navigation',
    },
    settings: {
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System',
      language: 'Language',
      langEn: 'EN',
      langZh: '中文',
    },
    home: {
      heroHello: 'Hello,',
      heroIm: "I'm",
      heroName: 'Aleph',
      heroSubtitle:
        'A space for projects, thoughts, and the tools I build along the way. Exploring the intersection of design, code, and craft.',
      aboutTitle: 'About This Space',
      aboutBody:
        'This is my personal corner of the web — a place to share what I am working on, document what I am learning, and keep track of the component ecosystem that powers my projects. Everything here is built with care and a touch of curiosity.',
      featuredTitle: 'Featured Work',
      projectAlephyeah:
        'Personal blog and portfolio built with React, Rsbuild, and TypeScript. A curated space for projects, documentation, and component references.',
      projectToolchain:
        'Shared Rsbuild configuration package supporting React targets. Layered config factory with hot reload, proxy, and environment injection.',
      projectDesign:
        'Component dependency management and version tracking for internal packages used across projects.',
    },
    projects: {
      title: 'Projects',
      subtitle: "Things I've built, contributed to, or spent too much time thinking about.",
      loading: 'Loading projects…',
      error: 'Failed to load projects. Please try again.',
      retry: 'Retry',
      noDescription: 'No description yet.',
    },
    documents: {
      title: 'Documents',
      subtitle: 'Notes, guides, and documentation — things worth writing down and sharing.',
    },
    dependencies: {
      title: 'Dependencies',
      subtitle:
        'The component ecosystem and tools this project depends on — documented for easy reference.',
    },
    about: {
      title: 'About',
      p1:
        "I'm a developer who enjoys building thoughtful, well-crafted tools and interfaces. This site is a reflection of that — a place where I can share projects, document what I learn, and keep track of the component ecosystem I work with.",
      p2:
        "I believe in simplicity without sacrifice. Good design doesn't need to shout, and good code doesn't need to be clever. It just needs to work, be maintainable, and leave room for the next thing you'll want to build.",
      skillsTitle: 'What I Work With',
      contactTitle: 'Get In Touch',
      contactBody:
        'Feel free to reach out if you want to collaborate, have questions, or just want to say hello.',
      skillTs: 'The foundation',
      skillReact: 'UI components',
      skillRsbuild: 'Build tooling',
      skillTailwind: 'Utility styling',
      skillThree: '3D visuals',
      skillCloudflare: 'Deployment',
    },
  },
  zh: {
    nav: {
      home: '首页',
      projects: '项目',
      documents: '文档',
      dependencies: '依赖',
      about: '关于',
      homeShort: '首页',
      projectsShort: '项目',
      documentsShort: '文档',
      dependenciesShort: '依赖',
      aboutShort: '关于',
      main: '主导航',
    },
    settings: {
      theme: '主题',
      themeLight: '亮色',
      themeDark: '暗色',
      themeSystem: '跟随系统',
      language: '语言',
      langEn: 'EN',
      langZh: '中文',
    },
    home: {
      heroHello: '你好，',
      heroIm: '我是',
      heroName: 'Aleph',
      heroSubtitle:
        '记录项目、思考与工具搭建的个人空间。探索设计、代码与手作之间的交集。',
      aboutTitle: '关于这个空间',
      aboutBody:
        '这是我网络上的个人角落——分享正在做的事、记录学到的东西，并整理项目所用的组件生态。一切都带着一点用心与好奇。',
      featuredTitle: '精选作品',
      projectAlephyeah:
        '基于 React、Rsbuild 与 TypeScript 的个人站点，汇集项目、文档与组件参考。',
      projectToolchain:
        '共享 Rsbuild 配置包，支持 React 目标，提供分层配置、热更新与代理注入。',
      projectDesign: '内部包的组件依赖管理与版本追踪。',
    },
    projects: {
      title: '项目',
      subtitle: '我做过、参与过，或反复琢磨过的事情。',
      loading: '加载项目中…',
      error: '项目列表加载失败，请重试。',
      retry: '重试',
      noDescription: '暂无描述。',
    },
    documents: {
      title: '文档',
      subtitle: '值得写下来并分享的笔记、指南与文档。',
    },
    dependencies: {
      title: '依赖',
      subtitle: '本项目依赖的组件生态与工具，便于查阅。',
    },
    about: {
      title: '关于',
      p1:
        '我是一名开发者，喜欢打造细致、好用的工具与界面。这个站点就是这种态度的延伸——分享项目、记录学习、整理组件生态。',
      p2:
        '我相信简洁不必牺牲品质。好的设计不必喧哗，好的代码也不必炫技——可靠、可维护，并为下一次迭代留出空间才最重要。',
      skillsTitle: '技术栈',
      contactTitle: '联系我',
      contactBody: '欢迎交流合作、提问或打个招呼。',
      skillTs: '类型基础',
      skillReact: '界面组件',
      skillRsbuild: '构建工具',
      skillTailwind: '样式体系',
      skillThree: '三维视觉',
      skillCloudflare: '部署发布',
    },
  },
} as const;

import type { ProjectItem } from './projects';

/** 线上正在运行的进行中项目（不随 Gitee sync 覆盖） */
export const activeProjects: ProjectItem[] = [
  {
    id: 'shaine-dashboard',
    title: 'Shaine Dashboard',
    description:
      'AIGC 相关工作台与控制台，覆盖创作与业务管理流程。',
    tags: ['AIGC', 'Dashboard', '进行中'],
    href: 'http://101.201.79.39/dashboard',
  },
  {
    id: 'mediacrawler-command-center',
    title: 'MediaCrawler',
    description:
      '多平台媒体数据采集指挥中心，爬取各大平台公开内容与数据。',
    tags: ['爬虫', '数据采集', '进行中'],
    href: 'http://101.201.79.39:3071/',
  },
];

export const activeProjectsEn: ProjectItem[] = [
  {
    id: 'shaine-dashboard',
    title: 'Shaine Dashboard',
    description: 'AIGC workspace and control panel for creation and operations.',
    tags: ['AIGC', 'Dashboard', 'In Progress'],
    href: 'http://101.201.79.39/dashboard',
  },
  {
    id: 'mediacrawler-command-center',
    title: 'MediaCrawler',
    description:
      'Command center for crawling public content across major media platforms.',
    tags: ['Crawler', 'Data', 'In Progress'],
    href: 'http://101.201.79.39:3071/',
  },
];

import antiCrawlerBasics from './anti-crawler-basics.md';
import engineeringSpec from './engineering-spec.md';
import proxyIpManagement from './proxy-ip-management.md';

import type { ProjectDocument } from '../types';

export type CrawlerDocument = ProjectDocument;

export const crawlerDocuments: CrawlerDocument[] = [
  {
    id: 'anti-crawler-basics',
    title: '反爬虫基础对抗',
    description:
      '服务端检测链路（UA、请求头、频率、Cookie）与各环节的识别特征与应对策略。',
    date: '2025',
    category: 'Technical',
    content: antiCrawlerBasics,
  },
  {
    id: 'engineering-spec',
    title: '工程化爬虫开发规范',
    description:
      '项目架构与目录结构、异常处理流程、HTTP 错误码分支、限流/风控/认证处理与重试、落库规范。',
    date: '2025',
    category: 'Technical',
    content: engineeringSpec,
  },
  {
    id: 'proxy-ip-management',
    title: '代理 IP 的使用与管理',
    description:
      '代理类型与选型、代理池架构设计、获取/检测/分配实现，以及与 httpx 爬虫集成的最佳实践。',
    date: '2025',
    category: 'Technical',
    content: proxyIpManagement,
  },
];

export const getCrawlerDocument = (id: string) =>
  crawlerDocuments.find((doc) => doc.id === id);

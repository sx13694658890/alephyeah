import antiCrawlerBasics from './anti-crawler-basics.md';
import engineeringSpec from './engineering-spec.md';

export interface CrawlerDocument {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}

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
];

export const getCrawlerDocument = (id: string) =>
  crawlerDocuments.find((doc) => doc.id === id);

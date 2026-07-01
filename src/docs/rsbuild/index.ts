import rsbuildConfig from './rsbuild-config.md';

import type { ProjectDocument } from '../types';

export const rsbuildDocument: ProjectDocument = {
  id: 'rsbuild-config',
  title: 'Rsbuild 项目构建配置',
  description:
    '基于 rsbuild.config.ts 的分层构建说明：共享工厂、入口覆盖、MD/GLSL 资源规则与 HTML 字体注入。',
  date: '2025',
  category: 'Technical',
  content: rsbuildConfig,
};

export const getRsbuildDocument = () => rsbuildDocument;

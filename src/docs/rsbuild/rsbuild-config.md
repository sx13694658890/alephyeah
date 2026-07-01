# Rsbuild 项目构建配置

> **官方文档**：[Rsbuild 介绍](https://rsbuild.rs/zh/guide/start/) — 由 Rspack 驱动的现代 Web 应用构建工具，提供快速构建体验与高度优化的产物。

本项目根目录的 `rsbuild.config.ts` 采用**分层配置**：先调用共享工厂 `config/` 生成基础配置，再通过 `mergeRsbuildConfig` 合并项目专属覆盖项。

---

## 完整配置源码

```typescript
import { mergeRsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import rsConfig from './config';

export default async () =>
  mergeRsbuildConfig(
    await rsConfig({
      framework: 'react',
      plugins: [pluginReact()],
      appName: 'AlephYeah',
      port: 3076,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
        },
      },
    }),
    {
      source: {
        entry: {
          index: './src/index.tsx',
        },
      },
      tools: {
        rspack: {
          module: {
            rules: [
              {
                test: /\.md$/,
                type: 'asset/source',
              },
              {
                test: /\.glsl$/,
                type: 'asset/source',
              },
            ],
          },
        },
      },
      html: {
        tags: [
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://fonts.googleapis.com',
            },
          },
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://fonts.gstatic.com',
              crossorigin: '',
            },
          },
          {
            tag: 'link',
            attrs: {
              rel: 'stylesheet',
              href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
            },
          },
        ],
      },
    },
  );
```

---

## 配置结构说明

### 1. 异步默认导出

```typescript
export default async () => mergeRsbuildConfig(...)
```

Rsbuild 支持异步配置函数，便于在构建启动时动态加载共享工厂或环境相关逻辑。

### 2. 共享工厂 `rsConfig({ ... })`

| 选项 | 值 | 作用 |
|------|-----|------|
| `framework` | `'react'` | 解析 React 目标，注入对应工具插件 |
| `plugins` | `[pluginReact()]` | 启用 JSX 转换与 Fast Refresh |
| `appName` | `'AlephYeah'` | HTML 标题与应用标识 |
| `port` | `3076` | 开发服务器端口（`pnpm dev` → `http://0.0.0.0:3076`） |
| `proxy['/api']` | `localhost:3000` | 将 `/api/*` 代理到本地后端，并自动 `changeOrigin: true` |

共享工厂位于 `config/rspack/index.ts`，还提供：

- 环境变量注入：`PUBLIC_`、`TANSTACK_`、`CLERK_`、`API_`、`MCP_`、`COMMIT_` 前缀
- 路径别名：`~/` → `./src`，`~~/` → `./`
- 开发体验：`lazyCompilation`、`progressBar`、`host: '0.0.0.0'`

### 3. 项目入口覆盖

```typescript
source: {
  entry: {
    index: './src/index.tsx',
  },
},
```

覆盖工厂默认的 `./src/index.ts`，挂载 React 根组件到 `#root`。

### 4. 资源 Loader 规则

```typescript
tools: {
  rspack: {
    module: {
      rules: [
        { test: /\.md$/, type: 'asset/source' },
        { test: /\.glsl$/, type: 'asset/source' },
      ],
    },
  },
},
```

| 扩展名 | 类型 | 用途 |
|--------|------|------|
| `.md` | `asset/source` | 以字符串形式导入 Markdown（文档预览、爬虫规范等） |
| `.glsl` | `asset/source` | 以字符串形式导入 GLSL Shader（如窗户雨特效 `rain.glsl`） |

配合 `src/env.d.ts` 中的模块声明，可在 TypeScript 中直接 `import content from './doc.md'`。

### 5. HTML 字体注入

通过 `html.tags` 在 `<head>` 注入 Google Fonts 预连接与 Inter 字体样式表，避免在 CSS 中 `@import` 阻塞渲染。

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 3076，热更新） |
| `pnpm build` | 生产构建，输出到 `dist/` |
| `pnpm deploy:cloudflare` | 构建并部署到 Cloudflare Pages |

---

## 延伸阅读

- [Rsbuild 快速上手](https://rsbuild.rs/zh/guide/start/quick-start)
- [Rsbuild 配置项总览](https://rsbuild.rs/zh/config/index)
- [Rspack 官方文档](https://rspack.rs/zh/)

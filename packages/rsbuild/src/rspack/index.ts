import type { ProxyOptions } from '@rsbuild/core';
import type { IBuildOptions } from '../config';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { aliasConfig, resolveFramework, resolveToolsPlugins } from '../config';

const { publicVars } = loadEnv({
  prefixes: ['PUBLIC_', 'TANSTACK_', 'CLERK_', 'API_', 'MCP_', 'COMMIT_'],
});

function buildProxy(proxy: IBuildOptions['proxy'] = {}): Record<string, ProxyOptions> {
  return Object.fromEntries(
    Object.entries(proxy).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, { target: value, changeOrigin: true }];
      }
      return [key, { changeOrigin: true, ...value }];
    }),
  );
}

export default async (options: IBuildOptions) => {
  const { baseUrl = '/', plugins = [], port = 3074, proxy = {} } = options;
  const framework = resolveFramework(options);
  const toolsPlugins = await resolveToolsPlugins(framework);

  return defineConfig({
    plugins: [...plugins],
    dev: {
      lazyCompilation: true,
      progressBar: true,
    },
    output: {
      assetPrefix: baseUrl,
      externals: {},
    },
    resolve: {
      alias: aliasConfig,
    },
    server: {
      host: '0.0.0.0',
      port,
      proxy: buildProxy(proxy),
    },
    source: {
      entry: {
        index: './src/index.ts',
      },
      define: {
        appName: JSON.stringify(options.appName),
        ...publicVars,
      },
    },
    html: {
      meta: {
        charset: {
          charset: 'UTF-8',
        },
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover',
      },
      title: options.appName,
    },
    performance: {
      buildCache: false,
      removeConsole: true,
    },
    tools: {
      rspack: {
        experiments: {
          nativeWatcher: true,
        },
        plugins: toolsPlugins,
      },
    },
  });
};

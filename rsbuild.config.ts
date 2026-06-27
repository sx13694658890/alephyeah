import { mergeRsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import rsConfig from '@init-project/rsbuild';

export default async () =>
  mergeRsbuildConfig(
    await rsConfig({
      framework: 'react',
      plugins: [pluginReact()],
      appName: 'galaxy-react',
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
    },
  );

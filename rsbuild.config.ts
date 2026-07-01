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

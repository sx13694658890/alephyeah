import AutoImport from 'unplugin-auto-import/rspack';

import type { Framework, VuePlatform } from './config';

export type { Framework, VuePlatform };

export const AutoImportConfig: (path: string) => Parameters<typeof AutoImport>[0] = (path) => ({
  dts: 'src/auto-imports.d.ts',
  dirsScanOptions: {
    filePatterns: [`${path}/**/*.{vue,ts,tsx,ts}`],
  },
});

export function resolveFramework(options: { framework?: Framework }): Framework | undefined {
  const fromOption = options.framework;
  const fromEnv = process.env.RSBUILD_FRAMEWORK as Framework | undefined;
  if (fromOption === 'vue' || fromOption === 'react') return fromOption;
  if (fromEnv === 'vue' || fromEnv === 'react') return fromEnv;
  return undefined;
}

export function resolvePlatform(options: { platform?: VuePlatform }): VuePlatform {
  const fromOption = options.platform;
  const fromEnv = process.env.RSBUILD_PLATFORM as VuePlatform | undefined;
  if (fromOption === 'web' || fromOption === 'h5') return fromOption;
  if (fromEnv === 'web' || fromEnv === 'h5') return fromEnv;
  return 'web';
}

export async function resolveToolsPlugins(framework?: Framework, platform: VuePlatform = 'web') {
  if (framework === 'vue') {
    const { createVueToolsPlugins } = await import('./vue.plugins');
    return createVueToolsPlugins(platform);
  }
  if (framework === 'react') {
    const { createReactToolsPlugins } = await import('./react.plugins');
    return createReactToolsPlugins();
  }
  return [];
}

export function ComponentsConfig() {
  return {
    dts: './src/components.d.ts',
  };
}

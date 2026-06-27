import type { Framework } from './config';

export type { Framework };

export function resolveFramework(options: { framework?: Framework }): Framework | undefined {
  const fromOption = options.framework;
  const fromEnv = process.env.RSBUILD_FRAMEWORK as Framework | undefined;
  if (fromOption === 'react') return fromOption;
  if (fromEnv === 'react') return fromEnv;
  return undefined;
}

export async function resolveToolsPlugins(framework?: Framework) {
  if (framework === 'react') {
    const { createReactToolsPlugins } = await import('./react.plugins');
    return createReactToolsPlugins();
  }
  return [];
}

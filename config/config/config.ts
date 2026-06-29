import type { ProxyOptions } from '@rsbuild/core';

export type Framework = 'react';

export interface IBuildOptions {
  baseUrl?: string;
  appName?: string;
  port?: number;
  proxy?: Record<string, ProxyOptions | NonNullable<ProxyOptions['target']>>;
  framework?: Framework;
}
export const aliasConfig: Record<string, string> = {
  '@': './src',
  '~': './src',
  '~~': './',
};

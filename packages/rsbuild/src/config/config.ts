import type { RsbuildPlugin, HtmlTagDescriptor, ProxyOptions } from '@rsbuild/core';

export type Framework = 'vue' | 'react';
export type VuePlatform = 'web' | 'h5';

export interface IBuildOptions {
  baseUrl?: string;
  appName?: string;
  port?: number;
  proxy?: Record<string, ProxyOptions | NonNullable<ProxyOptions['target']>>;
  plugins?: RsbuildPlugin[];
  /** 显式声明框架；未传时回退到环境变量 RSBUILD_FRAMEWORK */
  framework?: Framework;
  /** Vue 应用平台；未传时默认 web，可回退到环境变量 RSBUILD_PLATFORM */
  platform?: VuePlatform;
}
export const aliasConfig: Record<string, string> = {
  '~': './src',
  '~~': './',
};
export const tags: HtmlTagDescriptor[] = [
  { tag: 'script', attrs: { src: 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js' } },
  ...[{ tag: 'script', attrs: { src: 'https://wwcdn.weixin.qq.com/node/open/js/wecom-jssdk-2.3.3.js' } }],
  ...[{ tag: 'script', attrs: { src: 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js' } }],
];

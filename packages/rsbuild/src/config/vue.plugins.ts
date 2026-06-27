import type { VuePlatform } from './config';
import { createVueH5Plugins } from './vue.h5.plugins';
import { createVueSharedPlugins } from './vue.shared';
import { createVueWebPlugins } from './vue.web.plugins';

export function createVueToolsPlugins(platform: VuePlatform = 'web') {
  const platformPlugins = platform === 'h5' ? createVueH5Plugins() : createVueWebPlugins();
  return [...createVueSharedPlugins(), ...platformPlugins];
}

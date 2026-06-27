import AutoImport from 'unplugin-auto-import/rspack';
import VueRouterUnplugin, { VueRouterAutoImports } from 'vue-router/unplugin';

import { AutoImportConfig } from './plugin.config';

export function createVueSharedPlugins() {
  return [
    AutoImport({
      ...AutoImportConfig('/src'),
      imports: ['vue', VueRouterAutoImports],
      resolvers: [],
    }),
    VueRouterUnplugin.rspack({
      dts: 'src/route-map.d.ts',
      exclude: ['**/components/**/*'],
    }),
  ];
}

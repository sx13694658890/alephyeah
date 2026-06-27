import AutoImport from 'unplugin-auto-import/rspack';
import Components from 'unplugin-vue-components/rspack';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

import { AutoImportConfig } from './plugin.config';

export function createVueH5Plugins() {
  return [
    AutoImport({
      ...AutoImportConfig('/src'),
      imports: [
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
        },
      ],
      resolvers: [],
    }),
    Components({
      dts: 'src/components.d.ts',
      resolvers: [NaiveUiResolver()],
    }),
  ];
}

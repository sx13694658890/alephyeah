import Components from 'unplugin-vue-components/rspack';

export function createVueWebPlugins() {
  return [
    Components({
      dts: 'src/components.d.ts',
      resolvers: [],
    }),
  ];
}

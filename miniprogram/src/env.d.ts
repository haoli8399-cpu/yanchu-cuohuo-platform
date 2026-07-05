/// <reference types="@dcloudio/types" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@nutui/nutui' {
  import { App } from 'vue';
  const NutUI: { install: (app: App) => void };
  export default NutUI;
}

/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

import "vue-router"

declare module "vue-router" {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    role?: string
    permissions?: string[]
    keepAlive?: boolean
    hidden?: boolean
  }
}

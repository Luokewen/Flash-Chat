//环境变量的类型申明
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // 其他环境变量...
}

// 全局导入
interface ImportMeta {
  readonly env: ImportMetaEnv
}

//声明.vue文件模块
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

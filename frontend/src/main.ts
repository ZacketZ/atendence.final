import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { vPermission, vRole } from './directives/permission'
import { setupGlobalErrorHandler, handleError } from './utils/errors'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.directive('permission', vPermission)
app.directive('role', vRole)

app.config.errorHandler = (err, _instance, info) => {
  handleError(err)
  console.error('[Vue Error]', info, err)
}

setupGlobalErrorHandler()

app.mount('#app')

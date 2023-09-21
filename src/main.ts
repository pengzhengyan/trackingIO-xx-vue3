import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/index.less'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

let pinia = createPinia()
let app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
.use(router)
.use(pinia)
.use(ElementPlus)
.mount('#app')

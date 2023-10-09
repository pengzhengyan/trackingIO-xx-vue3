import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/index.less'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'virtual:svg-icons-register' // svg图标插件
import SvgIcon from '@/components/SvgIcon.vue'

let pinia = createPinia()
let app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
.use(router)
.use(pinia)
.use(ElementPlus)
.component('SvgIcon',SvgIcon)
.mount('#app')

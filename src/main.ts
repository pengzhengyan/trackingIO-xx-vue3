import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/index.less'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'virtual:svg-icons-register' // svg图标插件
// @ts-ignore
import globalComponent from '@/components' // 全局组件

let pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // pinia插件 解决页面刷新数据重置问题

let app = createApp(App)

// 注册el-icon全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
.use(router)
.use(pinia)
.use(ElementPlus)
.use(globalComponent)
.mount('#app')

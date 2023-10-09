// 引入需要的全局组件
import SvgIcon from './SvgIcon.vue'
const allGlobalComponent = {SvgIcon}
// 对外暴露插件对象
export default {
  // 这里的方法必须叫install
  // @ts-ignore
  install(app) {
    // 注册项目用到的全局组件
    Object.keys(allGlobalComponent).forEach((key) => {
      // @ts-ignore
      app.component(key, allGlobalComponent[key])
    })
  }
}
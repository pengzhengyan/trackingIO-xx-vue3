import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useConfig } from '@/pinia/config'
import { PageLayout } from '@/types/config'

let routes: RouteRecordRaw[] = [
    /** 主页 */
  {
    path: '/',
    name: 'main',
    redirect:'/login'
  },
  /** 登录页 */
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/Login.vue')
  },
  /** 选择应用页*/
  {
    path: '/applist',
    name: 'applist',
    component: () => import('@/pages/manage/Applist.vue')
  },
  /** 广告监测 */
  {
    path: '/monitor/dashboard',
    name: 'monitor-dashboard',
    component: () => import('@/pages/monitor/Dashboard.vue')
  },
  {
    path: '/monitor/campaigninfo',
    name: 'monitor-campaigninfo',
    component: () => import('@/pages/monitor/Campaigninfo.vue')
  },
  {
    path: '/monitor/advertisinginfoer',
    name: 'monitor-advertisinginfoer',
    component: () => import('@/pages/monitor/Advertisinginfoer.vue')
  },
  {
    path: '/monitor/keyword',
    name: 'monitor-keyword',
    component: () => import('@/pages/monitor/Keyword.vue')
  },
  {
    path: '/monitor/remarking',
    name: 'monitor-remarking',
    component: () => import('@/pages/monitor/Remarking.vue')
  },
  {
    path: '/monitor/effectevaluate',
    name: 'monitor-effectevaluate',
    component: () => import('@/pages/monitor/Effectevaluate.vue')
  },
  {
    path: '/monitor/roi',
    name: 'monitor-roi',
    component: () => import('@/pages/monitor/Roi.vue')
  },
  {
    path: '/monitor/asacampaigninfo',
    name: 'monitor-asacampaigninfo',
    component: () => import('@/pages/monitor/Asacampaigninfo.vue')
  },

  /** 行为分析 */
  {
    path: '/behavioranalysis/userengagement',
    name: 'behavioranalysis-userengagement',
    component: () => import('@/pages/behavioranalysis/Userengagement.vue')
  },
  {
    path: '/behavioranalysis/eventfunnel',
    name: 'behavioranalysis-eventfunnel',
    component: () => import('@/pages/behavioranalysis/Eventfunnel.vue')
  },
  {
    path: '/behavioranalysis/terminalproperties',
    name: 'behavioranalysis-terminalproperties',
    component: () => import('@/pages/behavioranalysis/Terminalproperties.vue')
  },

  /** 用户生命周期 */
  {
    path: '/userlifecycle/useroverview',
    name: 'userlifecycle-useroverview',
    component: () => import('@/pages/userlifecycle/Useroverview.vue')
  },
  {
    path: '/userlifecycle/channeloverview',
    name: 'userlifecycle-channeloverview',
    component: () => import('@/pages/userlifecycle/Channeloverview.vue')
  },
  {
    path: '/userlifecycle/backanalysis',
    name: 'userlifecycle-backanalysis',
    component: () => import('@/pages/userlifecycle/Backanalysis.vue')
  },

  /** 推广活动 */
  {
    path: '/manage/campaign',
    name: 'manage-campaign',
    component: () => import('@/pages/manage/Campaign.vue')
  },
  {
    path: '/manage/campgroup',
    name: 'manage-campgroup',
    component: () => import('@/pages/manage/Campgroup.vue')
  },

  /** 数据服务 */
  {
    path: '/dataservice/dataexport',
    name: 'dataservice-dataexport',
    component: () => import('@/pages/dataservice/Dataexport.vue')
  },
  {
    path: '/dataservice/reportdownload',
    name: 'dataservice-reportdownload',
    component: () => import('@/pages/dataservice/Reportdownload.vue')
  },
  {
    path: '/dataservice/logquery',
    name: 'dataservice-logquery',
    component: () => import('@/pages/dataservice/Logquery.vue')
  },

  /** 配置 */
  {
    path: '/config/channelmanage',
    name: 'config-channelmanage',
    component: () => import('@/pages/config/Channelmanage.vue')
  },
  {
    path: '/config/systemparam',
    name: 'config-systemparam',
    component: () => import('@/pages/config/Systemparam.vue')
  },

  /** 流量变现 */
  {
    path: '/trafficmonetization/trafficmonetizationper',
    name: 'trafficmonetization-trafficmonetizationper',
    component: () => import('@/pages/trafficmonetization/Trafficmonetizationper.vue')
  },

  /** 防作弊卫士 */
  {
    path: '/anticheatposition/anticheatpositioner',
    name: 'anticheatposition-anticheatpositioner',
    component: () => import('@/pages/anticheatposition/Anticheatpositioner.vue')
  },
]

let router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  let { changePageLayout } = useConfig()

  if (to.name === 'Login') {
    changePageLayout(PageLayout.FullScreen)
  } else if (to.name === 'applist') {
    changePageLayout(PageLayout.NotSidebar)
  }
  else changePageLayout(PageLayout.HasSidebar)
})

export default router

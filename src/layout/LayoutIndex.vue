<script setup lang="ts">
import { computed } from 'vue'
import { useConfig } from '@/pinia/config'
import { useUserInfo } from '@/pinia/userInfo'
import { useRouter, useRoute } from 'vue-router'
import { PageLayout } from '@/types/config'
import AppSelect from '@/components/AppSelect.vue'

type MenuItem = {
  text: string
  iconName?: string
  routeName?: string
  children?: MenuItem[]
}

let config = useConfig()
const userinfoStroe = useUserInfo()

let router = useRouter()
let route = useRoute()

let pageLayout = $computed(() => config.pageLayout)
let menuDefaultActiveIndex = $computed(() => {
  let routeName = route.name
  let index = ''

  for (let i = 0, length = sidebarMenu.length - 1; i <= length; i++) {
    let item = sidebarMenu[i]

    if (item.routeName === routeName) {
      index = i + ''
      continue
    }

    let childrenItems = item.children

    for (let _subI = 0, _subLength = childrenItems!.length - 1; _subI <= _subLength; _subI++) {
      let subItem = childrenItems![_subI]

      if (subItem.routeName === routeName) {
        index = i + '-' + _subI
        continue
      }
    }

    if (index) continue
  }

  return index
})

let sidebarMenu = $ref<MenuItem[]>([
  {
    text: '广告监测',
    iconName: 'icon-advertisement',
    children: [
      {
        text: '总览',
        routeName: 'monitor-dashboard',
      },
      {
        text: '推广活动详情',
        routeName: 'monitor-campaigninfo',
      },
      {
        text: '投放广告详情',
        routeName: 'monitor-advertisinginfoer',
      },
      {
        text: 'SEM推广详情',
        routeName: 'monitor-keyword',
      },
      {
        text: '再营销活动详情',
        routeName: 'monitor-remarking',
      },
      {
        text: '激活延迟分析',
        routeName: 'monitor-effectevaluate',
      },
      {
        text: '注收比',
        routeName: 'monitor-roi',
      },
      {
        text: 'ASA活动详情',
        routeName: 'monitor-asacampaigninfo',
      },
    ],
  },
  {
    text: '行为分析',
    iconName: 'icon-limits',
    children: [
      {
        text: '用户参与度',
        routeName: 'behavioranalysis-userengagement',
      },
      {
        text: '事件转化漏斗',
        routeName: 'behavioranalysis-eventfunnel',
      },
      {
        text: '终端属性',
        routeName: 'behavioranalysis-terminalproperties',
      },
    ],
  },
  {
    text: '用户生命周期',
    iconName: 'icon-lifecycle',
    children: [
      {
        text: '用户概览',
        routeName: 'userlifecycle-useroverview',
      },
      {
        text: '渠道概览',
        routeName: 'userlifecycle-channeloverview',
      },
      {
        text: '回流分析',
        routeName: 'userlifecycle-backanalysis',
      },
    ],
  },
  {
    text: '推广活动',
    iconName: 'icon-promotion-activity',
    children: [
      {
        text: '推广活动管理',
        routeName: 'manage-campaign',
      },
      {
        text: '推广活动组管理',
        routeName: 'manage-campgroup',
      },
    ],
  },
  {
    text: '数据服务',
    iconName: 'icon-data-services',
    children: [
      {
        text: '数据导出',
        routeName: 'dataservice-dataexport',
      },
      {
        text: '报表下载',
        routeName: 'dataservice-reportdownload',
      },
      {
        text: '日志查询',
        routeName: 'dataservice-logquery',
      },
    ],
  },
  {
    text: '配置',
    iconName: 'icon-configuration',
    children: [
      {
        text: '渠道配置',
        routeName: 'config-channelmanage',
      },
      {
        text: '应用配置',
        routeName: 'config-systemparam',
      },
    ],
  },
  {
    text: '流量变现',
    iconName: 'icon-cashflow',
    routeName: 'trafficmonetization-trafficmonetizationper',
    children: [],
  },
  {
    text: '防作弊卫士',
    iconName: 'icon-anti-cheating',
    routeName: 'anticheatposition-anticheatpositioner',
    children: [],
  },
])

/**
 * 处理菜单项选中
 * @param index 菜单项index绑定的值
 */
function handleMenuSelect(index: string) {
  let indexArray = index.split('-')
  let item = {} as MenuItem

  if (indexArray.length === 1) item = sidebarMenu[+index]
  else item = sidebarMenu[+indexArray[0]].children![+indexArray[1]]

  router.push({ name: item.routeName })
}

// avatar
const avatarSrc =
  'https://cimg.fx361.com/images/2019/05/15/qkimageswsblwsbl201903wsbl20190326-1-l.jpg'

/**
 * 处理选择应用组件的操作
 */
const applist = computed(() => userinfoStroe.applist)
const appid = computed(() => userinfoStroe.appSelected)
const selectChange = (value: string) => {
  userinfoStroe.reselectApp(value)
  // 注意：选择的appid值变更后，会回到dashboard
  router.push({ name: 'monitor-dashboard' })
  // 如果当前处在dashboard页面，则刷新页面
  if (route.name === 'monitor-dashboard') { router.go(0) }
}

</script>

<template>
  <template v-if="pageLayout === PageLayout.FullScreen">
    <router-view />
  </template>
  <template v-if="pageLayout === PageLayout.NotSidebar">
    <div class="Layout">
      <div class="main-container">
        <div class="header pd25">
          <div class="left">
            <div class="logo"
                 style="width: 128px;">
              <img src="@/assets/images/public/logo-copy.png" />
            </div>
          </div>
          <div class="right">
            <el-avatar :size="50"
                       :src="avatarSrc" />
          </div>
        </div>
        <div class="main-content"
             style="margin: 10px 0">
          <el-scrollbar class="pd25"
                        height="100%">
            <router-view />
          </el-scrollbar>
        </div>
      </div>
    </div>

  </template>
  <template v-if="pageLayout === PageLayout.HasSidebar">
    <div class="Layout">
      <div class="sidebar-container">
        <div class="logo">
          <img src="@/assets/images/public/logo-copy.png" />
        </div>
        <el-menu class="menu"
                 :default-active="menuDefaultActiveIndex"
                 active-text-color="#6b7aff"
                 @select="handleMenuSelect">
          <template v-for="(item, index) of sidebarMenu"
                    :key="index">
            <el-sub-menu v-if="item.children!.length"
                         :index="String(index)">
              <template #title>
                <i class="icon iconfont"
                   :class="item.iconName"></i>
                <span>{{ item.text }}</span>
              </template>
              <el-menu-item v-for="(subItem, subIndex) of item.children"
                            :key="subIndex"
                            :index="`${String(index)}-${String(subIndex)}`">
                {{ subItem.text }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item :index="String(index)"
                          v-else>
              <i class="icon iconfont"
                 :class="item.iconName"></i>
              <span>{{ item.text }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
      <div class="main-container">
        <div class="header">
          <div class="left">
            <AppSelect :options="applist"
                       :value='appid'
                       @selectChange="selectChange"></AppSelect>
          </div>
          <div class="right">
            <el-avatar :size="50"
                       :src="avatarSrc" />
          </div>
        </div>
        <div class="main-content "
             style="margin: 10px 0">
          <el-scrollbar height="100%"
                        class="pd25">
            <router-view />
          </el-scrollbar>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped lang="less">
.Layout {
  height: 100vh;
  display: flex;
  overflow: hidden;

  .sidebar-container {
    flex-shrink: 0;
    width: 184px;
    height: 100%;
    background-color: #fff;
    box-shadow: 0 8px 16px 0 #e5e6ed;
    z-index: 1;

    .logo {
      padding: 23px 0 20px;
      margin: 0 24px;
      border-bottom: 1px solid #e6e6e6;
    }

    :deep(.menu) {
      --el-menu-hover-bg-color: #f6f6f6;
      --el-menu-item-font-size: 13px;
      --el-menu-item-height: 40px;
      padding-top: 12px;
      border-right: none;

      .el-sub-menu,
      .el-menu-item {
        .icon {
          font-size: 14px;
          color: var(--el-menu-active-color);
          margin-right: 8px;
        }

        &:not(.is-active) {
          .icon {
            color: #babbc4;
          }
        }

        &.is-active {
          .el-sub-menu__title {
            color: var(--el-menu-active-color);
          }
        }
      }

      .el-sub-menu {
        .el-sub-menu__icon-arrow {
          right: 24px;
          color: #909399;
        }

        .el-menu {
          --el-menu-sub-item-height: 32px;
          --el-menu-item-font-size: 12px;

          .el-menu-item {
            margin: 4px 0;

            &.is-active {
              background-color: #f6f6f6;
            }
          }
        }
      }
    }
  }

  .main-container {
    width: 100%;
    flex-grow: 1;
    background-color: #f6f6f6;
    // overflow: auto;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 25px;

      .right {
        .user-avata {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #fff;
        }
      }
    }

    .main-content {
      width: 100%;
      position: relative;
      overflow: auto;
      height: calc(100vh - 72px);
      margin-top: 72px;

      .pd25 {
        padding: 0 25px;

      }
    }
  }
}
</style>

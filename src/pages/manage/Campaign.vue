<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfig } from '@/pinia/config'
import { useUserInfo } from '@/pinia/userInfo'
import ManagerTable from '@/components/ManagerTable.vue'
import MyTabbar from '@/components/MyTabbar.vue';
import { getActivity, getChannalList, getActivityById, addActivity } from '@/api'
import { ElMessage } from 'element-plus'


const router = useRouter()
const { changePromotionOption } = useConfig()
const useUserInfoStore = useUserInfo()
const reqConfig = computed(() => useUserInfoStore.reqConfig)
const username = computed(() => useUserInfoStore.loginId)
const pub = computed(() => useUserInfoStore.appSelected)
type Activity = {
  xaid: string;
  aname: string;
  curl: string;
  date: string;
  state: string;
  channel_id: string;
}
type Channel = { channelid: string, channelname: string }
let activityList = ref<Activity[]>([])
/** tabbar区 */
const tabList = [
  { key: '1', text: '分链接推广', label: '分链接推广' },
  { key: '2', text: 'ONELINK', label: 'ONELINK' },
]
const activeTab = ref('1')
const handleTab = (key: string) => {
  activeTab.value = key
}

/** 按钮区 */
const handelCratePromotion = () => {
  router.push({ name: 'manage-campaigndetail' })
  changePromotionOption(true)
}

/** 表格区 */
// 注意：需要新建后自动下载
// 表格的tab
const subtabList = [
  { key: '1', text: '常规渠道', label: '常规渠道' },
  { key: '2', text: '自定义渠道', label: '自定义渠道' },
  { key: '3', text: 'SEM渠道', label: 'SEM渠道' },
]
const activeSubtab = ref('1')
const handleSubtab = (key: string) => {
  activeSubtab.value = key
}

// 表格筛选区
let selectedState = ref('1')
const stateOptions = [
  { value: '1', label: '已启用的活动' },
  { value: '0', label: '已停用的活动' }
]
const selectedChannel = ref('')
const channels = ref<Channel[]>([])
const channelOptions = computed<Channel[]>(() =>
  channels.value.filter((channel: Channel) =>
    activityList.value.some((item) => item.channel_id === channel.channelid)
  )
)
// 表格主区
const tableData = computed(() => {
  return activityList.value.filter((item: Activity) =>
    selectedChannel.value === '' ?
      item.state === selectedState.value :
      item.state === selectedState.value && item.channel_id === selectedChannel.value
  )
})
const tableInfo = { id: 'activityTable', name: '监测短链' }
const propKey = [
  { text: '推广名称', key: 'aname', width: 180 },
  { text: '渠道', key: 'channel_id', width: 130 },
  { text: '点击监测短链', key: 'curl', width: 750 },
  { text: '创建时间', key: 'date', width: 200 },
  { text: '操作', key: 'state', width: 150 },
]

// 初始化页面
const initPage = async () => {
  const { data: data1 } = await getActivity(reqConfig.value)
  activityList.value = data1
  // console.log(activityList.value)

  const { data: data2 } = await getChannalList(reqConfig.value)
  channels.value = data2
  // console.log(channels.value)
}

/** 编辑活动 */
// 1.跳转编辑界面
const handelEditPromotion = (id: string) => {
  console.log(id)
  changePromotionOption(false, id)
  router.push({ name: 'manage-campaigndetail' })
}
// 2.直接修改状态
const editActivity = (id: string, state: boolean) => {
  getActivityById(JSON.stringify({ xaid: id })).then((res) => {
    if (res.data.length !== 1) return ElMessage.error('修改状态出错')
    const { aname, durl } = res.data[0]
    const type = 'update'
    const data = { state: state, aname, durl }
    const option = [{
      type,
      username: username.value,
      aname,
      pub: pub.value,
      data
    }]
    console.log(option)
    addActivity(JSON.stringify(option), reqConfig.value).then((res) => {
      console.log(res)
    })
  })
}

onBeforeMount(() => {
  initPage()
})
</script>

<template>
  <MyTabbar :list="tabList"
            :activeKey="activeTab"
            @change="(v) => handleTab(v)" />
  <div class="btn-tabbar">
    <el-button class="broadBtn"
               type="primary"
               @click="handelCratePromotion()">新建推广链接</el-button>
    <!-- <el-button class="broadBtn"
               type="primary"
               @click="handelEditPromotion('111')">编辑推广链接</el-button> -->
  </div>
  <ManagerTable :tableData='tableData'
                :tableInfo="tableInfo"
                :propKey="propKey"
                :handelSwitchChange="editActivity"
                :handelEditPromotion="handelEditPromotion">
    <template #topbar>
      <div class="sub-title">
        <div class="sub-title-lf">
          <MyTabbar :list="subtabList"
                    :activeKey="activeSubtab"
                    :style="{ fontSize: '14px', marginRight: '24px' }"
                    @change="(v) => handleSubtab(v)" />
        </div>
        <div class="sub-title-rg">
          <el-select class="my-select mr16"
                     v-model="selectedState">
            <el-option v-for="option in stateOptions"
                       :key="option.value"
                       :value="option.value"
                       :label="option.label" />
          </el-select>
          <el-select class="my-select"
                     placeholder="筛选渠道"
                     v-model="selectedChannel">
            <el-option v-for="option in channelOptions"
                       :key="option.channelid"
                       :label="option.channelname"
                       :value="option.channelid" />
          </el-select>
        </div>
      </div>
    </template>
  </ManagerTable>
</template>

<style scoped lang="less">
.btn-tabbar {
  margin-top: 24px;
}

.sub-title {
  margin-bottom: 10px;
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.mr16 {
  margin-right: 16px;
}
</style>

<script setup lang="ts">
import MyTabbar from '@/components/MyTabbar.vue'
import DateBar from '@/components/DateBar.vue'
import MetricsConfig from '@/components/MetricsConfig.vue'
import MyTable from '@/components/MyTable.vue'
import FilesSaver from '@/components/FilesSaver.vue'
import { getAsaData, getAsaList, login, getAsaMetrics } from '@/api/index.js'
import { ref, computed, onBeforeMount } from 'vue'
import { ElMessage } from 'element-plus'
import moment from 'moment'
import { useUserInfo } from "@/pinia/userInfo"
import { LOGIN_INFO } from '@/keys/storage'
import { useRouter } from 'vue-router'

const router = useRouter()
// 从store获取选中的应用
const userinfoStroe = useUserInfo()
const reqConfig = computed(() => userinfoStroe.reqConfig)
/**
 * type
 */
type metricsItem = {
  label: string
  children: metricsChildItem[]
}
type metricsChildItem = {
  text: string
  disabled: boolean
  checked: boolean
  key: string
}

type textKeyItem = {
  text: string
  key: string
}

/** tab 相关 */
let tabActiveKey = ref('0')
let tabActiveBar = computed(() => {
  return tabList.find((item) => item.key === tabActiveKey.value)
})
let tabList = [
  {
    key: '0',
    text: '日期',
    label: 'cdate',
  },
  {
    key: '1',
    text: '活动',
    label: 'orgid',
  },
  {
    key: '2',
    text: '活动组',
    label: 'campaignid',
  },
  {
    key: '3',
    text: '渠道',
    label: 'adgroupid',
  },
  {
    key: '4',
    text: '子渠道',
    label: 'keywordid',
  },
  {
    key: '5',
    text: '子帐号',
    label: 'adid',
  },
]
const tabbarClickHandle = (key: string) => {
  tabActiveKey.value = key
  requestAsaData()
}

/**
 * 日期组件相关内容
 */
// 选定的日期范围（默认为今日，与日期选择插件的默认值一致）
const today = Math.floor(Number(new Date(moment().format('YYYY/MM/DD'))) / 1000)
const datarange = ref([today, today])
// 从子组件接收选定的日期范围
const receiveDaterange = (date: Date[]) => {
  datarange.value = [Math.floor(Number(date[0]) / 1000), Math.ceil(Number(date[1]) / 1000)]
  // 更新日期范围后，从新请求一次asa数据
  setFilter()
  requestAsaData()
}

/**
 * 编辑指标相关
 */
let asaMectrics = ref<metricsItem[]>([])
let asaTextKey = ref<textKeyItem[]>([])
const initAsaMetrics = async () => {
  const { data } = await getAsaMetrics(reqConfig.value)
  data.forEach((item: metricsItem) => {
    item.children.forEach((sub: metricsChildItem) => {
      // 将子menu的text - key 存到 值键对数组，后面要用到
      asaTextKey.value.push({ text: sub.text, key: sub.key })
    })
  })
  asaMectrics.value = data
}
/**
 * 筛选框组相关内容
 */
// 定义筛选框内容
let filterGroups = ref([
  // { placeholder: '请选择转化类型',label:'', value:[], options: [] },
  // { placeholder: '请选择匹配类型',label:'', value:[], options: [] },
  { placeholder: '请选择渠道', label: 'orgid', value: [], options: [] },
  { placeholder: '请选择活动组', label: 'campaignid', value: [], options: [] },
  { placeholder: '请选择活动', label: 'adgroupid', value: [], options: [] },
  { placeholder: '请选择推广活动状态', label: 'keywordid', value: [], options: [] },
  { placeholder: '请选择筛选器模板', label: 'adid', value: [], options: [] },
  // { placeholder: '按广告活动组聚合日期数据',label:'', value:[], options: [] },
])

// 从服务端获取筛选框内容
const setFilter = async () => {
  const res = {
    cdate: datarange.value, // 日期[1693497500, 1694361600]
    type: 'asa'
  }
  const json = JSON.stringify(res)
  const { data } = await getAsaList(json, reqConfig.value)
  if (data.code) return ElMessage.error('group请求参数错误.')
  filterGroups.value.forEach((item) => {
    item.options = data[item.label].map((option: string) => Number(option))
  })
}
// 筛选框选定的内容
const chosenGroup = computed(() => {
  const obj: any = {}
  filterGroups.value.forEach((group) => {
    if (group.value.length > 0) {
      obj[group.label] = group.value
    }
  })
  return obj
})

const selectChangeHandle = () => {
  requestAsaData()
}
/**
 * 数据表格展示相关内容
 */
// 表格信息，用于导出表格和el-table第一列的数据显示
const tableInfo = {
  id: 'asaTable',
  name: 'asa活动详情',
}
// 表格数据内容
let asaData = ref([
  {
    actcount: '',
    cdate: '2023-09-01 00:00:00',
    loginimei: '3',
    newpayimeis: '0',
    newpaymoneybyimei: '0',
    paycount: '1',
    payimeis: '1',
    paymoney: '64800',
    regcount: '0',
    xhmoney: '0',
  },
])

// 表格选定的指标，通过向服务端请求获取
const checkedMetrics = ref<string[]>([])
// 表格选定指标的键值对
const propKey = computed((): any => {
  return checkedMetrics.value.map((key) => asaTextKey.value.find((item) => item.key === key))
})

// 从服务端获取表格内容
const requestAsaData = async () => {
  const head = tabActiveBar.value?.label
  const res = {
    head, //cdate:日期维度  orgid：广告活动组 adgroup：广告组 campaignid：广告活动 keywordid：关键字 adid：广告
    cdate: datarange.value, // 日期[1694948996, 1695035410]
    screen: chosenGroup.value, //下拉框筛选
    list: checkedMetrics.value, //编辑指标内容
    username: userinfoStroe.loginId,
    type: 'asa',
  }
  // 如果指标为空，则设定为一个基础值
  if (!res.list) res.list = ['actcount']
  const json = JSON.stringify(res)
  const { data } = await getAsaData(json, reqConfig.value)
  if (data.code && !Array.isArray(data)) return ElMessage.error('返回数据错误.')
  const lastItem = data.pop()
  data.unshift(lastItem)
  asaData.value = data
}
const initPage = () => {
  // 查看缓存(存了 token username password)
  const tokenJson = localStorage.getItem(LOGIN_INFO)
  if (!tokenJson) {
    ElMessage.error('登录失效，请重新登录')
    router.push({ name: 'Login' })
    return
  }
  const token = JSON.parse(tokenJson)
  // 请求数据指标数据
  initAsaMetrics()
  /** 请求select框组的数据*/
  setFilter()
  /** init选定的指标*/
  login(token.username, token.password).then((res: any) => {
    checkedMetrics.value = res.data.result.asacheck
    // 之后再请求表格数据
    requestAsaData()
  })
}
onBeforeMount(() => {
  initPage()
})
</script>

<template>
  <div class="Asacampaigninfo">
    <!-- tabbar区 -->
    <MyTabbar :list="tabList"
              :activeKey="tabActiveKey"
              @change="(key) => {
                tabbarClickHandle(key)
              }
                " />

    <!-- 日期组件在这儿 -->
    <div style="margin-top: 30px">
      <DateBar @sendDaterange="receiveDaterange" />
    </div>

    <!-- 指标 和 筛选框 -->
    <div style="margin-top: 25px; display: flex; flex-wrap: wrap; gap: 25px 15px">
      <!-- <el-button type="primary" style="height: 40px; border-radius: 8px; box-shadow: 0 4px 16px #e5e5ed;">编辑指标</el-button> -->
      <MetricsConfig title="编辑指标"
                     :requestAsaData="requestAsaData"
                     :metrics="asaMectrics"
                     :textKey="asaTextKey"
                     :fixedMetric="{ item: '转化总数', key: 'actcount' }"
                     v-model:checkedMetrics="checkedMetrics" />
      <el-button type="primary"
                 class="broadBtn">
        <el-icon>
          <Upload />
        </el-icon>
        批量上传
      </el-button>

      <el-select clearable
                 filterable
                 multiple
                 collapse-tags
                 collapse-tags-tooltip
                 style="width: 240px"
                 class="my-shadow-select"
                 v-for="Group in filterGroups"
                 :key="Group.label"
                 v-model="Group.value"
                 :placeholder="Group.placeholder"
                 @change="selectChangeHandle">
        <el-option v-for="option in Group.options"
                   :key="option"
                   :label="option"
                   :value="option" />
      </el-select>
    </div>

    <!-- 表格标题 及 下载按钮 -->
    <div class="bread-types">
      <div class="bread-left">
        <span>数据详情</span>
      </div>
      <div class="bread-right">
        <!-- 下载表格数据 -->
        <FilesSaver :datarange="datarange"
                    :tableInfo="tableInfo" />
      </div>
    </div>

    <!-- 表格区 -->
    <MyTable :tableData="asaData"
             :tableInfo="tableInfo"
             :tabActiveBar="tabActiveBar"
             :propKey="propKey" />
  </div>
</template>

<style scoped lang="less">
.Asacampaigninfo {
  .topBox {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex: auto;
  }

  .bread-types {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;

    .bread-left {
      span {
        font-size: 12px;
      }
    }
  }

  :deep(.el-select) {
    .el-select-tags-wrapper {
      .el-tag {
        background-color: #eff0ff;
        color: #2d2f4e;
      }
    }
  }
}
</style>

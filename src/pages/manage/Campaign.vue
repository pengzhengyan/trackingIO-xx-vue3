<script setup lang="ts">
import { ref, onBeforeMount, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useConfig } from '@/pinia/config'
import { useUserInfo } from '@/pinia/userInfo'
// ElConfigProvider 组件
import { ElConfigProvider, ElMessage } from 'element-plus'
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { FormRules, FormInstance, } from 'element-plus'
import MyTabbar from '@/components/MyTabbar.vue';
import { getActivity, getChannalList, addActivity } from '@/api'
import { exportExcel } from '@/utils/exportExcel.ts'
import { checkActivityName } from '@/utils/myFormRules'


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

/** 表格上方按钮和筛选区 */
// 1.新建推广链接
const handelCratePromotion = () => {
  router.push({ name: 'manage-campaigndetail' })
  changePromotionOption(true)
}

// 2.表格筛选按钮
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

// 3.批量操作按钮 及 弹出的dialog
// 控制dialog显示状态
const dialogFormVisible = ref(false)

// 批量操作表单内容
interface Form {
  type: string,
  isSelectAll: boolean,
  name: string,

}
const ruleFormRef = ref<FormInstance>()
const form = reactive<Form>({
  type: '',
  isSelectAll: false,
  name: '',
})
const isChangeName = computed<boolean>((): boolean => form.type === '3' && !form.isSelectAll)

// 表单校验规则
const rules = reactive<FormRules<Form>>({
  type: [
    { required: true, message: '必填', trigger: 'blur' },
  ],
  isSelectAll: [
    { required: true, message: '必填', trigger: 'blur' }
  ],
  name: [
    { validator: checkActivityName, required: true, trigger: 'blur' }
  ],
})
const currentChosenActivityName = computed(() => {
  const list: any[] = []
  selection.value.forEach((i) => { list.push(i.aname) })
  return list
})
// 批量操作按钮的提交
const handelSubmitMitiSelect = async (formEl: FormInstance | undefined) => {
  // 如果选择当前的数量为0
  if (!form.isSelectAll && selection.value.length === 0 || tableDataAll.value.length === 0) return ElMessage.error('没有数据可被操作')

  // 根据全选还是当前所选来确认操作的目标
  const target: Activity[] = form.isSelectAll ? tableDataAll.value : selection.value
  // 拿到当前需要进行开启还是停用
  const state = selectedState.value === '0' ? '1' : '0'

  if (!formEl) return
  await formEl.validate((valid) => {
    // 表格校验成功时的操作
    if (valid) {
      switch (form.type) {
        case '1':
          exportExcel(target, '推广链接')
          break;
        case '2':
          target.map((item: Activity) => {
            editActivity(item.xaid, state)
            item.state = state
            return item
          })
          break;
        case '3':
          target.map((item: Activity, index) => {
            // 修改本地
            item.aname = form.name + (index + 1)
            // 向服务端同步修改
            editActivityName(item.xaid, item.aname)
            return item
          })
          break;
        default:
          break;
      }
      // 关闭dialog
      dialogFormVisible.value = false
    } else {
      ElMessage.error('必填项不能为空')
    }
  })
}

// 修改活动名
const editActivityName = (id: string, aname: string) => {
  if (id === '') return ElMessage.error('修改的活动的id不存在')
  const type = 'update'
  const data = { aname }
  const option = [{
    type,
    xaid: id,
    username: username.value,
    pub: pub.value,
    data
  }]

  addActivity(JSON.stringify(option), reqConfig.value).then((res) => {
    res.data.code === 0 ? ElMessage.success(res.data.msg) : ElMessage.error(res.data.msg)
  })
}

/** 表格主区 */
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

// 批量选中
const selection = ref<Activity[]>([])
const handleSelectionChange = (val: Activity[]) => {
  selection.value = val
}

/* 表格主区*/
// 表格里所有的数据（不被分页影响）
const tableDataAll = computed(() => {
  return activityList.value.filter((item: Activity) =>
    selectedChannel.value === '' ?
      item.state === selectedState.value :
      item.state === selectedState.value && item.channel_id === selectedChannel.value
  )
})
// 表格里在分页后显示的数据
const tableData = computed(() => {
  const list = activityList.value.filter((item: Activity) =>
    selectedChannel.value === '' ?
      item.state === selectedState.value :
      item.state === selectedState.value && item.channel_id === selectedChannel.value
  )
  return list ? list.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value) : []
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)
const total = computed(() => tableDataAll.value.length)

const handleSizeChange = (val: number) => {
  pageSize.value = val
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 双击复制
const handleCopy = (curl: string) => {
  let save = function (e: any) {
    e.clipboardData.setData('text/plain', curl);
    e.preventDefault() //阻止默认行为
  }
  document.addEventListener('copy', save);//添加一个copy事件
  document.execCommand("copy")//执行copy方法
  ElMessage.success('复制成功')
}

// 初始化页面
const initPage = async () => {
  const { data: data1 } = await getActivity(reqConfig.value)
  activityList.value = data1

  const { data: data2 } = await getChannalList(reqConfig.value)
  channels.value = data2
}

/** 编辑活动 */
// 1.跳转编辑界面
const handelEditPromotion = (id: string) => {
  changePromotionOption(false, id)
  router.push({ name: 'manage-campaigndetail' })
}
// 2.直接修改状态
const editActivity = (id: string, state: string) => {
  if (id === '') return ElMessage.error('修改的活动的id不存在')
  const type = 'update'
  const data = { state: state }
  const option = [{
    type,
    xaid: id,
    username: username.value,
    pub: pub.value,
    data
  }]

  addActivity(JSON.stringify(option), reqConfig.value).then((res) => {
    res.data.code === 0 ? ElMessage.success(res.data.msg) : ElMessage.error(res.data.msg)
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
  <div class="table-content">
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
        <el-select class="my-select mr16"
                   placeholder="筛选渠道"
                   clearable
                   v-model="selectedChannel">
          <el-option v-for="option in channelOptions"
                     :key="option.channelid"
                     :label="option.channelname"
                     :value="option.channelid" />
        </el-select>
        <el-button class="broadBtn"
                   type="primary"
                   @click="dialogFormVisible = true">批量操作</el-button>

        <!-- 批量操作弹出框 -->
        <el-dialog v-model="dialogFormVisible"
                   title="批量操作">
          <el-form :model="form"
                   ref="ruleFormRef"
                   :rules="rules">
            <el-form-item label="选择批量操作类型"
                          label-width="140px"
                          prop="type">
              <el-select class="my-select width400"
                         v-model="form.type"
                         placeholder="选择批量操作类型">
                <el-option label="批量导出"
                           value="1" />
                <el-option :label="selectedState === '0' ? '批量启用' : '批量停用'"
                           value="2" />
                <el-option label="批量修改活动名称"
                           value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="选择数据范围"
                          label-width="140px"
                          prop="isSelectAll">
              <el-select class="my-select width400"
                         v-model="form.isSelectAll"
                         placeholder="选择数据范围">
                <el-option label="全部数据"
                           :value="true" />
                <el-option label="选中数据"
                           :value="false" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="isChangeName"
                          label="修改后字段"
                          label-width="140px"
                          prop="name">
              <el-input class="my-input width400"
                        v-model.trim="form.name"
                        placeholder="修改后字段" />
            </el-form-item>
            <el-form-item v-if="isChangeName"
                          label="所选活动名称"
                          label-width="140px">
              <span v-for="(name, i) in currentChosenActivityName"
                    :key="i"
                    style="margin-right: 15px; font-size: 12px;">{{ name }}</span>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogFormVisible = false">取消</el-button>
              <el-button type="primary"
                         @click="handelSubmitMitiSelect(ruleFormRef)">
                提交
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
    <el-table stripe
              fit
              max-height="450"
              :data="tableData"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection"
                       width="55" />
      <el-table-column label="序号"
                       width="55">
        <template #default="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="aname"
                       label="推广名称"
                       min-width="180" />
      <el-table-column prop="channel_name"
                       label="渠道"
                       min-width="130" />
      <el-table-column show-overflow-tooltip
                       prop="curl"
                       label="点击监测短链(双击复制)"
                       min-width="750">
        <template #default="{ row }">
          <span @dblclick="handleCopy(row.curl)">{{ row.curl }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="date"
                       label="创建时间"
                       min-width="200" />
      <el-table-column prop="state"
                       label="操作"
                       min-width="150">
        <template #default="{ row }">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 58px;">
            <el-tooltip content="编辑"
                        placement="top">
              <el-icon size="20"
                       @click="handelEditPromotion(row.xaid)">
                <Operation />
              </el-icon>
            </el-tooltip>
            <el-tooltip content="开启/停用"
                        placement="top">
              <el-switch size="small"
                         v-model="row.state"
                         active-value="1"
                         inactive-value="0"
                         @change="editActivity(row.xaid, row.state)" />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-config-provider :locale="zhCn">
        <el-pagination v-model:current-page="currentPage"
                       v-model:page-size="pageSize"
                       :page-sizes="[10, 20, 30, 50, 100]"
                       :small="small"
                       :disabled="disabled"
                       :background="background"
                       layout="total, sizes, prev, pager, next"
                       :total="total"
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange" />
      </el-config-provider>
    </div>
  </div>
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

.width400 {
  width: 400px;
}

:deep(.el-dialog) {
  border-radius: 8px;

  .el-form-item__label {
    font-size: 12px;
    color: #606266;
  }
}

.table-content {
  margin-top: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  -webkit-box-shadow: 0 8px 16px #e5e6ed;
  box-shadow: 0 8px 16px #e5e6ed;
  width: 100%;
  overflow: auto;

  .pagination-container {
    padding-top: 16px;
  }
}

:deep(.el-table) {
  font-size: 12px;

  thead {
    color: #2d2f4e;
  }

  color: #2d2f4e;
}

:deep(.el-pagination) {
  --el-pagination-font-size: 13px;
  display: flex;
  color: rgb(45, 47, 78);
  padding: 0px;
  white-space-collapse: collapse;
  text-wrap: nowrap;

  .el-pagination__sizes {
    text-align: left;
    flex: 1 1 0%;

    .el-input__wrapper {
      box-shadow: none;
      border: 1px solid #e5e5ed;
      height: 28px;

      .el-input__inner {
        height: 28px;
      }
    }
  }
}
</style>

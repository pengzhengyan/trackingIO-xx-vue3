<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfig } from '@/pinia/config'
import { useUserInfo } from '@/pinia/userInfo'
// ElConfigProvider 组件
import { ElConfigProvider, ElMessage } from 'element-plus'
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { getActivityGroup, addActivityGroup } from '@/api'


const router = useRouter()
const { changeCampgroupOption } = useConfig()
const useUserInfoStore = useUserInfo()
const reqConfig = computed(() => useUserInfoStore.reqConfig)
type Activity = {
  groupname: string;
  groupid: string;
  number: number;
  date: string;
  list: string[];
}

let activityList = ref<Activity[]>([])

/** 表格上方按钮和筛选区 */
// 1.新建推广链接
const handelCratePromotion = () => {
  router.push({ name: 'manage-campgroupdetail' })
  changeCampgroupOption(true)
}

// 2.表格筛选按钮
let selectedState = ref('')
const stateOptions = [
  { value: '0', label: '不筛选活动组类型' },
  { value: '1', label: '常规活动组' },
  { value: '2', label: '常规子活动组' },
  { value: '3', label: '再营销活动组' },
  { value: '4', label: '预约活动组' },
]
const keyWords = ref('')

/** 表格主区 */

// 批量选中
const selection = ref<Activity[]>([])
const handleSelectionChange = (val: Activity[]) => {
  selection.value = val
}

/* 表格主区*/
// 表格里所有的数据（不被分页影响）
const tableDataAll = computed(() => {
  return keyWords.value === '' ?
    activityList.value :
    activityList.value.filter((item) =>
      item.groupname.toLowerCase().includes(keyWords.value.toLowerCase())
    )
})
// 表格里在分页后显示的数据
const tableData = computed(() => {
  const list = keyWords.value === '' ?
    activityList.value :
    activityList.value.filter((item) =>
      item.groupname.toLowerCase().includes(keyWords.value.toLowerCase())
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

// 初始化页面
const initPage = async () => {
  const { data } = await getActivityGroup(reqConfig.value)
  activityList.value = data
}

/** 编辑活动 */
// 1.跳转编辑界面
const handelEditPromotion = (id: string) => {
  changeCampgroupOption(false, id)
  router.push({ name: 'manage-campgroupdetail' })
}
// 2.删除活动
const handelDelCampgroup = (id: string) => {
  const option = {
    type: 'del',
    groupid: id
  }
  const optionJson = JSON.stringify(option)
  addActivityGroup(optionJson, reqConfig.value).then((res) => {
    if (res.data.code !== 0) return ElMessage.error(res.data.msg)
    ElMessage.success(res.data.msg)
    initPage()
  })
}

onBeforeMount(() => {
  initPage()
})
</script>

<template>
  <h3>推广活动组管理</h3>
  <div class="sub-title btn-tabbar">
    <div class="sub-title-lf">
      <el-button class="broadBtn"
                 type="primary"
                 @click="handelCratePromotion()">新建推广活动组</el-button>
    </div>
    <div class="sub-title-rg">
      <el-select class="my-select mr16 width400"
                 v-model="selectedState"
                 placeholder="选择活动组类型">
        <el-option v-for="option in stateOptions"
                   :key="option.value"
                   :value="option.value"
                   :label="option.label" />
      </el-select>
      <el-input class="my-input"
                placeholder="输入搜索关键词"
                v-model="keyWords">
        <template #suffix>
          <el-icon size="20">
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>
  </div>
  <div class="table-content">
    <el-table stripe
              fit
              max-height="450"
              :data="tableData"
              @selection-change="handleSelectionChange">
      <el-table-column label="序号"
                       width="55">
        <template #default="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="groupname"
                       label="推广活动组名称"
                       min-width="180" />
      <el-table-column prop="number"
                       label="包含活动数量"
                       min-width="130" />
      <el-table-column show-overflow-tooltip
                       prop="curl"
                       label="推广活动组类型"
                       min-width="750">
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
                       @click="handelEditPromotion(row.groupid)">
                <Operation />
              </el-icon>
            </el-tooltip>
            <el-tooltip content="删除"
                        placement="top">
              <el-icon size="20"
                       @click="handelDelCampgroup(row.groupid)">
                <Delete />
              </el-icon>
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

  .sub-title-rg {
    display: flex;
  }
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

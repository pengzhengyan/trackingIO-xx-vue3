<script setup lang="ts">
import { ref, computed } from 'vue'
// ElConfigProvider 组件
import { ElConfigProvider, ElMessage } from 'element-plus'
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// type PropKey = {text:string; key:string}

const props = defineProps({
  tableData: {
    type: Array,
    default: [{
      xaid: '',
      aname: '',
      curl: '',
      date: '',
      state: '',
      channelid: '',
    },]
  },
  tableInfo: {
    type: Object,
    default: {
      id: 'tableID',
      name: 'tableName',
    }
  },
  tabActiveBar: {
    type: Object,
    default: { key: '1', label: 'cdate', text: '日期' }
  },
  propKey: {
    default: [{ text: '日期', key: 'cdate', width: 100 }]
  },
  handelSwitchChange: {
    type: Function,
    default: () => { }
  },
  handelEditPromotion: {
    type: Function,
    default: () => { }
  }
})
// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)
const total = computed(() => props.tableData.length)

const handleSizeChange = (val: number) => {
  pageSize.value = val
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleSelectionChange = () => { }

const handleCopy = (curl: string) => {

  // 双击复制
  let save = function (e: any) {
    e.clipboardData.setData('text/plain', curl);
    e.preventDefault() //阻止默认行为
  }
  document.addEventListener('copy', save);//添加一个copy事件
  document.execCommand("copy")//执行copy方法
  ElMessage.success('复制成功')
}

</script>

<template>
  <div class="table-content">
    <slot name="topbar">
    </slot>
    <el-table stripe
              fit
              max-height="450"
              :id="props.tableInfo.id"
              :data="props.tableData
                ? props.tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                : []
                "
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
                         @change="handelSwitchChange(row.xaid, row.state)" />
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
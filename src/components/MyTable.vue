<script setup lang="ts">
  import { ref, computed } from 'vue'
  // ElConfigProvider 组件
  import { ElConfigProvider } from 'element-plus'
  // 引入中文包
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

  const props = defineProps(['tableData', 'tableInfo', 'tabActiveBar', 'propKey'])

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
</script>

<template>
  <div class="table-content">
    <el-table
      stripe
      max-height="450"
      :id="props.tableInfo.id"
      :data="
        props.tableData
          ? props.tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          : []
      "
    >
      <el-table-column
        :prop="tabActiveBar?.label"
        :label="tabActiveBar?.text"
        width="180"
      />
      <el-table-column
        v-for="item in propKey"
        :key="item.key"
        :prop="item.key"
        :label="item.text"
      />
    </el-table>
    <div class="pagination-container">
      <el-config-provider :locale="zhCn">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50, 100]"
          :small="small"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
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

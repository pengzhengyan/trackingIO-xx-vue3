<script setup lang="ts">
import { ref, computed } from 'vue'
import FilesSaver from '@/components/FilesSaver.vue'
import { imgChart, imgTable, imgNodata } from '@/utils/base64'

type PropLabel = {
  prop: string
  label: string
}
interface Props {
  height?: number
  hasHeader?: boolean
  hasData: boolean
  tableId: string
  tablename?: string
  tableData?: any[]
  propLabel?: PropLabel[]
  datarange?: number[]
}
const props = withDefaults(defineProps<Props>(), {
  height: 320,
  hasHeader: false,
  hasData: false,
  tableId: 'myTable',
  tablename: 'myTable',
})
const isChart = ref(true)

// 表格开始
const chartWarpHeight = computed(() => props.height - 40)
// const chartHeight = computed(() => props.height - 60)
const tableHeight = computed(() => props.height - 95)
const rowStyles = () => {
  return { height: '10px' }
}

// 处理小数为百分比的方法
const formatNum = (_row: any, _column: any, cellValue: string) => {
  let n = Number(cellValue)
  if (n < 1 && n > 0) {
    return (n * 100).toFixed(2) + '%'
  } else {
    return cellValue
  }
}
</script>

<template>
  <div class="table-chart-container"
       :style="{ height: height + 'px' }">
    <div class="table-chart-body">
      <div class="chart-warp"
           :style="{ height: chartWarpHeight + 'px' }">
        <div v-show="hasData">
          <div class="style-icon"
               :style="{ 'background-image': isChart ? `url(${imgTable})` : `url(${imgChart})` }"
               @click="isChart = !isChart">
          </div>
          <div class="header-box"
               v-if="hasHeader"
               v-show="isChart">
            <slot name="header">
              <div>header</div>
            </slot>
          </div>
          <div class="chart-box"
               v-show="isChart">
            <slot name="chart">
              chart here
            </slot>
          </div>
          <div class="table-box"
               v-show="!isChart">
            <slot name="table">
              <el-table stripe
                        :id="tableId"
                        :maxHeight="tableHeight"
                        :row-style="rowStyles"
                        :data="tableData">
                <el-table-column v-for=" item  in  propLabel "
                                 :prop="item.prop"
                                 :label="item.label"
                                 :key="item.prop"
                                 :formatter="formatNum" />
              </el-table>
            </slot>
          </div>
          <div class="download">
            <FilesSaver :tableInfo="{ id: props.tableId, name: props.tablename }"
                        :datarange="props.datarange"></FilesSaver>
          </div>
        </div>
        <div class="nodata-txt"
             v-show="!hasData">
          <img :src="imgNodata"
               alt=""
               :style="{ marginTop: (chartWarpHeight * 0.3) + 'px', marginBottom: '10px' }">
          <p>暂无数据</p>
        </div>

      </div>
    </div>
  </div>
</template>


<style scoped lang="less">
.table-chart-container {
  background: #fff;
  border-radius: 8px;
  -webkit-box-shadow: 0 8px 16px #e5e6ed;
  box-shadow: 0 8px 16px #e5e6ed;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  position: relative;

  .table-chart-body {
    padding: 20px;

    .chart-warp {
      width: 100%;
      background: #fff;
      padding: 0 0 40px;

      // background-color: cornflowerblue;
      .nodata-txt {
        text-align: center;
        font-size: 12px;
      }

      .style-icon {
        position: absolute !important;
        top: 0;
        right: 0;
        width: 48px;
        height: 48px;
        z-index: 1;
        border-top-right-radius: 8px;
        cursor: pointer;
        background-size: 100%;
        background-repeat: no-repeat;
        background-image: linear-gradient(45deg, rgb(255, 255, 255) 50%, rgba(199, 199, 199, 0.38) 50%);
      }

      .header-box {
        display: block;
      }

      .chart-box {
        margin-left: -10px;
        width: 100%;
        height: 100%;
      }

      .table-box {
        padding-top: 30px;
        overflow-y: auto;

        :deep(.el-table) {
          font-size: 12px;

          thead {
            color: #2d2f4e;
          }

          color: #2d2f4e;
        }
      }

      .download {
        position: absolute;
        bottom: 15px;
        right: 15px;
        cursor: pointer;
        color: #9f9faa;
        font-size: 20px;
      }
    }
  }
}
</style>
<script setup lang="ts">
import { ref } from "vue"
import moment from 'moment'
/** 向父组件传日期 */
const emit = defineEmits(['sendDates'])

/**
 * data picker
 */

// datepicker内日期值
const today = new Date(moment().format('YYYY/MM/DD'))
const value1 = ref(today)
const value2 = ref(new Date(today.getTime() - 3600 * 1000 * 24))

const elDatePickerHandle = () => {
  emit('sendDates', [value1.value, value2.value])
}
</script>

<template>
  <div class="date-comparer">
    <div class="date-comparer-warp">
      <span class="demonstration">基础日期</span>
      <div class="el-date-picker-warp">
        <el-date-picker v-model="value1"
                        type="date"
                        placeholder="选择基础日期"
                        @change="elDatePickerHandle"></el-date-picker>
      </div>
      <span class="demonstration">对比日期</span>
      <div class="el-date-picker-warp">
        <el-date-picker v-model="value2"
                        type="date"
                        placeholder="选择对比日期"
                        @change="elDatePickerHandle"></el-date-picker>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.date-comparer {
  display: flex;

  .date-comparer-warp {
    display: flex;
    align-items: center;

    .demonstration {
      display: inline-block;
      font-size: 12px;
      color: #2d2f4e;
      margin-right: 10px
    }

    .el-date-picker-warp {
      background-color: #fff;
      box-shadow: 0 4px 16px #e5e5ed;
      border-radius: 8px;
      width: 220px;
      height: 40px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      margin-right: 20px;

      :deep(.el-date-editor) {
        .el-input__wrapper {
          box-shadow: none;

          .el-input__inner {
            font-size: 12px;
          }
        }
      }
    }
  }

}
</style>
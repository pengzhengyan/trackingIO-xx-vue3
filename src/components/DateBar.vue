<script setup lang="ts">
import { ref } from "vue"
import moment from 'moment'

/** 向父组件传日期 */
const emit = defineEmits(['sendDaterange'])

/**
 * data picker
 */

// datepicker内日期值
const today = new Date(moment().format('YYYY/MM/DD'))
const yesterday = new Date(today.getTime() - 3600 * 1000 * 24)
const pickedRange = ref<any>([today, today])

/**
 * 快捷日期按钮
 */
let dateItemActiveKey = ref('0')
let dateItems = [
  {
    key: '0',
    text: '今日'
  },
  {
    key: '1',
    text: '昨日',
  },
  {
    key: '2',
    text: '近7天',
  },
  {
    key: '3',
    text: '近14天',
  },
  {
    key: '4',
    text: '近30天',
  }
]
const quickDateBtnHandle = (key: string) => {
  // 如果点击的是激活的按钮，则不做任何处理
  if (dateItemActiveKey.value === key) return

  // 设置激活按钮
  dateItemActiveKey.value = key

  // 如果是昨天
  if (dateItemActiveKey.value === '1') {
    pickedRange.value = [yesterday, yesterday]
    // 向父组件更新日期
    emit('sendDaterange', pickedRange.value)
    return
  }
  let ranger = 0
  switch (key) {
    case "2":
      ranger = 6
      break;
    case "3":
      ranger = 13
      break;
    case "4":
      ranger = 29
      break;

    default: pickedRange.value = [new Date(), new Date()]
      break;
  }
  const start = new Date(today.getTime() - ranger * 24 * 3600 * 1000)
  const end = new Date(today.getTime() + 24 * 3600 * 1000)
  pickedRange.value = [start, end]
  // 向父组件更新日期
  emit('sendDaterange', pickedRange.value)
}
const elDatePickerHandle = () => {
  emit('sendDaterange', pickedRange.value)
}

</script>

<template>
  <div class="quickDate">
    <div class="radiogroup">
      <div class="date-item"
           :class="{ active: dateItemActiveKey === item.key }"
           v-for="item of dateItems"
           :key='item.key'
           @click='quickDateBtnHandle(item.key)'>
        {{ item.text }}
      </div>
    </div>
    <div class="right">
      <el-date-picker type="daterange"
                      v-model='pickedRange'
                      @change="elDatePickerHandle" />
    </div>
  </div>
</template>

<style scoped lang="less">
.quickDate {
  display: flex;

  .radiogroup,
  .right {
    background-color: #fff;
    box-shadow: 0 4px 16px #e5e5ed;
    border-radius: 8px;
  }

  .radiogroup {
    margin-right: 16px;
    display: flex;

    .date-item {
      cursor: pointer;
      font-size: 12px;
      padding: 12px 16px;
      border-radius: 8px;

      &.active {
        background-color: var(--el-color-primary);
        color: #fff;
      }
    }
  }

  .right {
    width: 220px;
    padding: 0 10px;
    display: flex;
    align-items: center;

    :deep(.el-date-editor) {
      width: 100%;
      box-shadow: none;

      .el-range-input {
        font-size: 12px;
      }
    }
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/**
 * type
 */
interface Option {
  key: string
  label: string
}

interface Props {
  data: Option[]
  titles: string[]
  modelValue: string[]
}

const props = defineProps<Props>()

const emits = defineEmits(['update:modelValue'])

// 双向绑定的选中的值的列表
const value = ref([''])

// 左右边搜索的关键词
const lfKeyWords = ref('')
const rgKeyWords = ref('')

// 左右列表显示的元素：左边筛选出不在选定列表中的元素，而右边筛选出在选中列表中的元素
const leftValue = computed(() => props.data.filter((item: Option) => !value.value.includes(item.key)))
const rightValue = computed(() => props.data.filter((item: Option) => value.value.includes(item.key)))

// 处理列表元素点击事件
const handleCheck = (key: string) => {
  // 查找被点击的元素，在选定值列表中的下标
  const index = value.value.findIndex((item) => item === key)
  // 如果下标大于-1，说明被点击元素在选定值列表中
  if (index > -1) {
    value.value.splice(index, 1)
    // 否则，说明被点击元素不在选定值列表中
  } else {
    value.value.push(key)
  }
  emits('update:modelValue', value.value)
}

// 处理清空事件
const handleClear = () => {
  value.value = []
  emits('update:modelValue', value.value)
}

const filterMethod = (query: string, item: any) => {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

watch(
  () => props.modelValue,
  (modelValue) => {
    value.value = modelValue
  }
)

</script>

<template>
  <div class="select-data">

    <!-- 左框 -->
    <div class="data-wrap lf">
      <div class="transfer-title">
        <div>
          <span>{{ titles[0] }}</span>
          <span>（{{ leftValue.length }}）</span>
        </div>
      </div>
      <div class="data-wrap-body">
        <slot name="transfer-body-search">
          <el-input class="my-input"
                    placeholder="输入搜索关键词"
                    v-model="lfKeyWords">
            <template #suffix>
              <el-icon size="20">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </slot>
        <ul class="transfer-body-list">
          <li v-for="item in leftValue"
              :key="item.key"
              v-show="filterMethod(lfKeyWords, item)"
              @click="handleCheck(item.key)">{{ item.label }}</li>
        </ul>
      </div>
      <div class="icon-transfer">
        <el-icon size="20"
                 color="gray">
          <Switch />
        </el-icon>
      </div>
    </div>

    <!-- 右框 -->
    <div class="data-wrap rg">
      <div class="transfer-title">
        <div>
          <span>{{ titles[1] }}</span>
          <span>（{{ rightValue.length }}）</span>
        </div>
        <div class="title-icon">
          <el-tooltip class="box-item"
                      effect="light"
                      :show-arrow="false"
                      content="清空"
                      placement="left">
            <el-icon size="16"
                     color="gray"
                     @click="handleClear">
              <Delete />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
      <div class="data-wrap-body">
        <slot name="transfer-body-search">
          <el-input class="my-input"
                    placeholder="输入搜索关键词"
                    v-model="rgKeyWords">
            <template #suffix>
              <el-icon size="20">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </slot>
        <ul class="transfer-body-list">
          <li v-for="item in rightValue"
              :key="item.key"
              v-show="filterMethod(rgKeyWords, item)"
              @click="handleCheck(item.key)">{{ item.label }}</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<style scoped lang="less">
.select-data {
  width: 100%;
  height: 400px;
  display: flex;

  .data-wrap {
    width: 400px;
    position: relative;

    .transfer-title {
      font-size: 13px;
      font-weight: 700;
      color: #2d2f4e;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title-icon {
        padding-left: 10px;
        cursor: pointer;
      }
    }

    .data-wrap-body {
      box-sizing: content-box;
      border: 1px solid #e6e6e6;
      opacity: 1;
      border-radius: 8px;
      height: 320px;
      padding: 15px;
      margin-top: 15px;

      .transfer-body-list {
        height: 265px;
        margin-top: 5px;
        overflow-y: auto;

        li {
          display: block;
          font-weight: 400;
          line-height: 16px;
          color: #2d2f4e;
          font-size: 12px;
          margin-top: 12px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;

          &:hover {
            color: #6b7aff;
          }
        }
      }
    }

    .icon-transfer {
      position: absolute;
      right: -24px;
      top: 50%;
    }
  }

  .rg {
    margin-left: 30px;
  }
}
</style>
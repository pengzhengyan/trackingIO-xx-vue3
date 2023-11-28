<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  titles: string[]
  data: string[]
  ratio: string[]
  hasArrow: boolean
}
const props = defineProps<Props>()
const arrows = computed<string[]>(() => {
  const list: string[] = ['', '']
  props.ratio.forEach((item, index) => {
    list[index] = Number(item) > 0 ? 'arrowup' : 'arrowdown'
  })
  return list
})
// 对数据进行处理
const formatData = (v: string): string => {
  let n = Number(v)
  if (n < 1000) {
    return n.toString()
  } else if (n < 10000) {
    return (n / 1000).toFixed(2) + 'K'
  } else {
    return (n / 10000).toFixed(2) + 'W'
  }
}

const formateTooltips = (v: string): string => Number(v).toFixed(0)
</script>

<template>
  <div>
    <div style="width: 100%;"
         class="main-card card-container">
      <div class="item lf">
        <p>{{ titles[0] }}</p>
        <el-tooltip placement="top-start"
                    :show-arrow="false"
                    :content="formateTooltips(data[0])">
          <h3 class="main-data"> {{ formatData(data[0]) }}</h3>
        </el-tooltip>
        <div class="ratio">
          环比
          <span>{{ ratio[0] }}%</span>
          <div v-if="hasArrow">
            <SvgIcon :name="arrows[0]" />
          </div>
        </div>
      </div>
      <div class="item rg">
        <p>{{ titles[1] }}</p>
        <el-tooltip placement="top-start"
                    :show-arrow="false"
                    :content="formateTooltips(data[1])">
          <h3 class="main-data"> {{ formatData(data[1]) }}</h3>
        </el-tooltip>
        <div class="ratio">
          环比
          <span>{{ ratio[1] }}%
          </span>
          <div v-if="hasArrow">
            <SvgIcon :name="arrows[1]" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="less">
.card-container {
  display: flex;

  .lf {
    border-right: 1px solid #eee;
  }

  .item {
    width: 50%;
    padding-left: 20px;
    color: #babbc4;
    font-size: 12px;

    .main-data {
      font-size: 24px;
      font-weight: 700;
      color: #6b7aff;
      padding: 6px 0;
    }

    .ratio {
      display: flex;
      align-items: baseline;

      span {
        color: #2d2f4e;
        padding-left: 5px;
      }
    }
  }
}
</style>
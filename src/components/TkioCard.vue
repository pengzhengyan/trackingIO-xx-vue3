<script setup lang="ts">
interface Props {
  title?: string
  subTitles?: string[]
  data?: string[]
}
withDefaults(defineProps<Props>(), {
  title: '核心指标趋势',
  subTitles: () => ['indicator1', 'indicator2', 'indicator3'],
  data: () => ['1111', '2222', '3333']
})

// 处理百分比、千和万显示的方法
const formatData = (v: string): string => {
  let n = Number(v)
  if (n < 1 && n > 0) {
    return (n * 100).toFixed(2) + '%'
  } else if (n < 1000) {
    return n.toString()
  } else if (n < 10000) {
    return (n / 1000).toFixed(2) + 'K'
  } else {
    return (n / 10000).toFixed(2) + 'W'
  }
}
</script>

<template>
  <div class="tkio-card">
    <p>{{ title }}</p>
    <el-row style="margin-top: 10px;">
      <el-col :span="8"
              v-for="(item, index) in subTitles ">
        <div class="sub-card">
          <p>{{ item }}</p>
          <span>{{ formatData(data[index]) }}</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="less">
.tkio-card {
  p {
    padding: 0;
    margin: 0;
    font-size: 14px;
    color: #2d2f4e;
    line-height: 30px;
  }

  .sub-card {
    display: block;

    p {
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      color: #8a8b98;
      text-align: center;
    }

    span {
      font-size: 20px;
      font-weight: 700;
      line-height: 26px;
      color: #6b7aff;
      text-align: center;
      display: block;
    }
  }
}
</style>
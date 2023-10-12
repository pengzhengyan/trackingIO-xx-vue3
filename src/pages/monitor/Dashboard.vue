<script setup lang="ts">
import DateBar from '@/components/DateBar.vue'
import DateComparer from '@/components/DateComparer.vue'
// import { useUserInfo } from '@/pinia/userInfo'
// import { computed } from 'vue'

// // 从store获取选中的应用
// const userinfoStroe = useUserInfo()
// const reqConfig = computed(() => userinfoStroe.reqConfig)

const receiveDaterange = (date: Date[]) => {
  console.log(date)
}
const receiveDates = (date: Date[]) => {
  console.log(date)
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 日期选择框 -->
    <DateBar @sendDaterange="receiveDaterange"></DateBar>

    <div class="title">数据概览</div>
    <el-row>
      <el-col :span="6"
              v-for="(i, index) in [1, 2, 3, 4]"
              :key="i"
              :class="index > 0 ? 'col-space-10' : ''">
        <el-card style="width: 100%;">
          <template #header>
            <div class="card-header">
              <span>页面制作中</span>
              <el-button class="button"
                         text>...</el-button>
            </div>
          </template>
          <div v-for="o in 4"
               :key="o"
               class="text item">
            {{ '测试 ' + o }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="title">趋势概览</div>
    <el-card style="width: 100%; height: 200px;"></el-card>

    <div class="title">日期对比</div>
    <DateComparer @sendDates="receiveDates"></DateComparer>

    <div class="title">核心指标效果</div>
    <div class="title">核心渠道效果</div>
  </div>
</template>

<style scoped lang="less">
// .dashboard-container {}

.title {
  font-size: 16px;
  margin-bottom: 20px;
  margin-top: 23px;
}

.col-space-10 {
  padding-left: 20px;
}
</style>

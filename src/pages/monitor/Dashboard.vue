<script setup lang="ts">
import DateBar from '@/components/DateBar.vue'
import DateComparer from '@/components/DateComparer.vue'
import DashBoardCard from '@/components/DashboardCard.vue'
import TableChart from '@/components/TableChart.vue'
import { getSumdata } from '@/api'
import { useUserInfo } from '@/pinia/userInfo'
import { ref, computed, onBeforeMount } from 'vue'
import moment from 'moment'

// 从store获取选中的应用
const userinfoStroe = useUserInfo()
const reqConfig = computed(() => userinfoStroe.reqConfig)

/**
 * 日期组件相关内容
 */
// 选定的日期范围（默认为今日，与日期选择插件的默认值一致）
const today = Math.floor(Number(new Date(moment().format('YYYY/MM/DD'))) / 1000)
const datarange = ref([today, today])
const receiveDaterange = (date: Date[]) => {
  console.log('start')
  datarange.value = [Math.floor(Number(date[0]) / 1000), Math.ceil(Number(date[1]) / 1000)]
  // 更新日期后，请求数据
  requestSumdata()

}
const receiveDates = (date: Date[]) => {
  console.log(date)
}

// 数据概览
const dashBoardCardData = ref([
  { titles: ['有效点击', '异常点击'], keys: ['click', ''], data: ['0', '0'], ratio: ['暂无', '暂无'], hasArrow: false },
  { titles: ['推广量', '自然量'], keys: ['tuiguang', 'ziran'], data: ['0', '0'], ratio: ['暂无', '暂无'], hasArrow: false },
  { titles: ['注册', '登录'], keys: ['regimei', 'loginimei'], data: ['0', '0'], ratio: ['暂无', '暂无'], hasArrow: false },
  { titles: ['付费金额', '付费设备数'], keys: ['paymoney', 'payimeis'], data: ['0', '0'], ratio: ['暂无', '暂无'], hasArrow: false },
])
// 请求数据概览中的数据
const requestSumdata = async () => {
  // 请求体，json格式
  const res = {
    cdate: datarange.value, // 日期[1694948996, 1695035410]
  }
  const json = JSON.stringify(res)
  // 返回的数据为一个数组
  // [{"click": null,"tuiguang": null,"ziran": "","regimei": "","loginimei": "","paymoney": "","payimeis": ""}]
  const { data } = await getSumdata(json, reqConfig.value)
  // 将数据存到dashBoardCardData
  dashBoardCardData.value.forEach((item) => {
    item.keys.forEach((key, index) => {
      // 如果没有数据，则设置为 '0'
      item.data[index] = data[0][key] ? data[0][key] : '0'
    })
  })
  // console.log(dashBoardCardData.value)
}

// 趋势概览
// const keyPropOfTrend = {
//   "cdate": '日期',
//   "actrate": '激活率',
//   "ziran": '自然量',
//   "tuiguang": '推广量',
//   "click": '有效点击',
//   "regimei": '注册',
//   "loginimei": '登录',
//   "paymoney": '付费金额',
//   "payimeis": '付费设备数'
// }

// 初始化页面
onBeforeMount(() => {
  requestSumdata()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 日期选择框 -->
    <DateBar @sendDaterange="receiveDaterange"></DateBar>

    <div class="title">数据概览</div>
    <el-row>
      <el-col :span="6"
              v-for="(item, index) in dashBoardCardData"
              :key="index"
              :class="index > 0 ? 'col-space-10' : ''">
        <DashBoardCard :titles="item.titles"
                       :data="item.data"
                       :ratio="item.ratio"
                       :hasArrow="item.hasArrow"></DashBoardCard>
      </el-col>
    </el-row>

    <div class="title">趋势概览</div>
    <TableChart :height="400"
                :chartId="'qushi'"
                :tableId="'qushiTable'" />

    <div class="title">日期对比</div>
    <DateComparer @sendDates="receiveDates"></DateComparer>
    <el-row class="mt20"
            style="margin-left: -7.5px; margin-right: -7.5px;">
      <el-col :span="12"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="320"
                    :chartId="'compareByDate1'"
                    :tableId="'compareTable1'" />
      </el-col>
      <el-col :span="12"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="320"
                    :chartId="'compareByDate2'"
                    :tableId="'compareTable2'" />
      </el-col>
    </el-row>

    <div class="title">核心指标效果</div>
    <el-row class="mt20"
            style="margin-left: -7.5px; margin-right: -7.5px;">
      <el-col :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="410"
                    :chartId="'coreMetric1'"
                    :tableId="'comreMetricTable1'" />
      </el-col>
      <el-col :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="410"
                    :chartId="'coreMetric2'"
                    :tableId="'comreMetricTable2'" />
      </el-col>
      <el-col :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="410"
                    :chartId="'coreMetric3'"
                    :tableId="'comreMetricTable3'" />
      </el-col>

    </el-row>
    <div class="title">核心渠道效果</div>
    <el-row class="mt20"
            style="margin-left: -7.5px; margin-right: -7.5px;">
      <el-col :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="430"
                    :chartId="'corePub1'"
                    :tableId="'corePubTable1'" />
      </el-col>
      <el-col :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="430"
                    :chartId="'corePub2'"
                    :tableId="'corePubTable2'" />
      </el-col>
      <el-col :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="430"
                    :chartId="'corePub3'"
                    :tableId="'corePubTable3'" />
      </el-col>

    </el-row>
  </div>
</template>

<style scoped lang="less">
.dashboard-container {

  .title {
    font-size: 16px;
    margin-bottom: 20px;
    margin-top: 23px;
  }

  .col-space-10 {
    padding-left: 20px;
  }

  .mt20 {
    margin-top: 20px;
  }

  .mb20 {
    margin-bottom: 20px;
  }
}
</style>

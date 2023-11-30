<script setup lang="ts">
import DateBar from '@/components/DateBar.vue'
import DateComparer from '@/components/DateComparer.vue'
import DashBoardCard from '@/components/DashboardCard.vue'
import TableChart from '@/components/TableChart.vue'
import { getSumdata, getOverview } from '@/api'
import { useUserInfo } from '@/pinia/userInfo'
import { ref, computed, onBeforeMount, onMounted, watch } from 'vue'
import moment from 'moment'
// 引入Echarts
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
// 数据集组件, 内置数据转换器组件 (filter, sort)
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LegendComponent } from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
// 系列类型的定义后缀都为 SeriesOption
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'
// 组件类型的定义后缀都为 ComponentOption
import type { TitleComponentOption, TooltipComponentOption, GridComponentOption, DatasetComponentOption, LegendComponentOption } from 'echarts/components'
import type { ComposeOption, } from 'echarts/core'
import { EChartsType } from 'echarts/types/dist/shared'
import MyTabbar from '@/components/MyTabbar.vue'

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
>
// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent
])

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
  datarange.value = [Math.floor(Number(date[0]) / 1000), Math.ceil(Number(date[1]) / 1000)]
  // 更新日期后，请求数据
  requestSumdata()
  requestTrend()
}
const receiveDates = (date: Date[]) => {
  console.log(date)
}

/**
 * 数据概览
 */
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

/**
 * 趋势概览
 */
const hasTrend = ref(true)
const keyPropOfTrend = [
  { prop: 'cdate', label: '日期' },
  { prop: 'ziran', label: '自然量' },
  { prop: 'tuiguang', label: '推广量' },
  { prop: 'click', label: '有效点击' },
  { prop: 'actrate', label: '激活率' },
]
//   // "regimei": '注册',
//   // "loginimei": '登录',
//   // "paymoney": '付费金额',
//   // "payimeis": '付费设备数'

type TrendData = {
  cdate: string
  actrate: string
  ziran: string
  tuiguang: string
  click: string
  regimei: string
  loginimei: string
  paymoney: string
  payimeis: string
}
const tableDataOfTrend = ref<TrendData[]>([
  {
    cdate: '',
    actrate: '',
    ziran: '',
    tuiguang: '',
    click: '',
    regimei: '',
    loginimei: '',
    paymoney: '',
    payimeis: '',
  },
])
// 当表格数据更新时，重新设置一下Echarts的option
watch(tableDataOfTrend, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    chartOfTrend.setOption(chartOptOfTrend.value)
  }
})

/**趋势预览Echarts从这里开始 */
// 存放趋势预览Echarts的变量
let chartOfTrend: EChartsType = null as unknown as EChartsType

// 设置趋势预览Echarts初始option
const chartOptOfTrend = ref<ECOption>(
  {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    yAxis: [
      {
        name: '激活量',
        type: 'value',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'gray',
            width: 0.3,
          }
        },
        axisLabel: {
          formatter: function (value) {
            return formatKW(value)
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['gray'],
            width: 0.3,
            type: [2, 2],
          }
        }
      },
      {
        name: '点击量',
        type: 'value',
        alignTicks: true,
        position: 'right',
        axisLabel: {
          formatter: function (value) {
            return formatKW(value)
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: 'gray',
            width: 0.3,
          }
        },
      },
      {
        name: '激活率',
        type: 'value',
        max: (value) => {
          const max = value.max + 0.1
          return max > 1 ? value.max : max
        },
        min: 0,
        alignTicks: true,
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: 'gray',
            width: 0.3,
          }
        },
        axisLabel: {
          formatter: function (value) {
            return (value * 100).toFixed(1) + '%'
          }
        },
        offset: 50,
      }
    ],
    xAxis: {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'gray',
          width: 0.3,
        }
      },
    },
    legend: { icon: 'circle', itemHeight: 7 },
    grid: { left: 50, right: 100 },
  }
)
// 根据请求到的新数据，重新的设置option的方法
const setChartOptOfTrend = (): void => {
  const tableData: TrendData[] = tableDataOfTrend.value
  const propLabel = keyPropOfTrend
  if (tableData.length === 0 || propLabel.length < 2) {
    hasTrend.value = false
  } else {
    hasTrend.value = true;
    // 设置xAxisData
    (chartOptOfTrend.value.xAxis as any).data = tableData.map((item) => item.cdate)

    // 设置legend
    const legendData = propLabel.map((item) => item.label)
    legendData.shift(); // 去掉'日期'
    (chartOptOfTrend.value.legend as any).data = legendData

    // 设置series
    const keys = propLabel.map((item) => item.prop)
    keys.shift() // 去掉'cdate'
    const series = [] as (BarSeriesOption | LineSeriesOption)[]
    keys.forEach((key: string, index) => {
      const dataList = tableData.map((item: any) => Number(item[key]))
      if (index < 3) {
        const seriesItem: BarSeriesOption | LineSeriesOption = {
          name: legendData[index],
          type: 'bar',
          barWidth: 10,
          yAxisIndex: index === 2 ? 1 : 0,
          data: dataList
        }
        series.push(seriesItem)
      } else {
        const seriesItem: BarSeriesOption | LineSeriesOption = {
          name: legendData[index],
          type: 'line',
          lineStyle: { width: 0.5 },
          smooth: true,
          symbol: 'circle',
          yAxisIndex: 2,
          data: dataList
        }
        series.push(seriesItem)
      }
    })
    chartOptOfTrend.value.series = series
  }
}

const requestTrend = async () => {
  // 请求体，json格式
  const res = {
    cdate: datarange.value, // 日期[1694948996, 1695035410]
  }
  const json = JSON.stringify(res)
  // 返回的数据为一个数组
  // [{"cdate": '',"actrate": '',"ziran": "", "tuiguang": '', "click": '', "regimei": "","loginimei": "","paymoney": "","payimeis": ""}]
  let { data } = await getOverview(json, reqConfig.value)
  if (data.code === -1) return hasTrend.value = false
  // 对数据中cdate进行格式处理
  data = data.map((item: any) => {
    let itemDate = (item as TrendData).cdate
    itemDate = moment(itemDate).format('YYYY-MM-DD')
    item.cdate = itemDate
    return item
  })
  // 将数据存到tableDataOfTrend
  tableDataOfTrend.value = data as TrendData[]
  setChartOptOfTrend()
}

/**
 * 日期对比
 */
// const hasCompared = ref(true)
// const keyPropOfCompared = [
//   { prop: 'cdate', label: '日期' },
//   { prop: 'ziran', label: '自然量' },
//   { prop: 'tuiguang', label: '推广量' },
//   { prop: 'click', label: '有效点击' },
//   { prop: 'actrate', label: '激活率' },
// ]

/**
 * 初始化页面
 */
onBeforeMount(() => {
  requestSumdata()
  requestTrend()
})

onMounted(() => {
  // if (!props.hasData) return
  chartOfTrend = echarts.init(document.getElementById('trendChart'))
})

// 处理千和万显示的方法
const formatKW = (n: number): string => {
  if (n < 1000) {
    return n.toString()
  } else if (n < 10000) {
    return (n / 1000).toFixed(1) + 'K'
  } else {
    return (n / 10000).toFixed(1) + 'W'
  }
}
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
                :hasData="hasTrend"
                :chartId="'Trend'"
                :tableId="'TrendTable'"
                :tablename="'趋势概览'"
                :datarange="datarange"
                :tableData="tableDataOfTrend"
                :propLabel="keyPropOfTrend">
      <template #chart>
        <div id="trendChart"
             :style="{ height: '360px' }"></div>
      </template>
    </TableChart>

    <div class="title">日期对比</div>
    <DateComparer @sendDates="receiveDates"></DateComparer>
    <el-row class="mt20">
      <el-col :span="12"
              class="mb20"
              style="padding-right: 7.5px;">
        <TableChart :height="320"
                    :hasData="false"
                    :hasHeader="true"
                    :chartId="'compareByDate1'"
                    :tableId="'compareTable1'">
          <template #header>
            <div :style="{ height: '30px' }">
              <MyTabbar></MyTabbar>
            </div>
          </template>
          <template #chart>
            <div id="dateComparer1"
                 :style="{ height: '260px' }"></div>
          </template>
        </TableChart>
      </el-col>
      <el-col :span="12"
              class="mb20"
              style="padding-left: 7.5px;">
        <TableChart :height="320"
                    :hasData="false"
                    :chartId="'compareByDate2'"
                    :tableId="'compareTable2'" />
      </el-col>
    </el-row>

    <!-- <div class="title">核心指标效果</div> -->
    <!-- <el-row class="mt20"
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

    </el-row> -->
    <!-- <div class="title">核心渠道效果</div> -->
    <!-- <el-row class="mt20"
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

    </el-row> -->
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

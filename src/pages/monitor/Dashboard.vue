<script setup lang="ts">
import DateBar from '@/components/DateBar.vue'
import DateComparer from '@/components/DateComparer.vue'
import DashBoardCard from '@/components/DashboardCard.vue'
import TableChart from '@/components/TableChart.vue'
import MyTabbar from '@/components/MyTabbar.vue'
import TkioCard from '@/components/TkioCard.vue'
import NodataCard from '@/components/NodataCard.vue'
import { getSumdata, getOverview, getCoreIndicators, getchanneldata } from '@/api'
import { useUserInfo } from '@/pinia/userInfo'
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import moment from 'moment'
// 引入Echarts
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
// 数据集组件, 内置数据转换器组件 (filter, sort)
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LegendComponent } from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
// 系列类型的定义后缀都为 SeriesOption
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
// 组件类型的定义后缀都为 ComponentOption
import type { TitleComponentOption, TooltipComponentOption, GridComponentOption, DatasetComponentOption, LegendComponentOption } from 'echarts/components'
import type { ComposeOption, } from 'echarts/core'
import { EChartsType } from 'echarts/types/dist/shared'


// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
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
  PieChart,
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
  reqCoreIndicatorsData()
}
const receiveDates = (_date: Date[]) => {
  // console.log(date)
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

/**趋势预览Echarts从这里开始 */
// 存放趋势预览Echarts的变量
let chartOfTrend: EChartsType = null as unknown as EChartsType

// 设置趋势预览Echarts 的 option
const optionOfChartTrend = computed<ECOption>(() => {
  const tableData: TrendData[] = tableDataOfTrend.value
  const propLabel = keyPropOfTrend
  const option: ECOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
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
        splitLine: { show: false },
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
        // max: (value) => {
        //   const max = value.max + 0.1
        //   return max > 1 ? 1 : max
        // },
        min: 0,
        // alignTicks: true,
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
            return formatKW(value)
          }
        },
        splitLine: { show: false },
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
  if (tableData.length === 0 || propLabel.length < 2) {
    hasTrend.value = false
  } else {
    hasTrend.value = true;
    // 设置xAxisData
    const xAxisData = tableData.map((item) => item.cdate)
      ; (option.xAxis as any).data = xAxisData

    // 设置legend
    const legendData = propLabel.map((item) => item.label)
    legendData.shift() // 去掉'日期'
      ; (option.legend as any).data = legendData

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
    option.series = series
  }
  return option
})

// 请求趋势数据、设置table数据、设置chart option的方法
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
  chartOfTrend.setOption(optionOfChartTrend.value)
}
/**
 * 核心指标效果
 */
type IndicatorData = {
  cdate?: string
  tuiguang: string
  ziran: string
  total: string
}
// 定义数组，存放三个核心指标的名字
const indicators = ['reg', 'retention', 'pay']
const indicatorsChartIds = ['regChart', 'retentionChart', 'payChart']
// 表、图中所用到的键值对
const keyLabelsOfIndicators = [
  { prop: 'cdate', label: '日期' },
  // { prop: 'total', label: '合计/均值' },
  { prop: 'tuiguang', label: '推广量' },
  { prop: 'ziran', label: '自然量' }
]
// 核心指标card的文本数据
const tkioCardsText = [
  { title: '注册趋势', subtitles: ['注册总数', '推广量', '自然量'] },
  { title: '次日留存趋势', subtitles: ['留存均值', '推广量', '自然量'] },
  { title: '付费趋势', subtitles: ['付费总值', '推广量', '自然量'] }
]
const dailyDataIndicators = ref<IndicatorData[][]>([[{ cdate: '', tuiguang: '0', ziran: '0', total: '0' }]])
// 用于存放所有日期汇总的核心指标的数据
const sumdataIndicators = ref<IndicatorData[]>([{ tuiguang: '0', ziran: '0', total: '0' }])
// 从sumdataIndicators数组中，按total\tuiguang\ziran顺序取出对应的值组成新的数组，用于指标卡片
const tkioCardsData = computed(() => sumdataIndicators.value.map((item) => {
  return [item.total, item.tuiguang, item.ziran]
}))
/**核心指标的Echarts */
let chartOfIndicator: EChartsType[] = [] as unknown as EChartsType[]
// 计算options
const optionsOfIndicator = computed<ECOption[]>(() => {
  const options: ECOption[] = [] as ECOption[]
  // 设置legend data
  const legendData = keyLabelsOfIndicators.map((item) => item.label)
  legendData.shift()
  // 设置xAxis data
  const xAxisData = dailyDataIndicators.value[0].map((data) => data.cdate as string)
  dailyDataIndicators.value.forEach((dataList, index) => {
    // 设置series
    const keys = keyLabelsOfIndicators.map((item) => item.prop)
    keys.shift() // 去掉'cdate'
    const series = [] as (BarSeriesOption | LineSeriesOption)[]
    keys.forEach((key: string, index) => {
      const seriesItemData = dataList.map((item: any) => Number(item[key]))
      const seriesItem: BarSeriesOption | LineSeriesOption = {
        name: legendData[index],
        type: 'line',
        lineStyle: { width: 0.8 },
        smooth: true,
        symbol: seriesItemData.length > 1 ? 'none' : 'circle',
        data: seriesItemData
      }
      series.push(seriesItem)
    })
    const option: ECOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      yAxis: [
        {
          type: 'value',
          // alignTicks: true,
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
        data: xAxisData
      },
      series,
      legend: { icon: 'circle', itemHeight: 7, data: legendData, bottom: 5 },
      grid: { left: 50, right: 0 },
    }
    // 将option存入数组中备用
    options[index] = option
  })
  return options
})
/**处理请求到的核心指标数据的方法 */
const reqCoreIndicatorsData = async () => {
  // 请求体，json格式
  const res = {
    cdate: datarange.value, // 日期[1694948996, 1695035410]
  }
  const json = JSON.stringify(res)
  const { data } = await getCoreIndicators(json, reqConfig.value)
  // 遍历indicators = ['reg', 'retention', 'pay']
  indicators.forEach((key: string, index) => {
    // 根据每个key，将key对应的数组中的最后一个元素（IndicatorData 类型）拿出，放到sumdataIndicators里
    sumdataIndicators.value[index] = data[key].pop()
    // 其它的元素均放到dailyData里
    dailyDataIndicators.value[index] = data[key].map((item: IndicatorData) => {
      // 对cdate进新重新格式化
      let itemDate = item.cdate
      itemDate = moment(itemDate).format('YYYY-MM-DD')
      item.cdate = itemDate
      return item
    })
  })
  // 对核心指标的3个chart设置option
  chartOfIndicator.forEach((chart: EChartsType, index) => {
    chart.setOption(optionsOfIndicator.value[index] as ECOption)
  })

}

/**
 * 核心渠道数据对比
 */
type PubData = {
  name: string
  value: number
}
// 渠道对比的指标项
const pubIndicators = ['dianji', 'tuiguang', 'pay']
// 渠道对比卡片中charts的id
const pubChartIds = ['dianjiChartPub', 'tuiguangChartPub', 'payChartPub']
const pubChartTitles = ['点击量分布', '推广量分布', '总付费金额分布']
// 渠道数据
const pubDataList = ref<PubData[][]>([[{ name: '', value: 0 }]])
/**核心指标的Echarts */
let chartOfPub: EChartsType[] = [] as unknown as EChartsType[]
// 计算options
const optionsOfPub = computed<ECOption[]>(() => {
  const options: ECOption[] = [] as ECOption[]

  pubDataList.value.forEach((dataList, index) => {
    // 设置legend data
    const legendData = dataList.map((item: PubData) => item.name)
    // 设置series data
    const seriesItemData = dataList

    const option: ECOption = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: seriesItemData.sort(function (a, b) {
            return a.value - b.value;
          }),
          label: {
            show: true,
            fontSize: 10,
            formatter(param) {
              // correct the percentage
              return param.name + '\n' + ' (' + param.percent + '%)';
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      legend: { icon: 'circle', itemHeight: 7, data: legendData, bottom: 5 },
      // grid: { left: 50, right: 0 },
    }
    // 将option存入数组中备用
    options[index] = option
  })
  return options
})
/**处理请求到的核心渠道数据的方法 */
const reqPubData = async () => {
  // 请求体，json格式
  const res = {
    cdate: datarange.value, // 日期[1694948996, 1695035410]
  }
  const json = JSON.stringify(res)
  const { data } = await getchanneldata(json, reqConfig.value)
  // 遍历pubIndicators = ['dianji', 'tuiguang', 'pay']
  pubIndicators.forEach((key: string, index) => {
    // 匹配到key的元素均放到pubDataList里
    pubDataList.value[index] = data[key].map((item: PubData) => {
      // 对value进新重新格式化，转化为数字型
      let value = Number(item.value)
      item.value = value
      return item
    })
  })
  // 对核心渠道指标的3个chart设置option
  chartOfPub.forEach((chart: EChartsType, index) => {
    chart.setOption(optionsOfPub.value[index] as ECOption)
  })
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
  reqCoreIndicatorsData()
  reqPubData()
})

onMounted(() => {
  // 初始化趋势概览的chart
  chartOfTrend = echarts.init(document.getElementById('trendChart'))
  // 初始化核心指标的3个chart
  indicatorsChartIds.forEach((id: string, index) => {
    chartOfIndicator[index] = echarts.init(document.getElementById(id))
  })
  // 初始化渠道效果的3个chart
  pubChartIds.forEach((id: string, index) => {
    chartOfPub[index] = echarts.init(document.getElementById(id))
  })
})

// 处理百分比、千和万显示的方法
const formatKW = (n: number): string => {
  if (n > 0 && n < 1) {
    return (n * 100).toFixed(1) + '%'
  } else if (n < 1000) {
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

    <div class="title">核心指标效果</div>
    <el-row class="mt20"
            style="margin-left: -7.5px; margin-right: -7.5px;">
      <el-col v-for="(charId, index) in indicatorsChartIds"
              :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;"
              :key="index">
        <TableChart :height="410"
                    :hasData="true"
                    :hasHeader="true"
                    :tableData="dailyDataIndicators[index]"
                    :propLabel="keyLabelsOfIndicators"
                    :tableId="'indicatorTable' + index"
                    :tablename="tkioCardsText[index].title"
                    :datarange="datarange">
          <template #header>
            <div :style="{ height: '86px' }">
              <TkioCard :title="tkioCardsText[index].title"
                        :sub-titles="tkioCardsText[index].subtitles"
                        :data="tkioCardsData[index]" />
            </div>
          </template>
          <template #chart>
            <div :id="charId"
                 :style="{ height: '255px' }"></div>
          </template>
        </TableChart>
      </el-col>
    </el-row>

    <div class="title">核心渠道效果</div>
    <el-row class="mt20"
            style="margin-left: -7.5px; margin-right: -7.5px;">
      <el-col v-for="(chartId, index) in pubChartIds"
              :span="8"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <NodataCard :height="430"
                    :hasData="true"
                    :hasHeader="true">
          <template #header>
            <div :style="{ height: '30px', color: '#303133', fontSize: '12px' }">
              <p>{{ pubChartTitles[index] }} </p>
            </div>
          </template>
          <template #chart>
            <div :id="chartId"
                 :style="{ height: '360px' }"></div>
          </template>
        </NodataCard>
      </el-col>
    </el-row>

    <div class="title">日期对比</div>
    <DateComparer @sendDates="receiveDates"></DateComparer>
    <el-row class="mt20"
            style="margin-left: -7.5px; margin-right: -7.5px;">
      <el-col :span="12"
              class="mb20"
              style="padding-left: 7.5px; padding-right: 7.5px;">
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
              style="padding-left: 7.5px; padding-right: 7.5px;">
        <TableChart :height="320"
                    :hasData="false"
                    :chartId="'compareByDate2'"
                    :tableId="'compareTable2'" />
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

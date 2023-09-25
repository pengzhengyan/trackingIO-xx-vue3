<script setup lang="ts">
  import MyTabbar from '@/components/MyTabbar.vue'
  import DateBar from '@/components/DateBar.vue'
  import MetricsConfig from '@/components/MetricsConfig.vue'
  import { getAsaData, getAsaList, getAsaCheck, getAsaMetrics } from '@/api/index.js'
  import { ref, computed, onBeforeMount } from 'vue'
  import { ElMessage } from 'element-plus'
  // ElConfigProvider 组件
  import { ElConfigProvider } from 'element-plus'
  // 引入中文包
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
  import moment from 'moment'
  // 引入导出Excel表格依赖
  import * as FileSaver from 'file-saver'
  import * as XLSX from 'xlsx'

  /**
   * type
   */
  type metricsItem = {
    label: string
    children: metricsChildItem[]
  }
  type metricsChildItem = {
    text: string
    disabled: boolean
    checked: boolean
    key: string
  }

  type textKeyItem = {
    text: string
    key: string
  }

  /** tab 相关 */
  let tabActiveKey = ref('0')
  let tabActiveBar = computed(() => {
    return tabList.find((item) => item.key === tabActiveKey.value)
  })
  let tabList = [
    {
      key: '0',
      text: '日期',
      label: 'cdate',
    },
    {
      key: '1',
      text: '活动',
      label: 'orgid',
    },
    {
      key: '2',
      text: '活动组',
      label: 'campaignid',
    },
    {
      key: '3',
      text: '渠道',
      label: 'adgroupid',
    },
    {
      key: '4',
      text: '子渠道',
      label: 'keywordid',
    },
    {
      key: '5',
      text: '子帐号',
      label: 'adid',
    },
  ]
  const tabbarClickHandle = (key: string) => {
    tabActiveKey.value = key
    requestAsaData()
  }

  /**
   * 日期组件相关内容
   */
  // 选定的日期范围（默认为今日，与日期选择插件的默认值一致）
  const today = Math.floor(Number(new Date(moment().format('YYYY/MM/DD'))) / 1000)
  const datarange = ref([today, today])
  // 从子组件接收选定的日期范围
  const receiveDateranger = (date: Date[]) => {
    datarange.value = [Math.floor(Number(date[0]) / 1000), Math.ceil(Number(date[1]) / 1000)]
    // 更新日期范围后，从新请求一次asa数据
    setFilter()
    requestAsaData()
  }

  /**
   * 编辑指标相关
   */
  let asaMectrics = ref<metricsItem[]>([])
  let asaTextKey = ref<textKeyItem[]>([])
  const initAsaMetrics = async () => {
    const { data } = await getAsaMetrics()
    data.forEach((item: metricsItem) => {
      item.children.forEach((sub: metricsChildItem) => {
        // 将子menu的text - key 存到 值键对数组，后面要用到
        asaTextKey.value.push({ text: sub.text, key: sub.key })
      })
    })
    asaMectrics.value = data
  }
  /**
   * 筛选框组相关内容
   */
  // 定义筛选框内容
  let filterGroups = ref([
    // { placeholder: '请选择转化类型',label:'', value:[], options: [] },
    // { placeholder: '请选择匹配类型',label:'', value:[], options: [] },
    { placeholder: '请选择渠道', label: 'orgid', value: [], options: [] },
    { placeholder: '请选择活动组', label: 'campaignid', value: [], options: [] },
    { placeholder: '请选择活动', label: 'adgroupid', value: [], options: [] },
    { placeholder: '请选择推广活动状态', label: 'keywordid', value: [], options: [] },
    { placeholder: '请选择筛选器模板', label: 'adid', value: [], options: [] },
    // { placeholder: '按广告活动组聚合日期数据',label:'', value:[], options: [] },
  ])

  // 从服务端获取筛选框内容
  const setFilter = async () => {
    const res = {
      cdate: datarange.value, // 日期[1693497500, 1694361600]
    }
    const json = JSON.stringify(res)
    const { data } = await getAsaList(json)
    if (data.code) return ElMessage.error('group请求参数错误.')
    filterGroups.value.forEach((item) => {
      item.options = data[item.label].map((option: string) => Number(option))
    })
  }
  // 筛选框选定的内容
  const chosenGroup = computed(() => {
    const obj: any = {}
    filterGroups.value.forEach((group) => {
      if (group.value.length > 0) {
        obj[group.label] = group.value
      }
    })
    return obj
  })

  const selectChangeHandle = () => {
    requestAsaData()
  }
  /**
   * 数据表格展示相关内容
   */
  // 导出表格
  const exportExcel = () => {
    /* 从表生成工作簿对象 */
    const wb = XLSX.utils.table_to_book(document.querySelector(`#${tableInfo.id}`))
    /* 获取二进制字符串作为输出 */
    const wbout = XLSX.write(wb, {
      bookType: 'xlsx',
      bookSST: true,
      type: 'array',
    })
    /* 获取表格日期 */
    const dataStart = moment(datarange.value[0] * 1000).format('YYYY/MM/DD')
    const dataEnd = moment(datarange.value[1] * 1000).format('YYYY/MM/DD')
    try {
      FileSaver.saveAs(
        //Blob 对象表示一个不可变、原始数据的类文件对象。
        //Blob 表示的不一定是JavaScript原生格式的数据。
        //File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
        //返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
        new Blob([wbout], { type: 'application/octet-stream' }),
        //设置导出文件名称
        `${tableInfo.name}-${dataStart}-${dataEnd}.xlsx`
      )
    } catch (e) {
      if (typeof console !== 'undefined') console.log(e, wbout)
    }
    return wbout
  }

  // 表格信息
  const tableInfo = {
    id: 'asaTable',
    name: 'asa活动详情',
  }
  // 表格数据内容
  let asaData = ref([
    {
      actcount: '',
      cdate: '2023-09-01 00:00:00',
      loginimei: '3',
      newpayimeis: '0',
      newpaymoneybyimei: '0',
      paycount: '1',
      payimeis: '1',
      paymoney: '64800',
      regcount: '0',
      xhmoney: '0',
    },
  ])
  // 表格选定的指标
  const checkedMetrics = ref<string[]>([])
  // 表格选定指标的键值对
  const propKey = computed(() => {
    return checkedMetrics.value.map((key) => asaTextKey.value.find((item) => item.key === key))
  })

  // 从服务端获取表格内容
  const requestAsaData = async () => {
    const head = tabActiveBar.value?.label
    const res = {
      head, //cdate:日期维度  orgid：广告活动组 adgroup：广告组 campaignid：广告活动 keywordid：关键字 adid：广告
      cdate: datarange.value, // 日期[1694948996, 1695035410]
      screen: chosenGroup.value, //下拉框筛选
      list: checkedMetrics.value, //编辑指标内容
      username: 'gaofei',
      type: 'asa',
    }
    const json = JSON.stringify(res)
    const { data } = await getAsaData(json)
    if (data.code) return ElMessage.error('asa请求参数错误.')
    const lastItem = data.pop()
    data.unshift(lastItem)
    asaData.value = data
  }

  // 分页
  const currentPage = ref(1)
  const pageSize = ref(10)
  const small = ref(false)
  const background = ref(false)
  const disabled = ref(false)
  const total = computed(() => asaData.value.length)

  const handleSizeChange = (val: number) => {
    pageSize.value = val
  }
  const handleCurrentChange = (val: number) => {
    currentPage.value = val
  }

  onBeforeMount(() => {
    // 请求数据指标数据
    initAsaMetrics()
    /** 请求select框组的数据*/
    setFilter()
    /** init选定的指标*/
    getAsaCheck().then((res: any) => {
      checkedMetrics.value = res.data.result.check
      // 之后再请求表格数据
      requestAsaData()
    })
  })
</script>

<template>
  <div class="Asacampaigninfo">
    <!-- tabbar区 -->
    <MyTabbar
      :list="tabList"
      :activeKey="tabActiveKey"
      @change="
        (key) => {
          tabbarClickHandle(key)
        }
      "
    />

    <!-- 日期组件在这儿 -->
    <div style="margin-top: 30px">
      <DateBar @sendDateranger="receiveDateranger" />
    </div>

    <!-- 指标 和 筛选框 -->
    <div style="margin-top: 25px; display: flex; flex-wrap: wrap; gap: 25px 15px">
      <!-- <el-button type="primary" style="height: 40px; border-radius: 8px; box-shadow: 0 4px 16px #e5e5ed;">编辑指标</el-button> -->
      <MetricsConfig
        title="编辑指标"
        :requestAsaData="requestAsaData"
        :metrics="asaMectrics"
        :textKey="asaTextKey"
        v-model:checkedMetrics="checkedMetrics"
      />
      <el-button
        type="primary"
        style="height: 40px; margin-left: 0; border-radius: 8px; box-shadow: 0 4px 16px #e5e5ed"
      >
        <el-icon>
          <Upload />
        </el-icon>
        批量上传
      </el-button>

      <el-select
        clearable
        multiple
        collapse-tags
        collapse-tags-tooltip
        style="width: 240px"
        v-for="Group in filterGroups"
        :key="Group.label"
        v-model="Group.value"
        :placeholder="Group.placeholder"
        @change="selectChangeHandle"
      >
        <el-option
          v-for="option in Group.options"
          :key="option"
          :label="option"
          :value="option"
        />
      </el-select>
    </div>

    <!-- 表格标题 及 下载按钮 -->
    <div class="bread-types">
      <div class="bread-left">
        <span>数据详情</span>
      </div>
      <div class="bread-right">
        <div
          class="export"
          @click="exportExcel"
        >
          <el-icon>
            <Download />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 表格区 -->
    <div class="table-content">
      <el-table
        stripe
        max-height="450"
        :id="tableInfo.id"
        :data="asaData ? asaData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : []"
      >
        <el-table-column
          :prop="tabActiveBar?.label"
          :label="tabActiveBar?.text"
          width="180"
        />
        <el-table-column
          v-for="item in propKey"
          :key="item.key"
          :prop="item.key"
          :label="item.text"
        />
      </el-table>
      <div class="pagination-container">
        <el-config-provider :locale="zhCn">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50, 100]"
            :small="small"
            :disabled="disabled"
            :background="background"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
  .Asacampaigninfo {
    .bread-types {
      display: flex;
      flex: auto;
      align-items: center;
      justify-content: space-between;
      margin-top: 24px;

      .bread-left {
        span {
          font-size: 12px;
        }
      }

      .bread-right {
        .export {
          .el-icon {
            font-size: 18px;
            color: #babbc4;
            cursor: pointer;
          }
        }
      }
    }

    .table-content {
      margin-top: 16px;
      padding: 24px;
      background: #fff;
      border-radius: 8px;
      -webkit-box-shadow: 0 8px 16px #e5e6ed;
      box-shadow: 0 8px 16px #e5e6ed;
      width: 100%;
      overflow: auto;
      .pagination-container {
        padding-top: 16px;
      }
    }

    :deep(.el-select) {
      .el-select-tags-wrapper {
        .el-tag {
          background-color: #eff0ff;
          color: #2d2f4e;
        }
      }
    }

    :deep(.el-table) {
      font-size: 12px;

      thead {
        color: #2d2f4e;
      }

      color: #2d2f4e;
    }

    :deep(.el-pagination) {
      --el-pagination-font-size: 13px;
      display: flex;
      color: rgb(45, 47, 78);
      padding: 0px;
      white-space-collapse: collapse;
      text-wrap: nowrap;
      .el-pagination__sizes {
        text-align: left;
        flex: 1 1 0%;
        .el-input__wrapper {
          box-shadow: none;
          border: 1px solid #e5e5ed;
          height: 28px;
          .el-input__inner {
            height: 28px;
          }
        }
      }
    }
  }
</style>

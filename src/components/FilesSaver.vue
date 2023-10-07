<script setup lang="ts">
// 引入导出Excel表格依赖
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import moment from 'moment'

const props = defineProps(['datarange', 'tableInfo'])
// 导出表格
const exportExcel = () => {
  /* 从表生成工作簿对象 */
  const wb = XLSX.utils.table_to_book(document.querySelector(`#${props.tableInfo.id}`))
  /* 获取二进制字符串作为输出 */
  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array',
  })
  /* 获取表格日期 */
  const dataStart = moment(props.datarange[0] * 1000).format('YYYY/MM/DD')
  const dataEnd = moment(props.datarange[1] * 1000).format('YYYY/MM/DD')
  try {
    FileSaver.saveAs(
      //Blob 对象表示一个不可变、原始数据的类文件对象。
      //Blob 表示的不一定是JavaScript原生格式的数据。
      //File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
      //返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
      new Blob([wbout], { type: 'application/octet-stream' }),
      //设置导出文件名称
      `${props.tableInfo.name}-${dataStart}-${dataEnd}.xlsx`
    )
  } catch (e) {
    if (typeof console !== 'undefined') console.log(e, wbout)
  }
  return wbout
}
</script>

<template>
  <div class="export"
       @click="exportExcel">
    <el-icon>
      <Download />
    </el-icon>
  </div>
</template>

<style scoped lang="less">
.export {
  .el-icon {
    font-size: 18px;
    color: #babbc4;
    cursor: pointer;
  }
}
</style>

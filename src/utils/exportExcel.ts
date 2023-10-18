import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

// 导出数据
const exportExcel = (data: any[], filename:string) => {
  /* 从表生成工作簿对象 */
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
  /* 获取二进制字符串作为输出 */
  const wbout = XLSX.write(workbook, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array',
  })

  try {
    FileSaver.saveAs(
      //Blob 对象表示一个不可变、原始数据的类文件对象。
      //Blob 表示的不一定是JavaScript原生格式的数据。
      //File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
      //返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
      new Blob([wbout], { type: 'application/octet-stream' }),
      //设置导出文件名称
      `${filename}.xlsx`
    )
  } catch (e) {
    if (typeof console !== 'undefined') console.log(e, wbout)
  }
  return wbout
}

export  {exportExcel}
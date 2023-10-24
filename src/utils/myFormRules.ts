// 活动名的校验规则
const nameReg = /[`~!@#$%^&*()+=<>?:"{}|,\/;'\\[\]·~！@#￥%……&*（）——{}|《》？：“”【】、；‘'，。、]/g

const checkActivityName = (_: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('必填'))
  } else if (nameReg.test(value) || value.length > 50) {
    callback(new Error('支持输入汉字、大小写字母、数字、下划线、中划线、间隔号点（·），长度限制50字符'))
  } else {
    callback()
  }
}

export {checkActivityName}
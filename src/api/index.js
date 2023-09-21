import http from "@/utils/request.js"

// 登录接口
const getAsaCheck = options => http.post("?api=/auth/login&password=89665d69947595ca7faf4581a9717fdc&type=0&dbserve=xxdbserver&username=gaofei", options)

// 获取指标接口
const getAsaMetrics = options => http.get('?api=/data/getindex&type=asa', options)

// 获取asa数据
const getAsaData = options => http.post('?api=/data/getasadata', options)

// 获取asa下拉列表
const getAsaList = options => http.post('?api=/data/getasalist', options)
// 对外暴露接口
export{
  getAsaCheck,
  getAsaMetrics,
  getAsaData,
  getAsaList
}
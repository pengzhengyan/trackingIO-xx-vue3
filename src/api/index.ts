import http from "@/utils/request.js"

// 获取asa选定的指标接口
const getAsaCheck = () => http.post("?api=/auth/login&password=89665d69947595ca7faf4581a9717fdc&type=asa&dbserve=xxdbserver&username=gaofei")

// 获取asa指标接口
const getAsaMetrics = () => http.get('?api=/data/getindex&type=asa')

// 获取asa数据
const getAsaData = (options:string) => http.post('?api=/data/getasadata', options)

// 获取asa下拉列表
const getAsaList = (options:string) => http.post('?api=/data/getasalist', options)

// 获取asa选定的指标接口
const getCampCheck = () => http.post("?api=/auth/login&password=89665d69947595ca7faf4581a9717fdc&type=ml&dbserve=xxdbserver&username=gaofei")

// 获取买量指标接口
const getCampMetrics = () => http.get('?api=/data/getindex&type=ml')

// 获取买量数据
const getCampData = (options:string) => http.post('?api=/data/getasadata', options)

// 获取买量下拉列表
const getCampList = (options:string) => http.post('?api=/data/getasalist', options)

// 对外暴露接口
export{
  getAsaCheck,
  getAsaMetrics,
  getAsaData,
  getAsaList,
  getCampCheck,
  getCampMetrics,
  getCampList,
  getCampData
}
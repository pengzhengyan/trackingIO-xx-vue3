import http from "@/utils/request.js"

type config = {
  headers: {
    gameid:number
  }
}

// 获取asa选定的指标接口
const getAsaCheck = () => http.post("?api=/auth/login&password=89665d69947595ca7faf4581a9717fdc&type=asa&dbserve=xxdbserver&username=gaofei")

// 获取asa指标接口
const getAsaMetrics = (config:config) => http.get('?api=/data/getindex&type=asa', config)

// 获取asa数据
const getAsaData = (options:string, config:config) => http.post('?api=/data/getasadata', options, config)

// 获取asa下拉列表
const getAsaList = (options:string, config:config) => http.post('?api=/data/getasalist', options, config)

// 获取asa选定的指标接口
const getCampCheck = () => http.post("?api=/auth/login&password=89665d69947595ca7faf4581a9717fdc&type=ml&dbserve=xxdbserver&username=gaofei")

// 获取买量指标接口
const getCampMetrics = (config:config) => http.get('?api=/data/getindex&type=ml', config)

// 获取买量数据
const getCampData = (options:string, config:config) => http.post('?api=/data/getasadata', options, config)

// 获取买量下拉列表
const getCampList = (options:string, config:config) => http.post('?api=/data/getasalist', options, config)

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
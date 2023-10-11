import http from "@/utils/request.js"

type config = {
  headers: {
    gameid:number
  }
}
// 登录
const login = (username:string, password:string) => http.post(`?api=/auth/login&username=${username}&password=${password}`)

// 获取asa指标接口
const getAsaMetrics = (config:config) => http.get('?api=/data/getindex&type=asa', config)

// 获取asa数据
const getAsaData = (options:string, config:config) => http.post('?api=/data/getasadata', options, config)

// 获取asa下拉列表
const getAsaList = (options:string, config:config) => http.post('?api=/data/getasalist', options, config)

// 获取买量指标接口
const getCampMetrics = (config:config) => http.get('?api=/data/getindex&type=ml', config)

// 获取买量数据
const getCampData = (options:string, config:config) => http.post('?api=/data/getasadata', options, config)

// 获取买量下拉列表
const getCampList = (options:string, config:config) => http.post('?api=/data/getasalist', options, config)

// 对外暴露接口
export{
  login,
  getAsaMetrics,
  getAsaData,
  getAsaList,
  getCampMetrics,
  getCampList,
  getCampData
}
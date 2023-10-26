import http from "@/utils/request.js"

type Config = {
  headers: {
    username:string,
    pub:string
  }
}
// 登录
const login = (username:string, password:string) => http.post(`?api=/auth/login&username=${username}&password=${password}`)

// 获取asa指标接口
const getAsaMetrics = (config:Config) => http.get('?api=/data/getindex&type=asa', config)

// 获取asa数据
const getAsaData = (options:string, config:Config) => http.post('?api=/data/getasadata', options, config)

// 获取asa下拉列表
const getAsaList = (options:string, config:Config) => http.post('?api=/data/getasalist', options, config)

// 获取买量指标接口
const getCampMetrics = (config:Config) => http.get('?api=/data/getindex&type=ml', config)

// 获取买量数据
const getCampData = (options:string, config:Config) => http.post('?api=/data/getasadata', options, config)

// 获取买量下拉列表
const getCampList = (options:string, config:Config) => http.post('?api=/data/getasalist', options, config)

// 获取投放的渠道列表
const getChannalList = (config:Config) => http.get('?api=/data/getchannellist',config)

// 获取活动列表
const getActivity = (config:Config) => http.get('?api=/data/getactivitylist',config)
// 添加和编辑投放活动
const addActivity = (options:string, config:Config) => http.post('?api=/data/addactivity', options, config)
// 根据活动id获取活动信息
const getActivityById = (options:string) => http.post('?api=/data/getedit',options)
// 获取活动组列表
const getActivityGroup = (config:Config) => http.get('?api=/data/getgrouplist',config)
// 添加和编辑活动组
const addActivityGroup = (options:string, config:Config) => http.post('?api=/data/addgroup', options, config)
// 根据活动id获取活动组信息
const getActivityGroupById = (options:string, config:Config) => http.post('?api=/data/getgroupedit',options,config)

// 对外暴露接口
export{
  login,
  getAsaMetrics,
  getAsaData,
  getAsaList,
  getCampMetrics,
  getCampList,
  getCampData,
  getChannalList,
  getActivity,
  addActivity,
  getActivityById,
  getActivityGroup,
  addActivityGroup,
  getActivityGroupById
}
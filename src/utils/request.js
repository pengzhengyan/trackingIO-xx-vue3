import axios from "axios"
import router from '@/router'
import { ElMessage, ElLoading } from 'element-plus'

// loading函数
// 记录请求次数
let needLoadingRequestCount = 0
let loading
function startLoading() {
  loading = ElLoading.service({
    lock: true,
    text: '加载中……',
    background: 'rgba(0, 0, 0, 0.5)',
  })
}
function endLoading() {
  // 延迟500ms，防止网速特快加载中画面一闪而过
  setTimeout(function() {
    if (loading) loading.close()
  }, 500)
}
// 打开loading
function showFullScreenLoading() {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}
// 关闭loading
function tryHideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    endLoading()
  }
}

axios.defaults.headers.post['Content-Type'] = 'application/json'
const http = axios.create({
  baseURL: 'http://47.106.118.195:8009/admin.php',
  timeout: 50000,
})

// Add a request interceptor
http.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    // 打开loading
    showFullScreenLoading()
    // const token = localStorage.getItem('token');
    // if (token) {
    //   // 判断是否存在token，如果存在的话，则每个http header都加上token
    //   config.headers.authorization = token; //请求头加上token
    // }
    return config
  },
  function(error) {
    // Do something with request error
    tryHideFullScreenLoading()
    return Promise.reject(error)
  }
)

// Add a response interceptor
http.interceptors.response.use(
  function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // 关闭loading
    tryHideFullScreenLoading()
    return response
  },
  function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // 关闭loading
    tryHideFullScreenLoading()
    if (error) {
      ElMessage.error(error)
    }
    return Promise.reject(error)
  }
)

export default http

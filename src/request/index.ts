import axios from 'axios'
import { ElMessage } from 'element-plus'

let axiosInstance = axios.create({})

axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    let { data, code, message } = response as any

    switch (code) {
      case 200:
        return Promise.resolve(data)
      default:
        ElMessage({
          message,
          type: 'error'
        })
        return Promise.reject(message)

    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance

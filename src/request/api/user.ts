import request from '@/request'

/**
 * 用户登录
 * @param data 登录信息
 */
export function userLogIn(data: any) {
  return request({
    url: 'http://47.106.118.195:8009/admin.php?api=/auth/login&password=89665d69947595ca7faf4581a9717fdc&type=0&dbserve=xxdbserver&username=gaofei',
    method: 'GET'
  })
}

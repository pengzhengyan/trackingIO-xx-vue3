import { defineStore } from 'pinia'
import { getCampCheck } from '@/api/index.js'


export const useUserInfo = defineStore('userInfo', {
  state: () => ({
    /** 用户上一次选定的 asa指标 列表 */
    /** @type {string[]} */
    asaCheckedMetrics: ['actcount'],

    // 用户所拥有的应用信息
    applist:[{gameid:0, name:''}],

    /**
     * 用户选择的appid
     */
    appidSelected: 100079100910
  }),
  getters: {
    reqConfig: (state) => {
      return {
        headers: {
          gameid : state.appidSelected
        }
      }
    }
  },
  actions: {
    // login时初始化所选的 asa指标
    async initUserinfo() {
      const {data} = await getCampCheck()
      this.asaCheckedMetrics = data.result.check
      this.applist = data.result.gameidlist
      console.log(data.result.gameidlist)
    },
    // 改变appid
    reselectAppid (id:number) {
      this.appidSelected = id
    },
  },
  persist: true
},)

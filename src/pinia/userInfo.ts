import { defineStore } from 'pinia'


export const useUserInfo = defineStore('userInfo', {
  state: () => ({
    username: '',

    /** 用户上一次选定的 asa指标 列表 */
    /** @type {string[]} */
    asaCheckedMetrics: ['actcount'],
    mlCheckedMetrics: ['actcount'],

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
    initUserinfo(result:any) {
      if(result.asacheck) this.asaCheckedMetrics = result.asacheck
      if(result.mlcheck) this.mlCheckedMetrics = result.mlcheck
      this.applist = result.gameidlist
      this.username = result.username
    },
    // 改变appid
    reselectAppid (id:number) {
      this.appidSelected = id
    },
  },
  persist: true
},)

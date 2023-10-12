import { defineStore } from 'pinia'


export const useUserInfo = defineStore('userInfo', {
  state: () => ({
    username: '',
    loginId:'',

    /** 用户上一次选定的 asa指标 列表 */
    /** @type {string[]} */
    asaCheckedMetrics: ['actcount'],
    mlCheckedMetrics: ['actcount'],

    // 用户所拥有的应用信息
    applist:[''],

    /**
     * 用户选择的appid
     */
    appSelected: 'appstore_pfdmw2_101'
  }),
  getters: {
    reqConfig: (state) => {
      return {
        headers: {
          pub : state.appSelected
        }
      }
    }
  },
  actions: {
    // login时初始化所选的 asa指标
    initUserinfo(result:any) {
      console.log(result)
      if(result.asacheck) this.asaCheckedMetrics = result.asacheck
      if(result.mlcheck) this.mlCheckedMetrics = result.mlcheck
      this.applist = result.publist
      this.username = result.username
      this.loginId = result.loginId
    },
    // 改变appid
    reselectApp (pub:string) {
      this.appSelected = pub
    },
  },
  persist: true
},)

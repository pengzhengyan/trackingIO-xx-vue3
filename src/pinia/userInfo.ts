import { defineStore } from 'pinia'

type App = {
  name: string
  pub: string
  platform: string
  addtime: string
  appid: string
}
export const useUserInfo = defineStore('userInfo', {
  state: () => ({
    username: '',
    loginId:'',

    /** 用户上一次选定的 asa指标 列表 */
    /** @type {string[]} */
    asaCheckedMetrics: ['actcount'],
    mlCheckedMetrics: ['actcount'],

    // 用户所拥有的应用信息
    applist:[
      {name: '', pub: '', platform: '', addtime: '', appid: ''}
    ],

    /**
     * 用户选择的appid
     */
    appSelected: 'appstore_pfdmw2_101'
  }),
  getters: {
    reqConfig: (state) => {
      return {
        headers: {
          username:state.loginId,
          pub : state.appSelected
        }
      }
    }
  },
  actions: {
    // login时初始化所选的 asa指标
    initUserinfo(result:any) {
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
    // 更新applist
    updateApplist (applist:App[]) {
      this.applist = applist
    }
  },
  persist: true
},)

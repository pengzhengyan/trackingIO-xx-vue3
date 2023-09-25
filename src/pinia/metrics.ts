import { defineStore } from 'pinia'
import { getAsaCheck } from '@/api/index.js'


export const useMetrics = defineStore('mectrics', {
  state: () => ({
    /** 用户上一次选定的 asa指标 列表 */
    /** @type {string[]} */
    asaCheckedMetrics: ['actcount'],

    /** asa指标和数据表的键值对 */
    /** @type {{ text: string, key: string }[]} */
    asaTextKey: [{text: '转化总数', key:'actcount'}],

    /** 用户上一次选定的 推广指标 列表 */
    /** @type {string[]} */
    campaignCheckedMetrics: ['actcount'],

    /** 推广指标 和数据表的 键值对 */
    /** @type {{ text: string, key: string }[]} */
    campaignTextKey: [{text: '转化总数', key:'actcount'}],

  }),
  actions: {
    // 更新选定的asa指标
    changeAsaCheckedMetrics(list:string[]) {
      this.asaCheckedMetrics = list
    },
    // login时初始化所选的 asa指标
    async initAsaCheckedMetrics() {
      const {data} = await getAsaCheck()
      this.asaCheckedMetrics = data.result.check
    },

    // asa指标和数据表的键值对，从指标组件更新
    changeAsaTextKey (list:any) {
      this.asaTextKey = list
    },
  }
})

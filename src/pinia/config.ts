import { defineStore } from 'pinia'
import { PageLayout } from '@/types/config'


export const useConfig = defineStore('config', {
  state: () => ({
    pageLayout: PageLayout.UnKnow,
    promotionOption: {isCreate: true, id:''},
    campgroupOption: {isCreate: true, id:''}
  }),
  actions: {
    changePageLayout(pageLayout: PageLayout) {
      this.pageLayout = pageLayout
    },
    changePromotionOption(isCreate:boolean, id?:string) {
      this.promotionOption.isCreate = isCreate
      if(id) this.promotionOption.id = id
    },
    changeCampgroupOption(isCreate:boolean, id?:string) {
      this.campgroupOption.isCreate = isCreate
      if(id) this.campgroupOption.id = id
    }
  }
})

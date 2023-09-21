import { defineStore } from 'pinia'
import { PageLayout } from '@/types/config'


export const useConfig = defineStore('config', {
  state: () => ({
    pageLayout: PageLayout.UnKnow,
  }),
  actions: {
    changePageLayout(pageLayout: PageLayout) {
      this.pageLayout = pageLayout
    },
  }
})

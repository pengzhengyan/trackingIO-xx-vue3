<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useConfig } from '@/pinia/config'

const router = useRouter()
const { changePromotionOption } = useConfig()
const handelCratePromotion = () => {
  router.push({ name: 'manage-campaigndetail' })
  changePromotionOption(true)
}
const handelEditPromotion = (v: string) => {
  router.push({ name: 'manage-campaigndetail' })
  changePromotionOption(false, v)
}
</script>

<template>
  <div>Campaign</div>
  <el-button class="broadBtn"
             type="primary"
             @click="handelCratePromotion()">新建推广链接</el-button>
  <el-button class="broadBtn"
             type="primary"
             @click="handelEditPromotion('111')">编辑推广链接</el-button>
</template>

<style scoped lang="less"></style>

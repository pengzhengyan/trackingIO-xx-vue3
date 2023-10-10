<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const handelCratePromotion = () => {
  router.push({ name: 'manage-campaigndetail' })
}
</script>

<template>
  <div>Campaign</div>
  <el-button class="broadBtn"
             type="primary"
             @click="handelCratePromotion">新建推广链接</el-button>
</template>

<style scoped lang="less"></style>

<script setup lang="ts">
import Layout from '@/layout/LayoutIndex.vue'
import { LOGIN_INFO } from '@/keys/storage'
import { onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onBeforeMount(() => {
  let hasLogged = localStorage.getItem(LOGIN_INFO!)

  if (!hasLogged) router.push({ name: 'Login' })
})

onMounted(() => {
  document.body.style.setProperty('--el-color-primary', '#6b7aff');
  document.body.style.setProperty('--el-color-primary-light-9', '#6b7affd9');
  document.body.style.setProperty('--el-color-primary-light-3', '#6b7affd9');
  document.body.style.setProperty('--el-dialog-padding-primary', '0');
})
</script>
<template>
  <Layout />
</template>

<style scoped></style>

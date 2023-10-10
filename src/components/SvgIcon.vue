<template>
  <svg :style="{ width, height }">
    <use :href="symbolId"
         :fill="color"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  name: String,
  width: {
    type: String,
    default: '16px'
  },
  height: {
    type: String,
    default: '16px'
  },
  color: {
    type: String,
    default: ''
  }
})
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style scoped></style>
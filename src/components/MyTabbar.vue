<script setup lang="ts">
type Props = {
  list: Array<{ key: string; text: string; label: string }>;
  activeKey: string;
}

type Emits = {
  change: [key: string];
}

let { list, activeKey } = defineProps<Props>()
let emit = defineEmits<Emits>()
const handleClick = (key: string) => {
  if (key === activeKey) return
  emit('change', key)
}
</script>

<template>
  <div class="Tab">
    <div class="tab-item"
         :class="{ active: item.key === activeKey }"
         v-for="item of list"
         :key='item.key'
         @click="handleClick(item.key)">
      {{ item.text }}
    </div>
  </div>
</template>

<style scoped lang="less">
.Tab {
  display: flex;

  .tab-item {
    font-size: 16px;
    font-weight: 700;
    line-height: 21px;
    color: #babbc4;
    margin-right: 40px;
    position: relative;
    cursor: pointer;

    &.active {
      color: #2d2f4e;

      &::before {
        content: "";
        height: 3px;
        width: 100%;
        background-image: linear-gradient(90deg, #6b7aff, #9baaff);
        box-shadow: 0 6px 16px #e5e6ed;
        position: absolute;
        bottom: -5px;
      }
    }
  }
}
</style>

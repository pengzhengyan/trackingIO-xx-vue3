<script setup lang="ts">
import { ref } from 'vue'
import BacktoappBtn from '@/components/BacktoappBtn.vue';

const emits = defineEmits(['selectChange'])
const props = defineProps(['options', 'value'])
const value = ref(props.value)

const handleChange = () => {
  emits('selectChange', value.value)
}
</script>

<template>
  <div class="applistbox">
    <div class="left">
      <el-select class="my-shadow-select"
                 v-model="value"
                 filterable
                 placeholder="请选择应用"
                 @change="handleChange">
        <template #prefix>
          <SvgIcon name="iphone"></SvgIcon>
        </template>
        <el-option v-for="item in options"
                   :key="item"
                   :label="item"
                   :value="item" />
      </el-select>
    </div>
    <BacktoappBtn></BacktoappBtn>
  </div>
</template>

<style scoped lang="less">
.applistbox {
  display: flex;
  align-items: center;

  .left {
    margin-right: 16px;

    :deep(.el-select) {
      width: 280px;

      .el-input {
        .el-input__wrapper {
          padding: 0px 11px;
          border-radius: 20px !important;
        }
      }
    }
  }
}
</style>
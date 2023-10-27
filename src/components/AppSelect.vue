<script setup lang="ts">
import { ref, computed } from 'vue'
import BacktoappBtn from '@/components/BacktoappBtn.vue';

const emits = defineEmits(['selectChange'])
const props = defineProps(['options', 'value'])
const value = ref(props.value)
const iconName = computed(() => props.options.find((item: any) => item.pub === props.value).platform.toLowerCase())

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
          <SvgIcon :name="iconName"></SvgIcon>
        </template>
        <el-option v-for="item in options"
                   :key="item.id"
                   :label="item.name"
                   :value="item.pub">
          <template #default>
            <SvgIcon :name="item.platform.toLowerCase()"></SvgIcon>
            {{ item.name }}
          </template>
        </el-option>
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
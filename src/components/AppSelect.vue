<script setup lang="ts">
import { ref } from 'vue'
import BacktoappBtn from '@/components/BacktoappBtn.vue';

const emits = defineEmits(['selectChange'])
const props = defineProps(['options', 'appid'])
const value = ref(props.appid)

const handleChange = () => {
  console.log(value.value)
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
                   :key="item.gameid"
                   :label="item.name"
                   :value="item.gameid" />
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
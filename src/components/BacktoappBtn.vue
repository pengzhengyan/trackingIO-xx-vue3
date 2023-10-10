<template>
  <el-tooltip class="box-item"
              effect="dark"
              content="返回应用列表"
              placement="bottom-start">

    <div class="icon-box"
         @click="handleClick">
      <el-icon>
        <Grid />
      </el-icon>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
let router = useRouter()

const handleClick = () => {
  // 处理返回应用列表的操作
  router.push({ name: 'applist' })

}
</script>

<style scoped lang="less">
.icon-box {
  background-color: #fff;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 8px 16px #e5e5ed;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps(['title'])
const dialogVisible = ref(false)
const handleSubmit = () => { }

let formData = ref([
  { name: '热云', type: '渠道', value: [] },
  { name: '', type: '', value: [] },
])
const formDataTemplates = [
  { type: '渠道', value: ['渠道1', '渠道2'] },
  { type: '活动组', value: ['活动组1', '活动组2'] },
]

const templatesMaxIndex = computed(() => {
  return formData.value.length - 1
})

const addTemplate = () => {
  // 最多只能加五条自定义模板
  if (templatesMaxIndex.value === 4) return
  formData.value.push({ name: '', type: '', value: [] })
}

const deleteTemplate = (index: number) => {
  formData.value.splice(index, 1)
}
</script>

<template>
  <!-- dialog 选择指标窗口 -->
  <div>
    <el-dialog v-model="dialogVisible"
               :show-close="false"
               style="margin-top: 15vh; width: 80%">
      <!-- 头部内容区 -->
      <template #header="{ close }">
        <div class="my-header">
          <div class="dialog-title">
            <span class="title-text">{{ title }}</span>
            <el-button @click="close"
                       class="el-dialog__headerbtn">
              <el-icon class="el-icon--left">
                <CloseBold />
              </el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <!-- 中间内容区 -->
      <div class="custom-target-content">
        <el-form status-icon
                 size="large"
                 :inline="true">
          <div class="mt20"
               v-for="(item, index) in formData"
               :key="index">
            <el-form-item label="模板名称"
                          prop="name">
              <el-input placeholder="输入模板名称，12字符以内"
                        clearable
                        v-model.trim="item.name" />
            </el-form-item>
            <el-form-item prop="type">
              <el-select placeholder="请选择维度"
                         v-model="item.type">
                <el-option v-for="(formDataTemplate, index) in formDataTemplates"
                           :key="index"
                           :label="formDataTemplate.type"
                           :value="formDataTemplate.type" />
              </el-select>
            </el-form-item>
            <el-form-item prop="value"
                          v-show="item.type !== ''">
              <el-select :placeholder="`请选择${item.type}`"
                         v-model="item.value"
                         multiple
                         collapse-tags
                         collapse-tags-tooltip>
                <el-option v-for="value in formDataTemplates.find((i) => i.type === item.type)?.value"
                           :key="value"
                           :label="value"
                           :value="value" />
              </el-select>
            </el-form-item>
            <el-button type="primary"
                       size="small"
                       link
                       style="font-size: 20px; height: 40px"
                       v-show="templatesMaxIndex === index && templatesMaxIndex < 4"
                       @click="addTemplate">
              <el-icon style="vertical-align: middle">
                <CirclePlus />
              </el-icon>
            </el-button>
            <el-button type="primary"
                       size="small"
                       link
                       style="font-size: 20px"
                       v-show="templatesMaxIndex > 0"
                       @click="deleteTemplate(index)">
              <el-icon style="vertical-align: middle">
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </el-form>
      </div>
      <!-- dialog的尾部 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary"
                     @click="handleSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <!-- 选择指标按钮 -->
  <el-button type="primary"
             style="height: 40px; margin-left: 0; border-radius: 8px; box-shadow: 0 4px 16px #e5e5ed"
             @click="dialogVisible = true">
    <el-icon style="margin-right: 5px">
      <Postcard />
    </el-icon>
    {{ title }}
  </el-button>
</template>

<style scoped lang="less">
.mt20 {
  margin-top: 20px;
}

.el-dialog {
  .el-dialog__header {
    .my-header {
      padding: 23px 0 0 32px;
      // border-bottom: 1px solid #e6e6e6 !important;

      .dialog-title {
        padding-bottom: 15px;
        text-align: center;
        margin-right: 32px;
        overflow: hidden;

        .title-text {
          font-size: 16px;
          font-weight: 700;
          float: left;
          line-height: 40px;
        }

        .el-dialog__headerbtn {
          background: #fff;
          -webkit-box-shadow: 0 8px 16px rgba(55, 66, 152, 0.2);
          box-shadow: 0 8px 16px rgba(55, 66, 152, 0.2);
          border-radius: 8px;
          width: 40px;
          height: 40px;
          top: -12px;
          right: -12px;
        }
      }
    }
  }

  .custom-target-content {
    min-height: 40px;
    background: #fff;

    b {
      display: inline-block;
      width: 120px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      padding: 0 20px;
      margin: 0px 15px 22px 0px;
      font-weight: bold;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    padding: 0;
    width: 100%;
  }

  .el-dialog__body {
    padding: 32px;
  }

  .el-dialog__footer {
    padding: 24px !important;
  }
}

:deep(.el-form) {
  .el-form-item {
    height: 18px;

    .el-form-item__label {
      width: 120px;
      justify-content: center;
      color: black;
    }

    input {
      font-size: 12px;
      color: black;
    }

    .el-input__wrapper {
      height: 40px;
      width: 210px;
      border-radius: 8px;
    }

    .el-select {
      .el-input__wrapper {
        box-shadow: none;
        border: 1px solid #e5e5ed;
      }
    }
  }
}</style>

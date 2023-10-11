<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref, computed } from 'vue'
import { useConfig } from '@/pinia/config'
import type { FormRules, FormInstance } from 'element-plus'
const router = useRouter()
const useConfigStore = useConfig()

const handleGoback = () => {
  router.go(-1)
}
interface RuleForm {
  channel: string,
  pomotionName: string,
  appDownloadLink: string,
  isMultiPromotion: boolean,
  isCustomer: boolean,
  start: number,
  count: number,
  linkType: string,
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
  channel: [
    { required: true, message: '必填', trigger: 'blur' },
  ],
})
const ruleForm = reactive<RuleForm>({
  channel: '', // 选定的渠道
  pomotionName: '', // 推广活动名称
  appDownloadLink: '', // 应用下载地址
  isMultiPromotion: false, // 是否多个活动
  isCustomer: false, // 是否自定义
  start: 1,
  count: 2,
  linkType: 'https'
})
// 推广渠道
const channels = ref([
  { label: '今日头条', value: 'toutiao' },
  { label: '广点通', value: 'guangdiantong' },
  { label: '百度原生', value: 'baidu' },
  { label: 'Bilibili', value: 'bilibili' },
  { label: '微博', value: 'weibo' },
  { label: 'UC头条', value: 'uc' },
])

// 是否新建活动
const isCreate = computed(() => useConfigStore.promotionOption.isCreate)
// 编辑活动的id
const id = computed(() => useConfigStore.promotionOption.id)

// 活动后缀终止
const countEnd = computed(() => (ruleForm.start + ruleForm.count - 1).toString())


const submitForm = async (formEl: FormInstance | undefined) => {
  console.log(ruleForm)
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
  router.go(-1)
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  router.go(-1)
}
</script>

<template>
  <div class="camp-detail-content">
    <div class="goback"
         @click="handleGoback">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      <span>返回</span>
    </div>
  </div>
  <h3 class="mt20 ft16">{{ isCreate ? '新建活动' : '修改活动' }}</h3>
  <div class="mt20">
    <el-form label-width="130"
             :rules="rules"
             :model="ruleForm"
             ref="ruleFormRef">
      <el-card class="main-card">
        <el-form-item label="推广活动渠道"
                      prop="name">
          <el-select v-model="ruleForm.channel"
                     class="my-select"
                     style="width: 400px;"
                     placeholder="请选择渠道">
            <el-option v-for="channel in channels"
                       :key="channel.value"
                       :label="channel.label"
                       :value="channel.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="推广活动名称"
                      prop="name">
          <el-input v-model="ruleForm.pomotionName"
                    class="my-input"
                    style="width: 400px;"
                    placeholder="请输入推广活动"></el-input>
        </el-form-item>
        <el-form-item label="应用下载地址">
          <el-input v-model="ruleForm.appDownloadLink"
                    class="my-input"
                    style="width: 400px;"
                    placeholder="请输入推广活动"></el-input>
        </el-form-item>
        <el-form-item label="点击监测短链"
                      v-show="!isCreate">
          <el-input class="my-input"
                    disabled
                    style="width: 400px;"
                    placeholder="">{{ id }}</el-input>
        </el-form-item>
        <el-form-item label="展示监测短链"
                      v-show="!isCreate">
          <el-input class="my-input"
                    disabled
                    style="width: 400px;"
                    placeholder=""></el-input>
        </el-form-item>
      </el-card>
      <el-card class="mt20 main-card">
        <el-form-item label="创建类型">
          <el-switch v-model="ruleForm.isMultiPromotion"
                     class="ml-2"
                     inline-prompt
                     style=" --el-switch-off-color: #6b7aff"
                     active-text="批量活动"
                     inactive-text="单个活动" />
        </el-form-item>
        <el-form-item label="命名规则"
                      v-show="ruleForm.isMultiPromotion">
          <template #default>
            <el-switch v-model="ruleForm.isCustomer"
                       disabled
                       class="ml-2"
                       inline-prompt
                       style=" --el-switch-off-color: #6b7aff"
                       active-text="自定"
                       inactive-text="默认" />
            <span class="form-sub-item">*目前仅支持默认</span>
          </template>
        </el-form-item>
        <el-form-item label="创建活动数量"
                      v-show="ruleForm.isMultiPromotion">

          <template #default>
            <el-input-number class="my-input-number"
                             :min="2"
                             :max="10000"
                             controls-position="right"
                             size="large"
                             v-model="ruleForm.count"
                             @change="" />
            <span class="form-sub-item">*请输入2～10000之间的整数</span>
          </template>
        </el-form-item>
        <el-form-item label="活动名称后缀范围"
                      v-show="ruleForm.isMultiPromotion">
          <template #default>
            <div style="display: flex; flex-direction: column;">
              <div>
                <el-input-number class="my-input-number"
                                 :min="1"
                                 controls-position="right"
                                 size="large"
                                 v-model="ruleForm.start"
                                 @change="" />

                ~
                <el-input-number class="my-input-number"
                                 disabled
                                 :min="2"
                                 controls-position="right"
                                 size="large"
                                 :placeholder="countEnd"
                                 @change="" />
              </div>
              <p class="form-sub-item-newline">
                活动名称后缀是指在批量创建时为了区别不同推广活动而添加的数字后缀，假设填写推广活动名称为“首页轮播”，则若批量创建，样式为“首页轮播_n”。其实默认值时您填写的推广活动名称下可用后缀的最小值。</p>
            </div>
          </template>
        </el-form-item>
        <el-form-item label="点击监测短链类型">
          <el-radio-group v-model="ruleForm.linkType"
                          class="my-radio-group">
            <el-radio label="https">https</el-radio>
            <el-radio label="http">http</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <div class="mt20"
           style="display: flex; justify-content: right;">
        <el-form-item>
          <el-button class="broadBtn"
                     style="width: 90px; border: none;"
                     @click="resetForm(ruleFormRef)">
            取消
          </el-button>
          <el-button class="broadBtn"
                     style="width: 90px;"
                     type="primary"
                     @click="submitForm(ruleFormRef)">
            立即创建
          </el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<style scoped lang="less">
.camp-detail-content {
  .goback {
    display: flex;
    align-items: center;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    cursor: pointer;
  }
}

.mt20 {
  margin-top: 20px;
}

.ft16 {
  font-size: 16px;
}

.form-sub-item {
  font-size: 12px;
  margin-left: 10px;
  line-height: 23px;
  color: #8a8b98 !important;
}

.form-sub-item-newline {
  font-size: 12px;
  line-height: 23px;
  color: #8a8b98 !important;
}

:deep(.el-form-item__label) {
  font-size: 12px;
  color: #606266;
}

// :deep(.el-input__inner) {
//   // width: 400px;
//   font-size: 12px;
// }
</style>
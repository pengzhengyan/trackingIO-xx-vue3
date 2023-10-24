<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref, computed, onBeforeMount } from 'vue'
import { useConfig } from '@/pinia/config'
import { useUserInfo } from '@/pinia/userInfo'
import { type FormRules, type FormInstance, ElMessage } from 'element-plus'
import { getChannalList, addActivity, getActivityById } from '@/api'
import { exportExcel } from '@/utils/exportExcel.ts'
import { checkActivityName } from '@/utils/myFormRules'

const router = useRouter()
const useConfigStore = useConfig()
const useUserInfoStore = useUserInfo()

const handleGoback = () => {
  router.go(-1)
}
const username = computed(() => useUserInfoStore.loginId)
const pub = computed(() => useUserInfoStore.appSelected)
const reqConfig = computed(() => useUserInfoStore.reqConfig)
const editType = computed(() => useConfigStore.promotionOption.isCreate ? "add" : "update")

interface RuleForm {
  channel: Channel,
  pomotionName: string,
  appDownloadLink: string,
  curl: string,
  isMultiPromotion: boolean,
  isCustomer: boolean,
  start: number,
  count: number,
  linkType: string,
}
const ruleFormRef = ref<FormInstance>()
// 表单校验规则
const checkChannel = (_: any, value: any, fn: any) => {
  if (value.value === '') {
    console.log('必填')
    fn(new Error('必填'))
  } else {
    fn()
  }
}
const rules = reactive<FormRules<RuleForm>>({
  channel: [
    { validator: checkChannel, trigger: 'blur', required: true },
  ],
  pomotionName: [
    { validator: checkActivityName, trigger: 'blur', required: true }
  ],
})
const ruleForm = reactive<RuleForm>({
  channel: { label: '', value: '' }, // 选定的渠道
  pomotionName: '', // 推广活动名称
  appDownloadLink: '', // 应用下载地址
  curl: '', // 应用点击监测试链接
  isMultiPromotion: false, // 是否多个活动
  isCustomer: false, // 是否自定义
  start: 1,
  count: 2,
  linkType: 'https'
})
// 推广渠道
type Channel = { label: string; value: string }
const channels = ref([
  { label: '', value: '' },
])
const initChannels = async () => {
  const { data } = await getChannalList(reqConfig.value)
  // 判断是否正确获取到数组
  if (data.length === 0 || !Array.isArray(data)) return
  channels.value = data.map((item: { channelname: string, channelid: string }) => {
    return { label: item.channelname, value: item.channelid }
  })
  if (isCreate.value) return
  // 如果是编辑状态，则进行编辑状态的初始化
  initEdit()
}
// 初始化进入编辑状态
const initEdit = async () => {
  // 如果没有传入编辑的id，则回到推广活动管理页面
  if (id.value === '') {
    router.push({ name: 'manage-campaign' })
    return
  }
  let { data } = await getActivityById(JSON.stringify({ xaid: id.value }))
  data = data[0]
  const channel = channels.value.find(item => item.value === data.channel_id)

  if (!channel) return ElMessage.error('渠道信息有误')
  ruleForm.pomotionName = data.aname
  ruleForm.channel = channel
  ruleForm.appDownloadLink = data.durl
  ruleForm.curl = data.curl
}

// 是否新建活动
const isCreate = computed(() => useConfigStore.promotionOption.isCreate)
// 编辑活动的id
const id = computed(() => useConfigStore.promotionOption.id)

// 活动后缀终止
const countEnd = computed(() => (ruleForm.start + ruleForm.count - 1).toString())

// 提交表格
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    // 表格校验成功时的操作
    if (valid) {
      if (isCreate.value) {
        // 导出表格用的表格名
        const filename = `监测链接-${ruleForm.pomotionName}`
        // 声明一个空的请求列表
        const req = [{
          type: editType.value,
          username: username.value,
          channel: ruleForm.channel.label,
          channelid: ruleForm.channel.value,
          aname: '',
          durl: ruleForm.appDownloadLink,
          pub: pub.value,
          data: { aname: '', durl: ruleForm.appDownloadLink, state: '1' }
        }]

        // 根据是否添加多条分别处理
        if (ruleForm.isMultiPromotion) {
          const list = []
          for (let i = 0; i < ruleForm.count; i++) {
            req[0].aname = ruleForm.pomotionName + (ruleForm.start + i)
            req[0].data.aname = ruleForm.pomotionName + (ruleForm.start + i)
            list.push({ name: ruleForm.pomotionName + (ruleForm.start + i), link: '暂无' })
            const reqJson = JSON.stringify(req)
            addActivity(reqJson, reqConfig.value).then((res) => {
              res.data.code === 0 ? ElMessage.success(res.data.msg) : ElMessage.error(res.data.msg)
            })
          }
          // 导出添加链接的信息
          exportExcel(list, filename)
        } else {
          req[0].aname = ruleForm.pomotionName
          req[0].data.aname = ruleForm.pomotionName
          // 导出添加链接的信息
          exportExcel([{ name: ruleForm.pomotionName, link: '暂无' }], filename)
          const reqJson = JSON.stringify(req)
          addActivity(reqJson, reqConfig.value).then((res) => {

            res.data.code === 0 ? ElMessage.success(res.data.msg) : ElMessage.error(res.data.msg)
          })
        }
      } else {
        // 编辑链接
        // 声明一个空的请求列表
        const req = [{
          type: editType.value,
          username: username.value,
          xaid: id.value,
          pub: pub.value,
          data: { aname: ruleForm.pomotionName, durl: ruleForm.appDownloadLink, state: '1' }
        }]

        const reqJson = JSON.stringify(req)
        addActivity(reqJson, reqConfig.value).then((res) => {
          res.data.code === 0 ? ElMessage.success(res.data.msg) : ElMessage.error(res.data.msg)
        })
      }
      router.go(-1)
    } else {
      ElMessage.error('必填项不能为空')
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  router.go(-1)
}

onBeforeMount(() => {
  initChannels()
})
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
                      prop="channel">
          <el-select v-model="ruleForm.channel"
                     :disabled="!isCreate"
                     class="my-select"
                     style="width: 400px;"
                     placeholder="请选择渠道">
            <el-option v-for="channel in channels"
                       :key="channel.value"
                       :label="channel.label"
                       :value="channel" />
          </el-select>
        </el-form-item>
        <el-form-item label="推广活动名称"
                      prop="pomotionName">
          <el-input v-model.trim="ruleForm.pomotionName"
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
          <el-input v-model="ruleForm.curl"
                    class="my-input"
                    disabled
                    style="width: 400px;"
                    placeholder=""></el-input>
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
        <el-form-item label="创建类型"
                      v-if="isCreate">
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
        <el-form-item label="点击监测短链类型"
                      v-if="isCreate">
          <el-radio-group v-model="ruleForm.linkType"
                          class="my-radio-group">
            <el-radio label="https">https</el-radio>
            <el-radio label="http"
                      disabled>http</el-radio>
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
            {{ isCreate ? '立即创建' : '保存' }}
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
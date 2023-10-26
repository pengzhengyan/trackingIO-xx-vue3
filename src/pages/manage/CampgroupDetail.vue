<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref, computed, onBeforeMount } from 'vue'
import { useConfig } from '@/pinia/config'
import { useUserInfo } from '@/pinia/userInfo'
import { type FormRules, type FormInstance, ElMessage } from 'element-plus'
import { getChannalList, addActivityGroup, getActivityGroupById, getActivity } from '@/api'
import { checkActivityName } from '@/utils/myFormRules'

const router = useRouter()
const useConfigStore = useConfig()
const useUserInfoStore = useUserInfo()

const handleGoback = () => {
  router.go(-1)
}

const reqConfig = computed(() => useUserInfoStore.reqConfig)
const editType = computed(() => useConfigStore.campgroupOption.isCreate ? "add" : "update")

/** 
 * type 
 * */
type Activity = {
  xaid: string;
  aname: string;
  curl: string;
  date: string;
  state: string;
  channel_id: string;
}

// 表单类型
interface RuleForm {
  channel: Channel,
  pomotionName: string,
  gruopType: string,
  activityList: string[],
}

/**
 * 表单从这里开始
 */
const ruleFormRef = ref<FormInstance>()
// 表单校验规则
const rules = reactive<FormRules<RuleForm>>({
  pomotionName: [
    { validator: checkActivityName, trigger: 'blur', required: true }
  ],
  gruopType: [
    { required: true, trigger: 'blur', message: '必填' }
  ]
})
const ruleForm = reactive<RuleForm>({
  channel: { label: '', value: '' }, // 选定的渠道
  pomotionName: '', // 推广活动名称
  gruopType: '1',
  activityList: []
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
  let { data } = await getActivityGroupById(JSON.stringify({ groupid: id.value }), reqConfig.value)
  if (data.length === 0) return ElMessage.error('该活动组不存在')
  data = data[0]
  ruleForm.pomotionName = data.groupname
  ruleForm.activityList = data.list
  activityList.value.filter((item) => !data.list.includes(item.key))
}

// 是否新建活动
const isCreate = computed(() => useConfigStore.campgroupOption.isCreate)
// 编辑活动的id
const id = computed(() => useConfigStore.campgroupOption.id)

/**
 * 穿棱框
 */
const filterMethod = (query: any, item: any) => {
  return item.label.toLowerCase().includes(query.toLowerCase())
}
interface Option {
  key: string
  label: string
}
// 声明活动列表
const activityList = ref<Option[]>([])
// 初始化活动列表
const initActivityList = async () => {
  // 向服务器请求活动列表
  const { data } = await getActivity(reqConfig.value)
  // 筛选出启用的活动铺
  activityList.value = data.filter((item: Activity) => item.state === '1')
    .map((item: Activity) => {
      return { key: item.xaid, label: item.aname }
    })
}

// 提交表格
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    // 表格校验成功时的操作
    if (valid) {
      if (isCreate.value) {
        // 声明一个空的请求列表
        const req = {
          type: editType.value,
          groupname: ruleForm.pomotionName,
          activitylist: ruleForm.activityList
        }
        const reqJson = JSON.stringify(req)
        addActivityGroup(reqJson, reqConfig.value).then((res) => {

          res.data.code === 0 ? ElMessage.success(res.data.msg) : ElMessage.error(res.data.msg)
        })
      } else {
        // 编辑链接
        // 声明一个空的请求列表
        const req = {
          type: editType.value,
          groupid: id.value,
          data: { groupname: ruleForm.pomotionName, activitylist: ruleForm.activityList }
        }

        const reqJson = JSON.stringify(req)
        addActivityGroup(reqJson, reqConfig.value).then((res) => {
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
  initActivityList()
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
  <h3 class="mt20 ft16">{{ isCreate ? '新建活动组' : '修改活动组' }}</h3>
  <div class="mt20">
    <el-form label-width="130"
             :rules="rules"
             :model="ruleForm"
             ref="ruleFormRef">
      <el-card class="main-card">
        <el-form-item label="活动组类型"
                      prop="gruopType">
          <el-radio-group v-model="ruleForm.gruopType">
            <el-radio :disabled="!isCreate"
                      label="1">常规活动组</el-radio>
            <el-radio :disabled="!isCreate"
                      label="2">再营销活动组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推广活动名称"
                      prop="pomotionName">
          <el-input v-model.trim="ruleForm.pomotionName"
                    class="my-input"
                    style="width: 400px;"
                    placeholder="请输入推广活动"></el-input>
        </el-form-item>
        <el-form-item label="推广活动渠道">
          <el-select v-model="ruleForm.channel"
                     class="my-select"
                     style="width: 400px;"
                     placeholder="请选择渠道">
            <el-option v-for="channel in channels"
                       :key="channel.value"
                       :label="channel.label"
                       :value="channel" />
          </el-select>
        </el-form-item>
      </el-card>
      <el-card class="mt20 main-card">
        <el-transfer v-model="ruleForm.activityList"
                     filterable
                     :filter-method="filterMethod"
                     filter-placeholder="搜索关键词"
                     :titles="['选择推广活动', '已选活动']"
                     :button-texts="['', '']"
                     :format="{
                       noChecked: '${total}',
                       hasChecked: '${total}',
                     }"
                     :data="activityList" />
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
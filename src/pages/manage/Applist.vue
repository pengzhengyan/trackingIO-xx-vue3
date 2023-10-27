<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormRules, type FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserInfo } from '@/pinia/userInfo'
import moment from 'moment'
import { addApp } from '@/api'

const router = useRouter()
const userinfoStroe = useUserInfo()

const reqConfig = computed(() => userinfoStroe.reqConfig)
let activeTab = ref(0)
const handleTabClick = () => {
  ElMessage.error('功能暂未开放')
}

const platforms = [
  { icon: 'ios', label: 'iOS', value: 'iOS' },
  { icon: 'android', label: 'Android', value: 'Android' },
  // { icon: 'quickapp', label: '快应用', value: '3' },
  // { icon: 'html5', label: 'H5', value: '4' },
  // { icon: 'wechatapp', label: '小程序', value: '5' },
  // { icon: 'minigame', label: '小游戏', value: '6' },
  // { icon: 'mediasite', label: '媒体自建站  ', value: '7' },
]

/** 新建应用 */
const dialogFormVisible = ref(false)
const type = ref('add')
const handleAddApp = () => {
  dialogFormVisible.value = true
  type.value = 'add'
  ruleForm.value.pub = ''
  ruleForm.value.platform = ''
  ruleForm.value.name = ''
}
const isAdd = computed(() => type.value === 'add')
// 新建应用的表单
interface RuleForm {
  pub: string,
  platform: string,
  name: string,
}
const ruleForm = ref<RuleForm>({
  pub: '',
  platform: '',
  name: ''
})
const ruleFormRef = ref<FormInstance>()

const validatePub = (_: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('必填'))
  } else {
    const found = applist.value.find((app) => app.pub === value)

    if (found && isAdd.value) {
      callback(new Error('该标识已存在'))
    } else {
      callback()
    }
  }
}

const formRules = reactive<FormRules>({
  pub: [{ required: true, validator: validatePub, trigger: 'blur' }],
  platform: [{ required: true, message: '必填', trigger: 'blur' }],
  name: [
    { required: true, message: '必填', trigger: 'blur' },
    { max: 20, message: '40个字符以内', trigger: 'change' }
  ],
})

const handelSubmitMitiSelect = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.validate((valid) => {
    if (valid) {
      const req = isAdd.value ? {
        type: type.value,
        name: ruleForm.value.name,
        platform: ruleForm.value.platform,
        pub: ruleForm.value.pub,
      } : {
        type: type.value,
        id: editAppId.value,
        data: {
          name: ruleForm.value.name,
          pub: ruleForm.value.pub,
        }
      }
      const reqJson = JSON.stringify(req)
      addApp(reqJson, reqConfig.value).then((res) => {
        if (res.status === 200) {
          userinfoStroe.updateApplist(res.data)
          dialogFormVisible.value = false
          const msg = isAdd.value ? '添加应用成功' : '修改应用成功'
          ElMessage.success(msg)
        } else {
          return ElMessage.error('提交失败')
        }
      })
    } else {
      return false
    }
  })
}
/**
 * 应用列表区
 */
let platform = ref<string[]>([])
let appKeywords = ref<string>('')
const applist = computed(() => {
  // return userinfoStroe.applist
  // 关键字筛选
  const list = userinfoStroe.applist
    .filter((app) => (app.name + app.pub).toLowerCase().includes(appKeywords.value.toLowerCase()))
  // 平台筛选
  if (platform.value.length === 0) {
    return list
  } else {
    return list.filter((app) => platform.value?.includes(app.platform))
  }
})

const handleAppcardClick = (pub: string) => {
  userinfoStroe.reselectApp(pub)
  router.push({ name: 'monitor-dashboard' })

}
const editAppId = ref('')
const handleAppEdit = (appid: string) => {
  editAppId.value = appid
  type.value = 'update'
  dialogFormVisible.value = true
  // 查询addid对应的
  const appFound = userinfoStroe.applist.find((app) => app.appid === appid)
  if (appFound) {
    ruleForm.value.pub = appFound.pub
    ruleForm.value.platform = appFound.platform
    ruleForm.value.name = appFound.name
  } else { ElMessage.error('该应用不存在') }
}
// 时间格式
const formatDate = (time: string) => moment(Number(time) * 1000).format('YYYY-MM-DD hh:mm:ss')
</script>

<template>
  <div class="app-main">
    <div class="app-content"
         style="min-height: calc(100vh - 176px);">
      <div class="app-head">
        <div class="app-lf">
          <el-button type="primary"
                     class="broadBtn"
                     @click="handleAddApp">
            <SvgIcon name="appicon1"
                     style="margin-right: 5px;" />新建应用
          </el-button>

          <!-- 新建应用弹出框 -->
          <el-dialog v-model="dialogFormVisible"
                     :close-on-click-modal="false"
                     title="新建应用">
            <el-form ref="ruleFormRef"
                     :model="ruleForm"
                     :rules="formRules">
              <el-form-item label="标识"
                            prop="pub">
                <el-input class="my-input width400"
                          placeholder="请填写标识"
                          :disabled="!isAdd"
                          v-model.trim="ruleForm.pub">
                </el-input>
              </el-form-item>
              <el-form-item label="平台"
                            prop="platform">
                <el-radio-group v-model="ruleForm.platform"
                                :disabled="!isAdd">
                  <el-radio v-for="item in platforms"
                            :key="item.value"
                            :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="应用名称"
                            prop="name">
                <el-input class="my-input width400"
                          v-model.trim="ruleForm.name"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary"
                           @click="handelSubmitMitiSelect(ruleFormRef)">
                  提交
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>
        <div class="app-rg">
          <ul class="app-tabs"
              @click="handleTabClick">
            <li :class="activeTab === 0 ? 'on' : ''">已调试</li>
            <li :class="activeTab === 1 ? 'on' : ''">待调试</li>
          </ul>
          <div class="sortbox mr-16">
            <span v-show="activeTab === 0">调试完成时间</span>
            <span v-show="activeTab === 1">产品创建时间</span>
            <span class="caretbox">
            </span>
          </div>
          <el-select class=" my-shadow-select mr-16"
                     clearable
                     multiple
                     collapse-tags
                     collapse-tags-tooltip
                     style="width: 172px"
                     v-model="platform"
                     placeholder="筛选系统平台">
            <el-option v-for="option in platforms"
                       :key="option.value"
                       :label="option.label"
                       :value="option.value">
              <template #default>
                <div style="display: flex; align-items: center;">
                  <SvgIcon :name="option.icon"></SvgIcon>
                  <span style="display: inline-block; font-size: 12px; margin-left: 6px;">
                    {{ option.label }}
                  </span>
                </div>
              </template>
            </el-option>
          </el-select>
          <div class="searchbox broadInput">
            <el-input class="my-shadow-input"
                      placeholder="搜索应用名称或标识"
                      v-model.trim="appKeywords">
              <template #suffix>
                <SvgIcon name="search"></SvgIcon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
      <div class="app-body">
        <div class="app-list">
          <p class="app-list-title mt-24 mb-24">常用应用</p>
          <!-- <p class="app-list-subtitle">暂无常用应用，请点击以下应用右下角图钉按钮进行设置 </p> -->
          <el-row>
            <el-col :span="8"
                    style="padding-right: 10px;"
                    v-for="app in applist"
                    :key="app.appid">
              <el-card class="app-card"
                       @click="handleAppcardClick(app.pub)">
                <div class="app-info">
                  <div class="app-icon">
                    <SvgIcon :name="app.platform.toLowerCase()"
                             width="50px"
                             height="50px"></SvgIcon>
                  </div>
                  <div class="app-info-rg">
                    <p class="app-title ">{{ app.name }}</p>
                    <p class="app-title ">{{ app.pub }}</p>
                    <p class="app-sub-title">{{ formatDate(app.addtime) }}</p>
                  </div>
                </div>
                <div class="edit-icon"
                     @click.stop="handleAppEdit(app.appid)">
                  <el-icon size="20px">
                    <Edit></Edit>
                  </el-icon>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.app-main {
  .app-content {
    color: #2d2f4e;
    font-size: 12px;

    .app-head {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .app-lf {
        :deep(.el-dialog) {
          border-radius: 8px;

          .el-form-item__label {
            font-size: 12px;
            color: #606266;
            width: 140px;
          }
        }
      }

      .app-rg {
        display: flex;
        align-items: center;
        justify-items: end;

        .app-tabs {
          width: 172px;
          vertical-align: middle;
          line-height: 20px;
          margin-right: 30px;
          margin-left: 10px;
          display: inline-block;
          list-style: none;

          li {
            float: left;
            color: #8a8b98;
            margin: 0 10px;
            cursor: pointer;

            &.on {
              color: #2d2f4e;
              border-bottom: 2px solid #6b7aff;
            }
          }
        }

        .searchbox {
          width: 260px;
        }
      }
    }

    .app-body {
      .app-list {
        .app-card {
          cursor: pointer;
          margin-bottom: 10px;
          height: 155px;

          .app-info {
            display: flex;
            height: 75px;
            padding: 10px 5px 5px 10px;
            box-sizing: content-box;

            .app-icon {
              margin-right: 10px;
            }

            .app-info-rg {
              .app-title {
                font-size: 14px;
                font-weight: 700;
                color: #2d2f4e;
                margin-bottom: 6px;
              }
            }
          }

          .edit-icon {
            float: right;
            display: none;
          }

          &:hover {
            .edit-icon {
              color: #6b7aff;
              display: block;
            }
          }
        }
      }
    }
  }
}

.mr-16 {
  margin-right: 16px;
}

.mt-24 {
  margin-top: 24px;
}

.mb-24 {
  margin-bottom: 24px;
}

.width400 {
  width: 400px;
}
</style>
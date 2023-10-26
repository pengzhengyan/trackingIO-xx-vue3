<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormRules, type FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserInfo } from '@/pinia/userInfo'

const router = useRouter()
const userinfoStroe = useUserInfo()

let activeTab = ref(0)
const handleTabClick = () => {
  ElMessage.error('功能暂未开放')
}

const platforms = [
  { icon: 'ios', label: 'iOS', value: '1' },
  { icon: 'android', label: 'Android', value: '2' },
  { icon: 'quickapp', label: '快应用', value: '3' },
  { icon: 'html5', label: 'H5', value: '4' },
  { icon: 'wechatapp', label: '小程序', value: '5' },
  { icon: 'minigame', label: '小游戏', value: '6' },
  { icon: 'mediasite', label: '媒体自建站  ', value: '7' },
]

/** 新建应用 */
const dialogFormVisible = ref(false)
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

const formRules = reactive<FormRules>({
  pub: [{ required: true, message: '必填', trigger: 'blur' }],
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
      console.log('submit!')
    } else {
      console.log('error submit!')
      return false
    }
  })
}
/**
 * 应用列表区
 */
let value = ref('')
const applist = computed(() => userinfoStroe.applist)
const selectChangeHandle = () => {
  // ElMessage.error('功能暂未开放')
}

const handleAppcardClick = (pub: string) => {
  userinfoStroe.reselectApp(pub)
  router.push({ name: 'monitor-dashboard' })

}
// 
</script>

<template>
  <div class="app-main">
    <div class="app-content"
         style="min-height: calc(100vh - 176px);">
      <div class="app-head">
        <div class="app-lf">
          <el-button type="primary"
                     class="broadBtn"
                     @click="dialogFormVisible = true">
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
                <el-select class="my-select width400"
                           placeholder="请选择标识"
                           v-model="ruleForm.pub"
                           filterable>
                  <el-option label="111111"
                             value="111111" />
                  <el-option label="111112"
                             value="111112" />
                </el-select>
              </el-form-item>
              <el-form-item label="平台"
                            prop="platform">
                <el-radio-group v-model="ruleForm.platform">
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
        <div class="app-rg"
             @click="handleTabClick">
          <ul class="app-tabs">
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
                     v-model="value"
                     placeholder="筛选系统平台"
                     @change="selectChangeHandle">
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
                      placeholder="搜索应用名称或APPKEY">
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
                    style="padding-right: 6px;"
                    v-for="app in applist"
                    :key="app">
              <el-card class="app-card"
                       @click="handleAppcardClick(app)">
                <div class="app-info">
                  <div class="app-icon">
                    <SvgIcon name="ios"
                             width="50px"
                             height="50px"></SvgIcon>
                  </div>
                  <div class="app-info-rg">
                    <p class="app-title ">{{ app }}</p>
                    <p class="app-sub-title">调试完成时间 2023-8-30 10:30:14</p>
                  </div>
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
          margin-bottom: 5px;

          .app-info {
            display: flex;
            height: 100px;
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
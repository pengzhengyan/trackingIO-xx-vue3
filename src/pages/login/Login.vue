<script setup lang="ts">
import { useUserInfo } from '@/pinia/userInfo';
import { ElMessage } from 'element-plus'
import { LOGIN_INFO } from '@/keys/storage'
import { useRouter } from 'vue-router'
import { login } from '@/api'

const router = useRouter()
const userInfoStore = useUserInfo()
/**
 * 表单信息
 * @prop email 邮箱地址
 * @prop password 密码
 */
let formState = $ref({
  email: '',
  password: ''
})

/**
 * 按钮加载状态
 * - (true) 加载中
 * - (false) 反之
 */
let buttonLoading = $ref(false)

const enterlogin = (e: KeyboardEvent) => {
  if (e.key === "Enter") handleLogIn()
}
/** 处理登录按钮点击事件 */
async function handleLogIn() {
  let { email, password } = formState

  if (!email || !password) return ElMessage({
    message: '帐号密码不能为空',
    type: 'error'
  })

  try {
    buttonLoading = true
    // 验证登录
    const { data } = await login(email, password)
    // const received = await login(config)
    if (data.code === 200) {
      /** 模拟接口响应 */
      // await new Promise(resolve => setTimeout(resolve, 1000))
      /** 获取用户数据 */
      userInfoStore.initUserinfo(data.result)
      /** 存token */
      let loginData = {
        token: data.result.token,
        username: email,
        password,
      }
      localStorage.setItem(LOGIN_INFO, JSON.stringify(loginData))
      /** 跳转到应用选择界面 */
      router.push({ name: 'applist' })
    } else {
      localStorage.removeItem(LOGIN_INFO)
      ElMessage({
        message: data.message,
        type: 'error'
      })
    }
  } catch (error) {

  } finally {
    buttonLoading = false
  }
}
</script>

<template>
  <div class="Login"
       @keyup="enterlogin">
    <div class="left-content">
      <div class="title">
        <p>Welcome back!</p>
        <p>Please sign in to your</p>
        <p><span style="text-decoration: underline;">SHUJUZHONGTAI</span> account</p>
      </div>
      <div class="description">
        lorem ipsum dolor sit amet consectetur.
        facilisi neque lectus turpis id tincidunt eget.
        sagittis id et cursus porttitos.
      </div>
    </div>
    <div class="right-content">
      <div class="logo">
        COPING<span style='color: hotpink;'>I</span><span style='color: mediumpurple;'>O</span>
      </div>
      <div class="enter-container">
        <div class="title">Sign In</div>
        <div class="description">Welcome back! Please enter your details</div>
        <div class="form">
          <div class="form-item">
            <div class="label">Email</div>
            <el-input placeholder="Enter your email"
                      autocomplete="off"
                      v-model="formState.email" />
          </div>
          <div class="form-item">
            <div class="label">Password</div>
            <el-input placeholder="Enter your password"
                      show-password
                      autocomplete="off"
                      v-model="formState.password" />
          </div>
        </div>
        <el-button class="login-button"
                   type="primary"
                   :loading="buttonLoading"
                   @click="handleLogIn">Sign in</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.Login {
  width: 100vw;
  height: 100vh;
  background-color: #f7fafe;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  padding: 3vw;

  .left-content {
    width: 740px;
    height: 100%;
    padding: 50px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    &::before {
      background-color: var(--el-color-primary);
      background-image: url('@/assets/images/login/image1.jpg');
      background-size: cover;
    }

    &::after {
      backdrop-filter: blur(25px);
    }

    .title {
      font-weight: 600;
      font-size: 50px;
      color: #fff;
      text-align: center;
      margin-bottom: 30px;
      line-height: 54px;
      z-index: 1;
    }

    .description {
      font-size: 20px;
      color: #fff;
      opacity: .55;
      text-align: center;
      z-index: 1;
    }
  }

  .right-content {
    width: 508px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .logo {
      font-weight: 800;
      font-size: 30px;
      margin-bottom: 20px;
    }

    .enter-container {
      width: 100%;
      background-color: #fff;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, .05);

      .title {
        text-align: center;
        font-size: 24px;
        color: #000;
        margin-bottom: 15px;
      }

      .description {
        text-align: center;
        font-size: 16px;
        color: #000;
        opacity: .55;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 30px;

        .form-item {
          .label {
            font-size: 14px;
            color: #000;
            opacity: .55;
            margin-bottom: 10px;
          }

          .el-input {
            --el-input-border-radius: 12px;
            --el-component-size: 48px;
          }
        }
      }

      .login-button {
        --el-font-size-base: 16px;
        --el-border-radius-base: 12px;
        width: 100%;
        height: 48px;
        margin-top: 16px;
      }
    }
  }
}
</style>
@/pinia/userInfo
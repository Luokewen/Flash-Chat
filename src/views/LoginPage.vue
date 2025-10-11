<template>
  <div class="form-container">
    <el-form :model="form" label-width="auto" style="max-width: 600px" :rules="formRules" ref="loginForm">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" style="width: 240px" placeholder="请输入用户名" prop="username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" style="width: 240px" placeholder="请输入密码" type="password" prop="password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
        <el-button @click="handleRegister">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { ElMessage } from 'element-plus'
import type { UserResponse } from '../../types/user'
import { useUserStore } from '../stores/userStore'
import type { UserInfo } from '../../types/userInfo'
import type { FormInstance } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
const form = reactive({
  username: '',
  password: '',
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' },
    //密码需要包含字母和数字
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,12}$/, message: '密码需要包含字母和数字', trigger: 'blur' }
  ],
}

// 登录表单引用
const loginForm = ref<FormInstance | null>(null)

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    await loginForm.value?.validate()

    // 调用登录API
    const response = await api.user.login(form)
    const res: UserResponse = response.data

    // 保存token
    localStorage.setItem('token', res.token);

    // 保存用户信息
    userStore.user = res.data

    // 跳转到首页
    router.push('/home')

  } catch (error) {
    console.error('登录失败:', error);
  }
}

// 处理注册+
const handleRegister = async () => {
  try {
    // 表单验证
    await loginForm.value?.validate()

    // 调用注册API
    const response = await api.user.register(form)
    const res: UserResponse = response.data
    console.log(res)
    if (res && res.message === 'success') {
      console.log('注册成功:');
      ElMessage.success('注册成功，请登录');
      // 创建用户信息
      api.userInfo.createAndUpdateUserInfo({ userId: res.data.id, username: res.data.username }).then(res => {
        const userInfo: UserInfo = res.data;
        if (userInfo.code === 201) {
          userStore.userInfo = {
            ...userInfo.data,
          };
        }
      }
      )
    }
  } catch (error) {
    console.error('注册失败:', error);
  }
}

</script>


<style lang="less" scoped>
// 将画面居中
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>

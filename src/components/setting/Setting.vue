<template>
  <el-dialog v-model="dialogVisible" title="系统设置" width="500px" align-center>
    <!-- 设置内容区域 -->
    <div class="settings-container">
      <!-- 外观设置区域 -->
      <div class="settings-section">
        <h3 class="section-title">外观设置</h3>

        <div class="setting-item">
          <span class="setting-label">深色模式</span>
          <el-switch v-model="darkMode" active-text="开启" inactive-text="关闭" />
        </div>

        <div class="setting-item">
          <span class="setting-label">主题颜色</span>
          <el-color-picker v-model="themeColor" size="small" />
        </div>

        <div class="setting-item">
          <span class="setting-label">字体大小</span>
          <el-select v-model="fontSize" placeholder="选择字体大小" style="width: 160px">
            <el-option label="小" value="small" />
            <el-option label="中" value="medium" />
            <el-option label="大" value="large" />
          </el-select>
        </div>
      </div>

      <!-- 通知设置区域 -->
      <div class="settings-section">
        <h3 class="section-title">通知设置</h3>

        <div class="setting-item">
          <span class="setting-label">新消息通知</span>
          <el-switch v-model="messageNotification" active-text="开启" inactive-text="关闭" />
        </div>

        <div class="setting-item">
          <span class="setting-label">声音提示</span>
          <el-switch v-model="soundNotification" active-text="开启" inactive-text="关闭" />
        </div>
      </div>

      <!-- 语言设置区域 -->
      <div class="settings-section">
        <h3 class="section-title">语言设置</h3>

        <div class="setting-item">
          <span class="setting-label">界面语言</span>
          <el-select v-model="language" placeholder="选择语言" style="width: 160px">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
            <el-option label="日本語" value="ja-JP" />
            <el-option label="한국어" value="ko-KR" />
          </el-select>
        </div>
      </div>

      <!-- 账号设置区域 -->
      <div class="settings-section">
        <h3 class="section-title">账号设置</h3>

        <div class="setting-item">
          <span class="setting-label">修改密码</span>
          <el-button type="text" @click="openChangePasswordDialog">修改密码</el-button>
        </div>
      </div>

    </div>

    <!-- 底部按钮区域 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSave" :loading="isSaving">
          {{ isSaving ? '保存中...' : '保存设置' }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 修改密码对话框 -->
  <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px" align-center>
    <div class="password-form">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closePasswordDialog">取消</el-button>
        <el-button type="primary" @click="changePassword" :loading="isChangingPassword">
          {{ isChangingPassword ? '修改中...' : '确认修改' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import request from '@/utils/request';
import { useUserStore } from '@/stores/userStore';

// 获取用户store
const userStore = useUserStore();

// 接收外部传入的控制对话框显示的props
const props = defineProps<{
  visible?: boolean;
}>();

// 主设置对话框相关状态
const dialogVisible = ref(props.visible || false); // 弹窗显示状态

// 监听外部visible变化
watch(() => props.visible, (newVal) => {
  if (newVal !== undefined) {
    dialogVisible.value = newVal;
  }
});

// 定义事件，通知父组件对话框状态变化
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();
const darkMode = ref(false);      // 深色模式
const themeColor = ref('#409EFF');// 主题色
const fontSize = ref('medium');   // 字体大小
const messageNotification = ref(true); // 新消息通知
const soundNotification = ref(true);  // 声音提示
const language = ref('zh-CN');    // 界面语言
const isSaving = ref(false);      // 保存加载状态

// 修改密码对话框相关状态
const passwordDialogVisible = ref(false);
const isChangingPassword = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码验证规则
const passwordRules = reactive({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordFormRef.value?.resetFields();
  passwordDialogVisible.value = true;
};

// 关闭修改密码对话框
const closePasswordDialog = () => {
  passwordDialogVisible.value = false;
};

// 修改密码
const changePassword = async () => {
  // 表单验证
  if (!passwordFormRef.value) return;
  try {
    await passwordFormRef.value.validate();
    
    isChangingPassword.value = true;
    
    // 发送修改密码请求
      const response = await request({
        url: '/auth/password',
        method: 'put',
        data: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          userId: userStore.userInfo._id // 使用MongoDB的_id作为userId
        }
      });
    
    if (response.data.code === 200) {
      ElMessage.success('密码修改成功，请重新登录');
      closePasswordDialog();
      // 清除密码表单
      passwordFormRef.value.resetFields();
      // 可以选择是否自动退出登录
      // localStorage.removeItem('token');
      // router.push('/');
    } else {
      ElMessage.error(response.data.msg || '密码修改失败');
    }
  } catch (error: any) {
    console.error('修改密码失败：', error);
    ElMessage.error(error.message || '密码修改失败，请重试');
  } finally {
    isChangingPassword.value = false;
  }
};

// 关闭设置对话框
const onCancel = () => {
  dialogVisible.value = false;
  emit('update:visible', false);
};

// 保存设置
const onSave = async () => {
  isSaving.value = true;
  try {
    // 构建设置对象
    const settings = {
      darkMode: darkMode.value,
      themeColor: themeColor.value,
      fontSize: fontSize.value,
      messageNotification: messageNotification.value,
      soundNotification: soundNotification.value,
      language: language.value
    };
    
    // 保存到本地存储
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    // 应用设置
    applySettings(settings);
    
    ElMessage.success('设置保存成功');
    dialogVisible.value = false;
    emit('update:visible', false);
  } catch (error) {
    console.error('保存设置失败：', error);
    ElMessage.error('保存设置失败，请重试');
  } finally {
    isSaving.value = false;
  }
};

// 应用设置
const applySettings = (settings: any) => {
  // 应用深色模式
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // 应用字体大小
  document.documentElement.style.fontSize = 
    settings.fontSize === 'small' ? '12px' : 
    settings.fontSize === 'large' ? '16px' : '14px';
  
  // 应用主题颜色（这里简单示例，实际项目可能需要更复杂的主题切换逻辑）
  document.documentElement.style.setProperty('--primary-color', settings.themeColor);
  
  // 应用语言设置（这里仅作示例，实际项目可能需要更复杂的国际化处理）
  document.documentElement.setAttribute('lang', settings.language.split('-')[0]);
};

// 组件挂载时加载本地存储的设置
onMounted(() => {
  const savedSettings = localStorage.getItem('systemSettings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      // 同步本地存储到响应式变量
      darkMode.value = parsed.darkMode;
      themeColor.value = parsed.themeColor;
      fontSize.value = parsed.fontSize;
      messageNotification.value = parsed.messageNotification;
      soundNotification.value = parsed.soundNotification;
      language.value = parsed.language;
      
      // 应用设置
      applySettings(parsed);
    } catch (error) {
      console.error('加载设置失败：', error);
    }
  }
});
</script>

<style scoped>
.settings-container {
  margin-top: 10px;
}

.settings-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 15px;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 5px;
  border-left: 3px solid #409EFF;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 5px 0;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  font-size: 14px;
  color: #606266;
  width: 120px;
  line-height: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.password-form {
  margin-top: 10px;
}

/* 深色模式支持 */
.dark .settings-container {
  color: #fff;
}

.dark .section-title {
  color: #fff;
  border-left-color: var(--primary-color, #409EFF);
}

.dark .setting-label {
  color: #ccc;
}

.dark .settings-section {
  border-bottom-color: #444;
}
</style>

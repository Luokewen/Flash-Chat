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

      <div class="settings-section">
        <h3 class="section-title">账号设置</h3>

        <div class="setting-item">
          <span class="setting-label">修改密码</span>
          <el-button type="text" @click="onCancel">修改密码</el-button>
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
</template>

<script lang="ts" setup>
// 此处不包含具体JavaScript逻辑实现
// 仅保留必要的变量声明作为占位符
const dialogVisible = true;
const darkMode = false;
const themeColor = '#409EFF';
const fontSize = 'medium';
const messageNotification = true;
const soundNotification = true;
const desktopNotification = false;
const language = 'zh-CN';
const isSaving = false;

// 方法仅作为占位符
const onCancel = () => { };
const onSave = () => { };
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
</style>

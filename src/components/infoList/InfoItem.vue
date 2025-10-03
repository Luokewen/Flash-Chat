<template>
  <div class="info-item" @click="$emit('click')">
    <div class="info-avatar">
      <el-avatar :size="40" :src="info.avatar" @error="errorHandler">
        <img src="../../assets/avatar/error-avatar.png" />
      </el-avatar>
    </div>
    <div class="info-details">
      <div class="info-name-time">
        <span class="info-name">{{ info.name }}</span>
        <span class="info-time">{{ info.time }}</span>
      </div>
      <div class="info-message">
        <span :class="{ 'info-unread': info.unread }">{{ info.message }}</span>
        <span class="info-badge" v-if="info.unreadCount > 0">{{ info.unreadCount }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

// 定义Props类型
interface InfoType {
  id: number
  name: string
  avatar: string
  message: string
  time: string
  unread: boolean
  unreadCount: number
}

// 定义Props
const props = defineProps<{
  info: InfoType
}>()

// 头像错误处理
const errorHandler = () => true
</script>

<style scoped lang="less">
.info-item {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9FAFB;
  }

  .info-avatar {
    margin-right: 12px;
  }

  .info-details {
    flex: 1;
    min-width: 0; // 解决文本溢出问题
    position: relative;
  }

  .info-name-time {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .info-name {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .info-time {
      font-size: 12px;
      color: #9CA3AF;
    }
  }

  .info-message {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 14px;
      color: #6B7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .info-unread {
      color: #111827;
      font-weight: 500;
    }

    .info-badge {
      position: absolute;
      right: 0;
      top: 60%;
      background-color: #409EFF;
      color: white;
      font-size: 12px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>

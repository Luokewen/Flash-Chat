<template>
  <div class="info-item" :class="{ 'info-item-selected': selected }" @click="handleClick">
    <!-- 头像区域 -->
    <div class="info-avatar">
      <el-avatar :size="40" :src="info.avatar" @error="handleAvatarError" class="avatar-transition">
        <!-- 头像加载失败时的默认显示 -->
        <template #error>
          {{ getAvatarText(info.name) }}
        </template>
      </el-avatar>
      <!-- 在线状态指示器 -->
      <div v-if="showOnlineStatus && online" class="online-indicator"></div>
    </div>

    <!-- 信息详情区域 -->
    <div class="info-details">
      <!-- 名称和时间行 -->
      <div class="info-name-time">
        <span class="info-name">{{ info.name }}</span>
        <span class="info-time">{{ formatTime(info.time) }}</span>
      </div>

      <!-- 消息内容行 -->
      <div class="info-message">
        <span :class="{ 'info-unread': info.unread }" class="message-text">{{ truncateMessage(info.message) }}</span>
        <!-- 未读消息徽章 -->
        <div class="info-badge-container" v-if="info.unreadCount > 0">
          <el-badge :value="info.unreadCount > 99 ? '99+' : info.unreadCount" type="primary" class="custom-badge" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { PropType } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useFriendsStore } from '@/stores/friendStore';
import { useRouter } from 'vue-router';

// 获取Store实例
const userStore = useUserStore();
const friendsStore = useFriendsStore();
const router = useRouter();

// 定义信息项的类型接口
export interface InfoItem {
  id: number | string;  // 支持数字或字符串ID
  name: string;
  avatar?: string;      // 头像可选
  message: string;
  time: string | number; // 支持时间戳或字符串
  unread: boolean;
  unreadCount: number;
  online?: boolean;     // 在线状态可选
}

// 定义组件的Props
const props = defineProps({
  // 信息项数据
  info: {
    type: Object as PropType<InfoItem>,
    required: true,
    validator: (value: InfoItem) => {
      // 基本验证
      return value.id !== undefined &&
        typeof value.name === 'string' &&
        typeof value.message === 'string';
    }
  },
  // 是否选中状态
  selected: {
    type: Boolean,
    default: false
  },
  // 是否显示在线状态
  showOnlineStatus: {
    type: Boolean,
    default: true
  },
  // 消息截断长度
  truncateLength: {
    type: Number,
    default: 30
  }
});

// 定义组件的Emits
const emit = defineEmits<{
  click: [info: InfoItem]
}>();

// 计算属性：在线状态
const online = computed(() => {
  return props.info.online || false;
});

// 处理头像加载错误
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    // 防止无限循环
    target.onerror = null;
  }
  // 返回true表示已经处理了错误
  return true;
};

// 获取头像文本（用于头像加载失败时显示）
const getAvatarText = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '未';
  }
  // 提取中文字符或首字母
  const chineseMatch = name.match(/[\u4e00-\u9fa5]/);
  if (chineseMatch) {
    return chineseMatch[0];
  }
  return name.charAt(0).toUpperCase();
};

// 格式化时间显示
const formatTime = (timeValue: string | number): string => {
  // 如果时间为空或无效，不显示任何内容
  if (!timeValue || (typeof timeValue === 'string' && timeValue.trim() === '')) {
    return '';
  }

  let date: Date;

  // 处理时间戳或日期字符串
  if (typeof timeValue === 'number') {
    date = new Date(timeValue);
  } else if (typeof timeValue === 'string') {
    // 检查是否已经是格式化的时间字符串
    if (timeValue.includes(':')) {
      return timeValue;
    }
    // 检查是否是"昨天"、"今天"等文本
    if (['今天', '昨天', '前天', '周一', '周二', '周三', '周四', '周五', '周六', '周日'].includes(timeValue)) {
      return timeValue;
    }
    // 尝试解析为日期
    date = new Date(timeValue);
  } else {
    return '';
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  if (isToday) {
    // 今天显示具体时间
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    // 昨天显示"昨天"
    return '昨天';
  } else {
    // 其他情况显示月-日
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  }
};

// 截断消息文本
const truncateMessage = (message: string): string => {
  if (!message || typeof message !== 'string') {
    return '';
  }

  if (message.length <= props.truncateLength) {
    return message;
  }

  return message.substring(0, props.truncateLength) + '...';
};

// 处理点击事件
const handleClick = () => {
  // 将info.id存入userStore.toUserId
  userStore.toUserId = props.info.id.toString();

  // 将info.name存入friendsStore.friendInfo.nickname
  friendsStore.friendInfo.nickname = props.info.name;

  // 触发自定义事件，并传递信息项数据
  emit('click', props.info);

  // 路由跳转
  router.push('/home/chatPage');
};
</script>

<style scoped lang="less">
.info-item {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  margin: 2px 0;

  &:hover {
    background-color: #F9FAFB;
  }

  &.info-item-selected {
    background-color: #ECF5FF;
    border-left: 3px solid #409EFF;
  }

  .info-avatar {
    position: relative;
    margin-right: 12px;
    flex-shrink: 0;

    .avatar-transition {
      // 移除过渡效果
    }

    &:hover .avatar-transition {
      // 移除缩放效果
    }

    // 在线状态指示器
    .online-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background-color: #67C23A;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }
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
      font-size: 15px;
    }

    .info-time {
      font-size: 12px;
      color: #9CA3AF;
      white-space: nowrap;
    }
  }

  .info-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 20px;

    .message-text {
      font-size: 14px;
      color: #6B7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      margin-right: 10px;
    }

    .info-unread {
      color: #111827;
      font-weight: 500;
    }

    .info-badge-container {
      flex-shrink: 0;
    }

    .custom-badge {
      min-width: 20px;
      height: 20px;
      line-height: 20px;
      font-size: 12px;
      padding: 0 6px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .info-item {
    padding: 8px 12px;

    .info-avatar {
      margin-right: 10px;
    }

    .info-name {
      font-size: 14px;
    }

    .message-text {
      font-size: 13px;
    }
  }
}
</style>

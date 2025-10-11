<template>
  <el-dialog v-model="modelValue" title="消息通知" width="500" align-center :modal="false" @close="handleClose">
    <div class="message-container">
      <!-- 空状态 -->
      <div v-if="!messageStore.friendRequestList.length" class="empty-state">
        <el-empty description="暂无消息通知" :image-size="100" />
      </div>

      <!-- 消息列表 -->
      <div v-else class="message-list">
        <div v-for="request in messageStore.friendRequestList" :key="request.id" class="message-item">
          <div class="message-content">
            <el-avatar :size="50" :src="request.avatar" class="avatar">
              <img src="../../assets/avatar/error-avatar.png" />
            </el-avatar>

            <div class="message-info">
              <div class="user-info">
                <span class="nickname">{{ request.nickname || '未知用户' }}</span>
                <span class="username">({{ request.username }})</span>
              </div>
              <div class="request-time">
                请求时间：{{ formatTime(request.requestedAt) }}
              </div>
              <div class="request-message">
                请求添加您为好友
              </div>
            </div>
          </div>

          <div class="message-actions">
            <el-button type="primary" size="small" @click="handleAgree(request.id)">
              同意
            </el-button>
            <el-button type="danger" size="small" @click="handleReject(request.id)">
              拒绝
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <span class="request-count">
          共 {{ messageStore.friendRequestCount }} 条好友请求
        </span>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useMessageStore } from '@/stores/messageStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import api from '../../api'
import type { FriendListItem } from '../../../types/friends'
import { useFriendsStore } from '@/stores/friendStore'

const modelValue = defineModel<boolean>({ default: false })
const messageStore = useMessageStore()
const userStore = useUserStore()
const friendStore = useFriendsStore()

// 格式化时间显示
const formatTime = (timeString: string) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN')
  } catch {
    return timeString
  }
}

// 处理同意好友请求
const handleAgree = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定同意该好友请求吗？', '提示', {
      type: 'warning'
    })

    // 这里调用API同意好友请求
    await api.friend.handleFriendRequest({ id: userStore.user.id, requestId: id, action: 'accept' })

    ElMessage.success('已同意好友请求')
    // 从列表中移除
    messageStore.friendRequestList = messageStore.friendRequestList.filter(
      item => item.id !== id
    )
    messageStore.friendRequestCount--
    loadFriend()
  } catch (error: any) {
    ElMessage.info('已取消操作')
  }
}

// 处理拒绝好友请求
const handleReject = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定拒绝该好友请求吗？', '提示', {
      type: 'warning'
    })

    // 这里调用API拒绝好友请求
    await api.friend.handleFriendRequest({ id: userStore.user.id, requestId: id, action: 'rejected' })

    ElMessage.success('已拒绝好友请求')
    // 从列表中移除
    messageStore.friendRequestList = messageStore.friendRequestList.filter(
      item => item.id !== id
    )
    messageStore.friendRequestCount--
  } catch (error) {
    // 用户取消操作
    ElMessage.info('已取消操作')
  }
}

// 关闭对话框
const handleClose = () => {
  modelValue.value = false
}

const loadFriend = async () => {
  if (!userStore.user?.id) return;
  try {
    const res: any = await api.friend.getFriends({ id: userStore.user.id });
    const friendList: FriendListItem[] = res.data.data || [];
    friendStore.friends = friendList;
  } catch (err) {
    console.error('加载好友列表失败:', err);
    ElMessage.error('加载好友列表失败');
  }
};
</script>

<style lang="less" scoped>
.message-container {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.message-list {
  .message-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #fafafa;
    }
  }

  .message-content {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .avatar {
    margin-right: 12px;
  }

  .message-info {
    flex: 1;

    .user-info {
      margin-bottom: 4px;

      .nickname {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }

      .username {
        font-size: 12px;
        color: #999;
        margin-left: 8px;
      }
    }

    .request-time {
      font-size: 12px;
      color: #999;
      margin-bottom: 2px;
    }

    .request-message {
      font-size: 13px;
      color: #666;
    }
  }

  .message-actions {
    display: flex;
    gap: 8px;

    .el-button {
      min-width: 60px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .request-count {
    font-size: 14px;
    color: #666;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-item {
    flex-direction: column;
    align-items: flex-start !important;

    .message-actions {
      margin-top: 12px;
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>

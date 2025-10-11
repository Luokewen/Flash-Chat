<template>
  <div class="friend-info-container">
    <!-- 加载状态 -->
    <div v-if="!friendInfo.userId && !loading" class="empty-state">
      <el-empty description="请选择一位好友查看详细信息" />
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="loading-state">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 好友信息 -->
    <div v-else class="friend-info-content">
      <!-- 头部信息卡片 -->
      <el-card class="profile-card" shadow="never">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="80" :src="friendInfo.avatar" class="profile-avatar">
              <span class="avatar-fallback">{{ getAvatarFallback(friendInfo.nickname) }}</span>
            </el-avatar>
            <div class="online-status" :class="getOnlineStatus()"></div>
          </div>
          <div class="profile-info">
            <div class="name-section">
              <h2 class="nickname">{{ friendInfo.nickname }}</h2>
              <el-tag v-if="friendInfo.gender" :type="getGenderTagType()" size="small" class="gender-tag">
                <el-icon>
                  <Male v-if="friendInfo.gender === 'male'" />
                  <Female v-else-if="friendInfo.gender === 'female'" />
                  <User v-else />
                </el-icon>
                {{ getGenderText() }}
              </el-tag>
            </div>
            <p v-if="friendInfo.bio" class="bio">{{ friendInfo.bio }}</p>
            <p v-else class="bio empty">暂无个性签名</p>
            <div class="user-id">用户ID: {{ friendInfo.userId }}</div>
          </div>
        </div>
      </el-card>

      <!-- 详细信息卡片 -->
      <el-card class="details-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="header-title">详细信息</span>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">
            <el-tag size="small">{{ friendInfo.userId }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="性别">
            <div class="gender-display">
              <el-icon :color="getGenderColor()">
                <Male v-if="friendInfo.gender === 'male'" />
                <Female v-else-if="friendInfo.gender === 'female'" />
                <User v-else />
              </el-icon>
              <span>{{ getGenderText() }}</span>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="地区">
            <div class="address-display">
              <el-icon>
                <Location />
              </el-icon>
              <span>{{ friendInfo.address || '未知' }}</span>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="注册时间">
            <div class="time-display">
              <el-icon>
                <Clock />
              </el-icon>
              <span>{{ formatDate(friendInfo.createdAt) }}</span>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="最后更新">
            <div class="time-display">
              <el-icon>
                <Refresh />
              </el-icon>
              <span>{{ formatDate(friendInfo.updatedAt) }}</span>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="数据库ID">
            <el-text type="info" size="small">{{ friendInfo._id }}</el-text>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作按钮 -->
      <el-card class="actions-card" shadow="never">
        <div class="action-buttons">
          <el-button type="primary" :icon="ChatDotRound" @click="handleSendMessage">
            发送消息
          </el-button>
          <el-button :icon="User" @click="handleViewMore">
            查看资料
          </el-button>
          <el-button :icon="MoreFilled" @click="showMoreActions" ref="buttonRef">
            更多操作
          </el-button>
        </div>
      </el-card>

      <!-- 更多操作菜单 -->
      <el-popover placement="bottom" :width="200" trigger="click" virtual-triggering :virtual-ref="buttonRef"
        ref="popoverRef">
        <div class="more-actions-menu">
          <div class="menu-item" @click="handleSetRemark">
            <el-icon>
              <Edit />
            </el-icon>
            <span>设置备注</span>
          </div>
          <div class="menu-item" @click="handleShareContact">
            <el-icon>
              <Share />
            </el-icon>
            <span>分享联系人</span>
          </div>
          <el-divider />
          <div class="menu-item danger" @click="handleDeleteFriend">
            <el-icon>
              <Delete />
            </el-icon>
            <span>删除好友</span>
          </div>
        </div>
        <template #reference>
          <div style="display: none;"></div> <!-- 隐藏的引用元素 -->
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFriendsStore } from '@/stores/friendStore'
import {
  Male,
  Female,
  User,
  Location,
  Clock,
  Refresh,
  ChatDotRound,
  MoreFilled,
  Edit,
  Share,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type PopoverInstance } from 'element-plus'
import type { FriendInfo } from '@/../types/friends'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const friendsStore = useFriendsStore()
const userStore = useUserStore()
const buttonRef = ref()
const popoverRef = ref<PopoverInstance>()

// 计算属性
const friendInfo = computed<FriendInfo>(() => friendsStore.friendInfo)
const loading = computed(() => !friendInfo.value.userId && friendsStore.friendInfoLoading)

// 方法
const getAvatarFallback = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const getGenderText = () => {
  const genderMap = {
    male: '男',
    female: '女',
    unknown: '未知',
    other: '其他'
  }
  return genderMap[friendInfo.value.gender] || '未知'
}

const getGenderTagType = () => {
  const typeMap = {
    male: 'primary',
    female: 'danger',
    unknown: 'info',
    other: 'warning'
  }
  return typeMap[friendInfo.value.gender] || 'info'
}

const getGenderColor = () => {
  const colorMap = {
    male: '#409EFF',
    female: '#F56C6C',
    unknown: '#909399',
    other: '#E6A23C'
  }
  return colorMap[friendInfo.value.gender] || '#909399'
}

const getOnlineStatus = () => {
  // 这里可以根据实际在线状态返回，暂时返回在线
  return 'online'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '无效日期'
  }
}

const handleSendMessage = () => {
  ElMessage.success(`开始与 ${friendInfo.value.nickname} 聊天`)
  // 这里可以触发打开聊天窗口的逻辑
  userStore.toUserId = friendInfo.value.userId
  router.push('/home/chatPage')
}

const handleViewMore = () => {
  ElMessage.info('查看完整资料')
  // 这里可以打开更详细的资料页面
}

const showMoreActions = () => {
  popoverRef.value?.hide()
  // moreActionsVisible.value = true
}

const handleSetRemark = () => {
  ElMessageBox.prompt('请输入备注名', '设置备注', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: friendInfo.value.nickname
  }).then(({ value }) => {
    if (value) {
      ElMessage.success(`备注已设置为: ${value}`)
      // 这里可以调用API更新备注
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleShareContact = () => {
  ElMessage.info('分享联系人功能')
  // 实现分享逻辑
}

const handleDeleteFriend = () => {
  ElMessageBox.confirm(
    `确定要删除好友 ${friendInfo.value.nickname} 吗？此操作不可撤销。`,
    '删除好友',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    // 确定删除好友
    removeFriend()
  }).catch(() => {
    // 取消操作
  })
}

const removeFriend = async () => {
  try {
    const response: any = await api.friend.removeFriend({ userId: userStore.userInfo.userId, friendId: friendInfo.value.userId })
    if (response.data.code === 200) {
      ElMessage.success('好友删除成功')
      friendsStore.$reset()
    } else {
      ElMessage.error('删除好友失败')
    }
  } catch (error) {
    ElMessage.error('删除好友失败')
  }
}

// 监听好友信息变化
watch(() => friendInfo.value.userId, (newUserId) => {
  if (newUserId) {
    console.log('好友信息已更新:', friendInfo.value)
  }
})


</script>

<style lang="less" scoped>
.friend-info-container {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-state {
    padding: 20px;
  }
}

.friend-info-content {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;

  .profile-card {
    margin-bottom: 16px;
    border-radius: 12px;

    .profile-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;

      .avatar-section {
        position: relative;

        .profile-avatar {
          border: 3px solid #e6f7ff;
        }

        .online-status {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-radius: 50%;

          &.online {
            background-color: #67c23a;
          }

          &.offline {
            background-color: #909399;
          }
        }
      }

      .profile-info {
        flex: 1;

        .name-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .nickname {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }

          .gender-tag {
            .el-icon {
              margin-right: 4px;
            }
          }
        }

        .bio {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.5;

          &.empty {
            color: #909399;
            font-style: italic;
          }
        }

        .user-id {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .details-card {
    margin-bottom: 16px;
    border-radius: 12px;

    .card-header {
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    :deep(.el-descriptions) {
      .el-descriptions__label {
        font-weight: 500;
        color: #606266;
      }

      .el-descriptions__content {
        color: #303133;
      }
    }

    .gender-display,
    .address-display,
    .time-display {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        font-size: 16px;
      }
    }
  }

  .actions-card {
    border-radius: 12px;

    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;

      .el-button {
        flex: 1;
        max-width: 140px;
      }
    }
  }
}

.more-actions-menu {
  padding: 4px 0;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    border-radius: 4px;

    &:hover {
      background-color: #f5f7fa;
    }

    &.danger {
      color: #f56c6c;

      &:hover {
        background-color: #fef0f0;
      }
    }

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    span {
      font-size: 14px;
    }
  }
}

.avatar-fallback {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

// 响应式设计
@media (max-width: 768px) {
  .friend-info-container {
    padding: 12px;
  }

  .friend-info-content {
    .profile-card {
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 16px;

        .profile-info {
          .name-section {
            justify-content: center;
          }
        }
      }
    }

    .actions-card {
      .action-buttons {
        flex-direction: column;

        .el-button {
          max-width: none;
        }
      }
    }
  }
}
</style>

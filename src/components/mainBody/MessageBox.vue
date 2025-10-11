<template>
  <div class="message-container" ref="messageContainer" @scroll="handleScroll" @click="closeContextMenu">
    <!-- 加载更多指示器 -->
    <div v-if="loadingMore" class="loading-more">
      加载中...
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.visible" class="context-menu" :style="contextMenuStyle" @click.stop>
      <div class="menu-item" @click="copyMessage">复制</div>
      <div class="menu-item" @click="deleteMessage">删除</div>
      <div class="menu-item" @click="revokeMessage">撤销</div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-list" ref="messagesList">
      <!-- 时间分组 -->
      <template v-for="(group, index) in timeGroupedMessages" :key="index">
        <!-- 时间分隔线 -->
        <div class="date-divider">{{ formatGroupTime(group.groupTime) }}</div>

        <!-- 消息项 -->
        <div v-for="msg in group.messages" :key="msg._id" class="message-item"
          :class="{ 'my-message': isMyMessage(msg), 'other-message': !isMyMessage(msg) }"
          @contextmenu.prevent="showContextMenu($event, msg)">
          <!-- 对方头像 -->
          <template v-if="!isMyMessage(msg)">
            <div class="avatar">
              <img :src="friendStore.friendInfo.avatar" alt="对方头像" class="avatar-img">
            </div>
          </template>

          <!-- 自己的头像 -->
          <template v-if="isMyMessage(msg)">
            <div class="avatar">
              <img :src="userStore.userInfo.avatar" alt="我的头像" class="avatar-img">
            </div>
          </template>

          <!-- 消息内容 -->
          <div class="message-bubble">
            <div class="message-content" v-if="msg.type === 'text'">
              {{ msg.content }}
            </div>
            <div class="message-content" v-else>
              [不支持的消息类型]
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import {
  getHistoryMessages,
  onSocketEvent,
  type Message
} from '@/utils/socket'

import { useUserStore } from '@/stores/userStore'
import { useFriendsStore } from '@/stores/friendStore'
import { useMessageStore } from '@/stores/messageStore'
import { ElMessage } from 'element-plus'

// 存储消息列表
const messages = ref<Message[]>([])
const messageContainer = ref<HTMLElement>()
const messagesList = ref<HTMLElement>()
const loadingMore = ref(false)
const hasMore = ref(true)
const currentOffset = ref(0)
const isScrolling = ref(false)

// 滚动位置记录
const scrollState = ref({
  position: 0,
  height: 0,
  firstMessageId: ''
})

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  message: null as Message | null
})

const userStore = useUserStore()
const friendStore = useFriendsStore()
const messageStore = useMessageStore()

// 最近输入的字符串数组
const content = ref<string[]>([])

// 监听 messageStore 中的消息变化
watch(() => messageStore.messages, (newMessages) => {
  content.value = [...newMessages]
  scrollToBottom()
}, { deep: true })

// 判断是否是自己发送的消息
const isMyMessage = (msg: Message) => {
  return msg.fromUserId === userStore.user.id
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 记录当前滚动状态
const recordScrollState = () => {
  if (!messageContainer.value || !messages.value.length) return

  const container = messageContainer.value
  scrollState.value = {
    position: container.scrollTop,
    height: container.scrollHeight,
    firstMessageId: getFirstVisibleMessageId()
  }
}

// 获取当前可视区域的第一条消息ID
const getFirstVisibleMessageId = (): string => {
  if (!messageContainer.value || !messages.value.length) return ''

  const container = messageContainer.value
  const messageElements = container.querySelectorAll('.message-item')

  for (let i = 0; i < messageElements.length; i++) {
    const rect = messageElements[i].getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // 如果消息元素在容器可视区域内
    if (rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
      const messageId = messageElements[i].getAttribute('data-message-id')
      return messageId || ''
    }
  }

  return messages.value[0]?._id || ''
}

// 恢复滚动位置
const restoreScrollPosition = () => {
  nextTick(() => {
    if (!messageContainer.value) return

    const container = messageContainer.value
    const oldScrollState = scrollState.value

    // 方法1：如果有记录的第一条消息ID，尝试找到该消息并定位
    if (oldScrollState.firstMessageId) {
      const targetElement = container.querySelector(`[data-message-id="${oldScrollState.firstMessageId}"]`)
      if (targetElement) {
        const newPosition = targetElement.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
        container.scrollTop = newPosition
        return
      }
    }

    // 方法2：计算高度差并恢复位置
    const heightDiff = container.scrollHeight - oldScrollState.height
    container.scrollTop = oldScrollState.position + heightDiff
  })
}

// 处理滚动事件（添加防抖）
let scrollTimer: number | null = null
const handleScroll = () => {
  isScrolling.value = true

  // 清除之前的计时器
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }

  // 设置新的计时器
  scrollTimer = setTimeout(() => {
    isScrolling.value = false
  }, 150)

  if (!messageContainer.value || loadingMore.value || !hasMore.value) return

  const { scrollTop } = messageContainer.value

  // 当滚动到顶部附近时（距离顶部30px以内），加载更多消息
  if (scrollTop < 30) {
    loadMoreMessages()
  }
}

// 加载更多消息
const loadMoreMessages = async () => {
  if (!userStore.toUserId || loadingMore.value || !hasMore.value) return

  // 记录加载前的滚动状态
  recordScrollState()

  loadingMore.value = true

  try {
    // 计算新的偏移量
    const newOffset = currentOffset.value + 15

    const result = await getHistoryMessages(userStore.toUserId, 15, newOffset)

    if (result.messages.length > 0) {
      // 将新消息添加到现有消息列表的前面
      const oldMessageCount = messages.value.length
      messages.value = [...result.messages, ...messages.value]
      currentOffset.value = newOffset

      // 恢复滚动位置
      restoreScrollPosition()

      // 如果返回的消息数量小于15，说明没有更多消息了
      if (result.messages.length < 15) {
        hasMore.value = false
      }

      console.log(`加载了 ${result.messages.length} 条历史消息，当前总数: ${messages.value.length}`)
    } else {
      // 没有更多消息了
      hasMore.value = false
      console.log('没有更多历史消息了')
    }
  } catch (error) {
    console.error('加载更多消息失败:', error)
  } finally {
    loadingMore.value = false
  }
}

// 重置消息状态（当切换聊天对象时）
const resetMessages = () => {
  messages.value = []
  currentOffset.value = 0
  hasMore.value = true
  loadingMore.value = false
  scrollState.value = {
    position: 0,
    height: 0,
    firstMessageId: ''
  }
  content.value = [] // 清空正在发送的消息
  closeContextMenu()
}

// 右键菜单样式计算
const contextMenuStyle = computed(() => {
  return {
    left: `${contextMenu.value.x}px`,
    top: `${contextMenu.value.y}px`
  }
})

// 显示右键菜单
const showContextMenu = (event: MouseEvent, message: Message) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    message
  }
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// 复制消息
const copyMessage = async () => {
  if (!contextMenu.value.message) return

  try {
    await navigator.clipboard.writeText(contextMenu.value.message.content ?? '')
    ElMessage.success('消息已复制到剪贴板')
    // 这里可以添加复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = contextMenu.value.message!.content ?? ''
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('消息已复制到剪贴板')
  }

  closeContextMenu()
}

// 删除消息
const deleteMessage = () => {
  if (!contextMenu.value.message) return

  const messageId = contextMenu.value.message._id
  const index = messages.value.findIndex(msg => msg._id === messageId)

  if (index !== -1) {
    messages.value.splice(index, 1)
    console.log('消息已删除')
    // 这里可以添加删除成功的提示，或者调用API删除服务器上的消息
  }

  closeContextMenu()
}

// 撤销消息（只对自己的消息有效）
const revokeMessage = () => {


  closeContextMenu()
}

onMounted(() => {
  // 重置消息状态
  resetMessages()

  // 加载历史消息
  if (userStore.toUserId) {
    loadHistory(userStore.toUserId)
  }

  // 监听新消息
  const offNewMessage = onSocketEvent<Message>('newMessage', (message) => {
    const isCurrentChat =
      (message.fromUserId === userStore.toUserId && message.toUserId === userStore.user.id) ||
      (message.fromUserId === userStore.user.id && message.toUserId === userStore.toUserId)

    if (isCurrentChat) {
      console.log('收到新消息:', message)
      messages.value.push(message)

      // 如果收到的是自己发送的消息，从 content 中移除对应的消息
      if (message.fromUserId === userStore.user.id && content.value.length > 0) {
        content.value = content.value.filter(text => text !== message.content)
      }
    }
  })

  // 监听用户上线状态
  const offUserOnline = onSocketEvent<string>('userOnline', (userId) => {
    console.log('用户上线:', userId)
  })

  // 点击页面其他地方关闭右键菜单
  document.addEventListener('click', closeContextMenu)

  onUnmounted(() => {
    // 取消事件监听
    offNewMessage()
    offUserOnline()
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
    document.removeEventListener('click', closeContextMenu)
  })
})

// 监听聊天对象变化
watch(() => userStore.toUserId, (newFriendId, oldFriendId) => {
  if (newFriendId && newFriendId !== oldFriendId) {
    resetMessages()
    loadHistory(newFriendId)
  }
})

// 获取历史消息
const loadHistory = async (friendId: string) => {
  try {
    const result = await getHistoryMessages(friendId, 15, 0)
    messages.value = result.messages
    currentOffset.value = 0
    hasMore.value = result.messages.length === 15
  } catch (error) {
    console.error('获取历史消息失败:', error)
  }
}

// 按时间间隔分组消息
const timeGroupedMessages = computed(() => {
  if (allMessages.value.length === 0) return []

  // 先按时间升序排序
  const sortedMessages = [...allMessages.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // 再次去重，确保消息列表中没有重复的消息
  const seenIds = new Set<string>()
  const uniqueSortedMessages = sortedMessages.filter(msg => {
    if (seenIds.has(msg._id)) return false
    seenIds.add(msg._id)
    return true
  })

  const groups: Array<{ groupTime: Date; messages: any[] }> = []

  if (uniqueSortedMessages.length === 0) return groups

  let currentGroup: any[] = [uniqueSortedMessages[0]]
  let lastMessageTime = new Date(uniqueSortedMessages[0].timestamp)

  for (let i = 1; i < uniqueSortedMessages.length; i++) {
    const currentMessage = uniqueSortedMessages[i]
    const currentTime = new Date(currentMessage.timestamp)

    // 计算与上一条消息的时间差（分钟）
    const timeDiff = (currentTime.getTime() - lastMessageTime.getTime()) / (1000 * 60)

    // 如果时间间隔超过60分钟（1小时），创建新分组
    if (timeDiff > 60) {
      groups.push({
        groupTime: new Date(currentGroup[0].timestamp),
        messages: [...currentGroup]
      })
      currentGroup = [currentMessage]
    } else {
      // 继续当前分组
      currentGroup.push(currentMessage)
    }

    lastMessageTime = currentTime
  }

  // 添加最后一个分组
  if (currentGroup.length > 0) {
    groups.push({
      groupTime: new Date(currentGroup[0].timestamp),
      messages: currentGroup
    })
  }

  return groups
})

// 合并所有消息（历史消息 + 正在发送的消息）
const allMessages = computed(() => {
  // 创建一个消息ID集合，用于检测重复消息
  const messageIds = new Set<string>()
  const uniqueMessages: any[] = []

  // 添加历史消息，确保唯一性
  messages.value.forEach(msg => {
    if (!messageIds.has(msg._id)) {
      messageIds.add(msg._id)
      uniqueMessages.push({
        ...msg,
        isSending: false
      })
    }
  })

  // 添加正在发送的消息
  content.value.forEach((text, index) => {
    const sendingId = `sending_${userStore.toUserId}_${index}`
    if (!messageIds.has(sendingId)) {
      messageIds.add(sendingId)
      uniqueMessages.push({
        _id: sendingId,
        content: text,
        type: 'text' as const,
        fromUserId: userStore.user.id,
        toUserId: userStore.toUserId,
        timestamp: new Date().toISOString(),
        isSending: true
      })
    }
  })

  return uniqueMessages
})

// 格式化分组时间显示
const formatGroupTime = (date: Date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (messageDate.getTime() === today.getTime()) {
    return `今天 ${hours}:${minutes}`
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return `昨天 ${hours}:${minutes}`
  } else if (messageDate.getFullYear() === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`
  } else {
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}
</script>

<style lang="less">
.message-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 15px;
  background-color: #f5f5f5;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
}

// 右键菜单样式
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 120px;
  padding: 4px 0;

  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #333;

    &:hover {
      background-color: #f5f5f5;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
  }
}

.loading-more {
  text-align: center;
  padding: 10px;
  color: #666;
  font-size: 14px;
  background-color: rgba(245, 245, 245, 0.8);
  position: sticky;
  top: 0;
  z-index: 10;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.date-divider {
  align-self: center;
  padding: 4px 12px;
  background-color: #e5e5e5;
  color: #666;
  font-size: 12px;
  border-radius: 12px;
  margin: 10px 0;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 80%;

  &.my-message {
    margin-left: auto;
    flex-direction: row-reverse;
  }

  &.other-message {
    margin-right: auto;
  }
}

.avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.message-bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: calc(100% - 50px);

  .message-content {
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
  }
}

.my-message {
  .message-bubble {
    background-color: #9eea6a;
  }
}

.other-message {
  .message-bubble {
    background-color: #ffffff;
  }
}
</style>

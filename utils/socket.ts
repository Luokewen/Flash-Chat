import io, { Socket } from 'socket.io-client'
import { useUserStore } from '../src/stores/userStore'

// 消息类型定义
export interface Message {
  _id: string
  fromUserId: string
  toUserId: string
  content?: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video'
  timestamp: Date | string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  roomId?: string
  mediaInfo?: {
    url: string
    name?: string
    size?: number
    mimeType?: string
  }
  isRecalled?: boolean
  recallTimestamp?: Date | string
  tempId?: string // 客户端临时ID
}

// 事件类型定义
type SocketEvent =
  | 'newMessage'
  | 'messageSent'
  | 'messageError'
  | 'messageRead'
  | 'historyMessages'
  | 'historyError'
  | 'userOnline'
  | 'userOffline'
  | 'onlineUsers'
  | 'messageRecalled'
  | 'messageRecallConfirmed'
  | 'recallError'

// 创建 Socket 实例
const socket: Socket = io('http://localhost:3000') // 后端服务器地址

// 事件监听器存储
const eventListeners: Record<SocketEvent, Array<(data: any) => void>> = {
  newMessage: [],
  messageSent: [],
  messageError: [],
  messageRead: [],
  historyMessages: [],
  historyError: [],
  userOnline: [],
  userOffline: [],
  onlineUsers: [],
  messageRecalled: [],
  messageRecallConfirmed: [],
  recallError: [],
}

// 初始化 Socket（登录后绑定用户 ID）
export const initSocket = (): void => {
  const userStore = useUserStore()

  // 绑定用户ID
  const bindUserId = (): void => {
    if (userStore.user?.id) {
      socket.emit('userLogin', userStore.user.id) // 告知服务器当前用户 ID
    }
  }

  // 初始绑定
  bindUserId()

  // 监听连接状态
  socket.on('connect', () => {
    console.log('Socket 连接成功:', socket.id)
    // 重连后重新绑定用户 ID
    bindUserId()
  })

  socket.on('disconnect', (reason: string) => {
    console.log('Socket 断开连接:', reason)
    // 自动重连
    if (reason === 'io server disconnect') {
      socket.connect()
    }
  })

  // 初始化聊天相关事件监听
  initChatEventListeners()
}

// 初始化聊天事件监听
const initChatEventListeners = (): void => {
  // 接收新消息
  socket.on('newMessage', (message: Message) => {
    triggerEvent('newMessage', message)
    // 自动发送已读确认
    confirmRead([message._id])
  })

  // 消息发送确认
  socket.on('messageSent', (data: { code: number; tempId: string; message: Message }) => {
    triggerEvent('messageSent', data)
  })

  // 消息发送错误
  socket.on('messageError', (error: { tempId: string; message: string }) => {
    triggerEvent('messageError', error)
  })

  // 收到已读确认
  socket.on('messageReadConfirmation', (data: { messageIds: string[]; readerId: string }) => {
    triggerEvent('messageRead', data)
  })

  // 历史消息
  socket.on(
    'historyMessages',
    (data: { requestId: string; messages: Message[]; total: number; friendId: string }) => {
      triggerEvent('historyMessages', data)
    },
  )

  // 历史消息错误
  socket.on('historyError', (error: { requestId: string; message: string }) => {
    triggerEvent('historyError', error)
  })

  // 用户上线
  socket.on('userOnline', (userId: string) => {
    triggerEvent('userOnline', userId)
  })

  // 用户下线
  socket.on('userOffline', (userId: string) => {
    triggerEvent('userOffline', userId)
  })

  // 在线用户列表
  socket.on('onlineUsers', (userIds: string[]) => {
    triggerEvent('onlineUsers', userIds)
  })

  // 消息撤回
  socket.on('messageRecalled', (data: { messageId: string; roomId?: string }) => {
    triggerEvent('messageRecalled', data)
  })

  // 消息撤回确认
  socket.on('messageRecallConfirmed', (data: { requestId: string; messageId: string }) => {
    triggerEvent('messageRecallConfirmed', data)
  })

  // 消息撤回错误
  socket.on('recallError', (error: { requestId: string; message: string }) => {
    triggerEvent('recallError', error)
  })
}

// 发送消息
export const sendMessage = (messageData: {
  toUserId: string
  content?: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video'
  roomId?: string
  mediaInfo?: {
    url: string
    name?: string
    size?: number
    mimeType?: string
  }
}): Promise<{ tempId: string; message: Message }> => {
  const userStore = useUserStore()
  if (!userStore.user?.id) {
    return Promise.reject(new Error('用户未登录'))
  }

  return new Promise((resolve, reject) => {
    const handleMessageSent = (data: { code: number; tempId: string; message: Message }) => {
      if (data.code === 200) {
        socket.off('messageSent', handleMessageSent)
        socket.off('messageError', handleMessageError)
        resolve(data)
      }
    }

    const handleMessageError = (error: { code: number; tempId: string; message: string }) => {
      if (error.code === 500) {
        socket.off('messageSent', handleMessageSent)
        socket.off('messageError', handleMessageError)
        reject(error)
      }
    }

    socket.on('messageSent', handleMessageSent)
    socket.on('messageError', handleMessageError)

    // 发送消息
    socket.emit('sendMessage', {
      fromUserId: userStore.user.id,
      ...messageData,
      timestamp: new Date().toISOString(),
    })
  })
}

// 确认消息已读
export const confirmRead = (messageIds: string[]): void => {
  const userStore = useUserStore()
  if (!userStore.user?.id || !messageIds?.length) return

  socket.emit('messageRead', {
    userId: userStore.user.id,
    messageIds,
  })
}

// 获取历史消息
export const getHistoryMessages = (
  friendId: string,
  limit: number = 50,
  skip: number = 0,
): Promise<{
  requestId: string
  messages: Message[]
  total: number
  friendId: string
}> => {
  const userStore = useUserStore()
  if (!userStore.user?.id || !friendId) {
    return Promise.reject(new Error('参数不完整'))
  }

  return new Promise((resolve, reject) => {
    const handleHistoryMessages = (data: {
      code: number
      requestId: string
      messages: Message[]
      total: number
      friendId: string
    }) => {
      if (data.code === 200) {
        socket.off('historyMessages', handleHistoryMessages)
        socket.off('historyError', handleHistoryError)
        resolve(data)
      }
    }

    const handleHistoryError = (error: { code: 500; requestId: string; message: string }) => {
      if (error.code === 500) {
        socket.off('historyMessages', handleHistoryMessages)
        socket.off('historyError', handleHistoryError)
        reject(error)
      }
    }

    socket.on('historyMessages', handleHistoryMessages)
    socket.on('historyError', handleHistoryError)

    socket.emit('getHistory', {
      userId: userStore.user.id,
      friendId,
      limit,
      skip,
    })
  })
}

// 撤回消息
export const recallMessage = (
  messageId: string,
): Promise<{
  requestId: string
  messageId: string
}> => {
  const userStore = useUserStore()
  if (!userStore.user?.id || !messageId) {
    return Promise.reject(new Error('参数不完整'))
  }

  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString()

    const handleRecallConfirmed = (data: { requestId: string; messageId: string }) => {
      if (data.requestId === requestId) {
        socket.off('messageRecallConfirmed', handleRecallConfirmed)
        socket.off('recallError', handleRecallError)
        resolve(data)
      }
    }

    const handleRecallError = (error: { requestId: string; message: string }) => {
      if (error.requestId === requestId) {
        socket.off('messageRecallConfirmed', handleRecallConfirmed)
        socket.off('recallError', handleRecallError)
        reject(error)
      }
    }

    socket.on('messageRecallConfirmed', handleRecallConfirmed)
    socket.on('recallError', handleRecallError)

    socket.emit('recallMessage', {
      requestId,
      messageId,
      userId: userStore.user.id,
    })
  })
}

// 注册事件监听
export const onSocketEvent = <T = any>(
  event: SocketEvent,
  callback: (data: T) => void,
): (() => void) => {
  eventListeners[event].push(callback as (data: any) => void)
  return () => {
    // 返回取消监听的函数
    eventListeners[event] = eventListeners[event].filter((cb) => cb !== callback)
  }
}

// 触发事件
const triggerEvent = (event: SocketEvent, data: any): void => {
  if (eventListeners[event]) {
    eventListeners[event].forEach((callback) => {
      callback(data)
    })
  }
}

export default socket

import { defineStore } from 'pinia'
import type { Message } from '../../utils/socket'

export const useMessageStore = defineStore('messageStore', {
  state: () => ({
    // 好友请求数量
    friendRequestCount: 0,
    friendRequestList: [] as Array<{
      avatar: string
      nickname: string
      id: string
      requestedAt: string
      username: string
    }>,
    messages: <string[]>[],
  }),
})

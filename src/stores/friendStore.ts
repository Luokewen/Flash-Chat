import { defineStore } from 'pinia'
import type { FriendListItem, FriendInfo } from '../../types/friends'

export const useFriendsStore = defineStore('friends', {
  state: () => ({
    friends: [] as FriendListItem[],
    friendInfo: {} as FriendInfo,
    friendInfoLoading: false,
  }),
  // 持久化
  persist: {
    key: 'friends',
    storage: localStorage,
  },
})

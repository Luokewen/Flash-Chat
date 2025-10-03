import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 核心用户认证信息（登录状态）
    user: {
      id: '', // 用户唯一标识（与后端一致）
      username: '', // 用户名
    },
    // 扩展用户信息（详情）
    userInfo: {
      _id: '', // MongoDB 文档 ID
      userId: '', // 关联的用户 ID（与 user.id 对应）
      gender: '',
      avatar: '',
      nickname: '',
      bio: '',
      address: '',
      createdAt: '',
      updatedAt: '',
    },
    toUserId: '',
  }),

  persist: {
    key: 'userInfo',
    storage: localStorage,
  },

  actions: {
    // 设置登录用户的核心信息
    setUser(userData: { id: string; username: string }) {
      this.user = userData // 直接覆盖，更简洁
    },

    // 设置用户详情信息
    setUserInfo(infoData: Partial<typeof this.userInfo>) {
      this.userInfo = { ...this.userInfo, ...infoData } // 合并更新
    },
  },

  getters: {
    // 判断是否登录（依赖 user.id）
    isLoggedIn: (state) => !!state.user.id,

    // 快捷获取完整用户信息（组合 user 和 userInfo）
    fullUserInfo: (state) => ({
      ...state.user,
      ...state.userInfo,
    }),
  },
})

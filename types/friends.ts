// 好友请求项类型
export interface FriendRequestItem {
  // 头像地址
  avatar: string
  // 请求唯一标识
  id: string
  // 昵称
  nickname: string
  // 请求时间
  requestedAt: string
  username: string
}

// 好友请求列表类型（数组形式）
export type FriendRequestList = FriendRequestItem[]

// 好友列表项类型
export interface FriendListItem {
  // 头像地址
  avatar: string
  // 昵称
  nickname: string
  // 用户名
  username: string
  // 好友唯一标识
  id: string
  // 好友添加时间
  requestedAt: string
}

export interface FriendInfo {
  userId: string
  gender: 'male' | 'female' | 'unknown' | 'other'
  avatar: string
  nickname: string
  bio: string
  address: string
  _id: string
  createdAt: string
  updatedAt: string
  __v: number
}

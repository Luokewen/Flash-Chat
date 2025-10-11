import request from '@/utils/request'
// 搜索用户
export const searchUsers = (data: {
  keyword: string
  userId: string
  page: number
  pageSize: number
}) => {
  return request({
    url: '/friends/search',
    method: 'get',
    params: data,
  })
}

// 发送好友请求
export const sendFriendRequest = (data: { recipientId: string; requesterId: string }) => {
  return request({
    url: '/friends/requests',
    method: 'post',
    data,
  })
}

// 获取好友请求
export const getFriendRequests = (data: { userId: string }) => {
  return request({
    url: '/friends/requests',
    method: 'get',
    params: data,
  })
}

// 处理好友请求
export const handleFriendRequest = (data: { id: string; requestId: string; action: string }) => {
  return request({
    url: '/friends/requests',
    method: 'put',
    data,
  })
}

// 删除好友
export const removeFriend = (data: { userId: string; friendId: string }) => {
  return request({
    url: '/friends/:friendId',
    method: 'delete',
    params: data,
  })
}

// 获取好友列表
export const getFriends = (data: { id: string }) => {
  return request({
    url: '/friends/getFriends',
    method: 'get',
    params: data,
  })
}

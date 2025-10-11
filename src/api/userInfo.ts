import request from '@/utils/request'
import { type UserInfoRequest } from '../../types/userInfo'

//获取用户信息
export const getUserInfo = (data: UserInfoRequest) => {
  return request({
    url: '/user/userinfo',
    method: 'get',
    params: data,
  })
}

//创建和修改用户信息
export const createAndUpdateUserInfo = (data: UserInfoRequest) => {
  return request({
    url: '/user/userinfo',
    method: 'post',
    data,
  })
}

//删除用户信息
export const deleteUserInfo = (data: UserInfoRequest) => {
  return request({
    url: '/user/userinfo',
    method: 'delete',
    data,
  })
}

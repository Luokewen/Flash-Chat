import request from '@/utils/request'
import { type User } from '../../types/user'
/**
 * 登录功能函数
 * @param data - 包含用户名和密码的对象
 * @returns 返回一个请求Promise对象
 */
export const login = (data: User) => {
  // 定义登录函数，接收用户名和密码参数
  return request({
    url: '/user/login',
    method: 'post',
    data,
  })
}

// 用户注册
export const register = (data: { username: string; password: string }) => {
  return request({
    url: '/user/register',
    method: 'post',
    data,
  })
}

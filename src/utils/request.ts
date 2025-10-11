import router from '@/router'
import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 加载动画实例
let loadingInstance: any = null

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 显示加载动画
    loadingInstance = ElLoading.service({
      fullscreen: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    // 在请求头中添加token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    // 关闭加载动画
    if (loadingInstance) loadingInstance.close()
    ElMessage.error('请求错误: ' + (error.message || '未知错误'))
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 关闭加载动画
    if (loadingInstance) loadingInstance.close()
    const data = response
    // 根据返回的状态码进行处理
    if (data.data.code !== 200 && data.data.code !== 201) {
      ElMessage.error(data.data.msg || '请求失败')
      // 处理特定错误码，如登录过期
      if (data.data.code === 401) {
        // 清除token并跳转到登录页
        localStorage.removeItem('token')
        router.push('/')
      }
      return Promise.reject(data)
    }
    return data
  },
  (error: AxiosError) => {
    // 关闭加载动画
    if (loadingInstance) loadingInstance.close()
    // 处理网络错误
    if (!error.response) {
      ElMessage.error('网络连接异常，请检查网络')
      return Promise.reject(error)
    }
    // 处理不同的HTTP状态码
    switch (error.response.status) {
      case 401:
        ElMessage.error('身份验证失败，请重新登录')
        localStorage.removeItem('token')
        router.push('/')
        break
      case 403:
        ElMessage.error('权限不足，无法访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 405:
        ElMessage.error('用户名已被使用')
        break
      case 500:
        localStorage.removeItem('token')
        router.push('/')
        ElMessage.error('服务器内部错误')
        break
    }
    return Promise.reject(error)
  },
)

export default service

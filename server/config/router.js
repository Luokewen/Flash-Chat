import userRouter from '../routes/auth.js'
import userInfoRouter from '../routes/userInfo.js'
import friendRouter from '../routes/friend.js'

/**
 * 配置路由中间件
 * @param {Object} app - Express应用实例
 * @returns {void}
 */
const router = app => {
  app.use('/api', userRouter),
  app.use('/api', userInfoRouter),
  app.use('/api', friendRouter)
}

export default router

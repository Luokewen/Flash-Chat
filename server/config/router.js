const userRouter = require('../routes/auth.js')
const userInfoRouter = require('../routes/userInfo.js')
const friendRouter = require('../routes/friend.js')

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

module.exports = router

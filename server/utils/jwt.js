// 加载环境变量
require('dotenv').config();
// 封装jwt
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');

// 生成jwt
/**
 * 生成JWT令牌的函数
 * @param {string} id - 用户唯一标识符
 * @returns {string} 返回生成的JWT令牌
 */
const generateToken = (id) => {
  return jwt.sign({id},process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

// 验证jwt
/**
 * JWT验证中间件函数
 * 用于验证请求中的JWT令牌
 * @returns {Function} expressJwt中间件函数
 */
function verifyJwt() {
return expressJwt({
    secret: process.env.JWT_SECRET, // 关键：必须传入有效的密钥
    algorithms: ['HS256'] // 必须指定算法
  }).unless({
    path: [
    '/api/user/login',
    '/api/user/register',
    '/favicon.ico',
    'api/user/userinfo',
    /^\/socket\.io\/.*/ // 排除所有 socket.io 相关路径（关键！）
  ],
  })
}

module.exports = {
  generateToken,
  verifyJwt
}

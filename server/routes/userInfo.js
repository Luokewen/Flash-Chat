const express = require('express');
const router = express.Router();
const {
  createOrUpdateUserInfo,
  getUserInfo,
  deleteUserInfo
} = require('../controllers/userInfo');

// 用户信息路由
router.route('/user/userinfo')
  .get(getUserInfo)                // 获取用户信息
  .post(createOrUpdateUserInfo)    // 创建或更新用户信息
  .delete(deleteUserInfo);         // 删除用户信息

module.exports = router;

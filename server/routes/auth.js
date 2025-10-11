const express = require('express');
const router = express.Router();
const { register, login, updatePassword } = require('../controllers/auth');

// 注册路由
router.post('/user/register', register);

// 登录路由
router.post('/user/login', login);

// 修改密码路由
router.put('/auth/password', updatePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

// 获取好友列表
router.get('/friends/getFriends', friendController.getFriends);

// 获取好友请求
router.get('/friends/requests', friendController.getFriendRequests);

// 发送好友请求
router.post('/friends/requests', friendController.sendFriendRequest);

// 处理好友请求
router.put('/friends/requests', friendController.handleFriendRequest);

// 删除好友
router.delete('/friends/:friendId', friendController.removeFriend);

// 搜索用户
router.get('/friends/search', friendController.searchUsers);

module.exports = router;

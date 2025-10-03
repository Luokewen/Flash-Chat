const Friend = require('../models/friend')
const User = require('../models/user')
const UserInfo = require('../models/userInfo')

// 获取用户的好友列表（修正关联查询错误）
exports.getFriends = async (req, res) => {
  try {
    const userId = req.query.id
    if (!userId) {
      return res.status(400).json({ code: 400, message: '缺少用户ID参数' })
    }

    // 1. 查找所有已接受的好友关系
    const friends = await Friend.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' },
      ],
    })
      // 只关联User表获取基础用户信息
      .populate('requester', 'username _id requestedAt')
      .populate('recipient', 'username _id requestedAt')

    // 2. 整理好友整理好友信息（单独查询UserInfo）
    const friendList = []
    for (const friend of friends) {
      // 确定当前当前用户是请求求者还是接收者
      const isRequester = friend.requester._id.toString() === userId
      // 获取好友的用户ID和用户名
      const { _id: friendUserId, username } = isRequester ? friend.recipient : friend.requester

      // 3. 通过好友ID查询UserInfo表获取nickname和avatar
      const userInfo = await UserInfo.findOne({ userId: friendUserId })

      friendList.push({
        id: friendUserId,
        username: username, // 来自User表
        nickname: userInfo?.nickname || '未知用户', // 来自UserInfo表
        avatar: userInfo?.avatar || '', // 来自UserInfo表
        requestedAt: friend.requestedAt, // 来自Friend表
      })
    }

    res.status(200).json({ code: 200, data: friendList })
  } catch (error) {
    console.error('获取好友列表失败:', error)
    res.status(500).json({ code: 500, message: '获取好友列表失败', error: error.message })
  }
}

// 获取好友请求
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.query.userId
    if (!userId) {
      return res.status(400).json({ message: '缺少用户ID参数' })
    }

    // 查找所有未接受的好友请求，并关联请求者的基础信息
    const requests = await Friend.find({
      recipient: userId,
      status: 'pending',
    }).populate('requester', '_id username') // 关联请求者ID和用户名

    // 处理请求列表，补充用户详情
    const requestList = []
    for (const request of requests) {
      // 获取请求者ID（从populate结果中获取）
      const requesterId = request.requester?._id
      if (!requesterId) {
        continue // 跳过无效请求
      }

      // 查询请求者的详细信息（用户信息表）
      const userInfo = await UserInfo.findOne({ userId: requesterId })
      // 查询请求者的账号信息（用户表）- 这里如果populate已经获取了username，可省略
      const user = await User.findOne({ _id: requesterId }, 'username')

      // 构建单个请求数据
      requestList.push({
        id: request._id,
        requestedAt: request.requestedAt,
        nickname: userInfo?.nickname || '未知用户', // 处理信息不存在的情况
        avatar: userInfo?.avatar || '', // 默认为空
        username: user?.username || request.requester?.username || '未知账号', // 优先用最新查询结果
      })
    }

    res.status(200).json({
      code: 200,
      data: requestList,
    })
  } catch (error) {
    console.error('获取好友请求失败:', error)
    res.status(500).json({
      message: '获取好友请求失败',
      error: error.message,
    })
  }
}

// 发送好友请求（添加 Socket 通知）
exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId, requesterId } = req.body

    // 检查是否添加自己
    if (requesterId === recipientId) {
      return res.status(400).json({ code: 400, message: '不能添加自己为好友' })
    }

    // 检查接收者是否存在
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    // 查找已有的好友关系（双向检查）
    const existingFriendship = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    })

    // 已存在好友关系处理
    if (existingFriendship) {
      // 已成为好友 - 阻止重复添加
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({
          code: 400,
          message: '你们已经是好友了',
        })
      }
      // 待处理请求 - 阻止重复发送
      if (existingFriendship.status === 'pending') {
        return res.status(400).json({
          code: 400,
          message: '好友请求已发送，请等待对方回复',
        })
      }
      // 被拒绝的请求 - 允许重新发送（更新状态）
      if (existingFriendship.status === 'rejected') {
        existingFriendship.status = 'pending'
        existingFriendship.requestedAt = Date.now() // 更新请求时间
        existingFriendship.recipient = recipientId
        existingFriendship.requester = requesterId
        await existingFriendship.save()

        // 后续通知逻辑复用下面的代码
      }
    } else {
      // 不存在关系 - 创建新的好友请求
      await new Friend({
        requester: requesterId,
        recipient: recipientId,
        status: 'pending',
        requestedAt: Date.now(),
      }).save()
    }

    // 获取请求者信息（用于通知显示）
    const requester = await User.findById(requesterId).select('username avatar')

    // Socket 通知接收者有新请求（包括重新发送的情况）
    const io = req.app.get('io')
    const userSocketMap = req.app.get('userSocketMap')
    const recipientSocketId = userSocketMap.get(recipientId)

    console.log('recipientId:', recipientId)

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new-friend-request', {
        requestId: requesterId,
        userId: requesterId,
        username: requester.username,
        avatar: requester.avatar,
        requestedAt: Date.now(), // 使用最新的请求时间
      })
    }

    // 根据不同情况返回不同消息
    const message = existingFriendship ? '好友请求已重新发送' : '好友请求已发送'

    res.status(201).json({ code: 201, message })
  } catch (error) {
    res.status(500).json({ code: 500, message: '发送好友请求失败', error: error.message })
  }
}

// 处理好友请求（添加 Socket 通知）
exports.handleFriendRequest = async (req, res) => {
  try {
    const { requestId, action, id: userId } = req.body
    console.log(requestId, action, userId)
    const request = await Friend.findById(requestId).populate('requester', 'username')

    if (!request) {
      return res.status(404).json({ message: '好友请求不存在' })
    }
    if (request.recipient.toString() !== userId) {
      return res.status(403).json({ message: '无权处理此请求' })
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: '此请求已处理' })
    }

    // 更新请求状态
    request.status = action === 'accept' ? 'accepted' : 'rejected'
    request.handledAt = Date.now()
    await request.save()

    // ------------ Socket 通知请求发送者 ------------
    const io = req.app.get('io')
    const userSocketMap = req.app.get('userSocketMap')
    const requesterSocketId = userSocketMap.get(request.requester._id.toString())

    if (requesterSocketId) {
      // 向请求者发送处理结果通知
      io.to(requesterSocketId).emit('friend-request-handled', {
        requestId: request._id,
        status: request.status, // 'accepted' 或 'rejected'
        handledAt: request.handledAt,
        recipientId: userId,
        recipientName: (await User.findById(userId)).username,
      })
    }

    res.status(200).json({
      code: 200,
      message: action === 'accept' ? '已接受好友请求' : '已拒绝好友请求',
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '处理好友请求失败', error: error.message })
  }
}
// 删除好友
exports.removeFriend = async (req, res) => {
  try {
    const friendId = req.query.friendId
    const userId = req.query.userId

    // 查找并删除好友关系（双向匹配）
    const result = await Friend.deleteOne({
      $or: [
        { requester: userId, recipient: friendId, status: 'accepted' },
        { requester: friendId, recipient: userId, status: 'accepted' },
      ],
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '好友关系不存在' })
    }

    res.status(200).json({ code: 200, message: '已成功删除好友' })
  } catch (error) {
    res.status(500).json({ message: '删除好友失败', error: error.message })
  }
}

// 搜索用户（支持分页，一页5条数据）
exports.searchUsers = async (req, res) => {
  try {
    const { keyword, userId: userId, page = 1, pageSize = 5 } = req.query // 新增分页参数

    if (!keyword) {
      return res.status(400).json({ message: '请输入搜索关键词' })
    }

    // 1. 计算分页参数（page 从1开始，转换为数字类型）
    const currentPage = parseInt(page, 10)
    const itemsPerPage = parseInt(pageSize, 10)
    const skip = (currentPage - 1) * itemsPerPage // 跳过前面的记录

    // 2. 先查询符合条件的总条数（用于计算总页数）
    const total = await User.countDocuments({
      username: { $regex: keyword, $options: 'i' },
      _id: { $ne: userId }, // 排除自己
    })

    // 3. 分页查询用户数据
    const users = await User.find({
      username: { $regex: keyword, $options: 'i' },
      _id: { $ne: userId },
    })
      .skip(skip) // 跳过指定数量的记录
      .limit(itemsPerPage) // 限制返回的记录数
      .lean() // 转换为普通JS对象，提高性能

    // 4. 处理用户关系数据
    const results = await Promise.all(
      users.map(async (user) => {
        const relationship = await Friend.findOne({
          $or: [
            { requester: userId, recipient: user._id },
            { requester: user._id, recipient: userId },
          ],
        }).lean()

        const userInfo = await UserInfo.findOne({ userId: user._id }).lean()
        // console.log(relationship);
        return {
          id: user._id,
          username: user.username,
          nickname: userInfo?.nickname || user.username, // 兼容昵称不存在的情况
          avatar: userInfo?.avatar || '',
          relationship: relationship ? relationship.status : null,
        }
      }),
    )

    // 5. 返回分页数据（包含总条数和总页数）
    res.status(200).json({
      code: 200,
      data: {
        list: results, // 当前页数据
        total, // 总条数
        page: currentPage, // 当前页码
        pageSize: itemsPerPage, // 每页条数
        totalPages: Math.ceil(total / itemsPerPage), // 总页数
      },
    })
  } catch (error) {
    res.status(500).json({ message: '搜索用户失败', error: error.message })
  }
}
